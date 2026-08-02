// ======================================
// MAIN.JS
// LOAD LOGGED-IN USER BALANCE
// ======================================

async function loadUserBalance() {

    // Your login should store the user's phone here
    const phone = localStorage.getItem("phone");

    if (!phone) {

        console.log("User phone not found in localStorage.");

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" + encodeURIComponent(phone)
        );

        const data = await response.json();

        console.log("Wallet response:", data);

        if (!data.success) {

            console.log("Could not load balance:", data.message);

            return;
        }

        const balance =
            Number(data.balance || 0).toLocaleString();

        // Update every balance element on the page
        document
            .querySelectorAll("#balance, .balance")
            .forEach(element => {

                element.textContent = balance + " ETB";

            });

    } catch (error) {

        console.error(
            "Error loading wallet balance:",
            error
        );

    }
}


// ======================================
// LOAD BALANCE WHEN PAGE OPENS
// ======================================

window.addEventListener("load", function () {

    loadUserBalance();

});


// ======================================
// REFRESH BALANCE EVERY 10 SECONDS
// ======================================

setInterval(function () {

    loadUserBalance();

}, 10000);