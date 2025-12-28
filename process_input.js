/**
 * Process User Input
 * Handles reading and processing user input from the console
 */

const readline = require('readline');

/**
 * Create a readline interface for user input
 * @returns {Object} - Readline interface
 */
function createInputInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Get input from user with a prompt
 * @param {string} prompt - Prompt to display to user
 * @param {Object} rlInterface - Readline interface
 * @returns {Promise<string>} - Promise resolving to user input
 */
function getUserInput(prompt, rlInterface) {
    return new Promise((resolve) => {
        rlInterface.question(prompt, (input) => {
            resolve(input);
        });
    });
}

/**
 * Process a single command from user input
 * @param {string} input - User input string
 * @param {Object} commandParser - Parser to parse the command
 * @param {Object} commandRouter - Router to handle the command
 * @returns {Promise<Object>} - Promise resolving to command result
 */
async function processCommand(input, commandParser, commandRouter) {
    try {
        // Parse the command
        const command = commandParser.parseCommand(input);
        
        // Validate the parsed command
        const validation = commandParser.validateParsedCommand(command);
        if (!validation.isValid) {
            return {
                success: false,
                command: 'VALIDATION_ERROR',
                result: {
                    errors: validation.errors,
                    message: 'Command validation failed'
                }
            };
        }
        
        // Route the command to the appropriate handler
        const result = await commandRouter.routeCommand(command);
        
        return result;
    } catch (error) {
        return {
            success: false,
            command: 'PROCESSING_ERROR',
            result: {
                error: error.message,
                message: 'Error processing command'
            }
        };
    }
}

/**
 * Process multiple commands from user input (batch processing)
 * @param {string} input - User input string that may contain multiple commands
 * @param {Object} commandParser - Parser to parse the commands
 * @param {Object} commandRouter - Router to handle the commands
 * @returns {Promise<Array>} - Promise resolving to array of command results
 */
async function processMultipleCommands(input, commandParser, commandRouter) {
    const commands = commandParser.parseMultipleCommands(input);
    const results = [];
    
    for (const command of commands) {
        try {
            const result = await commandRouter.routeCommand(command);
            results.push(result);
            
            // If there's an exit command, stop processing further commands
            if (command.type === 'EXIT') {
                break;
            }
        } catch (error) {
            results.push({
                success: false,
                command: 'PROCESSING_ERROR',
                result: {
                    error: error.message,
                    message: 'Error processing command'
                }
            });
        }
    }
    
    return results;
}

/**
 * Validate user input before processing
 * @param {string} input - User input string to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateInput(input) {
    const errors = [];
    
    if (typeof input !== 'string') {
        errors.push('Input must be a string');
    } else if (input.trim() === '') {
        errors.push('Input cannot be empty');
    } else if (input.length > 1000) {
        errors.push('Input is too long (max 1000 characters)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Sanitize user input by removing potentially harmful characters or patterns
 * @param {string} input - User input string to sanitize
 * @returns {string} - Sanitized input string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    // Trim whitespace
    let sanitized = input.trim();
    
    // Remove potential command injection characters (simple approach)
    // More sophisticated sanitization would be needed in a production environment
    sanitized = sanitized.replace(/[;&|`$(){}[\]\\<>]/g, '');
    
    return sanitized;
}

/**
 * Process raw user input through validation, sanitization, and command execution
 * @param {string} rawInput - Raw user input string
 * @param {Object} commandParser - Parser to parse the command
 * @param {Object} commandRouter - Router to handle the command
 * @returns {Promise<Object>} - Promise resolving to processing result
 */
async function processRawInput(rawInput, commandParser, commandRouter) {
    // Sanitize input first
    const sanitizedInput = sanitizeInput(rawInput);
    
    // Validate input
    const validation = validateInput(sanitizedInput);
    if (!validation.isValid) {
        return {
            success: false,
            command: 'INPUT_VALIDATION_ERROR',
            result: {
                errors: validation.errors,
                message: 'Invalid input'
            }
        };
    }
    
    // Process the command
    return await processCommand(sanitizedInput, commandParser, commandRouter);
}

module.exports = {
    createInputInterface,
    getUserInput,
    processCommand,
    processMultipleCommands,
    validateInput,
    sanitizeInput,
    processRawInput
};