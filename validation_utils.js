/**
 * Validation Utilities
 * Provides validation functions for various inputs in the todo application
 */

/**
 * Validate todo input (title)
 * @param {string} title - Title to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateTodoInput(title) {
    const errors = [];
    
    // Check if title is provided
    if (title === undefined || title === null) {
        errors.push('Todo title is required');
    } else if (typeof title !== 'string') {
        errors.push('Todo title must be a string');
    } else {
        // Check if title is not empty after trimming
        if (title.trim() === '') {
            errors.push('Todo title cannot be empty');
        }
        
        // Check if title is too long (optional constraint)
        if (title.length > 255) {
            errors.push('Todo title is too long (max 255 characters)');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate todo ID
 * @param {number} id - ID to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateTodoId(id) {
    const errors = [];
    
    if (id === undefined || id === null) {
        errors.push('Todo ID is required');
    } else if (!Number.isInteger(id)) {
        errors.push('Todo ID must be an integer');
    } else if (id < 1) {
        errors.push('Todo ID must be a positive integer');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate command
 * @param {Object} command - Command object to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateCommand(command) {
    const errors = [];
    
    if (!command) {
        errors.push('Command is required');
    } else {
        if (!command.type) {
            errors.push('Command type is required');
        }
        
        if (command.payload && typeof command.payload !== 'object') {
            errors.push('Command payload must be an object');
        }
        
        if (command.meta && typeof command.meta !== 'object') {
            errors.push('Command meta must be an object');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate application state
 * @param {Object} state - Application state to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateAppState(state) {
    const errors = [];
    
    if (!state) {
        errors.push('Application state is required');
    } else {
        if (!Array.isArray(state.todos)) {
            errors.push('Todos must be an array');
        }
        
        if (typeof state.nextId !== 'number' || state.nextId < 1) {
            errors.push('Next ID must be a positive number');
        }
        
        if (!['all', 'active', 'completed'].includes(state.currentView)) {
            errors.push('Current view must be "all", "active", or "completed"');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate multiple inputs
 * @param {...any} inputs - Inputs to validate
 * @returns {Array<Object>} - Array of validation results
 */
function validateMultiple(...inputs) {
    return inputs.map(input => {
        if (typeof input === 'string') {
            return validateTodoInput(input);
        } else if (typeof input === 'number') {
            return validateTodoId(input);
        } else if (input && typeof input === 'object' && input.hasOwnProperty('type')) {
            // Simple check if it looks like a command object
            return validateCommand(input);
        } else if (input && typeof input === 'object') {
            // Check if it looks like an app state object
            return validateAppState(input);
        } else {
            return { isValid: false, errors: ['Unknown input type'] };
        }
    });
}

module.exports = {
    validateTodoInput,
    validateTodoId,
    validateCommand,
    validateAppState,
    validateMultiple
};