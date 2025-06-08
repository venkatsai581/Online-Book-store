document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const captchaInput = document.getElementById('captcha');
    const otpInput = document.getElementById('otp');
    const sendOtpBtn = document.getElementById('sendOtpBtn');

    // Generate a random OTP
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Store OTP temporarily
    let currentOTP = null;

    // Send OTP button handler
    sendOtpBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (!email) {
            alert('Please enter a valid email address before sending OTP.');
            return;
        }
        currentOTP = generateOTP();
        console.log(`Your OTP is: ${currentOTP}`);
        alert(`Your OTP is: ${currentOTP} (also check console)`);
    });

    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const captcha = captchaInput.value.trim();
        const otp = otpInput.value.trim();

        // CAPTCHA validation
        if (captcha !== '5') {
            alert('Invalid CAPTCHA! Please answer: What is 2 + 3?');
            return;
        }

        // OTP validation
        if (!currentOTP) {
            alert('Please click "Send OTP" to receive an OTP.');
            return;
        }
        if (otp !== currentOTP) {
            alert('Invalid OTP! Please check the console or alert for the correct OTP.');
            return;
        }

        // Store user data in localStorage
        const userData = {
            username,
            email,
            password
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('username', username);
        localStorage.setItem('token', 'mock-token'); // Mock token for authentication

        alert('Sign In successful! Redirecting to homepage...');
        window.location.href = 'index.html';
    });
});