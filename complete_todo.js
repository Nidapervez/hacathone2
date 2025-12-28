/**
 * Complete/Incomplete Todo Functionality
 * Handles marking todos as complete or incomplete
 */

const { validateTodoId } = require('./validation_utils');

/**
 * Mark a todo as complete
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to mark as complete
 * @returns {Object} - Object containing the updated todo and status
 */
function completeTodo(appState, id) {
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

    // Mark as complete
    todo.complete();

    // Update the todo in the state
    appState.updateTodo(todo);

    return {
        todo: todo,
        message: `Todo "${todo.title}" marked as complete`
    };
}

/**
 * Mark a todo as incomplete
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to mark as incomplete
 * @returns {Object} - Object containing the updated todo and status
 */
function incompleteTodo(appState, id) {
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

    // Mark as incomplete
    todo.uncomplete();

    // Update the todo in the state
    appState.updateTodo(todo);

    return {
        todo: todo,
        message: `Todo "${todo.title}" marked as incomplete`
    };
}

/**
 * Toggle the completion status of a todo
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to toggle
 * @returns {Object} - Object containing the updated todo and status
 */
function toggleTodo(appState, id) {
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

    // Toggle the completion status
    const wasCompleted = todo.completed;
    todo.toggle();

    // Update the todo in the state
    appState.updateTodo(todo);

    const status = wasCompleted ? 'incomplete' : 'complete';
    return {
        todo: todo,
        message: `Todo "${todo.title}" marked as ${status}`
    };
}

/**
 * Async version of complete todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to mark as complete
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with updated todo and status
 */
async function completeTodoWithPersistence(appState, id, saveFunction) {
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

        // Mark as complete
        todo.complete();

        // Update the todo in the state
        appState.updateTodo(todo);

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the operation even if save failed
            }
        }

        return {
            todo: todo,
            message: `Todo "${todo.title}" marked as complete`,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Async version of incomplete todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to mark as incomplete
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with updated todo and status
 */
async function incompleteTodoWithPersistence(appState, id, saveFunction) {
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

        // Mark as incomplete
        todo.uncomplete();

        // Update the todo in the state
        appState.updateTodo(todo);

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the operation even if save failed
            }
        }

        return {
            todo: todo,
            message: `Todo "${todo.title}" marked as incomplete`,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Async version of toggle todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to toggle
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with updated todo and status
 */
async function toggleTodoWithPersistence(appState, id, saveFunction) {
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

        // Store the previous status for the message
        const wasCompleted = todo.completed;

        // Toggle the completion status
        todo.toggle();

        // Update the todo in the state
        appState.updateTodo(todo);

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the operation even if save failed
            }
        }

        const status = wasCompleted ? 'incomplete' : 'complete';
        return {
            todo: todo,
            message: `Todo "${todo.title}" marked as ${status}`,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    completeTodo,
    incompleteTodo,
    toggleTodo,
    completeTodoWithPersistence,
    incompleteTodoWithPersistence,
    toggleTodoWithPersistence
};