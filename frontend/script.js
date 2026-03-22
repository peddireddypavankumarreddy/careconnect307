const isDemoMode = typeof window.netlifyDeploy !== 'undefined' || !window.location.hostname.includes('localhost');

// Demo API - replace with real backend when available
const API = isDemoMode ? null : "http://localhost:5000/api";

// Mock data for Netlify static demo
const mockRequests = [
    { _id: '1', food: 'Rice 5kg', location: 'Near Park Street', name: 'John Doe' },
    { _id: '2', food: 'Vegetables', location: 'Downtown', name: 'Jane Smith' }
];

const mockDonations = [
    { _id: '1', foodType: 'Rice', quantity: '10kg', location: 'Central Market', name: 'Alice Brown' },
    { _id: '2', foodType: 'Bread', quantity: '50 loaves', location: 'Bakery Street', name: 'Bob Wilson' }
];

/* NAVBAR */
function loadNavbar() {
    const user = JSON.parse(localStorage.getItem("user")) || { role: 'user' };
    document.getElementById("nav").innerHTML = `
    <div class="navbar">
        <div>🍲 CareConnect</div>
        <div>
            <a href="index.html">Home</a>
            <a href="request.html">Request</a>
            <a href="donate.html">Donate</a>
            ${user.role === "admin" ? '<a href="admin.html">Admin</a>' : ""}
            <a href="profile.html">Profile</a>
            <a href="#" onclick="logout()">Logout</a>
        </div>
    </div>`;
}

/* AUTH CHECK */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user && window.location.pathname.includes('admin')) {
        alert('Admin access required');
        location.href = 'login.html';
    }
}

/* LOGIN - Demo */
async function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    if (isDemoMode) {
        localStorage.setItem("user", JSON.stringify({ email, name: 'Demo User', role: email.includes('admin') ? 'admin' : 'user' }));
        alert("Demo login - Backend not available on static deploy");
        location.href = "index.html";
        return;
    }

    // Real API call
    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const user = await res.json();
            localStorage.setItem("user", JSON.stringify(user));
            location.href = "index.html";
        } else {
            alert("Login failed");
        }
    } catch (err) {
        alert("Server error - check if backend running");
    }
}

/* REGISTER - Demo */
async function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    if (isDemoMode) {
        localStorage.setItem("user", JSON.stringify({ name, email, role: 'user' }));
        alert("Demo register - Backend not available");
        location.href = "login.html";
        return;
    }

    try {
        await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        alert("Registered successfully");
        location.href = "login.html";
    } catch (err) {
        alert("Server error");
    }
}

/* REQUEST */
async function submitRequest(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
        food: document.getElementById("food").value
    };

    if (isDemoMode) {
        console.log("Demo request:", data);
        alert("Request saved (demo mode)");
        e.target.reset();
        return;
    }

    try {
        await fetch(`${API}/request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert("Request added");
        e.target.reset();
    } catch (err) {
        alert("Server error");
    }
}

/* DONATION */
async function submitDonation(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
        foodType: document.getElementById("foodType").value,
        quantity: document.getElementById("quantity").value
    };

    if (isDemoMode) {
        console.log("Demo donation:", data);
        alert("Donation posted (demo mode)");
        e.target.reset();
        return;
    }

    try {
        await fetch(`${API}/donation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert("Donation added");
        e.target.reset();
    } catch (err) {
        alert("Server error");
    }
}

/* LOAD DATA - Demo fallback */
async function loadData() {
    const requestsList = document.getElementById("requestsList");
    const donationsList = document.getElementById("donationsList");

    if (isDemoMode) {
        requestsList.innerHTML = mockRequests.map(r => `
            <div class="card">
                <h3>${r.food}</h3>
                <p>${r.location} - ${r.name}</p>
                <button class="btn-blue" onclick="alert('Demo fulfill')">Fulfill ✓</button>
            </div>
        `).join("");

        donationsList.innerHTML = mockDonations.map(d => `
            <div class="card">
                <h3>${d.foodType} (${d.quantity})</h3>
                <p>${d.location} - ${d.name}</p>
                <button class="btn-green" onclick="alert('Demo claim')">Claim ✓</button>
            </div>
        `).join("");
        return;
    }

    try {
        const res = await fetch(`${API}/admin`);
        const data = await res.json();

        requestsList.innerHTML = data.requests.map(r => `
            <div class="card">
                <h3>${r.food}</h3>
                <p>${r.location}</p>
                <button class="btn-blue" onclick="deleteReq('${r._id}')">Fulfill</button>
            </div>
        `).join("");

        donationsList.innerHTML = data.donations.map(d => `
            <div class="card">
                <h3>${d.foodType}</h3>
                <p>${d.location}</p>
                <button class="btn-green" onclick="deleteDon('${d._id}')">Claim</button>
            </div>
        `).join("");
    } catch (err) {
        alert("Backend not available - showing demo data");
        loadData(); // recursive demo
    }
}

async function deleteReq(id) {
    if (isDemoMode) return alert("Demo mode");
    await fetch(`${API}/request/${id}`, { method: "DELETE" });
    loadData();
}

async function deleteDon(id) {
    if (isDemoMode) return alert("Demo mode");
    await fetch(`${API}/donation/${id}`, { method: "DELETE" });
    loadData();
}

function logout() {
    localStorage.removeItem("user");
    location.href = "login.html";
}

// Set demo flag for Netlify
window.netlifyDeploy = true;

