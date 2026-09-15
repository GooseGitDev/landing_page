document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully parsed. Initializing modular authentication hub...");

    // ==========================================
    // 1. SUPABASE CLIENT CONNECTION
    // ==========================================
    const SUPABASE_URL = "https://supabase.co"; 
    const SUPABASE_KEY = "sb_publishable_umgeh3s19yYT7neVpzxoKw_JQ665XFh"; 

    const targetLib = window.Supabase || window.supabase || (typeof Supabase !== 'undefined' ? Supabase : null);
    if (!targetLib) {
        console.error("Critical Failure: Supabase global script package was not ready.");
        return;
    }
    const mySupabaseClient = targetLib.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ==========================================
    // 2. DOM ELEMENTS (UI SELECTORS)
    // ==========================================
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const alertBanner = document.getElementById('alert-banner');

    const showSignupLink = document.getElementById('link-show-signup');
    const showLoginLink = document.getElementById('link-show-login');

    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayEmail = document.getElementById('user-display-email');

    // Current active security session tracking token
    let currentAccessToken = null;

    // System Alert Display Handler
    function displayAlert(message, type = "error") {
        alertBanner.innerText = message;
        alertBanner.className = `alert-banner ${type}`;
        alertBanner.style.display = 'block';
        setTimeout(() => { alertBanner.style.display = 'none'; }, 6000);
    }

    // ==========================================
    // 3. UI LAYOUT FORM TOGGLING
    // ==========================================
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        alertBanner.style.display = 'none';
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        alertBanner.style.display = 'none';
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // ==========================================
    // 4. CORE AUTHENTICATION FLOW ACTIONS
    // ==========================================

    // --- USER REGISTRATION ---
    document.getElementById('btn-signup').addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (!username || !email || !password || !confirmPassword) {
            return displayAlert("Please populate all fields.", "error");
        }
        if (password.length < 6) {
            return displayAlert("Password must be at least 6 characters long.", "error");
        }
        if (password !== confirmPassword) {
            return displayAlert("Passwords do not match. Please verify.", "error");
        }

        const { data, error } = await mySupabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { data: { display_username: username } }
        });

        if (error) {
            displayAlert("Registration Issue: " + error.message, "error");
        } else {
            displayAlert("Success! Check your inbox for a verification link.", "success");
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
        }
    });

    // --- USER LOGIN ---
    document.getElementById('btn-login').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            return displayAlert("Please enter both email and password.", "error");
        }

        const { error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
        if (error) displayAlert("Authentication Failed: " + error.message, "error");
    });

    // --- USER LOGOUT ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const { error } = await mySupabaseClient.auth.signOut();
        if (error) displayAlert("Logout Issue: " + error.message, "error");
    });

    // ==========================================
    // 5. GLOBAL AUTOMATED LINK INTERCEPTOR (The Magic)
    // ==========================================
    // Instead of mapping links manually, we watch the entire page layout for clicks.
    document.addEventListener('click', (e) => {
        // Find if the clicked element (or its parent element) is a marked secure link
        const targetLink = e.target.closest('a[data-secure-link="true"]');
        
        if (targetLink) {
            e.preventDefault(); // Stop the default navigation temporary
            
            if (!currentAccessToken) {
                return displayAlert("Security error: No active token found. Please re-authenticate.", "error");
            }
            
            // Extract the base URL out of the HTML attribute href
            const baseHref = targetLink.getAttribute('href');
            
            // Safely append the active cryptographic JWT pass as a URL search parameter
            window.location.href = `${baseHref}?access_token=${currentAccessToken}`;
        }
    });

    // ==========================================
    // 6. PERSISTENT STATE LISTENER
    // ==========================================
    mySupabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            // User is authenticated
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            
            userDisplayEmail.innerText = session.user.email;
            userDisplayName.innerText = session.user.user_metadata?.display_username || "Developer";
            
            // Save the secure token globally so the link interceptor can use it
            currentAccessToken = session.access_token;
            console.log("Secure authentication session validated.");
        } else {
            // User is signed out
            authContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            
            userDisplayEmail.innerText = '';
            userDisplayName.innerText = 'User';
            
            currentAccessToken = null;
            console.log("Session cleared.");
        }
    });

    console.log("Authentication hub fully active and modularized!");
});
