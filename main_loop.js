/**
 * Main Application Loop
 * Controls the main execution flow of the todo application
 */

const readline = require('readline');
const AppState = require('./app_state');
const { loadTodosAsInstances } = require('./load_todos');
const { saveTodosToFile } = require('./save_todos');
const { DATA_CONFIG } = require('./data_model');
const { parseCommand, validateParsedCommand } = require('./command_parser');
const CommandRouter = require('./command_router');
const {
    displayWelcome,
    displayMenu,
    displayPrompt,
    displayCommandResult,
    displayError
} = require('./ui_functions');
const { processRawInput } = require('./process_input');
const { handleError } = require('./error_handler');

/**
 * Main application loop function
 * @param {Object} options - Configuration options for the application
 * @param {string} options.dataPath - Path to the data file
 */
async function mainLoop(options = {}) {
    const dataPath = options.dataPath || DATA_CONFIG.DATA_PATH;
    
    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    // Close readline interface when the process exits
    process.on('SIGINT', () => {
        console.log('\n\nExiting application...');
        rl.close();
        process.exit(0);
    });

    try {
        // Initialize application state
        console.log('Loading application state...');
        const initialData = await loadTodosAsInstances(dataPath);
        const appState = new AppState(
            initialData.todos,
            initialData.nextId,
            initialData.currentView
        );
        
        // Set up command router
        const saveFunction = (state) => saveTodosToFile(state, dataPath);
        const commandRouter = new CommandRouter(appState, saveFunction, displayCommandResult);

        // Display welcome message
        displayWelcome();
        displayMenu();

        // Main loop function
        const runLoop = async () => {
            // Display prompt
            displayPrompt();
            
            // Wait for user input
            const input = await new Promise((resolve) => {
                rl.question('', resolve);
            });
            
            // If input is empty, just continue the loop
            if (input.trim() === '') {
                await runLoop();
                return;
            }
            
            try {
                // Process the command
                const result = await processRawInput(input, 
                    { parseCommand, validateParsedCommand }, 
                    commandRouter
                );
                
                // Display the result
                displayCommandResult(result);
                
                // Check if the command was an exit command
                if (result.success && 
                    result.command === 'EXIT' && 
                    result.result && 
                    result.result.exit) {
                    rl.close();
                    return;
                }
            } catch (error) {
                const handledError = handleError(error, 'command_processing');
                displayError(handledError.userMessage);
            }
            
            // Continue the loop
            await runLoop();
        };

        // Start the main loop
        await runLoop();
    } catch (error) {
        const handledError = handleError(error, 'main_loop');
        displayError(handledError.userMessage);
        rl.close();
    }
}

/**
 * Alternative main loop implementation with better async handling
 */
async function mainLoopWithAsyncHandler() {
    let rl;
    let appState;
    let commandRouter;
    
    try {
        // Create readline interface
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Initialize application state
        console.log('Loading application state...');
        const initialData = await loadTodosAsInstances(DATA_CONFIG.DATA_PATH);
        appState = new AppState(
            initialData.todos,
            initialData.nextId,
            initialData.currentView
        );
        
        // Set up command router
        const saveFunction = (state) => saveTodosToFile(state, DATA_CONFIG.DATA_PATH);
        commandRouter = new CommandRouter(appState, saveFunction, displayCommandResult);

        // Display welcome message
        displayWelcome();
        displayMenu();

        // Create loop function that returns a promise
        const loop = () => {
            return new Promise((resolve) => {
                const handleInput = async (input) => {
                    if (input.toLowerCase().trim() === 'exit' || 
                        input.toLowerCase().trim() === 'quit' || 
                        input.toLowerCase().trim() === 'x') {
                        console.log('Exiting application...');
                        rl.close();
                        resolve();
                        return;
                    }
                    
                    try {
                        // Process the command
                        const result = await processRawInput(input, 
                            { parseCommand, validateParsedCommand }, 
                            commandRouter
                        );
                        
                        // Display the result
                        displayCommandResult(result);
                        
                        // Check if the command was an exit command
                        if (result.success && 
                            result.command === 'EXIT' && 
                            result.result && 
                            result.result.exit) {
                            rl.close();
                            resolve();
                            return;
                        }
                    } catch (error) {
                        const handledError = handleError(error, 'command_processing');
                        displayError(handledError.userMessage);
                    }
                    
                    // Continue the loop
                    displayPrompt();
                    rl.once('line', handleInput);
                };
                
                displayPrompt();
                rl.once('line', handleInput);
            });
        };
        
        // Start the loop
        await loop();
    } catch (error) {
        if (rl) {
            rl.close();
        }
        
        const handledError = handleError(error, 'main_loop');
        displayError(handledError.userMessage);
    }
}

module.exports = {
    mainLoop,
    mainLoopWithAsyncHandler
};