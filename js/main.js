document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cartItems');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const booksSection = document.querySelector('.books');
    const iconCart = document.querySelector('.cart');
    const closeCart = document.querySelector('.close');
    const checkOut = document.querySelector('.checkOut');
    const body = document.querySelector('body');

    let cart = JSON.parse(localStorage.getItem('cart')) || { items: [], count: 0, total: 0 };

    const fetchBooks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            booksSection.innerHTML = '<p>Error loading books. Please try again later.</p>';
        }
    };

    const displayBooks = (books) => {
        booksSection.innerHTML = '';
        books.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');
            bookDiv.innerHTML = `
                <img src="${book.image || 'https://via.placeholder.com/150'}" alt="${book.title}">
                <h2>${book.title}</h2>
                < —

System: p>Author: ${book.author}</p>
                <p>Price: $${book.price.toFixed(2)}</p>
                <button class="add-to-cart" data-title="${book.title}" data-price="${book.price}">Add to Cart</button>
            `;
            booksSection.appendChild(bookDiv);
        });
        attachCartListeners();
    };

    const updateCartDisplay = () => {
        cartItems.innerText = cart.count;
        cartTotal.innerText = `$${cart.total.toFixed(2)}`;
        cartList.innerHTML = '';
        cart.items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${item.title} ($${item.price.toFixed(2)})
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(listItem);
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => removeFromCart(button.dataset.index));
        });
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const attachCartListeners = () => {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const title = button.getAttribute('data-title');
                const price = parseFloat(button.getAttribute('data-price'));
                cart.items.push({ title, price });
                cart.count++;
                cart.total += price;
                updateCartDisplay();
            });
        });
    };

    const removeFromCart = (index) => {
        const item = cart.items[index];
        cart.count--;
        cart.total -= item.price;
        cart.items.splice(index, 1);
        updateCartDisplay();
    };

    iconCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });

    closeCart.addEventListener('click', () => {
        body.classList.remove('showCart');
    });

    checkOut.addEventListener('click', async () => {
        if (cart.count === 0) {
            alert('Your cart is empty!');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in or sign in to checkout.');
            window.location.href = 'login.html';
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ token, cart }),
            });
            const data = await response.json();
            if (data.success) {
                alert(`Checkout successful! Total: $${cart.total.toFixed(2)}`);
                cart = { items: [], count: 0, total: 0 };
                updateCartDisplay();
                body.classList.remove('showCart');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Checkout failed. Please try again.');
        }
    });

    fetchBooks();
    updateCartDisplay();
});