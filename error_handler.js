/**
 * Error Handling Utilities
 * Provides comprehensive error handling for the todo application
 */

// Custom application error classes
class TodoAppError extends Error {
    constructor(message, code = 'APP_ERROR', details = null) {
        super(message);
        this.name = 'TodoAppError';
        this.code = code;
        this.details = details;
    }
}

class ValidationError extends TodoAppError {
    constructor(message, field = null, value = null) {
        super(message, 'VALIDATION_ERROR', { field, value });
        this.name = 'ValidationError';
    }
}

class StateError extends TodoAppError {
    constructor(message) {
        super(message, 'STATE_ERROR');
        this.name = 'StateError';
    }
}

class PersistenceError extends TodoAppError {
    constructor(message, filePath = null) {
        super(message, 'PERSISTENCE_ERROR', { filePath });
        this.name = 'PersistenceError';
    }
}

class CommandError extends TodoAppError {
    constructor(message, commandType = null) {
        super(message, 'COMMAND_ERROR', { commandType });
        this.name = 'CommandError';
    }
}

// Error severity levels
const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Log an error with timestamp and context
 * @param {Error} error - The error to log
 * @param {string} context - Context where the error occurred
 * @param {string} severity - Severity level of the error
 */
function logError(error, context = 'unknown', severity = ERROR_SEVERITY.MEDIUM) {
    const timestamp = new Date().toISOString();
    
    const logEntry = {
        timestamp,
        context,
        severity,
        error: {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code || 'NO_CODE',
            details: error.details || null
        }
    };
    
    // Write to console
    console.error(`[${timestamp}] ${severity.toUpperCase()} - ${context}:`, error.message);
    
    // In a real application, you might write this to a log file
    // fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n');
    
    return logEntry;
}

/**
 * Handle an error gracefully and return a user-friendly message
 * @param {Error} error - The error to handle
 * @param {string} context - Context where the error occurred
 * @returns {Object} - Object containing user-friendly message and error details
 */
function handleError(error, context = 'unknown') {
    logError(error, context);
    
    let userMessage;
    
    // Provide user-friendly messages based on error type
    if (error instanceof ValidationError) {
        userMessage = `Validation error: ${error.message}`;
    } else if (error instanceof StateError) {
        userMessage = `State error: ${error.message}. Please try again or restart the application.`;
    } else if (error instanceof PersistenceError) {
        userMessage = `Storage error: ${error.message}. Your todos may not be saved, but you can continue using the application.`;
    } else if (error instanceof CommandError) {
        userMessage = `Command error: ${error.message}. Type "help" to see available commands.`;
    } else {
        userMessage = `An unexpected error occurred: ${error.message}. Please try again.`;
    }
    
    return {
        userMessage,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        handled: true
    };
}

/**
 * Handle errors in async operations
 * @param {Promise} operation - The promise to handle
 * @param {string} context - Context where the operation is happening
 * @returns {Promise<Object>} - Promise resolving to result or error object
 */
async function handleAsyncError(operation, context = 'async_operation') {
    try {
        const result = await operation();
        return {
            success: true,
            data: result,
            error: null
        };
    } catch (error) {
        logError(error, context, ERROR_SEVERITY.HIGH);
        
        return {
            success: false,
            data: null,
            error: handleError(error, context)
        };
    }
}

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} - Wrapped function
 */
function withErrorHandler(fn, context) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            return handleError(error, context);
        }
    };
}

/**
 * Validate and handle potential errors in application state
 * @param {Object} state - The application state to validate
 * @returns {Object} - Object containing validation result
 */
function validateStateWithErrorHandling(state) {
    try {
        if (!state) {
            throw new StateError('Application state is null or undefined');
        }
        
        if (!Array.isArray(state.todos)) {
            throw new StateError('State todos must be an array');
        }
        
        if (typeof state.nextId !== 'number' || state.nextId < 1) {
            throw new StateError('State nextId must be a positive number');
        }
        
        if (!['all', 'active', 'completed'].includes(state.currentView)) {
            throw new StateError('State currentView must be "all", "active", or "completed"');
        }
        
        return {
            valid: true,
            errors: []
        };
    } catch (error) {
        logError(error, 'state_validation', ERROR_SEVERITY.CRITICAL);
        return {
            valid: false,
            errors: [handleError(error, 'state_validation')]
        };
    }
}

/**
 * Create a result wrapper that handles both success and error cases
 * @param {Function} operation - Operation to execute
 * @param {string} context - Context for error logging
 * @returns {Object} - Result object with success/error information
 */
async function safeOperation(operation, context) {
    try {
        const result = await operation();
        return {
            success: true,
            data: result,
            error: null,
            context
        };
    } catch (error) {
        logError(error, context);
        
        return {
            success: false,
            data: null,
            error: {
                message: error.message,
                name: error.name,
                code: error.code,
                details: error.details
            },
            context
        };
    }
}

module.exports = {
    TodoAppError,
    ValidationError,
    StateError,
    PersistenceError,
    CommandError,
    ERROR_SEVERITY,
    logError,
    handleError,
    handleAsyncError,
    withErrorHandler,
    validateStateWithErrorHandling,
    safeOperation
};