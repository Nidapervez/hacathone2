/**
 * Application State Structure
 * Defines the structure for the application state
 */

// Application state structure
class AppState {
    /**
     * Create an application state instance
     * @param {Array} todos - Array of Todo objects
     * @param {number} nextId - Next available ID for new todos
     * @param {string} currentView - Current view mode (all/done/active)
     */
    constructor(todos = [], nextId = 1, currentView = 'all') {
        this.todos = Array.isArray(todos) ? todos : [];
        this.nextId = nextId;
        this.currentView = currentView;
    }

    /**
     * Add a todo to the state
     * @param {Todo} todo - Todo object to add
     */
    addTodo(todo) {
        this.todos.push(todo);
        // Update nextId if the added todo has a higher ID
        if (todo.id >= this.nextId) {
            this.nextId = todo.id + 1;
        }
    }

    /**
     * Find a todo by ID
     * @param {number} id - ID of the todo to find
     * @returns {Todo|null} Found todo or null if not found
     */
    findTodoById(id) {
        return this.todos.find(todo => todo.id === id) || null;
    }

    /**
     * Update a todo in the state
     * @param {Todo} updatedTodo - Updated todo object
     * @returns {boolean} True if todo was found and updated, false otherwise
     */
    updateTodo(updatedTodo) {
        const index = this.todos.findIndex(todo => todo.id === updatedTodo.id);
        if (index !== -1) {
            this.todos[index] = updatedTodo;
            return true;
        }
        return false;
    }

    /**
     * Remove a todo from the state
     * @param {number} id - ID of the todo to remove
     * @returns {boolean} True if todo was found and removed, false otherwise
     */
    removeTodo(id) {
        const initialLength = this.todos.length;
        this.todos = this.todos.filter(todo => todo.id !== id);
        return this.todos.length < initialLength;
    }

    /**
     * Get todos based on the current filter
     * @returns {Array} Filtered array of todos
     */
    getFilteredTodos() {
        switch (this.currentView) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'all':
            default:
                return this.todos;
        }
    }

    /**
     * Set the current view filter
     * @param {string} view - View filter ('all', 'active', or 'completed')
     */
    setCurrentView(view) {
        if (['all', 'active', 'completed'].includes(view)) {
            this.currentView = view;
        } else {
            throw new Error(`Invalid view: ${view}. Must be 'all', 'active', or 'completed'`);
        }
    }

    /**
     * Get a plain object representation of the state (for JSON serialization)
     * @returns {Object} Plain object with state properties
     */
    toJSON() {
        return {
            todos: this.todos.map(todo => todo.toJSON()),
            nextId: this.nextId,
            currentView: this.currentView
        };
    }

    /**
     * Create an AppState instance from a plain object
     * @param {Object} obj - Plain object with state properties
     * @returns {AppState} New AppState instance
     */
    static fromObject(obj) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid state object');
        }

        const { todos, nextId, currentView } = obj;
        
        // Convert plain todo objects to Todo instances
        const todoInstances = Array.isArray(todos) 
            ? todos.map(todoObj => require('./todo_class').fromObject(todoObj))
            : [];

        return new AppState(
            todoInstances,
            nextId || 1,
            currentView || 'all'
        );
    }
}

module.exports = AppState;