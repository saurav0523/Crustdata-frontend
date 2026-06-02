import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), function(err) {
    if (err) {
      res.status(500).send('Vite build dist folder not found on server!');
    }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
