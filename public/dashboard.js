// ===============================
// DASHBOARD
// ===============================

// Get saved phone number
let phone = localStorage.getItem("phone");

// If not logged in
if (!phone) {

    window.location.href = "/";

}

// Show phone number
document.getElementById("phone").innerHTML =
"Phone: " + phone;

// Default balance
let balance = localStorage.getItem("balance");

if(balance == null){

    balance = "0.00";

    localStorage.setItem("balance", balance);

}

document.getElementById("balance").innerHTML =
balance + " ETB";

// Default referral code
let referral = localStorage.getItem("referral");

if(referral == null){

    referral = "USER" + Math.floor(Math.random()*1000000);

    localStorage.setItem("referral", referral);

}

document.getElementById("refcode").innerHTML =
referral;

// Default values
document.getElementById("earnings").innerHTML =
"0 ETB";

document.getElementById("today").innerHTML =
"0 ETB";

document.getElementById("total").innerHTML =
"0 ETB";

document.getElementById("invited").innerHTML =
"0";

// Logout
function logout(){

    localStorage.removeItem("phone");

    alert("Logged out successfully.");

    window.location.href="/";

}