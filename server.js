// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

const corsOptions = {
  origin: [
    'https://nhinin.rf.gd',      // Thay bằng domain frontend của bạn
    'http://localhost:3000',     // nếu frontend chạy local
    'http://localhost:8000'      // nếu bạn dùng port 8000
  ],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  console.log('Body:', req.body);
  next();
});

app.post('/api/gemini', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    console.warn('[WARN] Missing text field in request body');
    return res.status(400).json({ error: 'Missing text field' });
  }

  try {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    console.log(`[INFO] Calling Gemini API for text: "${text}"`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: text }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('[INFO] Gemini API response:', data);

    let resultText = '';
    if (data.candidates && data.candidates.length > 0) {
      resultText = data.candidates[0].content.parts[0].text;
    } else if (data.results && data.results.length > 0) {
      resultText = data.results[0].text;
    } else if (data.text) {
      resultText = data.text;
    }

    console.log(`[INFO] Extracted resultText: "${resultText}"`);
    return res.json({ result: resultText });
  } catch (error) {
    console.error('[ERROR] Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
