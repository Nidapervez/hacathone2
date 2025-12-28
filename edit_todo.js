/**
 * Edit Todo Functionality
 * Handles updating todo titles in the application state
 */

const { validateTodoId } = require('./validation_utils');
const { validateTodoInput } = require('./validation_utils');

/**
 * Edit a todo by updating its title
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to edit
 * @param {string} newTitle - New title for the todo
 * @returns {Object} - Object containing the updated todo and status
 */
function editTodo(appState, id, newTitle) {
    // Validate the ID
    const idValidation = validateTodoId(id);
    if (!idValidation.isValid) {
        throw new Error(idValidation.errors.join('; '));
    }

    // Validate the new title
    const titleValidation = validateTodoInput(newTitle);
    if (!titleValidation.isValid) {
        throw new Error(titleValidation.errors.join('; '));
    }

    // Find the todo by ID
    const todo = appState.findTodoById(id);
    if (!todo) {
        throw new Error(`Todo with ID ${id} not found`);
    }

    // Store the old title
    const oldTitle = todo.title;

    // Update the todo title
    todo.updateTitle(newTitle);

    // Update the todo in the state
    appState.updateTodo(todo);

    return {
        todo: todo,
        oldTitle: oldTitle,
        message: `Todo updated: "${oldTitle}" -> "${todo.title}"`
    };
}

/**
 * Edit multiple todos
 * @param {Object} appState - The current application state
 * @param {Array<Object>} edits - Array of edit objects {id, title}
 * @returns {Object} - Object containing results of the bulk edit operation
 */
function editMultipleTodos(appState, edits) {
    if (!Array.isArray(edits)) {
        throw new Error('Edits must be an array');
    }

    const results = [];
    const errors = [];

    for (const edit of edits) {
        const { id, title } = edit;
        try {
            const result = editTodo(appState, id, title);
            results.push(result);
        } catch (error) {
            errors.push({
                id,
                title,
                error: error.message
            });
        }
    }

    return {
        results,
        errors,
        totalEdited: results.length,
        totalErrors: errors.length
    };
}

/**
 * Async version of edit todo that includes persistence
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to edit
 * @param {string} newTitle - New title for the todo
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with updated todo and status
 */
async function editTodoWithPersistence(appState, id, newTitle, saveFunction) {
    try {
        // Validate the ID
        const idValidation = validateTodoId(id);
        if (!idValidation.isValid) {
            throw new Error(idValidation.errors.join('; '));
        }

        // Validate the new title
        const titleValidation = validateTodoInput(newTitle);
        if (!titleValidation.isValid) {
            throw new Error(titleValidation.errors.join('; '));
        }

        // Find the todo by ID
        const todo = appState.findTodoById(id);
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        // Store the old title
        const oldTitle = todo.title;

        // Update the todo title
        todo.updateTitle(newTitle);

        // Update the todo in the state
        appState.updateTodo(todo);

        // Attempt to save the updated state
        let saveSuccess = false;
        if (saveFunction) {
            try {
                saveSuccess = await saveFunction(appState);
            } catch (saveError) {
                console.warn('Warning: Could not save updated todos to file:', saveError.message);
                // Still return success for the edit operation even if save failed
            }
        }

        return {
            todo: todo,
            oldTitle: oldTitle,
            message: `Todo updated: "${oldTitle}" -> "${todo.title}"`,
            saveSuccess: saveSuccess
        };
    } catch (error) {
        throw error; // Re-throw the error to be handled by the caller
    }
}

/**
 * Async version of edit multiple todos that includes persistence
 * @param {Object} appState - The current application state
 * @param {Array<Object>} edits - Array of edit objects {id, title}
 * @param {Function} saveFunction - Function to save the updated state
 * @returns {Promise<Object>} - Promise resolving to object with edit results and status
 */
async function editMultipleTodosWithPersistence(appState, edits, saveFunction) {
    if (!Array.isArray(edits)) {
        throw new Error('Edits must be an array');
    }

    const results = [];
    const errors = [];

    for (const edit of edits) {
        const { id, title } = edit;
        try {
            // Don't save after each edit to be more efficient
            const result = await editTodoWithPersistence(appState, id, title, null);
            results.push(result);
        } catch (error) {
            errors.push({
                id,
                title,
                error: error.message
            });
        }
    }

    // Save once after all edits
    let saveSuccess = false;
    if (saveFunction && (results.length > 0)) {
        try {
            saveSuccess = await saveFunction(appState);
        } catch (saveError) {
            console.warn('Warning: Could not save updated todos to file:', saveError.message);
        }
    }

    return {
        results,
        errors,
        totalEdited: results.length,
        totalErrors: errors.length,
        saveSuccess: saveSuccess
    };
}

module.exports = {
    editTodo,
    editMultipleTodos,
    editTodoWithPersistence,
    editMultipleTodosWithPersistence
};