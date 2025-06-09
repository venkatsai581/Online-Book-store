document.addEventListener('DOMContentLoaded', async () => {
    const cartItems = document.getElementById('cartItems');
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const booksSection = document.getElementById('booksSection');
    const noBooksMessage = document.getElementById('noBooksMessage');
    const cartBtn = document.getElementById('cartBtn');
    const checkOut = document.querySelector('.checkOut');
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const sortBy = document.getElementById('sortBy');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const loginLink = document.getElementById('loginLink');
    const signinLink = document.getElementById('signinLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileSection = document.getElementById('profileSection');
    const profileFullName = document.getElementById('profileFullName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const errorMessage = document.getElementById('errorMessage');

    let books = [];
    let categories = [];
    let cart = { items: [], count: 0, total: 0 };
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    const showError = (message) => {
        errorMessage.textContent = message;
        errorModal.show();
    };

    // Check if server is running
    const checkServer = async () => {
        try {
            const response = await fetch('http://localhost:3000/');
            return response.ok;
        } catch {
            return false;
        }
    };

    // Fetch books and categories
    const fetchBooksAndCategories = async () => {
        try {
            const serverRunning = await checkServer();
            if (!serverRunning) {
                throw new Error('Backend server is not running. Please start the server at http://localhost:3000.');
            }

            const booksResponse = await fetch('http://localhost:3000/books');
            if (!booksResponse.ok) throw new Error('Failed to fetch books: ' + booksResponse.statusText);
            books = await booksResponse.json();
            console.log('Fetched books:', books);

            const categoriesResponse = await fetch('http://localhost:3000/categories');
            if (!categoriesResponse.ok) throw new Error('Failed to fetch categories: ' + categoriesResponse.statusText);
            categories = await categoriesResponse.json();
            console.log('Fetched categories:', categories);

            // Populate category select
            categorySelect.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

            displayBooks();
        } catch (error) {
            console.error('Error fetching books or categories:', error);
            showError(`Error loading books: ${error.message}. Please ensure the server is running and try refreshing the page.`);
        }
    };

    // Fetch and display profile data
    const fetchProfileData = async () => {
        if (!userId) return;
        try {
            const userResponse = await fetch(`http://localhost:3000/users?id=${userId}`);
            if (!userResponse.ok) throw new Error('Failed to fetch user data');
            const users = await userResponse.json();

            const profileResponse = await fetch(`http://localhost:3000/profiles?userId=${userId}`);
            if (!profileResponse.ok) throw new Error('Failed to fetch profile data');
            const profiles = await profileResponse.json();

            if (users.length > 0 && profiles.length > 0) {
                const user = users[0];
                const profile = profiles[0];
                profileFullName.textContent = profile.fullName || 'Not provided';
                profileEmail.textContent = user.email || 'Not provided';
                profilePhone.textContent = profile.phone || 'Not provided';
                profileSection.style.display = 'block';
            } else {
                profileSection.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            showError('Error loading profile data.');
        }
    };

    const displayBooks = (filteredBooks = books) => {
        booksSection.innerHTML = '';
        if (filteredBooks.length === 0) {
            noBooksMessage.style.display = 'block';
            return;
        }
        noBooksMessage.style.display = 'none';
        filteredBooks.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
            bookDiv.innerHTML = `
                <div class="card book-card animate__animated animate__fadeInUp h-100">
                    <img src="${book.image || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">Author: ${book.author}</p>
                        <p class="card-text">Price: $${book.price.toFixed(2)}</p>
                        <p class="card-text">Category: ${categories.find(cat => cat.id === book.categoryId)?.name || 'Unknown'}</p>
                        <button class="btn btn-success add-to-cart" data-title="${book.title}" data-price="${book.price}" data-bs-toggle="tooltip" title="Add to Cart">Add to Cart</button>
                    </div>
                </div>
            `;
            booksSection.appendChild(bookDiv);
        });
        console.log('Books displayed:', filteredBooks);
        attachCartListeners();
        const newTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].forEach(tooltip => new bootstrap.Tooltip(tooltip));
    };

    const fetchCart = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:3000/cart?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const carts = await response.json();
            if (carts.length > 0) {
                cart = carts[0];
            } else {
                cart = { items: [], count: 0, total: 0, userId };
                await fetch('http://localhost:3000/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });
            }
            updateCartDisplay();
        } catch (error) {
            console.error('Error fetching cart:', error);
            showError('Error loading cart. Please try again.');
        }
    };

    const updateCartDisplay = () => {
        cartItems.textContent = cart.count;
        cartTotal.textContent = `$${(Math.round(cart.total * 100) / 100).toFixed(2)}`;
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
        const newTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].forEach(tooltip => new bootstrap.Tooltip(tooltip));
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
                cart.total = Math.round(cart.total * 100) / 100;
                await updateCartOnServer();
                updateCartDisplay();
                setTimeout(() => button.classList.remove('animate__animated', 'animate__pulse'), 300);
            });
        });
    };

    const updateCartOnServer = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:3000/cart?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart for update');
            const carts = await response.json();
            if (carts.length > 0) {
                await fetch(`http://localhost:3000/cart/${carts[0].id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });
            } else {
                await fetch('http://localhost:3000/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cart, userId })
                });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            showError('Error updating cart.');
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
        cart.total = Math.round(cart.total * 100) / 100;
        await updateCartOnServer();
        updateCartDisplay();
    };

    const removeFromCart = async (index) => {
        const item = cart.items[index];
        cart.count -= item.quantity;
        cart.total -= item.price * item.quantity;
        cart.items.splice(index, 1);
        cart.count = Math.max(0, cart.count);
        cart.total = Math.max(0, Math.round(cart.total * 100) / 100);
        await updateCartOnServer();
        updateCartDisplay();
    };

    const saveOrder = async () => {
        if (!userId || !username) return;
        try {
            const order = {
                userId,
                username,
                items: cart.items,
                total: Math.round(cart.total * 100) / 100,
                date: new Date().toISOString()
            };
            const response = await fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            if (!response.ok) throw new Error('Failed to save order');
            console.log('Order saved:', await response.json());
        } catch (error) {
            console.error('Error saving order:', error);
            showError('Error saving order.');
        }
    };

    const applyFilters = () => {
        let filteredBooks = [...books];
        const query = searchInput.value.toLowerCase().trim();
        const category = categorySelect.value;
        const sort = sortBy.value;

        if (query) {
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
            );
        }

        if (category !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.categoryId === parseInt(category));
        }

        if (sort) {
            if (sort === 'price-asc') {
                filteredBooks.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
                filteredBooks.sort((a, b) => b.price - b.price);
            } else if (sort === 'title') {
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            }
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
            profileSection.style.display = 'none';
        }
    };

    cartBtn.addEventListener('click', () => {
        cartList.classList.add('animate__animated', 'animate__slideInRight');
        setTimeout(() => cartList.classList.remove('animate__animated', 'animate__slideInRight'), 500);
    });

    checkOut.addEventListener('click', async () => {
        checkOut.classList.add('animate__animated', 'animate__pulse');
        if (cart.count === 0) {
            showError('Your cart is empty!');
            setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            showError('Please log in or sign in to checkout.');
            window.location.href = 'login.html';
            setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
            return;
        }
        await saveOrder();
        showError(`Checkout successful! Total: $${(Math.round(cart.total * 100) / 100).toFixed(2)}`);
        cart = { items: [], count: 0, total: 0, userId };
        await updateCartOnServer();
        updateCartDisplay();
        setTimeout(() => checkOut.classList.remove('animate__animated', 'animate__pulse'), 300);
    });

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    logoutBtn.addEventListener('click', async () => {
        logoutBtn.classList.add('animate__animated', 'animate__pulse');
        await updateCartOnServer();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('rememberedEmail');
        cart = { items: [], count: 0, total: 0, userId: null };
        updateUsernameDisplay();
        updateCartDisplay();
        showError('Logged out successfully!');
        window.location.reload();
        setTimeout(() => logoutBtn.classList.remove('animate__animated', 'animate__pulse'), 300);
    });

    try {
        updateUsernameDisplay();
        await Promise.all([
            fetchBooksAndCategories(),
            fetchCart(),
            fetchProfileData()
        ]);
        console.log('All async operations completed');
    } catch (error) {
        console.error('Error in main.js:', error);
        showError('Error initializing application: ' + error.message);
    }
});