// scripts/testGenerate.js
// Usage:
// $env:GEMINI_API_KEY='KEY'; node .\scripts\testGenerate.js

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(2);
}

(async function(){
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: 'Say hello and confirm generateContent call works.' }] }]
  };

  try {
    console.log('Posting to', url);
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    console.log('Status:', res.status);
    const txt = await res.text();
    console.log('Body:', txt);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
