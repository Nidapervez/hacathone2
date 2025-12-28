/**
 * Command Parser
 * Parses user input into command objects
 */

const { COMMAND_TYPES, Command } = require('./command_types');

// Command patterns and aliases
const COMMAND_PATTERNS = {
    ADD: /^(add|create|new)\s+(.+)$/i,
    COMPLETE: /^(complete|done|finish|check)\s+(\d+)$/i,
    INCOMPLETE: /^(incomplete|notdone|uncheck|unfinish)\s+(\d+)$/i,
    TOGGLE: /^(toggle|switch)\s+(\d+)$/i,
    DELETE: /^(delete|remove|del|rm)\s+(\d+)$/i,
    EDIT: /^(edit|update|change)\s+(\d+)\s+(.+)$/i,
    LIST: /^(list|show|view|ls)(?:\s+(all|active|completed))?$/i,
    CLEAR_COMPLETED: /^(clear|clean|clearcompleted|clear-done|clear_done)$/i,
    FILTER: /^(filter|view)\s+(all|active|completed)$/i,
    HELP: /^(help|\?|--help|-h)$/i,
    EXIT: /^(exit|quit|q|stop|end|bye)$/i,
    SEARCH: /^(search|find)\s+(.+)$/i,
    STATS: /^(stats|statistics|count)$/i,
    SORT: /^(sort)\s+(id|title|date|status)(?:\s+(asc|desc))?$/i
};

// Command aliases mapping
const COMMAND_ALIASES = {
    'a': 'ADD',
    'c': 'COMPLETE',
    'i': 'INCOMPLETE',
    't': 'TOGGLE',
    'd': 'DELETE',
    'e': 'EDIT',
    'l': 'LIST',
    'cc': 'CLEAR_COMPLETED',
    'f': 'FILTER',
    'h': 'HELP',
    'x': 'EXIT',
    's': 'SEARCH',
    'st': 'STATS'
};

/**
 * Parse user input into a command object
 * @param {string} input - User input string
 * @returns {Command} - Parsed command object
 */
function parseCommand(input) {
    if (typeof input !== 'string' || input.trim() === '') {
        return new Command(COMMAND_TYPES.UNKNOWN, { input: input }, { error: 'Empty input' });
    }

    const trimmedInput = input.trim();
    const lowerInput = trimmedInput.toLowerCase();

    // Check for exact command aliases first
    if (COMMAND_ALIASES[lowerInput]) {
        const commandType = COMMAND_ALIASES[lowerInput];
        return new Command(COMMAND_TYPES[commandType], { input: trimmedInput });
    }

    // Check each command pattern
    for (const [commandName, pattern] of Object.entries(COMMAND_PATTERNS)) {
        const match = trimmedInput.match(pattern);
        if (match) {
            return createCommandFromMatch(commandName, match);
        }
    }

    // If no pattern matches, return unknown command
    return new Command(COMMAND_TYPES.UNKNOWN, { input: trimmedInput });
}

/**
 * Create a command object from a regex match
 * @param {string} commandName - Name of the command
 * @param {Array} match - Regex match array
 * @returns {Command} - Command object based on the match
 */
