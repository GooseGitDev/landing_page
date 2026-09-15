document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully parsed. Initializing local authentication architecture...");

    const SUPABASE_URL = "https://oztxnrrhbrgzzibfolmc.supabase.co"; 
    const SUPABASE_KEY = "sb_publishable_umgeh3s19yYT7neVpzxoKw_JQ665XFh"; 

    // Look for the browser object using exact Case Sensitivity matching rules
    const targetLib = window.Supabase || window.supabase || (typeof Supabase !== 'undefined' ? Supabase : null);
    
    if (!targetLib) {
        console.error("Critical Failure: Supabase global script package was not ready.");
        return;
    }

    const mySupabaseClient = targetLib.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase initialization verified. Constructing elements...");

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

    const MAP_PROJECT_BASE_URL = "https://map-rasterizer.onrender.com/";

    function displayAlert(message, type = "error") {
        alertBanner.innerText = message;
        alertBanner.className = `alert-banner ${type}`;
        alertBanner.style.display = 'block';
        setTimeout(() => { alertBanner.style.display = 'none'; }, 6000);
    }

    // Toggle forms
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

    // Sign Up Button Event
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
            options: { data: { display_username: username } }
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

    // Log In Button Event
    document.getElementById('btn-login').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            return displayAlert("Please enter both email and password credentials.", "error");
        }

        const { data, error } = await mySupabaseClient.auth.signInWithPassword({ email, password });
        if (error) displayAlert("Authentication Failed: " + error.message, "error");
    });

    // Log Out Button Event
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const { error } = await mySupabaseClient.auth.signOut();
        if (error) displayAlert("Signout Error: " + error.message, "error");
    });

    // Session listener handling UI adjustments
    mySupabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            userDisplayEmail.innerText = session.user.email;
            
            const customUsername = session.user.user_metadata?.display_username || "Explorer";
            userDisplayName.innerText = customUsername;
            
            mapProjectLink.href = `${MAP_PROJECT_BASE_URL}?access_token=${session.access_token}`;
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
