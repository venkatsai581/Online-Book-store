async function sendOTP() {
    const username = document.getElementById('username').value;
    const mobileNo = document.getElementById('mobileno').value;
    if (!username) {
        alert('Please enter a username');
        return;
    }
    if (!mobileNo.match(/^\d{10}$/)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, mobileNo }),
        });
        const data = await response.json();
        if (data.success) {
            alert('OTP sent to your mobile number');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error sending OTP');
    }
}

async function signIn() {
    const username = document.getElementById('username').value;
    const mobileNo = document.getElementById('mobileno').value;
    const otp = document.getElementById('otp').value;

    if (!username) {
        alert('Please enter a username');
        return;
    }
    if (!mobileNo.match(/^\d{10}$/)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }
    if (!otp) {
        alert('Please enter the OTP');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, mobileNo, otp }),
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            alert(`Welcome, ${username}! Sign-in successful.`);
            window.location.href = 'index.html';
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Sign-in failed. Please try again.');
    }
}