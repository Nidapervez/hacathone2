/**
 * Command Router
 * Routes parsed commands to appropriate handlers
 */

const { COMMAND_TYPES } = require('./command_types');
const { addTodoWithPersistence } = require('./add_todo');
const { 
    completeTodoWithPersistence, 
    incompleteTodoWithPersistence, 
    toggleTodoWithPersistence 
} = require('./complete_todo');
const { deleteTodoWithPersistence } = require('./delete_todo');
const { editTodoWithPersistence } = require('./edit_todo');
const { listTodos, getTodoStats, searchTodos, sortTodos, formatTodosForDisplay } = require('./list_todos');
const { clearCompletedTodosWithPersistence } = require('./clear_completed');

/**
 * Command router class to handle routing of commands to appropriate handlers
 */
class CommandRouter {
    /**
     * Create a new command router
     * @param {Object} appState - The application state
     * @param {Function} saveFunction - Function to save the application state
     * @param {Function} displayFunction - Function to display results to the user
     */
    constructor(appState, saveFunction, displayFunction) {
        this.appState = appState;
        this.saveFunction = saveFunction;
        this.displayFunction = displayFunction;
    }

    /**
     * Route a command to the appropriate handler
     * @param {Object} command - The parsed command object
     * @returns {Promise<Object>} - Promise resolving to command result
     */
    async routeCommand(command) {
        if (!command || !command.type) {
            throw new Error('Invalid command: command must have a type');
        }

        try {
            switch (command.type) {
                case COMMAND_TYPES.ADD_TODO:
                    return await this.handleAddTodo(command);
                
                case COMMAND_TYPES.COMPLETE_TODO:
                    return await this.handleCompleteTodo(command);
                
                case COMMAND_TYPES.INCOMPLETE_TODO:
                    return await this.handleIncompleteTodo(command);
                
                case COMMAND_TYPES.TOGGLE_TODO:
                    return await this.handleToggleTodo(command);
                
                case COMMAND_TYPES.DELETE_TODO:
                    return await this.handleDeleteTodo(command);
                
                case COMMAND_TYPES.EDIT_TODO:
                    return await this.handleEditTodo(command);
                
                case COMMAND_TYPES.LIST_TODOS:
                    return await this.handleListTodos(command);
                
                case COMMAND_TYPES.CLEAR_COMPLETED:
                    return await this.handleClearCompleted(command);
                
                case COMMAND_TYPES.FILTER_TODOS:
                    return await this.handleFilterTodos(command);
                
                case COMMAND_TYPES.HELP:
                    return await this.handleHelp(command);
                
                case COMMAND_TYPES.EXIT:
                    return await this.handleExit(command);
                
                case COMMAND_TYPES.UNKNOWN:
                default:
                    return await this.handleUnknownCommand(command);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                command: command.type
            };
        }
    }

    /**
     * Handle ADD_TODO command
     */
    async handleAddTodo(command) {
        const result = await addTodoWithPersistence(
            this.appState, 
            command.payload.title, 
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.ADD_TODO,
            result: result
        };
    }

    /**
     * Handle COMPLETE_TODO command
     */
    async handleCompleteTodo(command) {
        const result = await completeTodoWithPersistence(
            this.appState,
            command.payload.id,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.COMPLETE_TODO,
            result: result
        };
    }

    /**
     * Handle INCOMPLETE_TODO command
     */
    async handleIncompleteTodo(command) {
        const result = await incompleteTodoWithPersistence(
            this.appState,
            command.payload.id,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.INCOMPLETE_TODO,
            result: result
        };
    }

    /**
     * Handle TOGGLE_TODO command
     */
    async handleToggleTodo(command) {
        const result = await toggleTodoWithPersistence(
            this.appState,
            command.payload.id,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.TOGGLE_TODO,
            result: result
        };
    }

    /**
     * Handle DELETE_TODO command
     */
    async handleDeleteTodo(command) {
        const result = await deleteTodoWithPersistence(
            this.appState,
            command.payload.id,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.DELETE_TODO,
            result: result
        };
    }

