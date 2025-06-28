document.addEventListener('DOMContentLoaded', () => {
    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://bookstore-backend-a7ma.onrender.com';

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMe = document.getElementById('rememberMe');

    // Populate email if remembered
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            // Retrieve user data from JSON Server
            const response = await fetch(`${backendUrl}/users?email=${email}&password=${password}`);
            const users = await response.json();

            if (users.length === 0) {
                alert('Invalid email or password. Please try again or sign in.');
                return;
            }

            const user = users[0];
            console.log('Logged in user:', user);

            // Save login details
            localStorage.setItem('username', user.username);
            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('userId', user.id);
            if (rememberMe.checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            alert('Login successful! Redirecting to homepage...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login. Please try again.');
        }
    });
});
