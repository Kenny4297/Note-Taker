const express = require('express');
const fs = require('fs');
const path = require('path');
const { listeners } = require('process');
const app = express();
const uuid = require('./public/assets/js/uuid.js')

const PORT = 5601;

// Importing some necessary middleware
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true }))
app.use(express.json());

//This is a function that gets the notes from the db.json and returns it in an object form.
const getNotes = async () => {
  let rawNotes = await fs.readFile(('./db/db.json', (err, data) => console.log("Sorry, an error occurred!")));
  let notes = JSON.parse(rawNotes);
  return notes;
}

//!ROUTES SECTION
//Route to the homepage, index.html
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/index.html'));
})

//This is the route to the 'notes.html' page itself. This is separate from getting the data from the db.json
app.get('/notes', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public/notes.html'));
});

//=====================================
//!API ROUTES SECTION (DATABASE READING AND WRITING)
//Get all the notes stored from the db and show them in the left hand column
app.get('/api/notes', async (req, res) => {
  let getNotesData = await getNotes();
});

app.post('/api/notes', async (req, res) => {
  //Just checking to see if I have the right method here
  console.log(`${req.method} is the method`)

  //Destructuring the title (first input bar) and the name (the second input par)
  const { title, name } = req.body;

  //Checking to see if they both exist and assigning an id to them
  if (title && name) {
      const newNote = {
          title, 
          name,
          noteId: uuid()
      }
    
      let getAllNotes = await getNotes();
      getAllNotes.push(newNote);

      //Write the files to the database
        //First we need to convert the notes to a string
      let noteToWrite = JSON.stringify(getAllNotes);

      //Now we can write the notes back to the database
      

      //Setting up the message to send ot the user. Contains the status and what they wrote.
      const response = {
          status: 'success',
          body: newNote,
      };

      res.status(201).json(response);
  } else {
      res.status(500).json('Error in saving the note');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on port ${5601}...`)
});
