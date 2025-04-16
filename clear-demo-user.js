// Script to completely clear localStorage and remove demo user information
console.log("Starting cleanup of localStorage...");

// Save theme mode if it exists
const themeMode = localStorage.getItem('themeMode');
console.log("Current theme mode:", themeMode);

// Clear all localStorage items
console.log("Clearing all localStorage items...");
localStorage.clear();

// Restore theme mode if it existed
if (themeMode) {
  console.log("Restoring theme mode:", themeMode);
  localStorage.setItem('themeMode', themeMode);
}

console.log("localStorage cleanup complete!");
console.log("Please refresh the page to see the changes.");
