const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const uuid = require('./public/assets/js/uuid.js')

const PORT = 5601;

// Importing some necessary middleware
app.use(express.static('public'));
app.use(express.urlencoded( { extended: true }))
app.use(express.json());

//This is a function that gets the notes from the db.json and returns it in an object form.
const getNotes = async () => {
  try {
    //This will not work if you just use 'readFile'. Not sure why- awaiting tutor response
    const data = await fs.promises.readFile('./db/db.json');
    let log = await console.log(`The data on line 18 is ${data}`)
    const notes = await JSON.parse(data);
    console.log(notes)
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
  //Just checking to see if I have the right method here
  console.log(`${req.method} is the method`)

  //Destructuring the title (first input bar) and the name (the second input par)
  const { title, text } = req.body;

  const newNote = {
    title,
    text,
    id: uuid()
  }

  let getAllNotes = await getNotes();
  getAllNotes.push(newNote);
  console.log(`The 'getAllNotes' variable on line 56 is: ${getAllNotes}`)

  //Write the files to the database
    //First we need to convert the notes to a string
  let noteToWrite = JSON.stringify(getAllNotes);
  console.log(`The 'noteToWrite' is ${noteToWrite}`)

  //Now we can write the notes back to the database
  fs.writeFile('./db/db.json', noteToWrite, (err, data) => {
    console.log(`Line 71, what the 'fs.writeFile' wrote: `)
    if (err) {
      console.log("Sorry, an error has occurred!")
    }
  })

  //Setting up the message to send ot the user. Contains the status and what they wrote.
  const response = {
      status: 'success',
      body: newNote,
  };

  res.status(201).json(noteToWrite);
  res.end();

});
//Why do I get the error "Syntax Error: Unexpected end of JSON input"
app.delete('/api/notes/:noteId', async (req, res) => {
  //Getting the noteId from the params
  let noteId = req.params.noteId

  //Getting the notes
  let getAllNotes = await getNotes();
  let deleteSpecificNote = getAllNotes.find((note) => {
    note.id === noteId;
  })

  //Finding the index of the note
  let indexOfNote = getAllNotes.indexOf(deleteSpecificNote);

  //Deleting the note
  getAllNotes.splice(indexOfNote, 1);

  //writing the current set of notes back to the db
  let currentNotes = JSON.stringify(getAllNotes);

  fs.writeFile('./db/db.json', currentNotes, (err, data) => {
    if (err) {
      console.log("Sorry, an error has occurred!")
    }
  })
  console.log(getNotes())
  return res.json(getNotes())
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
  console.log(`listening on port ${5601}...`)
});
