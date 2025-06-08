document.addEventListener('DOMContentLoaded', () => {
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

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Retrieve user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));

        if (!userData || userData.email !== email || userData.password !== password) {
            alert('Invalid email or password. Please try again or sign in.');
            return;
        }

        // Save login details
        localStorage.setItem('username', userData.username);
        localStorage.setItem('token', 'mock-token');
        if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        alert('Login successful! Redirecting to homepage...');
        window.location.href = 'index.html';
    });
});