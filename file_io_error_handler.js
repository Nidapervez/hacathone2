/**
 * File I/O Error Handling Utilities
 * Provides comprehensive error handling for file operations
 */

const fs = require('fs');
const path = require('path');

// Error types specific to file operations
class FileIOError extends Error {
    constructor(message, code, filePath) {
        super(message);
        this.name = 'FileIOError';
        this.code = code;
        this.filePath = filePath;
    }
}

// Common file operation errors
const FILE_ERROR_TYPES = {
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INVALID_JSON: 'INVALID_JSON',
    DISK_FULL: 'DISK_FULL',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Handle file read errors gracefully
 * @param {Error} error - The error that occurred
 * @param {string} filePath - Path of the file that caused the error
 * @returns {Object} - Object with error details and fallback data
 */
function handleReadError(error, filePath) {
    let errorType;
    let errorMessage = error.message;

    switch (error.code) {
        case 'ENOENT':
            errorType = FILE_ERROR_TYPES.FILE_NOT_FOUND;
            errorMessage = `File not found: ${filePath}`;
            break;
        case 'EACCES':
            errorType = FILE_ERROR_TYPES.PERMISSION_DENIED;
            errorMessage = `Permission denied reading file: ${filePath}`;
            break;
        case 'ENOSPC':
            errorType = FILE_ERROR_TYPES.DISK_FULL;
            errorMessage = `Disk full or quota exceeded reading file: ${filePath}`;
            break;
        case 'EISDIR':
            errorType = FILE_ERROR_TYPES.UNKNOWN_ERROR;
            errorMessage = `Expected file but found directory: ${filePath}`;
            break;
        default:
            if (error instanceof SyntaxError) {
                errorType = FILE_ERROR_TYPES.INVALID_JSON;
                errorMessage = `Invalid JSON in file: ${filePath}. ${error.message}`;
            } else {
                errorType = FILE_ERROR_TYPES.UNKNOWN_ERROR;
                errorMessage = `Unknown error reading file ${filePath}: ${error.message}`;
            }
    }

    console.warn(`[File Read Warning] ${errorMessage}`);

    // Return fallback data
    return {
        error: new FileIOError(errorMessage, errorType, filePath),
        fallbackData: {
            todos: [],
            nextId: 1,
            currentView: 'all'
        }
    };
}

/**
 * Handle file write errors gracefully
 * @param {Error} error - The error that occurred
 * @param {string} filePath - Path of the file that caused the error
 * @returns {Object} - Object with error details
 */
function handleWriteError(error, filePath) {
    let errorType;
    let errorMessage = error.message;

    switch (error.code) {
        case 'EACCES':
            errorType = FILE_ERROR_TYPES.PERMISSION_DENIED;
            errorMessage = `Permission denied writing to file: ${filePath}`;
            break;
        case 'ENOSPC':
            errorType = FILE_ERROR_TYPES.DISK_FULL;
            errorMessage = `Disk full or quota exceeded writing to file: ${filePath}`;
            break;
        case 'EISDIR':
            errorType = FILE_ERROR_TYPES.UNKNOWN_ERROR;
            errorMessage = `Expected file but found directory: ${filePath}`;
            break;
        default:
            errorType = FILE_ERROR_TYPES.UNKNOWN_ERROR;
            errorMessage = `Unknown error writing to file ${filePath}: ${error.message}`;
    }

    console.error(`[File Write Error] ${errorMessage}`);

    return {
        error: new FileIOError(errorMessage, errorType, filePath),
        success: false
    };
}

/**
 * Attempt to read a file with fallback to in-memory storage
 * @param {string} filePath - Path of the file to read
 * @param {Object} fallbackData - Data to return if file read fails
 * @returns {Promise<Object>} - Promise resolving to file content or fallback data
 */
async function readWithFallback(filePath, fallbackData = null) {
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        try {
            const parsedData = JSON.parse(fileContent);
            return parsedData;
        } catch (parseError) {
            const { fallbackData: parseFallback } = handleReadError(parseError, filePath);
            return parseFallback;
        }
    } catch (readError) {
        const { fallbackData: readFallback } = handleReadError(readError, filePath);
        return fallbackData !== null ? fallbackData : readFallback;
    }
}

/**
 * Attempt to write a file with fallback to in-memory storage
 * @param {string} filePath - Path of the file to write
 * @param {Object} data - Data to write to the file
 * @returns {Promise<boolean>} - Promise resolving to write success status
 */
async function writeWithFallback(filePath, data) {
    try {
        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }

        const jsonData = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, jsonData, 'utf8');
        return true;
    } catch (writeError) {
        handleWriteError(writeError, filePath);
        return false;
    }
}

/**
 * Check if file operations are possible
 * @param {string} filePath - Path to check
 * @returns {Object} - Object with file operation capabilities
 */
function checkFileCapabilities(filePath) {
    try {
        const dirPath = path.dirname(filePath);
        
        // Check if directory exists and is writable
        let dirWritable = true;
        try {
            if (fs.existsSync(dirPath)) {
                fs.accessSync(dirPath, fs.constants.W_OK);
            } else {
                // Check parent directory
                const parentDir = path.dirname(dirPath);
                fs.accessSync(parentDir, fs.constants.W_OK);
            }
        } catch {
            dirWritable = false;
        }
        
        // Check if file exists and is readable
        const fileExists = fs.existsSync(filePath);
        let fileReadable = false;
        if (fileExists) {
            try {
                fs.accessSync(filePath, fs.constants.R_OK);
                fileReadable = true;
            } catch {
                fileReadable = false;
            }
        }
        
        return {
            directoryWritable: dirWritable,
            fileExists: fileExists,
            fileReadable: fileReadable,
            canRead: fileExists && fileReadable,
            canWrite: dirWritable
        };
    } catch (error) {
        return {
            directoryWritable: false,
            fileExists: false,
            fileReadable: false,
            canRead: false,
            canWrite: false
        };
    }
}

module.exports = {
    FileIOError,
    FILE_ERROR_TYPES,
    handleReadError,
    handleWriteError,
    readWithFallback,
    writeWithFallback,
    checkFileCapabilities
};