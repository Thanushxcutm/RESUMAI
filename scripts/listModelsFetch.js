// scripts/listModelsFetch.js
// Tries multiple Generative API endpoints to list available models using an API key.
// Usage (PowerShell):
// $env:GEMINI_API_KEY='YOUR_KEY'; node .\scripts\listModelsFetch.js

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set.');
  process.exit(2);
}

const endpoints = [
  'https://generativelanguage.googleapis.com/v1/models',
  'https://generativelanguage.googleapis.com/v1beta/models',
  'https://generativelanguage.googleapis.com/v1beta2/models'
];

(async () => {
  for (const url of endpoints) {
    try {
      console.log('Trying', url);
      const res = await fetch(`${url}?key=${apiKey}`, { method: 'GET' });
      const text = await res.text();
      console.log('Status:', res.status);
      try {
        const json = JSON.parse(text);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response body (non-json):', text);
      }
      // Stop after the first successful HTTP 200 or readable JSON
      if (res.ok) return;
    } catch (err) {
      console.error('Fetch error for', url, err);
    }
  }
  console.error('All endpoints tried; none returned OK.');
  process.exit(1);
})();
