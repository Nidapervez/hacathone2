/**
 * Add Todo Functionality
 * Handles adding new todos to the application state
 */

const Todo = require('./todo_class');
const { validateTodoInput } = require('./validation_utils');

/**
 * Add a new todo to the application state
 * @param {Object} appState - The current application state
 * @param {string} title - Title of the new todo
 * @returns {Object} - Object containing the added todo and updated state information
 */
function addTodo(appState, title) {
    // Validate input
    const validation = validateTodoInput(title);
    if (!validation.isValid) {
        throw new Error(validation.errors.join('; '));
    }

    // Create a new Todo with the next available ID
    const newTodo = new Todo(
        appState.nextId,
        title.trim()
    );

    // Add the todo to the state
    appState.addTodo(newTodo);

    // Return the added todo and updated information
    return {
        todo: newTodo,
        nextId: appState.nextId,
        todosCount: appState.todos.length
    };
}

/**
 * Async version of add todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {string} title - Title of the new todo
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with added todo and status
 */
async function addTodoWithPersistence(appState, title, saveFunction) {
    try {
        // Validate input
        const validation = validateTodoInput(title);
        if (!validation.isValid) {
            throw new Error(validation.errors.join('; '));
        }

        // Create a new Todo with the next available ID
        const newTodo = new Todo(
            appState.nextId,
            title.trim()
        );

        // Add the todo to the state
        appState.addTodo(newTodo);

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the add operation even if save failed
            }
        }

        return {
            todo: newTodo,
            nextId: appState.nextId,
            todosCount: appState.todos.length,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Add multiple todos to the application state
 * @param {Object} appState - The current application state
 * @param {Array<string>} titles - Array of titles for the new todos
 * @returns {Array<Object>} - Array of objects containing added todos and status
 */
function addMultipleTodos(appState, titles) {
    if (!Array.isArray(titles)) {
        throw new Error('Titles must be an array');
    }

    const results = [];
    const errors = [];

    for (const title of titles) {
        try {
            const result = addTodo(appState, title);
            results.push(result);
        } catch (error) {
            errors.push({
                title,
                error: error.message
            });
        }
    }

    return {
        results,
        errors,
        totalAdded: results.length,
        totalErrors: errors.length
    };
}

module.exports = {
    addTodo,
    addTodoWithPersistence,
    addMultipleTodos
};