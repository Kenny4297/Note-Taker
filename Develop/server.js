const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('./public/assets/js/uuid.js')

const PORT = 5601;

app.use(express.static('public'));
app.use(express.urlencoded( { extended: true }))
app.use(express.json());

app.get('/api/notes', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/notes.html'));
});

app.post('/api/notes', (req, res) => {
    console.log(`${req.method}is the method`)
    const { title, name } = req.body;
    if (title && name) {
        const newNotes = {
            title, 
            name,
            noteId: uuid()
        }

        // fs.writeFile(`./db/${newNotes.title}.json`, JSON.stringify(newNotes), (err) =>
        // err
        //   ? console.error(err)
        //   : console.log(
        //       `Review for ${newNotes.title} has been written to JSON file`
        //     )
        // )

        const response = {
            status: 'success',
            body: newNotes,
        };

        res.status(201).json(response);
    } else {
        res.status(500).json('Error in saving the note');
    }
});

//Returning the specific note the user wants to view when clicked on the left side of the '/notes' page
// app.get('/api/notes/:noteId', (req, res) => {

// })

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on port ${5601}...`)
});
