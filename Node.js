const express = require('express'); 

const app = express(); 

const PORT = 3000; 

 

// Simulated in-memory book data 

let books = [ 

  { id: 1, title: 'Book Title 1', author: 'Author Name 1', price: 19.99 }, 

  // Add more books similarly 

]; 

 

// Get all books 

app.get('/api/books', (req, res) => { 

  res.json(books); 

}); 

 

// Add a new book 

app.post('/api/books', (req, res) => { 

  const newBook = req.body; // Assuming the request body contains book data 

  books.push(newBook); 

  res.status(201).json(newBook); 

}); 

 

// Start the server 

app.listen(PORT, () => { 

  console.log(`Server is running on port ${PORT}`); 

}); 

 