/**
 * Initialize Application State
 * Handles the initialization of the application state from persistent storage
 */

const AppState = require('./app_state');
const { loadTodosAsInstances } = require('./load_todos');
const { DATA_CONFIG } = require('./data_model');
const Todo = require('./todo_class');
const { validateStateWithErrorHandling } = require('./error_handler');

/**
 * Initialize the application state from storage
 * @param {string} dataPath - Path to the data file
 * @returns {Promise<Object>} - Promise resolving to the initialized application state
 */
async function initializeAppState(dataPath = DATA_CONFIG.DATA_PATH) {
    try {
        console.log('Initializing application state...');

        // Load data from storage
        const loadedData = await loadTodosAsInstances(dataPath);

        // Create new application state with loaded data
        const appState = new AppState(
            loadedData.todos,
            loadedData.nextId,
            loadedData.currentView
        );

        // Validate the initialized state
        const validation = validateStateWithErrorHandling(appState);
        if (!validation.valid) {
            console.warn('Warning: Initialized state has validation issues:', validation.errors);
            // We can still return the state but with a warning
        }

        console.log(`Application state initialized with ${appState.todos.length} todos`);
        return appState;
    } catch (error) {
        console.error('Error initializing application state:', error.message);
        
        // Return a default state if initialization fails
        console.log('Creating default application state...');
        return new AppState([], 1, 'all');
    }
}

/**
 * Initialize with default todos if no data exists
 * @param {string} dataPath - Path to the data file
 * @param {Array} defaultTodos - Array of default todo objects to initialize with
 * @returns {Promise<Object>} - Promise resolving to the initialized application state
 */
async function initializeAppStateWithDefaults(dataPath = DATA_CONFIG.DATA_PATH, defaultTodos = []) {
    try {
        console.log('Initializing application state with potential defaults...');

        // Load data from storage
        const loadedData = await loadTodosAsInstances(dataPath);

        // If no todos were loaded, use defaults
        const todos = loadedData.todos.length > 0 
            ? loadedData.todos 
            : defaultTodos.map((todoData, index) => 
                new Todo(
                    index + 1,
                    todoData.title,
                    todoData.completed || false,
                    todoData.createdAt,
                    todoData.updatedAt
                )
            );

        // Determine the next ID - use the max ID from loaded/default todos + 1
        const maxId = Math.max(...todos.map(todo => todo.id), 0);
        const nextId = todos.length > 0 ? maxId + 1 : 1;

        // Create new application state with loaded or default data
        const appState = new AppState(
            todos,
            nextId,
            loadedData.currentView
        );

        // Validate the initialized state
        const validation = validateStateWithErrorHandling(appState);
        if (!validation.valid) {
            console.warn('Warning: Initialized state has validation issues:', validation.errors);
        }

        const todosCount = appState.todos.length;
        console.log(`Application state initialized with ${todosCount} todos`);
        
        if (todosCount === 0 && defaultTodos.length > 0) {
            console.log('Added default todos to empty state');
        }
        
        return appState;
    } catch (error) {
        console.error('Error initializing application state with defaults:', error.message);
        
        // Return a default state if initialization fails
        console.log('Creating default application state...');
        return new AppState([], 1, 'all');
    }
}

/**
 * Reset the application state to default
 * @returns {Object} - Fresh application state with default values
 */
function resetAppState() {
    console.log('Resetting application state to default...');
    return new AppState([], 1, 'all');
}

/**
 * Create a fresh application state with example todos
 * @returns {Object} - Application state with example todos
 */
function createExampleAppState() {
    console.log('Creating application state with example todos...');
    
    const exampleTodos = [
        new Todo(1, 'Learn how to use this todo app', false),
        new Todo(2, 'Add your first todo item', false),
        new Todo(3, 'Complete important tasks', false),
        new Todo(4, 'Review and organize todos', true)  // Completed example
    ];
    
    return new AppState(exampleTodos, 5, 'all');
}

/**
 * Initialize state and ensure data compatibility
 * @param {string} dataPath - Path to the data file
 * @returns {Promise<Object>} - Promise resolving to the initialized and validated application state
 */
async function initializeCompatibleState(dataPath = DATA_CONFIG.DATA_PATH) {
    try {
        console.log('Initializing compatible application state...');
        
        // Load data from storage
        const loadedData = await loadTodosAsInstances(dataPath);
        
        // Sanitize and validate the loaded data
        let { todos, nextId, currentView } = loadedData;
        
        // Ensure todos is an array
        if (!Array.isArray(todos)) {
            console.warn('Todos is not an array, initializing with empty array');
            todos = [];
        }
        
        // Ensure nextId is a positive number
        if (typeof nextId !== 'number' || nextId < 1) {
            const maxId = todos.length > 0 
                ? Math.max(...todos.map(t => t.id), 0) 
                : 0;
            nextId = maxId + 1;
            console.warn(`Invalid nextId (${nextId}), calculated as ${nextId}`);
        }
        
        // Ensure currentView is valid
        if (!['all', 'active', 'completed'].includes(currentView)) {
            currentView = 'all';
            console.warn(`Invalid currentView, defaulted to 'all'`);
        }
        
        // Create new application state
        const appState = new AppState(todos, nextId, currentView);
        
        // Validate the final state
        const validation = validateStateWithErrorHandling(appState);
        if (!validation.valid) {
            console.error('Initialized state failed validation:', validation.errors);
            return resetAppState();
        }
        
        console.log(`Compatible application state initialized with ${appState.todos.length} todos`);
        return appState;
    } catch (error) {
        console.error('Error initializing compatible state:', error.message);
        
        // Return a default state if initialization fails
        console.log('Falling back to default application state...');
        return resetAppState();
    }
}

module.exports = {
    initializeAppState,
    initializeAppStateWithDefaults,
    resetAppState,
    createExampleAppState,
    initializeCompatibleState
};