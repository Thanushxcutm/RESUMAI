// scripts/listModels.js
// Usage (PowerShell):
// $env:GEMINI_API_KEY="your_key_here"; node .\scripts\listModels.js

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY env var is not set.\nSet it and re-run: $env:GEMINI_API_KEY='YOUR_KEY'; node .\\scripts\\listModels.js");
    process.exit(2);
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);

    // Try to call a typical listModels method. SDKs differ; try common variants.
    if (typeof client.listModels === 'function') {
      const resp = await client.listModels();
      console.log("ListModels response:\n", JSON.stringify(resp, null, 2));
      return;
    }

    if (typeof client.listAvailableModels === 'function') {
      const resp = await client.listAvailableModels();
      console.log("listAvailableModels response:\n", JSON.stringify(resp, null, 2));
      return;
    }

    // Some SDK versions return a models client under client.models
    if (client.models && typeof client.models.list === 'function') {
      const resp = await client.models.list();
      console.log("models.list response:\n", JSON.stringify(resp, null, 2));
      return;
    }

    console.error('No known list-models method found on GoogleGenerativeAI instance. Inspect the SDK docs.');
    process.exit(3);
  } catch (err) {
    console.error('ListModels call failed:', err);
    process.exit(1);
  }
}

main();
