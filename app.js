const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the "public" folder (cover image, CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Environment-controlled variables
const MESSAGE = 'I am building pipelines like a pro!';
const TEAM = process.env.TEAM || 'Member A, Member B, Member C';
const COVER = process.env.COVER || '/cover.jpg';

// Home route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>CI/CD Demo</title></head>
      <body style="font-family:Arial;margin:40px">
        <img src="${COVER}" style="max-width:100%;border-radius:10px">
        <h1>${MESSAGE}</h1>
        <h3>Team Members</h3>
        <p>${TEAM}</p>
      </body>
    </html>
  `);
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(\`✅ App running on http://localhost:\${port}\`));