function createCommandFromMatch(commandName, match) {
    const [, ...args] = match;

    switch (commandName) {
        case 'ADD':
            // Extract title and handle quoted strings properly
            let title = args[1].trim();
            // Check if the title is quoted and extract the content between quotes
            const quotedMatch = title.match(/^"(.*)"$/);
            if (quotedMatch) {
                title = quotedMatch[1]; // Extract content between quotes
            }
            return new Command(
                COMMAND_TYPES.ADD_TODO,
                { title: title }
            );

        case 'COMPLETE':
            return new Command(
                COMMAND_TYPES.COMPLETE_TODO,
                { id: parseInt(args[1], 10) }
            );

        case 'INCOMPLETE':
            return new Command(
                COMMAND_TYPES.INCOMPLETE_TODO,
                { id: parseInt(args[1], 10) }
            );

        case 'TOGGLE':
            return new Command(
                COMMAND_TYPES.TOGGLE_TODO,
                { id: parseInt(args[1], 10) }
            );

        case 'DELETE':
            return new Command(
                COMMAND_TYPES.DELETE_TODO,
                { id: parseInt(args[1], 10) }
            );

        case 'EDIT':
            // Extract title and handle quoted strings properly
            let editTitle = args[2].trim();
            // Check if the title is quoted and extract the content between quotes
            const editQuotedMatch = editTitle.match(/^"(.*)"$/);
            if (editQuotedMatch) {
                editTitle = editQuotedMatch[1]; // Extract content between quotes
            }
            return new Command(
                COMMAND_TYPES.EDIT_TODO,
                {
                    id: parseInt(args[1], 10),
                    title: editTitle
                }
            );

        case 'LIST':
            const filter = args[1] || 'all';
            return new Command(
                COMMAND_TYPES.LIST_TODOS,
                { filter: filter.toLowerCase() }
            );

        case 'CLEAR_COMPLETED':
            return new Command(
                COMMAND_TYPES.CLEAR_COMPLETED
            );

        case 'FILTER':
            return new Command(
                COMMAND_TYPES.FILTER_TODOS,
                { filter: args[0].toLowerCase() }
            );

        case 'HELP':
            return new Command(
                COMMAND_TYPES.HELP
            );

        case 'EXIT':
            return new Command(
                COMMAND_TYPES.EXIT
            );

        case 'SEARCH':
            // Extract search term and handle quoted strings properly
            let searchTerm = args[1].trim(); // Use args[1] since args[0] is the command word
            // Check if the search term is quoted and extract the content between quotes
            const searchQuotedMatch = searchTerm.match(/^"(.*)"$/);
            if (searchQuotedMatch) {
                searchTerm = searchQuotedMatch[1]; // Extract content between quotes
            }
            return new Command(
                COMMAND_TYPES.LIST_TODOS,
                {
                    filter: 'all',
                    searchTerm: searchTerm
                },
                { search: true }
            );

        case 'STATS':
            return new Command(
                COMMAND_TYPES.LIST_TODOS,
                { filter: 'all' },
                { stats: true }
            );

        case 'SORT':
            return new Command(
                COMMAND_TYPES.LIST_TODOS,
                { 
                    filter: 'all',
                    sortBy: args[0].toLowerCase(),
                    ascending: args[1] !== 'desc'
                },
                { sort: true }
            );

        default:
            return new Command(
                COMMAND_TYPES.UNKNOWN,
                { input: match[0] }
            );
    }
}

/**
 * Parse multiple commands from a single input (for batch operations)
 * @param {string} input - User input string containing multiple commands
 * @returns {Array<Command>} - Array of parsed command objects
 */
function parseMultipleCommands(input) {
    if (typeof input !== 'string') {
        return [new Command(COMMAND_TYPES.UNKNOWN, { input: input })];
    }

    // Split input by semicolon or newline for multiple commands
    const commandStrings = input.split(/;|\n/).map(cmd => cmd.trim()).filter(cmd => cmd);

    return commandStrings.map(cmd => parseCommand(cmd));
}

/**
 * Validate a command against expected format
 * @param {Command} command - Command object to validate
 * @returns {Object} - Object containing validation result and errors
 */
function validateParsedCommand(command) {
    const errors = [];

    if (!command || typeof command !== 'object') {
        errors.push('Command must be an object');
        return { isValid: false, errors };
    }

    if (!command.type) {
        errors.push('Command must have a type');
    }

    if (command.type === COMMAND_TYPES.ADD_TODO) {
        if (!command.payload || !command.payload.title) {
            errors.push('Add todo command must have a title');
        }
    } else if (command.type === COMMAND_TYPES.COMPLETE_TODO || 
               command.type === COMMAND_TYPES.INCOMPLETE_TODO ||
               command.type === COMMAND_TYPES.TOGGLE_TODO ||
               command.type === COMMAND_TYPES.DELETE_TODO) {
        if (!command.payload || typeof command.payload.id !== 'number') {
            errors.push('Todo command must have a valid ID');
        }
    } else if (command.type === COMMAND_TYPES.EDIT_TODO) {
        if (!command.payload || 
            typeof command.payload.id !== 'number' || 
            !command.payload.title) {
            errors.push('Edit todo command must have a valid ID and title');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    parseCommand,
    parseMultipleCommands,
    validateParsedCommand
};