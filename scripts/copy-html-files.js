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
  'tips',
  'premium-dashboard'
];

console.log('Starting HTML file generation for Netlify deployment...');
console.log(`Output directory: ${outDir}`);

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

// Check if index.html exists
const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('Warning: index.html file not found in the "out" directory. Using 404.html as template.');
} else {
  console.log('Found index.html, will use it as template for route HTML files.');
}

// Use index.html as template if it exists, otherwise use 404.html
const templatePath = fs.existsSync(indexPath) ? indexPath : notFoundPath;
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Copy template to each route HTML file
let successCount = 0;
for (const route of routes) {
  const routeHtmlPath = path.join(outDir, `${route}.html`);
  
  try {
    fs.writeFileSync(routeHtmlPath, templateContent);
    console.log(`✅ Created ${route}.html`);
    successCount++;
  } catch (error) {
    console.error(`❌ Error creating ${route}.html:`, error.message);
  }
}

// Also ensure we have a 200.html file for Netlify's default success page
try {
  fs.writeFileSync(path.join(outDir, '200.html'), templateContent);
  console.log('✅ Created 200.html');
  successCount++;
} catch (error) {
  console.error('❌ Error creating 200.html:', error.message);
}

console.log(`\n🎉 Successfully created ${successCount} of ${routes.length + 1} HTML files.`);
console.log('HTML file generation complete!'); 