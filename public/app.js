// ======================================================
// PUBLIC APP.JS
// USER WALLET + BALANCE + DEPOSIT + LOGOUT
// ======================================================


// ======================================================
// GET LOGGED-IN USER PHONE
// ======================================================

function getUserPhone() {

    const phone =
        localStorage.getItem("phone") ||
        localStorage.getItem("userPhone") ||
        sessionStorage.getItem("phone") ||
        sessionStorage.getItem("userPhone");

    if (!phone) {

        console.log(
            "No phone number found in browser storage."
        );

        return null;
    }

    return phone.trim();
}


// ======================================================
// UPDATE BALANCE ON WEBSITE
// ======================================================

function updateBalanceOnPage(balance) {

    const amount =
        Number(balance || 0);

    const formattedBalance =
        amount.toLocaleString("en-US") +
        " ETB";

    console.log(
        "DISPLAYING BALANCE:",
        formattedBalance
    );


    // ----------------------------------------------
    // Main balance
    // ----------------------------------------------

    const balanceElement =
        document.getElementById("balance");

    if (balanceElement) {

        balanceElement.textContent =
            formattedBalance;

        console.log(
            "#balance updated:",
            formattedBalance
        );
    }


    // ----------------------------------------------
    // Other possible balance elements
    // ----------------------------------------------

    const walletBalance =
        document.getElementById("walletBalance");

    if (walletBalance) {

        walletBalance.textContent =
            formattedBalance;

        console.log(
            "#walletBalance updated"
        );
    }


    const availableBalance =
        document.getElementById("availableBalance");

    if (availableBalance) {

        availableBalance.textContent =
            formattedBalance;

        console.log(
            "#availableBalance updated"
        );
    }


    const currentBalance =
        document.getElementById("currentBalance");

    if (currentBalance) {

        currentBalance.textContent =
            formattedBalance;

        console.log(
            "#currentBalance updated"
        );
    }


    const userBalance =
        document.getElementById("userBalance");

    if (userBalance) {

        userBalance.textContent =
            formattedBalance;

        console.log(
            "#userBalance updated"
        );
    }

}


// ======================================================
// LOAD PRIVATE USER WALLET BALANCE
// ======================================================

async function loadWalletBalance() {

    console.log(
        "======================================"
    );

    console.log(
        "LOADING PRIVATE USER WALLET"
    );

    console.log(
        "======================================"
    );


    // ----------------------------------------------
    // Get logged-in phone
    // ----------------------------------------------

    const phone =
        getUserPhone();


    console.log(
        "PHONE FROM STORAGE:",
        phone
    );


    if (!phone) {

        console.log(
            "No logged-in phone."
        );

        updateBalanceOnPage(0);

        return;
    }


    // ----------------------------------------------
    // Request user's private wallet
    // ----------------------------------------------

    const encodedPhone =
        encodeURIComponent(
            phone
        );


    const walletURL =
        "/api/wallet/" +
        encodedPhone +
        "?t=" +
        Date.now();


    console.log(
        "REQUESTING:",
        walletURL
    );


    try {

        const response =
            await fetch(
                walletURL,
                {
                    method: "GET",

                    cache: "no-store",

                    headers: {

                        "Cache-Control":
                            "no-cache",

                        "Pragma":
                            "no-cache"

                    }
                }
            );


        console.log(
            "WALLET HTTP STATUS:",
            response.status
        );


        // ------------------------------------------
        // Convert response to JSON
        // ------------------------------------------

        const data =
            await response.json();


        console.log(
            "WALLET API RESPONSE:",
            data
        );


        // ------------------------------------------
        // Server error
        // ------------------------------------------

        if (!response.ok) {

            console.log(
                "Wallet server error:",
                response.status
            );

            return;
        }


        // ------------------------------------------
        // User not found / API error
        // ------------------------------------------

        if (!data.success) {

            console.log(
                "Wallet API error:",
                data.message
            );

            return;
        }


        // ------------------------------------------
        // Get balance from MongoDB
        // ------------------------------------------

        const balance =
            Number(
                data.balance || 0
            );


        console.log(
            "DATABASE PHONE:",
            data.phone
        );


        console.log(
            "DATABASE BALANCE:",
            balance
        );


        // ------------------------------------------
        // PUT BALANCE ON WEBSITE
        // ------------------------------------------

        updateBalanceOnPage(
            balance
        );


        console.log(
            "WALLET BALANCE UPDATED SUCCESSFULLY"
        );


    } catch (error) {

        console.error(
            "WALLET LOAD ERROR:",
            error
        );

    }

}


