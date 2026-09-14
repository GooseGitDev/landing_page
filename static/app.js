// ==========================================
// 1. INITIALIZE SUPABASE
// ==========================================
// Use Supabase's global window variable to create our client under a unique name
const SUPABASE_URL = "https://oztxnrrhbrgzzibfolmc.supabase.co/rest/v1/"; 
const SUPABASE_KEY = "sb_publishable_umgeh3s19yYT7neVpzxoKw_JQ665XFh"; 

const mySupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. DOM ELEMENTS (UI SELECTORS)
// ==========================================
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');

const showSignupLink = document.getElementById('link-show-signup');
const showLoginLink = document.getElementById('link-show-login');

const userDisplayEmail = document.getElementById('user-display-email');

// ==========================================
// 3. UI TOGGLE LOGIC
// ==========================================
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// ==========================================
// 4. AUTHENTICATION LOGIC (Live Actions)
// ==========================================

// --- SIGN UP ACTION ---
document.getElementById('btn-signup').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await mySupabaseClient.auth.signUp({ email, password });

    if (error) {
        alert("Signup Error: " + error.message);
    } else {
        alert("Signup successful! Please check your email for a confirmation link.");
    }
});

// --- LOG IN ACTION ---
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await mySupabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login Error: " + error.message);
    } else {
        console.log("Logged in successfully!", data);
    }
});

// --- LOG OUT ACTION ---
document.getElementById('btn-logout').addEventListener('click', async () => {
    const { error } = await mySupabaseClient.auth.signOut();
    if (error) alert("Logout Error: " + error.message);
});

// ==========================================
// 5. SESSION TRACKING (Auto-updates UI)
// ==========================================
mySupabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // User is logged in
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        userDisplayEmail.innerText = session.user.email;
        
        console.log("User session active. Access Token (JWT):", session.access_token);
    } else {
        // User is logged out
        authContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        userDisplayEmail.innerText = '';
    }
});
