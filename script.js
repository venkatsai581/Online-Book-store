document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cartItems');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const booksSection = document.querySelector('.books-slider .swiper-wrapper');
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
            bookDiv.classList.add('swiper-slide', 'book');
            bookDiv.innerHTML = `
                <img src="https://via.placeholder.com/150" alt="${book.title}">
                <h2>${book.title}</h2>
                <p>Author: ${book.author}</p>
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
            listItem.innerText = `${item.title} ($${item.price.toFixed(2)})`;
            const removeButton = document.createElement('button');
            removeButton.innerText = 'Remove';
            removeButton.addEventListener('click', () => removeFromCart(index));
            listItem.appendChild(removeButton);
            cartList.appendChild(listItem);
        });
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const attachCartListeners = () => {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
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
        body.classList.toggle('showCart');
    });

    checkOut.addEventListener('click', () => {
        if (cart.count === 0) {
            alert('Your cart is empty!');
        } else {
            alert(`Checkout successful! Total: $${cart.total.toFixed(2)}`);
            cart = { items: [], count: 0, total: 0 };
            updateCartDisplay();
            body.classList.remove('showCart');
        }
    });

    fetchBooks();
    updateCartDisplay();
});