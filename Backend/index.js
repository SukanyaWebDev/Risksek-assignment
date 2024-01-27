const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

const dbPath = './library.db';

const initializeDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      author TEXT,
      isbn TEXT,
      file_format TEXT
    );
  `);

  console.log('Database initialized');
};

initializeDB();

// Welcome message for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Library of API');
});

// Middleware for handling database errors
const handleDBError = (err, res) => {
  console.error('Database Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Add a book to the library
app.post('/books', async (req, res) => {
  const { title, author, isbn, file_format } = req.body;
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const insertBookQuery = `
      INSERT INTO books (title, author, isbn, file_format)
      VALUES (?, ?, ?, ?);
    `;
    await db.run(insertBookQuery, [title, author, isbn, file_format]);
    res.json({ message: 'Book added successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// List all books in the library
app.get('/books', async (req, res) => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const selectBooksQuery = 'SELECT * FROM books';
    const books = await db.all(selectBooksQuery);
    res.json(books);
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete a book by title
app.delete('/books/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    const deleteBookQuery = 'DELETE FROM books WHERE title = ?';
    await db.run(deleteBookQuery, [title]);
    res.json({ message: `Book '${title}' deleted successfully` });
  } catch (err) {
    handleDBError(err, res);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