// ======================================================
// PAGE OPEN
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "======================================"
        );

        console.log(
            "PUBLIC APP.JS LOADED"
        );

        console.log(
            "======================================"
        );


        loadWalletBalance();

    }
);


// ======================================================
// PAGE SHOW
// ======================================================

window.addEventListener(
    "pageshow",
    function () {

        console.log(
            "PAGE SHOW - LOADING BALANCE"
        );

        loadWalletBalance();

    }
);


// ======================================================
// PAGE BECOMES VISIBLE
// ======================================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            console.log(
                "PAGE VISIBLE - LOADING BALANCE"
            );

            loadWalletBalance();

        }

    }
);


// ======================================================
// AUTOMATIC BALANCE REFRESH
// EVERY 5 SECONDS
// ======================================================

setInterval(
    function () {

        loadWalletBalance();

    },
    5000
);


// ======================================================
// MANUAL BALANCE REFRESH
// ======================================================

window.refreshWalletBalance =
    loadWalletBalance;


// ======================================================
// DEPOSIT
// ======================================================

async function deposit() {


    const amountInput =
        document.getElementById(
            "amount"
        );


    const txidInput =
        document.getElementById(
            "txid"
        );


    const message =
        document.getElementById(
            "message"
        );


    // ----------------------------------------------
    // Check fields
    // ----------------------------------------------

    if (
        !amountInput ||
        !txidInput
    ) {

        console.log(
            "Deposit fields not found."
        );

        return;
    }


    // ----------------------------------------------
    // Get values
    // ----------------------------------------------

    const amount =
        Number(
            amountInput.value
        );


    const txid =
        txidInput.value.trim();


    const phone =
        getUserPhone();


    // ----------------------------------------------
    // Login check
    // ----------------------------------------------

    if (!phone) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Please login first.";

        }

        return;
    }


    // ----------------------------------------------
    // Amount check
    // ----------------------------------------------

    if (
        !amount ||
        amount <= 0
    ) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Please enter a valid amount.";

        }

        return;
    }


    // ----------------------------------------------
    // TXID check
    // ----------------------------------------------

    if (!txid) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Please enter your Telebirr TXID.";

        }

        return;
    }


    try {


        if (message) {

            message.style.color =
                "black";

            message.textContent =
                "Submitting deposit...";

        }


        // ------------------------------------------
        // Send deposit to server
        // ------------------------------------------

        const response =
            await fetch(
                "/deposit/create",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            phone:
                                phone,

                            amount:
                                amount,

                            txid:
                                txid

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "DEPOSIT RESPONSE:",
            data
        );


        // ------------------------------------------
        // Deposit failed
        // ------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            if (message) {

                message.style.color =
                    "red";

                message.textContent =
                    data.message ||
                    "Deposit failed.";

            }

            return;
        }


        // ------------------------------------------
        // Deposit submitted
        // ------------------------------------------

        if (message) {

            message.style.color =
                "green";

            message.textContent =
                data.message ||
                "Deposit submitted successfully.";

        }


        // Clear fields

        amountInput.value = "";

        txidInput.value = "";


        // Refresh balance

        await loadWalletBalance();


    } catch (error) {

        console.error(
            "DEPOSIT ERROR:",
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
// MAKE DEPOSIT AVAILABLE TO HTML
// ======================================================

window.deposit =
    deposit;


// ======================================================
// LOGOUT
// ======================================================

function logout() {


    localStorage.removeItem(
        "phone"
    );


    localStorage.removeItem(
        "userPhone"
    );


    localStorage.removeItem(
        "user"
    );


    sessionStorage.removeItem(
        "phone"
    );


    sessionStorage.removeItem(
        "userPhone"
    );


    window.location.href =
        "/";

}


window.logout =
    logout;


// ======================================================
// LOAD CURRENT USER
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
                encodeURIComponent(
                    phone
                ) +
                "?t=" +
                Date.now(),

                {
                    method:
                        "GET",

                    cache:
                        "no-store",

                    headers: {

                        "Cache-Control":
                            "no-cache"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "CURRENT USER:",
            data
        );


        if (!data.success) {

            console.log(
                "Could not load user:",
                data.message
            );

            return null;

        }


        return data;


    } catch (error) {


        console.error(
            "CURRENT USER ERROR:",
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