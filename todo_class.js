/**
 * Todo Item Class
 * Represents a single todo item with properties and methods
 */

class Todo {
    /**
     * Create a new Todo item
     * @param {number} id - Unique identifier for the todo
     * @param {string} title - Title/description of the todo
     * @param {boolean} completed - Whether the todo is completed (default: false)
     * @param {string} createdAt - Timestamp when todo was created (optional)
     * @param {string} updatedAt - Timestamp when todo was last updated (optional)
     */
    constructor(id, title, completed = false, createdAt = null, updatedAt = null) {
        this.id = id;
        this.title = title.trim();
        this.completed = completed;
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    /**
     * Mark the todo as completed
     */
    complete() {
        this.completed = true;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Mark the todo as incomplete
     */
    uncomplete() {
        this.completed = false;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Toggle the completion status of the todo
     */
    toggle() {
        this.completed = !this.completed;
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Update the title of the todo
     * @param {string} newTitle - New title for the todo
     */
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Todo title cannot be empty');
        }
        this.title = newTitle.trim();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Get a plain object representation of the todo (for JSON serialization)
     * @returns {Object} Plain object with todo properties
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            completed: this.completed,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Create a Todo instance from a plain object
     * @param {Object} obj - Plain object with todo properties
     * @returns {Todo} New Todo instance
     */
    static fromObject(obj) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid todo object');
        }

        const { id, title, completed, createdAt, updatedAt } = obj;
        
        if (id === undefined || title === undefined) {
            throw new Error('Todo object must have id and title');
        }

        return new Todo(id, title, completed, createdAt, updatedAt);
    }
}

module.exports = Todo;