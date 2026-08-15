// ======================================================
// PUBLIC APP.JS
// USER WALLET + BALANCE + DEPOSIT
// ======================================================


// ======================================================
// GET LOGGED-IN USER PHONE
// ======================================================

function getUserPhone() {

    const phone = localStorage.getItem("phone");

    if (!phone) {
        console.log("No phone number found in localStorage.");
        return null;
    }

    return phone.trim();
}


// ======================================================
// LOAD USER WALLET BALANCE
// ======================================================

async function loadWalletBalance() {

    const balanceElement = document.getElementById("balance");

    if (!balanceElement) {
        console.log("Balance element #balance was not found.");
        return;
    }

    const phone = getUserPhone();

    if (!phone) {

        balanceElement.textContent = "0 ETB";

        console.log("No logged-in phone number.");

        return;
    }

    console.log("Loading wallet for phone:", phone);

    try {

        balanceElement.textContent = "Loading...";

        const response = await fetch(
            "/api/wallet/" + encodeURIComponent(phone) +
            "?t=" + Date.now(),
            {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache"
                }
            }
        );

        const data = await response.json();

        console.log("Wallet response:", data);

        if (!response.ok) {

            console.log(
                "Wallet server error:",
                response.status
            );

            balanceElement.textContent = "0 ETB";

            return;
        }

        if (!data.success) {

            console.log(
                "Wallet error:",
                data.message
            );

            balanceElement.textContent = "0 ETB";

            return;
        }

        const balance = Number(data.balance || 0);

        balanceElement.textContent =
            balance.toLocaleString("en-US") + " ETB";

        console.log(
            "USER:",
            data.phone
        );

        console.log(
            "BALANCE:",
            balance
        );

    } catch (error) {

        console.log(
            "Wallet loading error:",
            error
        );

        balanceElement.textContent = "0 ETB";
    }
}


// ======================================================
// LOAD BALANCE WHEN PAGE OPENS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Public app.js loaded.");

        loadWalletBalance();

    }
);


// ======================================================
// REFRESH BALANCE WHEN USER RETURNS TO PAGE
// ======================================================

window.addEventListener(
    "pageshow",
    function () {

        loadWalletBalance();

    }
);


// ======================================================
// REFRESH BALANCE WHEN PAGE BECOMES VISIBLE AGAIN
// ======================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.visibilityState === "visible") {

            loadWalletBalance();

        }

    }
);


// ======================================================
// MANUAL REFRESH FUNCTION
// ======================================================

window.refreshWalletBalance = function () {

    loadWalletBalance();

};


// ======================================================
// DEPOSIT
// ======================================================

async function deposit() {

    const amountInput =
        document.getElementById("amount");

    const txidInput =
        document.getElementById("txid");

    const message =
        document.getElementById("message");


    if (!amountInput || !txidInput) {

        console.log(
            "Deposit fields were not found."
        );

        return;
    }


    const amount =
        Number(amountInput.value);

    const txid =
        txidInput.value.trim();


    const phone =
        getUserPhone();


    if (!phone) {

        if (message) {

            message.style.color = "red";

            message.textContent =
                "Please login first.";

        }

        return;
    }


    if (!amount || amount <= 0) {

        if (message) {

            message.style.color = "red";

            message.textContent =
                "Please enter a valid amount.";

        }

        return;
    }


    if (!txid) {

        if (message) {

            message.style.color = "red";

            message.textContent =
                "Please enter your Telebirr TXID.";

        }

        return;
    }


    try {

        if (message) {

            message.style.color = "black";

            message.textContent =
                "Submitting deposit...";

        }


        const response =
            await fetch(
                "/deposit/create",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        phone: phone,

                        amount: amount,

                        txid: txid

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Deposit response:",
            data
        );


        if (!response.ok ||
            !data.success) {

            if (message) {

                message.style.color =
                    "red";

                message.textContent =
                    data.message ||
                    "Deposit failed.";

            }

            return;
        }


        if (message) {

            message.style.color =
                "green";

            message.textContent =
                data.message ||
                "Deposit submitted successfully.";

        }


        amountInput.value = "";

        txidInput.value = "";


        // Keep current balance displayed.
        // Admin approval will update MongoDB.
        await loadWalletBalance();


    } catch (error) {

        console.log(
            "Deposit error:",
            error
        );


        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Server error. Please try again.";

        }

    }

}


// ======================================================
// MAKE DEPOSIT FUNCTION AVAILABLE TO HTML
// ======================================================

window.deposit = deposit;


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem("phone");

    localStorage.removeItem("user");

    window.location.href = "/";

}


window.logout = logout;


// ======================================================
// OPTIONAL: GET CURRENT USER
// ======================================================

async function loadCurrentUser() {

    const phone =
        getUserPhone();

    if (!phone) {

        return null;

    }


    try {

        const response =
            await fetch(
                "/api/wallet/" +
                encodeURIComponent(phone) +
                "?t=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            console.log(
                "Could not load user:",
                data.message
            );

            return null;

        }


        return data;

    } catch (error) {

        console.log(
            "Current user error:",
            error
        );

        return null;

    }

}


window.loadCurrentUser =
    loadCurrentUser;


// ======================================================
// END OF PUBLIC APP.JS
// ======================================================