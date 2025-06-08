const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let books = [
  { id: 1, title: 'Book Title 1', author: 'Author Name 1', price: 19.99 },
  { id: 2, title: 'Book Title 2', author: 'Author Name 2', price: 19.99 },
  { id: 3, title: 'Book Title 3', author: 'Author Name', price: 19.99 }
];

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.post('/api/books', (req, res) => {
  console.log('Received body:', req.body);
  const newBook = req.body;
  if (!newBook.id || !newBook.title || !newBook.author || !newBook.price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (books.some(book => book.id === newBook.id)) {
    return res.status(400).json({ error: 'Book ID already exists' });
  }
  books.push(newBook);
  res.status(201).json(newBook);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});