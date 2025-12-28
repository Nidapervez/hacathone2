/**
 * List Todos Functionality with Filtering
 * Handles retrieving and filtering todos for display
 */

/**
 * List all todos with optional filtering
 * @param {Object} appState - The current application state
 * @param {string} filter - Filter type ('all', 'active', or 'completed')
 * @returns {Array} - Array of todos matching the filter
 */
function listTodos(appState, filter = 'all') {
    // Validate filter
    if (!['all', 'active', 'completed'].includes(filter)) {
        throw new Error('Filter must be "all", "active", or "completed"');
    }

    // Set the current view in the state
    appState.setCurrentView(filter);

    // Get filtered todos
    const filteredTodos = appState.getFilteredTodos();

    return filteredTodos;
}

/**
 * Get statistics about the todos
 * @param {Object} appState - The current application state
 * @returns {Object} - Object containing statistics about todos
 */
function getTodoStats(appState) {
    const allTodos = appState.todos;
    const activeTodos = allTodos.filter(todo => !todo.completed);
    const completedTodos = allTodos.filter(todo => todo.completed);

    return {
        total: allTodos.length,
        active: activeTodos.length,
        completed: completedTodos.length,
        completedPercentage: allTodos.length > 0 ? Math.round((completedTodos.length / allTodos.length) * 100) : 0
    };
}

/**
 * Format todos for display
 * @param {Array} todos - Array of todo objects to format
 * @param {boolean} includeIndex - Whether to include index numbers
 * @returns {Array<string>} - Array of formatted strings for display
 */
function formatTodosForDisplay(todos, includeIndex = true) {
    if (!Array.isArray(todos)) {
        throw new Error('Todos must be an array');
    }

    const formattedTodos = [];
    
    todos.forEach((todo, index) => {
        const status = todo.completed ? '✓' : '○';
        const prefix = includeIndex ? `${index + 1}. ` : '';
        const formatted = `${prefix}[${status}] ${todo.id}: ${todo.title} (Created: ${new Date(todo.createdAt).toLocaleDateString()})`;
        formattedTodos.push(formatted);
    });

    return formattedTodos;
}

/**
 * Get todos with search functionality
 * @param {Object} appState - The current application state
 * @param {string} searchTerm - Term to search for in todo titles
 * @param {string} filter - Filter type ('all', 'active', or 'completed')
 * @returns {Array} - Array of todos matching both the filter and search term
 */
function searchTodos(appState, searchTerm, filter = 'all') {
    if (typeof searchTerm !== 'string') {
        throw new Error('Search term must be a string');
    }

    if (!['all', 'active', 'completed'].includes(filter)) {
        throw new Error('Filter must be "all", "active", or "completed"');
    }

    // First get the filtered todos
    const filteredTodos = listTodos(appState, filter);

    // Then filter by search term (case insensitive)
    const searchLower = searchTerm.toLowerCase();
    const searchedTodos = filteredTodos.filter(todo => 
        todo.title.toLowerCase().includes(searchLower)
    );

    return searchedTodos;
}

/**
 * Get a specific todo by ID
 * @param {Object} appState - The current application state
 * @param {number} id - ID of the todo to retrieve
 * @returns {Object|null} - The todo object if found, otherwise null
 */
function getTodoById(appState, id) {
    if (typeof id !== 'number' || id < 1) {
        throw new Error('ID must be a positive number');
    }

    return appState.findTodoById(id);
}

/**
 * Check if there are any todos matching the current filter
 * @param {Object} appState - The current application state
 * @param {string} filter - Filter type ('all', 'active', or 'completed')
 * @returns {boolean} - True if there are todos matching the filter, false otherwise
 */
function hasTodos(appState, filter = 'all') {
    const todos = listTodos(appState, filter);
    return todos.length > 0;
}

/**
 * Sort todos by specified criteria
 * @param {Object} appState - The current application state
 * @param {string} sortBy - Criteria to sort by ('id', 'title', 'createdAt', 'updatedAt', 'completed')
 * @param {boolean} ascending - Whether to sort in ascending order (default: true)
 * @param {string} filter - Filter type ('all', 'active', or 'completed')
 * @returns {Array} - Array of sorted todos
 */
function sortTodos(appState, sortBy = 'id', ascending = true, filter = 'all') {
    if (!['id', 'title', 'createdAt', 'updatedAt', 'completed'].includes(sortBy)) {
        throw new Error('Sort by must be one of: id, title, createdAt, updatedAt, completed');
    }

    const todos = listTodos(appState, filter);

    const sortedTodos = [...todos].sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        // Handle date comparison
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        // Handle string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (ascending) {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    return sortedTodos;
}

module.exports = {
    listTodos,
    getTodoStats,
    formatTodosForDisplay,
    searchTodos,
    getTodoById,
    hasTodos,
    sortTodos
};