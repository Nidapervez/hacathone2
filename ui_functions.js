/**
 * User Interface Functions
 * Handles displaying menus, prompts, and results to the user
 */

/**
 * Display the main menu to the user
 */
function displayMenu() {
    console.log('\n--- Todo Application ---');
    console.log('Available commands:');
    console.log('  add "task"           - Add a new todo');
    console.log('  complete # / c #     - Mark todo # as complete');
    console.log('  incomplete # / i #   - Mark todo # as incomplete');
    console.log('  toggle # / t #       - Toggle completion status of todo #');
    console.log('  delete # / d #       - Delete todo #');
    console.log('  edit # "title" / e # - Edit the title of todo #');
    console.log('  list [all|active|completed] / l - List todos with optional filter');
    console.log('  clear / cc           - Clear all completed todos');
    console.log('  filter all|active|completed / f - Set current filter view');
    console.log('  search "term"        - Search todos by term');
    console.log('  stats                - Show todo statistics');
    console.log('  help / h             - Show help');
    console.log('  exit / x             - Exit application');
    console.log('------------------------\n');
}

/**
 * Display a prompt to the user
 */
function displayPrompt() {
    process.stdout.write('> ');
}

/**
 * Display todos in a formatted way
 * @param {Array} todos - Array of todo objects to display
 * @param {string} filter - The filter that was applied
 */
function displayTodos(todos, filter = 'all') {
    if (!Array.isArray(todos) || todos.length === 0) {
        console.log(`No ${filter === 'all' ? 'todo items' : filter} todo items found.`);
        return;
    }

    console.log(`\n${filter.charAt(0).toUpperCase() + filter.slice(1)} Todo Items (${todos.length}):`);
    console.log('-'.repeat(50));
    
    todos.forEach((todo, index) => {
        const status = todo.completed ? '✓' : '○';
        const statusText = todo.completed ? 'COMPLETED' : 'PENDING';
        const createdDate = new Date(todo.createdAt).toLocaleDateString();
        
        console.log(`${index + 1}. [${status}] ID: ${todo.id} - ${todo.title}`);
        console.log(`    Status: ${statusText} | Created: ${createdDate}`);
        
        if (todo.updatedAt !== todo.createdAt) {
            const updatedDate = new Date(todo.updatedAt).toLocaleDateString();
            console.log(`    Last Updated: ${updatedDate}`);
        }
        
        console.log('');
    });
}

/**
 * Display todo statistics
 * @param {Object} stats - Statistics object
 */
function displayStats(stats) {
    console.log('\n--- Todo Statistics ---');
    console.log(`Total Todos: ${stats.total}`);
    console.log(`Active: ${stats.active}`);
    console.log(`Completed: ${stats.completed}`);
    console.log(`Completion Rate: ${stats.completedPercentage}%`);
    console.log('------------------------\n');
}

/**
 * Display a success message
 * @param {string} message - Success message to display
 */
function displaySuccess(message) {
    console.log(`✓ ${message}`);
}

/**
 * Display an error message
 * @param {string} message - Error message to display
 */
function displayError(message) {
    console.log(`✗ Error: ${message}`);
}

/**
 * Display a general message
 * @param {string} message - Message to display
 */
function displayMessage(message) {
    console.log(message);
}

/**
 * Display command result based on command type
 * @param {Object} result - Result from command execution
 */
function displayCommandResult(result) {
    if (!result) {
        displayError('No result to display');
        return;
    }

    if (!result.success) {
        if (result.error) {
            displayError(result.error);
        } else {
            displayError(`Command failed: ${JSON.stringify(result)}`);
        }
        return;
    }

    switch (result.command) {
        case 'ADD_TODO':
            displaySuccess(`Added: ${result.result.todo.title} (ID: ${result.result.todo.id})`);
            break;

        case 'COMPLETE_TODO':
            displaySuccess(result.result.message);
            break;

        case 'INCOMPLETE_TODO':
            displaySuccess(result.result.message);
            break;

        case 'TOGGLE_TODO':
            displaySuccess(result.result.message);
            break;

        case 'DELETE_TODO':
            displaySuccess(result.result.message);
            break;

        case 'EDIT_TODO':
            displaySuccess(result.result.message);
            break;

        case 'LIST_TODOS':
            if (result.result.todos) {
                displayTodos(result.result.todos, result.result.filter);
            }
            if (result.result.stats) {
                displayStats(result.result.stats);
            }
            break;

        case 'CLEAR_COMPLETED':
            displayMessage(result.result.message);
            break;

        case 'FILTER_TODOS':
            displayMessage(result.result.message);
            break;

        case 'HELP':
            displayMessage(result.result.message);
            break;

        case 'EXIT':
            displayMessage(result.result.message);
            break;

        case 'UNKNOWN':
            displayError(result.result.message);
            if (result.result.help) {
                displayMessage(result.result.help);
            }
            break;

        default:
            displayMessage(`Result: ${JSON.stringify(result.result, null, 2)}`);
    }
}

/**
 * Display a welcome message
 */
function displayWelcome() {
    console.log('=====================================');
    console.log('    Welcome to the Todo Application');
    console.log('=====================================');
    console.log('Type "help" to see available commands');
    console.log('=====================================\n');
}

/**
 * Clear the console screen (platform independent)
 */
function clearScreen() {
    // Clear command based on platform
    const clearCommand = process.platform === 'win32' ? 'cls' : 'clear';
    process.stdout.write('\x1Bc'); // This is the ANSI escape code for clearing the screen
}

module.exports = {
    displayMenu,
    displayPrompt,
    displayTodos,
    displayStats,
    displaySuccess,
    displayError,
    displayMessage,
    displayCommandResult,
    displayWelcome,
    clearScreen
};