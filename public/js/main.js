// DOM Elements
const form = document.getElementById('accessForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const accessCode = document.getElementById('accessCode').value.trim();

    // Validate inputs
    if (!firstName || !lastName || !accessCode) {
        showError('Please fill in all fields');
        return;
    }

    // Clear previous messages
    hideMessages();

    // Show loading state
    setLoadingState(true);

    try {
        // Submit to server
        const response = await fetch('/api/verify-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName,
                lastName,
                accessCode
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show success message
            showSuccess('Access granted! Redirecting to ASEA GPT ONE...');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = data.redirectUrl;
            }, 1500);
        } else {
            // Show error message
            showError(data.message || 'Invalid access code. Please try again.');
            setLoadingState(false);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Connection error. Please check your internet and try again.');
        setLoadingState(false);
    }
});

// Helper functions
function setLoadingState(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';

    // Shake animation for error
    errorMessage.style.animation = 'none';
    setTimeout(() => {
        errorMessage.style.animation = 'slideDown 0.3s ease';
    }, 10);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Input validation and formatting
document.getElementById('firstName').addEventListener('input', (e) => {
    // Remove non-alphabetic characters
    e.target.value = e.target.value.replace(/[^a-zA-Z\s-]/g, '');
});

document.getElementById('lastName').addEventListener('input', (e) => {
    // Remove non-alphabetic characters
    e.target.value = e.target.value.replace(/[^a-zA-Z\s-]/g, '');
});

document.getElementById('accessCode').addEventListener('input', (e) => {
    // Convert to uppercase for access codes
    e.target.value = e.target.value.toUpperCase();
});

// Auto-hide messages after 5 seconds
let messageTimeout;
function autoHideMessage(element) {
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Add animation class to form on load
window.addEventListener('load', () => {
    const formCard = document.querySelector('.form-card');
    formCard.style.opacity = '0';
    formCard.style.transform = 'translateY(20px)';
    formCard.style.transition = 'all 0.5s ease';

    setTimeout(() => {
        formCard.style.opacity = '1';
        formCard.style.transform = 'translateY(0)';
    }, 100);
});
