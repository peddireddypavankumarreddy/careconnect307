const API = "http://127.0.0.1:5000/api";

/* NAVBAR */
function loadNavbar() {
    const user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("nav").innerHTML = `
    <div class="navbar">
        <div>🍲 CareConnect</div>
        <div>
            <a href="index.html">Home</a>
            <a href="request.html">Request</a>
            <a href="donate.html">Donate</a>
            ${user?.role === "admin" ? '<a href="admin.html">Admin</a>' : ""}
            <a href="#" onclick="logout()">Logout</a>
        </div>
    </div>`;
}

/* LOGIN */
async function loginUser(e){
    e.preventDefault();

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    const res = await fetch(`${API}/login`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email,password})
    });

    if(res.ok){
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        location.href="index.html";
    } else alert("Login failed");
}

/* REGISTER */
async function registerUser(e){
    e.preventDefault();

    await fetch(`${API}/register`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            name: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value
        })
    });

    alert("Registered successfully");
    location.href="login.html";
}

/* REQUEST */
async function submitRequest(e){
    e.preventDefault();

    await fetch(`${API}/request`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            name: name.value,
            phone: phone.value,
            location: location.value,
            food: food.value
        })
    });

    alert("Request added");
}

/* DONATION */
async function submitDonation(e){
    e.preventDefault();

    await fetch(`${API}/donation`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
            name: name.value,
            phone: phone.value,
            location: location.value,
            foodType: foodType.value,
            quantity: quantity.value
        })
    });

    alert("Donation added");
}

/* LOAD DATA */
async function loadData(){
    const res = await fetch(`${API}/admin`);
    const data = await res.json();

    requestsList.innerHTML = data.requests.map(r=>`
        <div class="card">
            <h3>${r.food}</h3>
            <p>${r.location}</p>
            <button class="btn-blue" onclick="deleteReq('${r._id}')">Fulfill</button>
        </div>
    `).join("");

    donationsList.innerHTML = data.donations.map(d=>`
        <div class="card">
            <h3>${d.foodType}</h3>
            <p>${d.location}</p>
            <button class="btn-green" onclick="deleteDon('${d._id}')">Claim</button>
        </div>
    `).join("");
}

async function deleteReq(id){
    await fetch(`${API}/request/${id}`,{method:"DELETE"});
    loadData();
}

async function deleteDon(id){
    await fetch(`${API}/donation/${id}`,{method:"DELETE"});
    loadData();
}

function logout(){
    localStorage.removeItem("user");
    location.href="login.html";
}