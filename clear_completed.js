/**
 * Clear Completed Todos Functionality
 * Handles removing all completed todos from the application state
 */

const { deleteMultipleTodosWithPersistence } = require('./delete_todo');

/**
 * Clear all completed todos
 * @param {Object} appState - The current application state
 * @returns {Object} - Object containing information about the cleared todos
 */
function clearCompletedTodos(appState) {
    // Find all completed todos
    const completedTodos = appState.todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        return {
            clearedTodos: [],
            count: 0,
            message: 'No completed todos to clear'
        };
    }

    // Store the IDs of completed todos for deletion
    const completedIds = completedTodos.map(todo => todo.id);

    // Delete all completed todos
    const deleteResults = deleteMultipleTodos(appState, completedIds);

    return {
        clearedTodos: completedTodos,
        count: completedTodos.length,
        message: `${completedTodos.length} completed todo(s) cleared`
    };
}

/**
 * Async version of clear completed todos that includes persistence
 * @param {Object} appState - The current application state
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with clear results
 */
async function clearCompletedTodosWithPersistence(appState, saveFunction) {
    // Find all completed todos
    const completedTodos = appState.todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
        return {
            clearedTodos: [],
            count: 0,
            message: 'No completed todos to clear',
            saveSuccess: false
        };
    }

    // Store the IDs of completed todos for deletion
    const completedIds = completedTodos.map(todo => todo.id);

    // Delete all completed todos with persistence
    const deleteResults = await deleteMultipleTodosWithPersistence(appState, completedIds, saveFunction);

    return {
        clearedTodos: completedTodos,
        count: completedTodos.length,
        message: `${completedTodos.length} completed todo(s) cleared`,
        saveSuccess: deleteResults.saveSuccess
    };
}

/**
 * Preview which todos will be cleared if clearCompletedTodos is called
 * @param {Object} appState - The current application state
 * @returns {Array} - Array of completed todos that would be cleared
 */
function previewClearCompletedTodos(appState) {
    return appState.todos.filter(todo => todo.completed);
}

/**
 * Count how many completed todos would be cleared
 * @param {Object} appState - The current application state
 * @returns {number} - Number of completed todos that would be cleared
 */
function countCompletedTodosForClear(appState) {
    return appState.todos.filter(todo => todo.completed).length;
}

/**
 * Clear completed todos with confirmation option
 * @param {Object} appState - The current application state
 * @param {boolean} confirmed - Whether the action is confirmed
 * @returns {Object} - Object containing information about the cleared todos or confirmation message
 */
function clearCompletedTodosWithConfirmation(appState, confirmed) {
    const completedTodos = appState.todos.filter(todo => todo.completed);
    const count = completedTodos.length;

    if (count === 0) {
        return {
            clearedTodos: [],
            count: 0,
            message: 'No completed todos to clear'
        };
    }

    if (!confirmed) {
        return {
            clearedTodos: null,
            count: count,
            message: `Are you sure you want to clear ${count} completed todo(s)? Confirm with confirmed=true parameter.`
        };
    }

    // Proceed with clearing if confirmed
    return clearCompletedTodos(appState);
}

module.exports = {
    clearCompletedTodos,
    clearCompletedTodosWithPersistence,
    previewClearCompletedTodos,
    countCompletedTodosForClear,
    clearCompletedTodosWithConfirmation
};