    /**
     * Handle EDIT_TODO command
     */
    async handleEditTodo(command) {
        const result = await editTodoWithPersistence(
            this.appState,
            command.payload.id,
            command.payload.title,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.EDIT_TODO,
            result: result
        };
    }

    /**
     * Handle LIST_TODOS command
     */
    async handleListTodos(command) {
        let todos;
        let stats;
        
        // Check if command has search term
        if (command.meta && command.meta.search) {
            todos = searchTodos(
                this.appState,
                command.payload.searchTerm,
                command.payload.filter
            );
        } 
        // Check if command has sort instruction
        else if (command.meta && command.meta.sort) {
            todos = sortTodos(
                this.appState,
                command.payload.sortBy,
                command.payload.ascending,
                command.payload.filter
            );
        }
        else {
            // Regular list command
            todos = listTodos(this.appState, command.payload.filter);
        }
        
        // If command has stats flag, include stats
        if (command.meta && command.meta.stats) {
            stats = getTodoStats(this.appState);
        }
        
        return {
            success: true,
            command: COMMAND_TYPES.LIST_TODOS,
            result: {
                todos: todos,
                stats: stats,
                filter: command.payload.filter,
                count: todos.length
            }
        };
    }

    /**
     * Handle CLEAR_COMPLETED command
     */
    async handleClearCompleted(command) {
        const result = await clearCompletedTodosWithPersistence(
            this.appState,
            this.saveFunction
        );
        
        return {
            success: true,
            command: COMMAND_TYPES.CLEAR_COMPLETED,
            result: result
        };
    }

    /**
     * Handle FILTER_TODOS command
     */
    async handleFilterTodos(command) {
        // Just update the current view in the state
        this.appState.setCurrentView(command.payload.filter);
        
        const todos = listTodos(this.appState, command.payload.filter);
        
        return {
            success: true,
            command: COMMAND_TYPES.FILTER_TODOS,
            result: {
                todos: todos,
                filter: command.payload.filter,
                message: `Now showing ${command.payload.filter} todos`
            }
        };
    }

    /**
     * Handle HELP command
     */
    async handleHelp(command) {
        const helpText = `
Todo Application Commands:
  add "task" or new "task" or create "task" - Add a new todo
  complete # or done # or finish # - Mark todo # as complete
  incomplete # or notdone # - Mark todo # as incomplete
  toggle # - Toggle completion status of todo #
  delete # or remove # - Delete todo #
  edit # "new task" - Edit the title of todo #
  list [all|active|completed] - List todos with optional filter
  clear or clearcompleted - Clear all completed todos
  filter all|active|completed - Set current filter view
  search "term" - Search todos by term
  stats - Show todo statistics
  sort id|title|date|status [asc|desc] - Sort todos
  help or ? - Show this help
  exit or quit or q - Exit the application

Examples:
  add "Buy groceries"
  complete 1
  list active
  search "groceries"
  clear
  help

Shortcuts:
  a - add
  c # - complete #
  i # - incomplete #
  t # - toggle #
  d # - delete #
  e # "title" - edit #
  l - list
  cc - clear completed
  f - filter
  h - help
  x - exit
        `;

        return {
            success: true,
            command: COMMAND_TYPES.HELP,
            result: {
                message: helpText
            }
        };
    }

    /**
     * Handle EXIT command
     */
    async handleExit(command) {
        return {
            success: true,
            command: COMMAND_TYPES.EXIT,
            result: {
                exit: true,
                message: 'Exiting application...'
            }
        };
    }

    /**
     * Handle unknown commands
     */
    async handleUnknownCommand(command) {
        return {
            success: false,
            command: COMMAND_TYPES.UNKNOWN,
            result: {
                message: `Unknown command: ${command.payload.input || 'No input provided'}`,
                help: 'Type "help" to see available commands'
            }
        };
    }
}

module.exports = CommandRouter;