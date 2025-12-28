/**
 * Handle Invalid Inputs Gracefully
 * Provides functions to handle invalid user inputs gracefully
 */

const { validateInput } = require('./process_input');
const { validateTodoInput, validateTodoId } = require('./validation_utils');
const { displayError, displayMessage } = require('./ui_functions');

/**
 * Handle invalid todo title input
 * @param {string} title - The invalid title input
 * @returns {Object} - Object containing error details and suggestion
 */
function handleInvalidTitle(title) {
    const validation = validateTodoInput(title);
    
    if (validation.isValid) {
        return {
            isValid: true,
            errors: [],
            suggestion: null
        };
    }
    
    const suggestion = title && title.trim() === '' 
        ? 'Please provide a non-empty title for your todo.'
        : 'Please provide a valid title for your todo (not too long or containing invalid characters).';
    
    return {
        isValid: false,
        errors: validation.errors,
        suggestion: suggestion
    };
}

/**
 * Handle invalid todo ID input
 * @param {number} id - The invalid ID input
 * @returns {Object} - Object containing error details and suggestion
 */
function handleInvalidId(id) {
    const validation = validateTodoId(id);
    
    if (validation.isValid) {
        return {
            isValid: true,
            errors: [],
            suggestion: null
        };
    }
    
    const suggestion = !Number.isInteger(id) || id < 1
        ? 'Please provide a valid positive integer ID.'
        : 'Please provide a valid todo ID.';
    
    return {
        isValid: false,
        errors: validation.errors,
        suggestion: suggestion
    };
}

/**
 * Handle invalid command input
 * @param {string} input - The invalid command input
 * @returns {Object} - Object containing error details and suggestion
 */
function handleInvalidCommand(input) {
    const validation = validateInput(input);
    
    if (validation.isValid) {
        return {
            isValid: true,
            errors: [],
            suggestion: null
        };
    }
    
    let suggestion = 'Please enter a valid command. Type "help" to see available commands.';
    
    if (input && input.length > 1000) {
        suggestion = 'Command is too long. Please keep commands under 1000 characters.';
    }
    
    return {
        isValid: false,
        errors: validation.errors,
        suggestion: suggestion
    };
}

/**
 * Display helpful error message for invalid input
 * @param {Object} validationResult - The validation result
 * @param {string} inputType - Type of input being validated
 */
function displayInvalidInputMessage(validationResult, inputType = 'input') {
    if (validationResult.isValid) {
        return;
    }
    
    // Display validation errors
    for (const error of validationResult.errors) {
        displayError(error);
    }
    
    // Display suggestion if available
    if (validationResult.suggestion) {
        displayMessage(`Suggestion: ${validationResult.suggestion}`);
    }
}

/**
 * Validate and handle input with automatic error display
 * @param {string} input - Input to validate
 * @param {string} inputType - Type of input ('command', 'title', 'id')
 * @returns {Object} - Validated result with error handling
 */
function validateAndHandleInput(input, inputType = 'command') {
    let result;
    
    switch (inputType) {
        case 'title':
            result = handleInvalidTitle(input);
            break;
        case 'id':
            result = handleInvalidId(input);
            break;
        case 'command':
        default:
            result = handleInvalidCommand(input);
            break;
    }
    
    if (!result.isValid) {
        displayInvalidInputMessage(result, inputType);
    }
    
    return result;
}

/**
 * Attempt to auto-correct common input errors
 * @param {string} input - The input to auto-correct
 * @returns {Object} - Object containing corrected input and changes made
 */
function autoCorrectInput(input) {
    if (typeof input !== 'string') {
        return {
            corrected: '',
            changes: ['Input was not a string, converted to empty string'],
            original: input
        };
    }
    
    const original = input;
    let corrected = input;
    const changes = [];
    
    // Auto-trim whitespace
    if (input !== input.trim()) {
        corrected = input.trim();
        changes.push('Auto-trimmed leading/trailing whitespace');
    }
    
    // Replace common character issues (in a simple way)
    const replacements = [
        { from: /…/g, to: '...' },
        { from: /“/g, to: '"' },
        { from: /”/g, to: '"' },
        { from: /‘/g, to: "'" },
        { from: /’/g, to: "'" }
    ];
    
    for (const { from, to } of replacements) {
        if (from.test(corrected)) {
            corrected = corrected.replace(from, to);
            changes.push(`Replaced ${from} with ${to}`);
        }
    }
    
    return {
        corrected,
        changes,
        original
    };
}

/**
 * Process input with comprehensive error handling
 * @param {string} rawInput - Raw input from user
 * @param {Function} nextAction - Function to call with validated input
 * @returns {Promise<boolean>} - Promise resolving to whether processing was successful
 */
async function processInputWithGracefulHandling(rawInput, nextAction) {
    try {
        // First, auto-correct the input
        const correctionResult = autoCorrectInput(rawInput);
        if (correctionResult.changes.length > 0) {
            displayMessage(`Auto-corrected input: ${correctionResult.changes.join('; ')}`);
        }
        
        const input = correctionResult.corrected;
        
        // Validate the command
        const validationResult = validateAndHandleInput(input, 'command');
        if (!validationResult.isValid) {
            return false;
        }
        
        // Call the next action with the validated input
        await nextAction(input);
        return true;
    } catch (error) {
        displayError(`An error occurred while processing your input: ${error.message}`);
        return false;
    }
}

/**
 * A more general function for handling invalid inputs in a graceful way
 * @param {any} input - The input to handle
 * @param {string} expectedType - The expected type of input
 * @param {Array<string>} allowedValues - Array of allowed values (optional)
 * @returns {Object} - Object containing validity and helpful message
 */
function handleGenericInvalidInput(input, expectedType, allowedValues = null) {
    const result = {
        isValid: true,
        errors: [],
        suggestion: null,
        corrected: input
    };
    
    // Check type match
    if (expectedType === 'number' && typeof input !== 'number') {
        // Try to convert to number
        const numberInput = Number(input);
        if (!isNaN(numberInput)) {
            result.corrected = numberInput;
            result.suggestion = `Input automatically converted to number: ${numberInput}`;
        } else {
            result.isValid = false;
            result.errors.push(`Expected a number but got ${typeof input}`);
            result.suggestion = `Please provide a valid number.`;
        }
    } else if (expectedType === 'string' && typeof input !== 'string') {
        result.corrected = String(input);
        result.suggestion = `Input automatically converted to string: ${String(input)}`;
    } else if (expectedType === 'boolean' && typeof input !== 'boolean') {
        if (input === 'true' || input === '1' || input === 1) {
            result.corrected = true;
        } else if (input === 'false' || input === '0' || input === 0 || input === '') {
            result.corrected = false;
        } else {
            result.isValid = false;
            result.errors.push(`Expected a boolean but got ${typeof input}`);
            result.suggestion = `Please provide a boolean value (true/false).`;
        }
    }
    
    // Check allowed values if specified
    if (allowedValues && result.isValid) {
        if (!allowedValues.includes(result.corrected)) {
            result.isValid = false;
            result.errors.push(`Value "${result.corrected}" is not in allowed values: [${allowedValues.join(', ')}]`);
            result.suggestion = `Allowed values are: ${allowedValues.join(', ')}`;
        }
    }
    
    return result;
}

module.exports = {
    handleInvalidTitle,
    handleInvalidId,
    handleInvalidCommand,
    displayInvalidInputMessage,
    validateAndHandleInput,
    autoCorrectInput,
    processInputWithGracefulHandling,
    handleGenericInvalidInput
};