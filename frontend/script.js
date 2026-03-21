const API = "http://127.0.0.1:5000/api";

// 1. INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    showMessage();
    
    const path = window.location.pathname;
    if (path.includes("index.html") || path.endsWith("/")) {
        checkAuth();
        loadAllData();
    }
});

// 2. UPDATED NAVBAR (Includes Profile)
function loadNavbar() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navDiv = document.getElementById("nav");
    if (navDiv) {
        navDiv.innerHTML = `
            <nav class="navbar">
                <div class="logo">🍲 CareConnect</div>
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="request.html">Request</a>
                    <a href="donate.html">Donate</a>
                    <a href="profile.html">Profile</a>
                    ${user && user.role === 'admin' ? '<a href="admin.html" style="color:#f39c12; font-weight:bold;">Admin</a>' : ''}
                    <a href="#" onclick="logout(); return false;" style="color:#ff4b2b">Logout</a>
                </div>
            </nav>`;
    }
}

// 3. AUTHENTICATION
async function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
        alert("Registration Successful!");
        window.location.href = "login.html";
    } else {
        alert("Registration Failed.");
    }
}

async function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        window.location.href = "index.html";
    } else {
        alert("Invalid Login Credentials.");
    }
}

// 4. DATA MANAGEMENT
async function loadAllData() {
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user && user.role === "admin";

    try {
        const res = await fetch(`${API}/admin`);
        const data = await res.json();

        document.getElementById("requestsList").innerHTML = data.requests.map(r => `
            <div class="glass-card" style="margin-bottom:15px; padding:1.5rem;">
                <div style="font-weight:bold; color:#4facfe;">🍱 ${r.food}</div>
                <div style="font-size:12px; opacity:0.7; margin:8px 0;">📍 ${r.location}</div>
                <button onclick="handleAction('request', '${r._id}', '${isAdmin ? 'delete' : 'fulfill'}', '${r.phone}')" 
                    style="background:${isAdmin ? '#ff4b2b' : 'rgba(79,172,254,0.1)'}">
                    ${isAdmin ? 'Delete' : 'Fulfill'}
                </button>
            </div>`).join("");

        document.getElementById("donationsList").innerHTML = data.donations.map(d => `
            <div class="glass-card" style="margin-bottom:15px; padding:1.5rem;">
                <div style="font-weight:bold; color:#43e97b;">🍲 ${d.foodType}</div>
                <div style="font-size:12px; opacity:0.7; margin:8px 0;">📍 ${d.location}</div>
                <button onclick="handleAction('donation', '${d._id}', '${isAdmin ? 'delete' : 'claim'}', '${d.phone}')" 
                    style="background:${isAdmin ? '#ff4b2b' : 'rgba(67,233,123,0.1)'}">
                    ${isAdmin ? 'Delete' : 'Claim'}
                </button>
            </div>`).join("");
    } catch (e) { console.error("Data failed to load"); }
}

window.handleAction = async (type, id, action, phone = "") => {
    if (confirm(`Confirm ${action}?`)) {
        const res = await fetch(`${API}/${type}/${id}`, { method: "DELETE" });
        if (res.ok) {
            if (phone && action !== 'delete') alert("Contact: " + phone);
            loadAllData();
        }
    }
};

function logout() { localStorage.removeItem("user"); window.location.href = "login.html"; }
function checkAuth() { if (!localStorage.getItem("user")) window.location.href = "login.html"; }
function showMessage() {
    const msg = localStorage.getItem("msg");
    if (msg && document.getElementById("message")) {
        document.getElementById("message").innerText = msg;
        localStorage.removeItem("msg");
    }
}