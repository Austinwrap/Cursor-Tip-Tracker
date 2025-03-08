// This file helps Netlify understand how to handle Next.js
// It's a simple adapter that ensures proper routing

exports.handler = async function(event, context) {
  // This is a placeholder file that helps Netlify's build process
  // The actual handling is done by the @netlify/plugin-nextjs plugin
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Next.js handler initialized" })
  };
}; 