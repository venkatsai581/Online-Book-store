document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    let generatedOtp = '';

    // Generate a random 6-digit OTP
    const generateOtp = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    sendOtpBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const fullName = document.getElementById('fullName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!username || !email || !password || !fullName || !address || !phone) {
            alert('Please fill in all fields.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Basic phone validation
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid phone number (10-15 digits).');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/users?email=${email}`);
            if (!response.ok) throw new Error('Failed to check email');
            const users = await response.json();
            if (users.length > 0) {
                alert('Email already registered. Please use a different email.');
                return;
            }

            generatedOtp = generateOtp();
            alert(`OTP sent to your email (simulated). Use ${generatedOtp} as OTP.`);
            sendOtpBtn.disabled = true;
        } catch (error) {
            console.error('Error checking email:', error);
            alert('Error sending OTP. Please ensure the server is running and try again.');
        }
    });

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const fullName = document.getElementById('fullName').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const captcha = document.getElementById('captcha').value.trim();
        const otp = document.getElementById('otp').value.trim();

        if (!username || !email || !password || !fullName || !address || !phone || !captcha || !otp) {
            alert('Please fill in all fields.');
            return;
        }

        if (captcha !== '5') {
            alert('Invalid CAPTCHA. Please answer: What is 2 + 3?');
            return;
        }

        if (otp !== generatedOtp) {
            alert(`Invalid OTP. Please use ${generatedOtp}.`);
            return;
        }

        try {
            const user = { username, email, password };
            const userResponse = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (!userResponse.ok) throw new Error('Failed to save user');
            const savedUser = await userResponse.json();

            const profile = { userId: savedUser.id, fullName, address, phone };
            const profileResponse = await fetch('http://localhost:3000/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            if (!profileResponse.ok) throw new Error('Failed to save profile');

            localStorage.setItem('token', 'mock-token');
            localStorage.setItem('username', username);
            localStorage.setItem('userId', savedUser.id);
            alert('Sign-in successful! Redirecting to homepage...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error saving user/profile:', error);
            alert('Error signing in. Please ensure the server is running and try again.');
        }
    });
});