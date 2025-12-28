/**
 * Save Todos to File Function
 * Handles writing todos data to persistent storage
 */

const fs = require('fs');
const { DATA_CONFIG } = require('./data_model');

/**
 * Save todos to file
 * @param {Array|Object} data - Data to save (can be todos array or full app state)
 * @param {string} filePath - Path to save the file (optional, uses default if not provided)
 * @returns {Promise<boolean>} - Promise that resolves to true if save was successful, false otherwise
 */
async function saveTodosToFile(data, filePath = DATA_CONFIG.DATA_PATH) {
    try {
        // Ensure the data is in the correct format
        let saveData;
        
        // If data is an array (just todos), wrap it in the full app state structure
        if (Array.isArray(data)) {
            saveData = {
                todos: data,
                nextId: DATA_CONFIG.DEFAULT_DATA.nextId, // This should be passed in a real implementation
                currentView: DATA_CONFIG.DEFAULT_DATA.currentView,
                version: DATA_CONFIG.DEFAULT_DATA.version
            };
        } else if (typeof data === 'object' && data !== null) {
            // If data is an object (full app state), use it as is
            saveData = {
                ...DATA_CONFIG.DEFAULT_DATA,
                ...data
            };
        } else {
            throw new Error('Invalid data format: data must be an array or object');
        }

        // Convert the data to a formatted JSON string
        const jsonData = JSON.stringify(saveData, null, 2);

        // Write the data to the file
        await fs.promises.writeFile(filePath, jsonData, 'utf8');

        console.log(`Todos successfully saved to ${filePath}`);
        return true;
    } catch (error) {
        console.error('Error saving todos to file:', error.message);
        return false;
    }
}

/**
 * Synchronous version of saveTodosToFile
 * @param {Array|Object} data - Data to save
 * @param {string} filePath - Path to save the file
 * @returns {boolean} - True if save was successful, false otherwise
 */
function saveTodosToFileSync(data, filePath = DATA_CONFIG.DATA_PATH) {
    try {
        // Ensure the data is in the correct format
        let saveData;
        
        if (Array.isArray(data)) {
            saveData = {
                todos: data,
                nextId: DATA_CONFIG.DEFAULT_DATA.nextId,
                currentView: DATA_CONFIG.DEFAULT_DATA.currentView,
                version: DATA_CONFIG.DEFAULT_DATA.version
            };
        } else if (typeof data === 'object' && data !== null) {
            saveData = {
                ...DATA_CONFIG.DEFAULT_DATA,
                ...data
            };
        } else {
            throw new Error('Invalid data format: data must be an array or object');
        }

        // Convert the data to a formatted JSON string
        const jsonData = JSON.stringify(saveData, null, 2);

        // Write the data to the file synchronously
        fs.writeFileSync(filePath, jsonData, 'utf8');

        console.log(`Todos successfully saved to ${filePath}`);
        return true;
    } catch (error) {
        console.error('Error saving todos to file:', error.message);
        return false;
    }
}

module.exports = {
    saveTodosToFile,
    saveTodosToFileSync
};