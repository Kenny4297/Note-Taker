const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 5601;

app.use(express.static('public'));

app.get('/notes', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json');
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on port ${5601}...`)
});
