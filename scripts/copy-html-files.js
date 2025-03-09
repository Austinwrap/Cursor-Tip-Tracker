/**
 * This script copies the 404.html file to create HTML files for all app routes
 * This ensures that direct navigation to routes works correctly on Netlify
 */

const fs = require('fs');
const path = require('path');

// Output directory where Next.js builds the static files
const outDir = path.join(__dirname, '..', 'out');

// List of routes that need HTML files
const routes = [
  'dashboard',
  'history',
  'analytics',
  'upgrade',
  'signin',
  'signup',
  'tips'
];

// Check if the out directory exists
if (!fs.existsSync(outDir)) {
  console.error('Error: The "out" directory does not exist. Make sure the Next.js build completed successfully.');
  process.exit(1);
}

// Check if 404.html exists
const notFoundPath = path.join(outDir, '404.html');
if (!fs.existsSync(notFoundPath)) {
  console.error('Error: 404.html file not found in the "out" directory.');
  process.exit(1);
}

// Read the 404.html file content
const notFoundContent = fs.readFileSync(notFoundPath, 'utf8');

// Copy 404.html to each route HTML file
let successCount = 0;
for (const route of routes) {
  const routeHtmlPath = path.join(outDir, `${route}.html`);
  
  try {
    fs.writeFileSync(routeHtmlPath, notFoundContent);
    console.log(`✅ Created ${route}.html`);
    successCount++;
  } catch (error) {
    console.error(`❌ Error creating ${route}.html:`, error.message);
  }
}

console.log(`\n🎉 Successfully created ${successCount} of ${routes.length} HTML files.`); 