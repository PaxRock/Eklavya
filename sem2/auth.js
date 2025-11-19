// Authentication System using Appwrite
// Configure your Appwrite credentials here
const APPWRITE_CONFIG = {
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: '691e0dad001b659febbe'
};

// Initialize Appwrite Client
let client, account;
let isAuthenticated = false;
let currentUser = null;
let isConfigValid = false;

// Validate Appwrite configuration
function validateConfig() {
    const hasValidEndpoint = APPWRITE_CONFIG.endpoint && 
                            APPWRITE_CONFIG.endpoint !== 'YOUR_APPWRITE_ENDPOINT' &&
                            APPWRITE_CONFIG.endpoint.startsWith('http');
    const hasValidProjectId = APPWRITE_CONFIG.projectId && 
                             APPWRITE_CONFIG.projectId !== 'YOUR_PROJECT_ID';
    
    isConfigValid = hasValidEndpoint && hasValidProjectId;
    return isConfigValid;
}

// Initialize Appwrite when SDK loads
function initAppwrite() {
    if (typeof Appwrite === 'undefined') {
        console.error('Appwrite SDK not loaded');
        return;
    }
    
    // Validate configuration before initializing
    if (!validateConfig()) {
        console.warn('Appwrite configuration is not set. Please configure your endpoint and projectId in auth.js');
        account = null;
        client = null;
        return;
    }
    
    try {
        client = new Appwrite.Client()
            .setEndpoint(APPWRITE_CONFIG.endpoint)
            .setProject(APPWRITE_CONFIG.projectId);
        
        account = new Appwrite.Account(client);
        checkAuthStatus();
    } catch (error) {
        console.error('Failed to initialize Appwrite:', error);
        account = null;
        client = null;
    }
}

// Check if user is authenticated
async function checkAuthStatus() {
    try {
        if (!account) {
            isAuthenticated = false;
            updateUI();
            return;
        }
        
        const user = await account.get();
        isAuthenticated = true;
        currentUser = user;
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userName', user.name || user.email || '');
        updateUI();
    } catch (error) {
        isAuthenticated = false;
        currentUser = null;
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        updateUI();
    }
}

// Login with Google
async function loginWithGoogle() {
    try {
        // Always validate config first
        const configIsValid = validateConfig();
        
        if (!configIsValid) {
            alert('Authentication system not configured. Please set your Appwrite endpoint and projectId in sem2/auth.js file.\n\nTo set up Appwrite:\n1. Create an account at https://cloud.appwrite.io\n2. Create a new project\n3. Get your endpoint and project ID\n4. Update the APPWRITE_CONFIG in auth.js');
            return;
        }
        
        // Check if Appwrite SDK is loaded
        if (typeof Appwrite === 'undefined') {
            alert('Appwrite SDK is not loaded. Please refresh the page.');
            return;
        }
        
        // Initialize if not already done
        if (!account || !client) {
            initAppwrite();
        }
        
        // Double check account after initialization
        if (!account) {
            alert('Authentication system not initialized. Please check your Appwrite configuration and refresh the page.');
            return;
        }
        
        const successRedirect = window.location.href;
        const failureRedirect = window.location.href;
        
        await account.createOAuth2Session(
            'google',
            successRedirect,
            failureRedirect
        );
    } catch (error) {
        console.error('Google sign-in failed', error);
        alert('Login failed. Please try again. Error: ' + (error.message || 'Unknown error'));
    }
}

// Logout
async function logout() {
    try {
        if (account) {
            await account.deleteSession('current');
        }
        isAuthenticated = false;
        currentUser = null;
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        updateUI();
        hideLoginModal();
    } catch (error) {
        console.error('Logout failed', error);
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Update UI based on authentication status
function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    
    if (isAuthenticated || localStorage.getItem('isAuthenticated') === 'true') {
        isAuthenticated = true;
        const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userInfo) {
            userInfo.textContent = `Welcome, ${userName}`;
            userInfo.style.display = 'block';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Intercept button clicks
function setupButtonInterception() {
    document.addEventListener('click', function(e) {
        // Check if clicked element is a button or link with view-button class
        const target = e.target.closest('.view-button, .back-button, button, a[href]');
        
        if (!target) return;
        
        // Allow navigation buttons (back button) and login/logout buttons
        if (target.classList.contains('back-button') || 
            target.id === 'loginBtn' || 
            target.id === 'logoutBtn' ||
            target.id === 'btn-siwg' ||
            target.closest('#loginModal')) {
            return;
        }
        
        // Check if user is authenticated
        const authStatus = isAuthenticated || localStorage.getItem('isAuthenticated') === 'true';
        
        if (!authStatus) {
            e.preventDefault();
            e.stopPropagation();
            showLoginModal();
        }
    }, true);
}

// Check for OAuth callback
function checkOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');
    
    if (userId && secret) {
        // OAuth callback detected, check auth status after a short delay
        setTimeout(() => {
            checkAuthStatus();
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Validate config immediately
    validateConfig();
    console.log('Appwrite Config:', {
        endpoint: APPWRITE_CONFIG.endpoint,
        projectId: APPWRITE_CONFIG.projectId,
        isValid: isConfigValid
    });
    
    // Check if Appwrite SDK is already loaded
    if (typeof Appwrite !== 'undefined') {
        initAppwrite();
    } else {
        // Wait for SDK to load
        const checkSDK = setInterval(() => {
            if (typeof Appwrite !== 'undefined') {
                clearInterval(checkSDK);
                initAppwrite();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkSDK);
            if (typeof Appwrite === 'undefined') {
                console.error('Appwrite SDK failed to load');
            }
        }, 5000);
    }
    
    // Check for OAuth callback
    checkOAuthCallback();
    
    // Setup button interception
    setupButtonInterception();
    
    // Update UI based on stored auth status
    updateUI();
});

// Export functions for global use
window.authSystem = {
    loginWithGoogle,
    logout,
    showLoginModal,
    hideLoginModal,
    checkAuthStatus,
    isAuthenticated: () => isAuthenticated || localStorage.getItem('isAuthenticated') === 'true'
};

