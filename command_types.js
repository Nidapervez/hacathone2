/**
 * Command Structures and Types
 * Defines the structure for commands and available command types
 */

// Define command types/constants
const COMMAND_TYPES = {
    ADD_TODO: 'ADD_TODO',
    COMPLETE_TODO: 'COMPLETE_TODO',
    INCOMPLETE_TODO: 'INCOMPLETE_TODO',
    TOGGLE_TODO: 'TOGGLE_TODO',
    DELETE_TODO: 'DELETE_TODO',
    EDIT_TODO: 'EDIT_TODO',
    LIST_TODOS: 'LIST_TODOS',
    CLEAR_COMPLETED: 'CLEAR_COMPLETED',
    FILTER_TODOS: 'FILTER_TODOS',
    HELP: 'HELP',
    EXIT: 'EXIT',
    UNKNOWN: 'UNKNOWN'
};

// Command structure
class Command {
    /**
     * Create a command object
     * @param {string} type - Type of command (from COMMAND_TYPES)
     * @param {Object} payload - Command-specific data
     * @param {Object} meta - Additional metadata
     */
    constructor(type, payload = {}, meta = {}) {
        this.type = type;
        this.payload = payload;
        this.meta = meta;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Validate the command
     * @returns {boolean} True if command is valid, false otherwise
     */
    isValid() {
        return this.type && Object.values(COMMAND_TYPES).includes(this.type);
    }

    /**
     * Get a plain object representation of the command
     * @returns {Object} Plain object with command properties
     */
    toJSON() {
        return {
            type: this.type,
            payload: this.payload,
            meta: this.meta,
            timestamp: this.timestamp
        };
    }

    /**
     * Create a Command instance from a plain object
     * @param {Object} obj - Plain object with command properties
     * @returns {Command} New Command instance
     */
    static fromObject(obj) {
        if (!obj || typeof obj !== 'object') {
            throw new Error('Invalid command object');
        }

        const { type, payload, meta } = obj;
        
        if (!type) {
            throw new Error('Command object must have a type');
        }

        return new Command(type, payload, meta);
    }
}

// Export command types and Command class
module.exports = {
    COMMAND_TYPES,
    Command
};