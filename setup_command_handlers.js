/**
 * Set Up Command Handlers
 * Configures and registers all command handlers for the application
 */

const CommandRouter = require('./command_router');
const { initializeCompatibleState } = require('./initialize_state');
const { saveTodosToFile } = require('./save_todos');
const { DATA_CONFIG } = require('./data_model');
const { 
    displayCommandResult,
    displayError,
    displaySuccess
} = require('./ui_functions');

/**
 * Create and configure the command router with all necessary dependencies
 * @param {Object} options - Configuration options
 * @param {string} options.dataPath - Path to the data file
 * @param {Object} options.appState - Optional pre-loaded application state
 * @returns {Promise<CommandRouter>} - Promise resolving to configured command router
 */
async function setupCommandHandlers(options = {}) {
    try {
        const dataPath = options.dataPath || DATA_CONFIG.DATA_PATH;
        
        // Initialize or use provided application state
        let appState;
        if (options.appState) {
            appState = options.appState;
        } else {
            appState = await initializeCompatibleState(dataPath);
        }

        // Define save function for persistence
        const saveFunction = (state) => saveTodosToFile(state, dataPath);
        
        // Create command router with dependencies
        const commandRouter = new CommandRouter(appState, saveFunction, displayCommandResult);
        
        console.log('Command handlers set up successfully');
        
        return commandRouter;
    } catch (error) {
        // Log the error and re-throw it to be handled upstream
        console.error('Error setting up command handlers:', error.message);
        throw error;
    }
}

/**
 * Register command handlers in the router (this is built into the CommandRouter constructor)
 * @param {CommandRouter} router - The command router to register handlers in
 * @returns {Object} - Object containing registration status
 */
function registerCommandHandlers(router) {
    if (!router) {
        throw new Error('Command router is required to register handlers');
    }

    // All handlers are already registered in the CommandRouter constructor
    // This function exists for interface consistency
    
    return {
        success: true,
        registeredCommands: [
            'ADD_TODO',
            'COMPLETE_TODO', 
            'INCOMPLETE_TODO',
            'TOGGLE_TODO',
            'DELETE_TODO',
            'EDIT_TODO',
            'LIST_TODOS',
            'CLEAR_COMPLETED',
            'FILTER_TODOS',
            'HELP',
            'EXIT',
            'UNKNOWN'
        ],
        count: 12
    };
}

/**
 * Initialize the complete command handler system
 * @param {Object} options - Configuration options
 * @param {string} options.dataPath - Path to the data file
 * @returns {Promise<Object>} - Promise resolving to an object with router, state, and helpers
 */
async function initializeCommandHandlerSystem(options = {}) {
    try {
        console.log('Initializing command handler system...');
        
        // Set up the command router
        const commandRouter = await setupCommandHandlers(options);
        
        // Get reference to the application state from the router
        const appState = commandRouter.appState;
        
        // Create additional helper functions
        const helpers = {
            displayResult: (result) => displayCommandResult(result),
            handleError: (error, context = 'command') => {
                displayError(`Error in ${context}: ${error.message}`);
            },
            reloadState: async () => {
                const reloadedState = await initializeCompatibleState(options.dataPath || DATA_CONFIG.DATA_PATH);
                commandRouter.appState = reloadedState;
                return reloadedState;
            },
            saveState: async () => {
                try {
                    const saveSuccess = await commandRouter.saveFunction(commandRouter.appState);
                    if (saveSuccess) {
                        displaySuccess('State saved successfully');
                    } else {
                        displayError('Failed to save state');
                    }
                    return saveSuccess;
                } catch (error) {
                    displayError(`Error saving state: ${error.message}`);
                    return false;
                }
            }
        };
        
        console.log('Command handler system initialized successfully');
        
        return {
            router: commandRouter,
            state: appState,
            helpers: helpers,
            initialized: true
        };
    } catch (error) {
        console.error('Error initializing command handler system:', error.message);
        throw error;
    }
}

/**
 * Validate that all command handlers are properly set up
 * @param {CommandRouter} router - The command router to validate
 * @returns {Object} - Validation result
 */
function validateCommandHandlers(router) {
    const validation = {
        isValid: true,
        errors: [],
        checks: {}
    };
    
    // Check if router exists
    if (!router) {
        validation.isValid = false;
        validation.errors.push('Command router is not provided');
        return validation;
    }
    
    // Check if router has required properties
    if (!router.appState) {
        validation.isValid = false;
        validation.errors.push('Command router missing appState');
    } else {
        validation.checks.appState = true;
    }
    
    if (!router.saveFunction) {
        validation.isValid = false;
        validation.errors.push('Command router missing saveFunction');
    } else {
        validation.checks.saveFunction = true;
    }
    
    if (!router.displayFunction) {
        validation.isValid = false;
        validation.errors.push('Command router missing displayFunction');
    } else {
        validation.checks.displayFunction = true;
    }
    
    // Check for the routeCommand method
    if (typeof router.routeCommand !== 'function') {
        validation.isValid = false;
        validation.errors.push('Command router missing routeCommand method');
    } else {
        validation.checks.routeCommand = true;
    }
    
    return validation;
}

module.exports = {
    setupCommandHandlers,
    registerCommandHandlers,
    initializeCommandHandlerSystem,
    validateCommandHandlers
};