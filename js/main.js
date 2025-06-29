document.addEventListener('DOMContentLoaded', () => {
    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://bookstore-backend-a7ma.onrender.com';

    const cartItems = document.getElementById('cartItems');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const booksSection = document.getElementById('booksSection');
    const cartBtn = document.getElementById('cartBtn');
    const checkOut = document.querySelector('.checkOut');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const sortBy = document.getElementById('sortBy');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const loginLink = document.getElementById('loginLink');
    const signinLink = document.getElementById('signinLink');
    const logoutBtn = document.getElementById('logoutBtn');

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    const books = [
        { title: 'Book Title 1', author: 'Author Name', price: 19.99, image: 'https://m.media-amazon.com/images/I/61id5HQ7ogL._AC_UL480_FMwebp_QL65_.jpg', category: 'Fiction' },
        { title: 'Book Title 2', author: 'Author Name', price: 24.99, image: 'https://m.media-amazon.com/images/I/41n4z8Xv1BL.AC_SX250.jpg', category: 'Non-Fiction' },
        { title: 'Book Title 3', author: 'Author Name', price: 14.99, image: 'https://m.media-amazon.com/images/I/51Lq5EZahEL.AC_SX250.jpg', category: 'Fiction' },
        { title: 'Book Title 4', author: 'Author Name', price: 29.99, image: 'https://m.media-amazon.com/images/I/71xxddxprOL._AC_UY327_FMwebp_QL65_.jpg', category: 'Non-Fiction' },
        { title: 'Book Title 5', author: 'Author Name', price: 17.99, image: 'https://m.media-amazon.com/images/I/71YjdCMBmQL._AC_UY327_FMwebp_QL65_.jpg', category: 'Fiction' },
        { title: 'Book Title 6', author: 'Author Name', price: 22.99, image: 'https://m.media-amazon.com/images/I/515n5lr+lVL.AC_SX250.jpg', category: 'Non-Fiction' },
        { title: 'Book Title 7', author: 'Author Name', price: 15.99, image: 'https://m.media-amazon.com/images/I/91g4K+FXBLL._AC_UY327_FMwebp_QL65_.jpg', category: 'Fiction' },
        { title: 'Book Title 8', author: 'Author Name', price: 27.99, image: 'https://m.media-amazon.com/images/I/71n26QIGeVL._AC_UL480_FMwebp_QL65_.jpg', category: 'Non-Fiction' },
        { title: 'Book Title 9', author: 'Author Name', price: 25.99, image: 'https://m.media-amazon.com/images/I/81Dky+tD+pL._AC_UY327_FMwebp_QL65_.jpg', category: 'Non-Fiction' }
    ];

    let cart = { items: [], count: 0, total: 0 };
    const userId = localStorage.getItem('userId');

    const displayBooks = (filteredBooks = books) => {
        booksSection.innerHTML = '';
        filteredBooks.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
            bookDiv.innerHTML = `
                <div class="card book-card animate__animated animate__fadeInUp h-100">
                    <img src="${book.image}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">Author: ${book.author}</p>
                        <p class="card-text">Price: $${book.price.toFixed(2)}</p>
                        <p class="card-text">Category: ${book.category}</p>
                        <button class="btn btn-success add-to-cart" data-title="${book.title}" data-price="${book.price}" data-bs-toggle="tooltip" title="Add to Cart">Add to Cart</button>
                    </div>
                </div>
            `;
            booksSection.appendChild(bookDiv);
        });
        attachCartListeners();
        const newTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].forEach(tooltip => new bootstrap.Tooltip(tooltip));
    };

    const fetchCart = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${backendUrl}/cart?userId=${userId}`);
            const carts = await response.json();
            if (carts.length > 0) {
                cart = carts[0];
            } else {
                cart = { items: [], count: 0, total: 0, userId };
                await fetch(`${backendUrl}/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });
            }
            updateCartDisplay();
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const updateCartDisplay = () => {
        cartItems.textContent = cart.count;
        cartTotal.textContent = `$${cart.total.toFixed(2)}`;
        cartList.innerHTML = '';
        cart.items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${item.title} ($${item.price.toFixed(2)} x ${item.quantity})
                <div class="quantity-controls">
                    <button class="btn btn-sm btn-primary decrement" data-index="${index}">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-primary increment" data-index="${index}">+</button>
                    <button class="btn btn-sm btn-danger remove-item ms-2" data-index="${index}" data-bs-toggle="tooltip" title="Remove">Remove</button>
                </div>
            `;
            cartList.appendChild(listItem);
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('animate__animated', 'animate__pulse');
                removeFromCart(button.dataset.index);
                setTimeout(() => button.classList.remove('animate__animated', 'animate__pulse'), 300);
            });
        });
        document.querySelectorAll('.increment').forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('animate__animated', 'animate__pulse');
                changeQuantity(button.dataset.index, 1);
                setTimeout(() => button.classList.remove('animate__animated', 'animate__pulse'), 300);
            });
        });
        document.querySelectorAll('.decrement').forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('animate__animated', 'animate__pulse');
                changeQuantity(button.dataset.index, -1);
                setTimeout(() => button.classList.remove('animate__animated', 'animate__pulse'), 300);
            });
        });
    };

    const attachCartListeners = () => {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', async () => {
                button.classList.add('animate__animated', 'animate__pulse');
                const title = button.getAttribute('data-title');
                const price = parseFloat(button.getAttribute('data-price'));
                const existingItem = cart.items.find(item => item.title === title);
                if (existingItem) {
                    existingItem.quantity++;
                    cart.count++;
                    cart.total += price;
                } else {
                    cart.items.push({ title, price, quantity: 1 });
                    cart.count++;
                    cart.total += price;
                }
                await updateCartOnServer();
                updateCartDisplay();
                setTimeout(() => button.classList.remove('animate__animated', 'animate__pulse'), 300);
            });
        });
    };

    const updateCartOnServer = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${backendUrl}/cart?userId=${userId}`);
            const carts = await response.json();
            if (carts.length > 0) {
                await fetch(`${backendUrl}/cart/${carts[0].id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });
            } else {
                await fetch(`${backendUrl}/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cart, userId })
                });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const changeQuantity = async (index, change) => {
        const item = cart.items[index];
        item.quantity += change;
        cart.count += change;
        cart.total += change * item.price;
        if (item.quantity <= 0) {
            cart.items.splice(index, 1);
            cart.count = Math.max(0, cart.count);
            cart.total = Math.max(0, cart.total);
        }
        await updateCartOnServer();
        updateCartDisplay();
    };

    const removeFromCart = async (index) => {
        const item = cart.items[index];
        cart.count -= item.quantity;
        cart.total -= item.price * item.quantity;
        cart.items.splice(index, 1);
        await updateCartOnServer();
        updateCartDisplay();
    };

    async function saveOrder(orders) {
        try {
            const response = await fetch(`${backendUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orders)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save order: Status ${response.status}, ${errorText}`);
            }

            const savedOrder = await response.json();
            console.log('Order saved:', savedOrder);
        } catch (error) {
            console.error('Error saving order:', error.message);
        }
    }

    const applyFilters = () => {
        let filteredBooks = [...books];
        const query = searchInput.value.toLowerCase();
        const category = categorySelect.value;
        const sort = sortBy.value;

        if (query) {
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            );
        }

        if (category !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === category);
        }

        if (sort) {
            if (sort === 'price-asc') filteredBooks.sort((a, b) => a.price - b.price);
            if (sort === 'price-desc') filteredBooks.sort((a, b) => b.price - a.price);
            if (sort === 'title') filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        }

        displayBooks(filteredBooks);
    };

    const updateUsernameDisplay = () => {
        const username = localStorage.getItem('username');
        if (username) {
            usernameDisplay.textContent = `Welcome, ${username}`;
            loginLink.classList.add('d-none');
            signinLink.classList.add('d-none');
            logoutBtn.classList.remove('d-none');
        } else {
            usernameDisplay.textContent = '';
            loginLink.classList.remove('d-none');
            signinLink.classList.remove('d-none');
            logoutBtn.classList.add('d-none');
        }
    };

    cartBtn.addEventListener('click', () => {
        cartList.classList.add('animate__animated', 'animate__slideInRight');
        setTimeout(() => cartList.classList.remove('animate__animated', 'animate__slideInRight'), 500);
    });

    checkOut.addEventListener('click', async () => {
        checkOut.classList.add('animate__animated', 'animate__pulse');

        if (cart.count === 0) {
            alert('Your cart is empty!');
            setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in or sign in to checkout.');
            window.location.href = 'login.html';
            setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
            return;
        }

        const order = {
            id: crypto.randomUUID ? crypto.randomUUID() : 'order-' + Math.random().toString(36).substr(2, 9),
            userId,
            items: [...cart.items],
            total: cart.total,
            timestamp: new Date().toISOString()
        };

        await saveOrder(order);

        cart.items = [];
        cart.count = 0;
        cart.total = 0;

        await updateCartOnServer();
        updateCartDisplay();

        alert(`Checkout successful! Total: $${order.total.toFixed(2)}`);
        setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
    });

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    logoutBtn.addEventListener('click', async () => {
        logoutBtn.classList.add('animate__animated', 'animate__pulse');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('rememberedEmail');
        cart = { items: [], count: 0, total: 0, userId: null };
        await updateCartOnServer();
        updateUsernameDisplay();
        updateCartDisplay();
        alert('Logged out successfully!');
        window.location.reload();
        setTimeout(() => logoutBtn.classList.remove('animate__animated', 'animate__pulse'), 300);
    });

    try {
        updateUsernameDisplay();
        displayBooks();
        fetchCart();
    } catch (error) {
        console.error('Error in main.js:', error);
        alert('Error loading books or cart. Please check the console.');
    }
});
