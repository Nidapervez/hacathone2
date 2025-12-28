/**
 * Load Todos from File Function
 * Handles reading todos data from persistent storage
 */

const fs = require('fs');
const { DATA_CONFIG, ensureDataCompatibility } = require('./data_model');
const Todo = require('./todo_class');

/**
 * Load todos from file
 * @param {string} filePath - Path to load the file from (optional, uses default if not provided)
 * @returns {Promise<Object|null>} - Promise that resolves to the loaded data or null if failed
 */
async function loadTodosFromFile(filePath = DATA_CONFIG.DATA_PATH) {
    try {
        // Check if file exists
        const fileExists = fs.existsSync(filePath);
        
        if (!fileExists) {
            console.log(`File ${filePath} does not exist. Returning default data.`);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        }

        // Read the file
        const fileContent = await fs.promises.readFile(filePath, 'utf8');

        // Parse the JSON content
        const parsedData = JSON.parse(fileContent);

        // Ensure the data is compatible with our expected structure
        const compatibleData = ensureDataCompatibility(parsedData);

        console.log(`Todos successfully loaded from ${filePath}`);
        return compatibleData;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File ${filePath} does not exist. Returning default data.`);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        } else if (error instanceof SyntaxError) {
            console.error('Error parsing JSON from file:', error.message);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        } else {
            console.error('Error loading todos from file:', error.message);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        }
    }
}

/**
 * Synchronous version of loadTodosFromFile
 * @param {string} filePath - Path to load the file from
 * @returns {Object|null} - Loaded data or null if failed
 */
function loadTodosFromFileSync(filePath = DATA_CONFIG.DATA_PATH) {
    try {
        // Check if file exists
        const fileExists = fs.existsSync(filePath);
        
        if (!fileExists) {
            console.log(`File ${filePath} does not exist. Returning default data.`);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        }

        // Read the file synchronously
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse the JSON content
        const parsedData = JSON.parse(fileContent);

        // Ensure the data is compatible with our expected structure
        const compatibleData = ensureDataCompatibility(parsedData);

        console.log(`Todos successfully loaded from ${filePath}`);
        return compatibleData;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File ${filePath} does not exist. Returning default data.`);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        } else if (error instanceof SyntaxError) {
            console.error('Error parsing JSON from file:', error.message);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        } else {
            console.error('Error loading todos from file:', error.message);
            return { ...DATA_CONFIG.DEFAULT_DATA };
        }
    }
}

/**
 * Load todos from file and convert to Todo instances
 * @param {string} filePath - Path to load the file from
 * @returns {Promise<Object>} - Promise that resolves to an object with Todo instances and state
 */
async function loadTodosAsInstances(filePath = DATA_CONFIG.DATA_PATH) {
    try {
        const data = await loadTodosFromFile(filePath);
        
        if (!data || !Array.isArray(data.todos)) {
            return {
                todos: [],
                nextId: 1,
                currentView: 'all'
            };
        }

        // Convert plain todo objects to Todo instances
        const todoInstances = data.todos.map(todoObj => {
            try {
                return Todo.fromObject(todoObj);
            } catch (error) {
                console.error(`Error converting todo object to instance:`, error.message);
                // Return a default todo if conversion fails
                return new Todo(
                    todoObj.id || Date.now(),
                    todoObj.title || 'Recovery todo',
                    todoObj.completed || false,
                    todoObj.createdAt,
                    todoObj.updatedAt
                );
            }
        });

        return {
            todos: todoInstances,
            nextId: data.nextId || 1,
            currentView: data.currentView || 'all'
        };
    } catch (error) {
        console.error('Error loading todos as instances:', error.message);
        return {
            todos: [],
            nextId: 1,
            currentView: 'all'
        };
    }
}

module.exports = {
    loadTodosFromFile,
    loadTodosFromFileSync,
    loadTodosAsInstances
};