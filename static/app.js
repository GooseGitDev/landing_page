document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully parsed. Checking library availability...");

    // ==========================================
    // 1. INITIALIZE SUPABASE WITH SAFETY CHECK
    // ==========================================
    const SUPABASE_URL = "https://oztxnrrhbrgzzibfolmc.supabase.co"; 
    const SUPABASE_KEY = "sb_publishable_umgeh3s19yYT7neVpzxoKw_JQ665XFh"; 

    let mySupabaseClient;

    // The jsDelivr CDN attaches the global variable with a capital 'S' (Supabase)
    if (typeof Supabase !== 'undefined') {
        mySupabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else if (window.Supabase && typeof window.Supabase.createClient === 'function') {
        mySupabaseClient = window.Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Critical Failure: The global Supabase library window object is missing.");
        return;
    }

    console.log("Supabase initialization secure. Constructing elements...");
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
    const mapProjectLink = document.getElementById('link-map-project');

    const MAP_PROJECT_BASE_URL = "https://onrender.com";

    // System banner alert helper
    function displayAlert(message, type = "error") {
        alertBanner.innerText = message;
        alertBanner.className = `alert-banner ${type}`;
        alertBanner.style.display = 'block';
        
        setTimeout(() => {
            alertBanner.style.display = 'none';
        }, 6000);
    }

    // ==========================================
    // 3. UI TOGGLE LOGIC
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
    // 4. AUTHENTICATION LOGIC
    // ==========================================

    // --- SIGN UP ---
    document.getElementById('btn-signup').addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (!username || !email || !password || !confirmPassword) {
            return displayAlert("Please populate all fields.", "error");
        }

        if (password.length < 6) {
            return displayAlert("Password must possess at least 6 characters.", "error");
        }

        if (password !== confirmPassword) {
            return displayAlert("Passwords do not match. Please verify.", "error");
        }

        const { data, error } = await mySupabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_username: username
                }
            }
        });

        if (error) {
            displayAlert("Registration Defect: " + error.message, "error");
        } else {
            displayAlert("Success! Check your inbox for a confirmation validation link.", "success");
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
        }
    });

    // --- LOG IN ---
    document.getElementById('btn-login').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            return displayAlert("Please enter both email and password credentials.", "error");
        }

        const { data, error } = await mySupabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            displayAlert("Authentication Failed: " + error.message, "error");
        }
    });

    // --- LOG OUT ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const { error } = await mySupabaseClient.auth.signOut();
        if (error) displayAlert("Signout Error: " + error.message, "error");
    });

    // ==========================================
    // 5. SESSION HANDSHAKE ASSIGNMENT
    // ==========================================
    mySupabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            userDisplayEmail.innerText = session.user.email;
            
            const customUsername = session.user.user_metadata?.display_username || "Explorer";
            userDisplayName.innerText = customUsername;
            
            // Append JWT pass link securely
            mapProjectLink.href = `${MAP_PROJECT_BASE_URL}?access_token=${session.access_token}`;
            console.log("Authentication handshake prepared for downstream apps.");
        } else {
            authContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            userDisplayEmail.innerText = '';
            userDisplayName.innerText = 'User';
            mapProjectLink.href = MAP_PROJECT_BASE_URL;
        }
    });

    console.log("Authentication hub fully active!");
});
