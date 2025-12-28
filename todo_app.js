/**
 * Phase 1 Console-Based Todo Application
 * Main Application Entry Point
 */

// Import required modules
const { mainLoopWithAsyncHandler } = require('./main_loop');

// Main application function
async function main() {
    console.log('Welcome to the Console-Based Todo Application!');

    // Run the main application loop
    await mainLoopWithAsyncHandler();
}

// Execute main function
main().catch(error => {
    console.error('An error occurred:', error.message);
    process.exit(1);
});

module.exports = {
    main
};