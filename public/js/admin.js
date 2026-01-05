// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard elements
const totalSubmissions = document.getElementById('totalSubmissions');
const recentSubmissions = document.getElementById('recentSubmissions');
const monthSubmissions = document.getElementById('monthSubmissions');
const currentAccessCode = document.getElementById('currentAccessCode');
const accessCodeForm = document.getElementById('accessCodeForm');
const accessCodeMessage = document.getElementById('accessCodeMessage');
const submissionsTableBody = document.getElementById('submissionsTableBody');
const noSubmissions = document.getElementById('noSubmissions');
const refreshBtn = document.getElementById('refreshBtn');

// Check authentication on load
window.addEventListener('load', checkAuth);

async function checkAuth() {
    try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();

        if (data.isAuthenticated) {
            showDashboard();
            loadDashboardData();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

// Login functionality
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const submitBtn = loginForm.querySelector('.login-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Hide previous errors
    loginError.style.display = 'none';

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showDashboard();
            loadDashboardData();
        } else {
            loginError.textContent = data.message || 'Invalid credentials';
            loginError.style.display = 'block';
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Connection error. Please try again.';
        loginError.style.display = 'block';
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
        showLogin();
        loginForm.reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Screen management
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboardScreen.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
}

// Load all dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadAccessCode(),
        loadSubmissions()
    ]);
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            totalSubmissions.textContent = stats.total;

            // Calculate last 7 days
            const last7Days = stats.byDay
                .slice(0, 7)
                .reduce((sum, day) => sum + day.count, 0);
            recentSubmissions.textContent = last7Days;

            // Calculate current month
            const currentMonth = new Date().toISOString().slice(0, 7);
            const thisMonth = stats.byMonth.find(m => m.month === currentMonth);
            monthSubmissions.textContent = thisMonth ? thisMonth.count : 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load current access code
async function loadAccessCode() {
    try {
        const response = await fetch('/api/admin/access-code');
        const data = await response.json();

        if (data.success) {
            currentAccessCode.value = data.accessCode;
        }
    } catch (error) {
        console.error('Error loading access code:', error);
        currentAccessCode.value = 'Error loading code';
    }
}

// Update access code
accessCodeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newCode = document.getElementById('newAccessCode').value.trim();
    const submitBtn = accessCodeForm.querySelector('.update-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    if (!newCode) {
        showMessage('Please enter a new access code', 'error');
        return;
    }

    // Hide previous messages
    accessCodeMessage.style.display = 'none';

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';

    try {
        const response = await fetch('/api/admin/access-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessCode: newCode })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentAccessCode.value = newCode;
            document.getElementById('newAccessCode').value = '';
            showMessage('Access code updated successfully!', 'success');
        } else {
            showMessage(data.message || 'Error updating access code', 'error');
        }
    } catch (error) {
        console.error('Error updating access code:', error);
        showMessage('Connection error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

// Show message
function showMessage(text, type) {
    accessCodeMessage.textContent = text;
    accessCodeMessage.className = `message ${type}`;
    accessCodeMessage.style.display = 'block';

    setTimeout(() => {
        accessCodeMessage.style.display = 'none';
    }, 5000);
}

// Load submissions
async function loadSubmissions() {
    try {
        const response = await fetch('/api/admin/submissions');
        const data = await response.json();

        if (data.success) {
            displaySubmissions(data.submissions);
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        submissionsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-row" style="color: var(--error-color);">
                    Error loading submissions. Please try again.
                </td>
            </tr>
        `;
    }
}

// Display submissions in table
function displaySubmissions(submissions) {
    if (submissions.length === 0) {
        submissionsTableBody.innerHTML = '';
        noSubmissions.style.display = 'block';
        return;
    }

    noSubmissions.style.display = 'none';

    submissionsTableBody.innerHTML = submissions.map(submission => {
        const date = new Date(submission.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr>
                <td>${submission.id}</td>
                <td>${escapeHtml(submission.first_name)}</td>
                <td>${escapeHtml(submission.last_name)}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime}</td>
            </tr>
        `;
    }).join('');
}

// Refresh button
refreshBtn.addEventListener('click', async () => {
    const icon = refreshBtn.querySelector('.refresh-icon');
    icon.style.transform = 'rotate(360deg)';

    await loadDashboardData();

    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
    }, 300);
});

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Auto-refresh submissions every 30 seconds
setInterval(() => {
    if (dashboardScreen.style.display === 'block') {
        loadStats();
        loadSubmissions();
    }
}, 30000);
