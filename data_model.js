/**
 * Data Model for Storing Todos
 * Defines the structure and location for persistent storage
 */

const path = require('path');

// Define the data storage configuration
const DATA_CONFIG = {
    // File name for storing todos
    FILE_NAME: 'todos.json',
    
    // Default directory for storing the data file
    DATA_DIR: path.join(__dirname),
    
    // Full path to the data file
    get DATA_PATH() {
        return path.join(this.DATA_DIR, this.FILE_NAME);
    },
    
    // Default data structure when file doesn't exist
    DEFAULT_DATA: {
        todos: [],
        nextId: 1,
        currentView: 'all',
        version: '1.0.0'
    }
};

// Function to validate the data structure
function validateDataStructure(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    // Check for required properties
    const requiredProps = ['todos', 'nextId', 'currentView'];
    return requiredProps.every(prop => data.hasOwnProperty(prop));
}

// Function to ensure data compatibility
function ensureDataCompatibility(data) {
    if (!data) {
        return { ...DATA_CONFIG.DEFAULT_DATA };
    }
    
    // Ensure all required properties exist
    const result = { ...DATA_CONFIG.DEFAULT_DATA, ...data };
    
    // Ensure todos is an array
    if (!Array.isArray(result.todos)) {
        result.todos = [];
    }
    
    // Ensure nextId is a positive number
    if (typeof result.nextId !== 'number' || result.nextId < 1) {
        result.nextId = 1;
    }
    
    // Ensure currentView is valid
    if (!['all', 'active', 'completed'].includes(result.currentView)) {
        result.currentView = 'all';
    }
    
    return result;
}

module.exports = {
    DATA_CONFIG,
    validateDataStructure,
    ensureDataCompatibility
};