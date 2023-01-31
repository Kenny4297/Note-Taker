const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('./public/assets/js/uuid.js')

const PORT = process.env.PORT || 5601;

// Importing some necessary middleware
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true }))
app.use(express.json());

//This is a function that gets the notes from the db.json and returns it in an object form.
const getNotes = async () => {
  try {
    //This will not work if you just use 'readFile'. Not sure why- awaiting tutor response
    const data = await fs.promises.readFile('./db/db.json');

    // The data type returned from 'readFile' is a buffer, you need to convert it into an object
    const notes = await JSON.parse(data);

    return notes;
  } catch (err) {
    throw err;
  }
};

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
  res.send(getNotesData);
});

app.post('/api/notes', async (req, res) => {
  //Destructuring the title (first input bar) and the name (the second input bar)
  const { title, text } = req.body;

  const newNote = {
    title,
    text,
    //Need to add an id to the note so it can be found specifically for potential deletion
    id: uuid()
  }
  //Retrieving the notes in a json object so we can add to it
  let getAllNotes = await getNotes();

  //Adding to the note
  getAllNotes.push(newNote);

  //Write the files to the database
    //First we need to convert the notes to a string
  let noteToWrite = JSON.stringify(getAllNotes);

  //Now we can write the notes back to the database
  fs.writeFile('./db/db.json', noteToWrite, (err, data) => {
    if (err) {
      console.log("Sorry, an error has occurred!")
    }
  })

  res.status(201).json(noteToWrite);
  //Because we are not sending anything back to the user, we need to end the request somehow. Note how sending json does not end the request
  res.end();

});

app.delete('/api/notes/:noteId', async (req, res) => {
  //Getting the noteId from the params
  let noteId = req.params.noteId

  //Getting the notes in a json object
  let getAllNotes = await getNotes();

  //Finding a note in the object with an id that matches the req.params
  let deleteSpecificNote = getAllNotes.find((note) => {
    //Remember that 'id' was a property we add to all created notes. 
    note.id === noteId;
  })

  //Finding the index of the note
  let indexOfNote = getAllNotes.indexOf(deleteSpecificNote);

  //Deleting the note
  getAllNotes.splice(indexOfNote, 1);

  //writing the current set of notes back to the db
  let currentNotes = JSON.stringify(getAllNotes);

  // Writing the updated file back to the database
  fs.writeFile('./db/db.json', currentNotes, (err, data) => {
    if (err) {
      console.log("Sorry, an error has occurred!")
    }
  })
  return res.json(getNotes())
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`)
});
