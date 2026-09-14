document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully parsed. Initializing authentication hub...");

    // ==========================================
    // 1. INITIALIZE SUPABASE
    // ==========================================
    const SUPABASE_URL = "https://oztxnrrhbrgzzibfolmc.supabase.co"; 
    const SUPABASE_KEY = "sb_publishable_umgeh3s19yYT7neVpzxoKw_JQ665XFh"; 

    // Access the global variable exposed directly by the browser layout bundle
    const mySupabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    // Base URL configuration for map project setup
    const MAP_PROJECT_BASE_URL = "https://onrender.com";

    // ==========================================
    // HELPER FUNCTIONS (System UI Notifications)
    // ==========================================
    function displayAlert(message, type = "error") {
        alertBanner.innerText = message;
        alertBanner.className = `alert-banner ${type}`;
        alertBanner.style.display = 'block';
        
        // Auto-dismiss notification after 6 seconds
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
    // 4. AUTHENTICATION LOGIC (Live Actions)
    // ==========================================

    // --- SIGN UP ACTION WITH METADATA ---
    document.getElementById('btn-signup').addEventListener('click', async () => {
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Frontend Client Side Validations
        if (!username || !email || !password || !confirmPassword) {
            return displayAlert("Please populate all fields.", "error");
        }

        if (password.length < 6) {
            return displayAlert("Password must possess at least 6 characters.", "error");
        }

        if (password !== confirmPassword) {
            return displayAlert("Passwords do not match. Please verify.", "error");
        }

        // Register with Supabase passing custom structural metadata
        const { data, error } = await mySupabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    display_username: username // Saved directly inside user_metadata
                }
            }
        });

        if (error) {
            displayAlert("Registration Defect: " + error.message, "error");
        } else {
            displayAlert("Success! Check your inbox for a confirmation validation link.", "success");
            // Clear inputs
            document.getElementById('signup-username').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
        }
    });

    // --- LOG IN ACTION ---
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

    // --- LOG OUT ACTION ---
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const { error } = await mySupabaseClient.auth.signOut();
        if (error) displayAlert("Signout Error: " + error.message, "error");
    });

    // ==========================================
    // 5. SESSION TRACKING & SECURITY HANDSHAKE
    // ==========================================
    mySupabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            // User session is active
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            
            // Extract attributes from session payloads safely
            userDisplayEmail.innerText = session.user.email;
            
            // Look into user metadata for the customized username, fall back to email if missing
            const customUsername = session.user.user_metadata?.display_username || "Explorer";
            userDisplayName.innerText = customUsername;
            
            // PREVENT CRITICAL SECURITY LOSS ACROSS DOMAINS
            // Append the cryptographic JWT access token directly as an URL search token.
            // When user clicks link, FastAPI catches it securely via standard parameter checking.
            mapProjectLink.href = `${MAP_PROJECT_BASE_URL}?access_token=${session.access_token}`;
            
            console.log("Authentication handshake prepared for downstream apps.");
        } else {
            // User session cleared
            authContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            userDisplayEmail.innerText = '';
            userDisplayName.innerText = 'User';
            mapProjectLink.href = MAP_PROJECT_BASE_URL;
        }
    });

    console.log("Authentication hub fully active!");
});
