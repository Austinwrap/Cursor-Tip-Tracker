/**
 * This script copies the 404.html file to create HTML files for all app routes
 * This ensures that direct navigation to routes works correctly on Netlify
 */

const fs = require('fs');
const path = require('path');

// Define the routes that need HTML files
const routes = [
  'dashboard',
  'signin',
  'signup',
  'history',
  'analytics',
  'upgrade',
  'tips',
  '200', // For default Netlify handling
];

// Path to the output directory
const outDir = path.join(__dirname, '../out');

// Check if the output directory exists
if (!fs.existsSync(outDir)) {
  console.error('Error: The "out" directory does not exist. Please run the build first.');
  process.exit(1);
}

// Path to the source index.html file
const indexPath = path.join(outDir, 'index.html');

// Check if the index.html file exists
if (!fs.existsSync(indexPath)) {
  console.error('Error: The index.html file does not exist in the "out" directory.');
  process.exit(1);
}

// Read the content of the index.html file
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Create HTML files for each route
let successCount = 0;
let errorCount = 0;

console.log('Creating HTML files for routes...');

routes.forEach(route => {
  const routePath = path.join(outDir, `${route}.html`);
  
  try {
    // Copy the index.html content to the route HTML file
    fs.writeFileSync(routePath, indexContent);
    console.log(`✅ Created ${route}.html`);
    successCount++;
  } catch (error) {
    console.error(`❌ Error creating ${route}.html:`, error.message);
    errorCount++;
  }
});

console.log(`\nSummary: Created ${successCount} HTML files, encountered ${errorCount} errors.`);

if (successCount === routes.length) {
  console.log('All HTML files were created successfully! 🎉');
} else {
  console.log('Some HTML files could not be created. Please check the errors above.');
} 