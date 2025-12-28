/**
 * Delete Todo Functionality
 * Handles removing todos from the application state
 */

const { validateTodoId } = require('./validation_utils');

/**
 * Delete a todo by ID
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to delete
 * @returns {Object} - Object containing the deleted todo and status
 */
function deleteTodo(appState, id) {
    // Validate the ID
    const validation = validateTodoId(id);
    if (!validation.isValid) {
        throw new Error(validation.errors.join('; '));
    }

    // Find the todo by ID
    const todo = appState.findTodoById(id);
    if (!todo) {
        throw new Error(`Todo with ID ${id} not found`);
    }

    // Remove the todo from the state
    const removed = appState.removeTodo(id);
    
    if (!removed) {
        throw new Error(`Failed to remove todo with ID ${id}`);
    }

    return {
        todo: todo,
        message: `Todo "${todo.title}" deleted successfully`
    };
}

/**
 * Delete multiple todos by IDs
 * @param {Object} appState - The current application state
 * @param {Array<number>} ids - Array of IDs of the todos to delete
 * @returns {Object} - Object containing results of the bulk delete operation
 */
function deleteMultipleTodos(appState, ids) {
    if (!Array.isArray(ids)) {
        throw new Error('IDs must be an array');
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            const result = deleteTodo(appState, id);
            results.push(result);
            successCount++;
        } catch (error) {
            errors.push({
                id,
                error: error.message
            });
        }
    }

    return {
        results,
        errors,
        totalDeleted: successCount,
        totalErrors: errors.length
    };
}

/**
 * Delete all todos
 * @param {Object} appState - The current application state
 * @returns {Object} - Object containing status of the clear operation
 */
function deleteAllTodos(appState) {
    const count = appState.todos.length;
    
    // Create a copy of the todos that are being deleted
    const deletedTodos = [...appState.todos];
    
    // Clear all todos
    appState.todos = [];
    
    return {
        deletedTodos,
        count,
        message: `${count} todos deleted successfully`
    };
}

/**
 * Async version of delete todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to delete
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with deleted todo and status
 */
async function deleteTodoWithPersistence(appState, id, saveFunction) {
    try {
        // Validate the ID
        const validation = validateTodoId(id);
        if (!validation.isValid) {
            throw new Error(validation.errors.join('; '));
        }

        // Find the todo by ID
        const todo = appState.findTodoById(id);
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        // Remove the todo from the state
        const removed = appState.removeTodo(id);
        
        if (!removed) {
            throw new Error(`Failed to remove todo with ID ${id}`);
        }

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the delete operation even if save failed
            }
        }

        return {
            todo: todo,
            message: `Todo "${todo.title}" deleted successfully`,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Async version of delete multiple todos that includes persistence
 * @param {Object} appState - The current application state
 * @param {Array<number>} ids - Array of IDs of the todos to delete
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with delete results and status
 */
async function deleteMultipleTodosWithPersistence(appState, ids, saveFunction) {
    if (!Array.isArray(ids)) {
        throw new Error('IDs must be an array');
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            const result = await deleteTodoWithPersistence(appState, id, null); // Don't save after each delete
            results.push(result);
            successCount++;
        } catch (error) {
            errors.push({
                id,
                error: error.message
            });
        }
    }

    // Save once after all deletions
    let saveSuccess = false;
    if (saveFunction && (successCount > 0)) {
        try {
            saveSuccess = await saveFunction(appState);
        } catch (saveError) {
            console.warn('Warning: Could not save updated todos to file:', saveError.message);
        }
    }

    return {
        results,
        errors,
        totalDeleted: successCount,
        totalErrors: errors.length,
        saveSuccess: saveSuccess
    };
}

/**
 * Async version of delete all todos that includes persistence
 * @param {Object} appState - The current application state
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with clear results and status
 */
async function deleteAllTodosWithPersistence(appState, saveFunction) {
    const count = appState.todos.length;
    
    // Create a copy of the todos that are being deleted
    const deletedTodos = [...appState.todos];
    
    // Clear all todos
    appState.todos = [];
    
    // Attempt to save the updated state
    let saveSuccess = false;
    if (saveFunction) {
        try {
            saveSuccess = await saveFunction(appState);
        } catch (saveError) {
            console.warn('Warning: Could not save updated todos to file:', saveError.message);
            // Still return success for the clear operation even if save failed
        }
    }

    return {
        deletedTodos,
        count,
        message: `${count} todos deleted successfully`,
        saveSuccess: saveSuccess
    };
}

module.exports = {
    deleteTodo,
    deleteMultipleTodos,
    deleteAllTodos,
    deleteTodoWithPersistence,
    deleteMultipleTodosWithPersistence,
    deleteAllTodosWithPersistence
};