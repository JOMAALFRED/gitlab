// app.js
const express = require('express');
const app = express();
const port = 3000;

// This version will be updated in the demo to show the CI/CD working
const appVersion = "1.0"; 

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CI/CD Demo App</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
            .container { text-align: center; background-color: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
            h1 { color: #333; }
            p { color: #666; font-size: 1.2em; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello CI/CD!</h1>
            <p>This is version <strong>${appVersion}</strong> of the demo application.</p>
            <p>Deployed automatically via Jenkins and GitLab.</p>
        </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});