// ======================================================
// PUBLIC APP.JS
// USER WALLET + BALANCE + DEPOSIT
// ======================================================

(function () {

    "use strict";


    // ======================================================
    // GET LOGGED-IN USER PHONE
    // ======================================================

    function getUserPhone() {

        let phone =
            localStorage.getItem("phone") ||
            localStorage.getItem("userPhone") ||
            sessionStorage.getItem("phone") ||
            sessionStorage.getItem("userPhone");


        // ------------------------------------------
        // ALSO CHECK SAVED USER OBJECT
        // ------------------------------------------

        if (!phone) {

            try {

                const savedUser =
                    JSON.parse(
                        localStorage.getItem("user")
                    );

                if (
                    savedUser &&
                    savedUser.phone
                ) {

                    phone =
                        savedUser.phone;

                }

            } catch (error) {

                console.log(
                    "Could not read saved user object."
                );

            }

        }


        if (!phone) {

            console.log(
                "NO PHONE FOUND IN STORAGE"
            );

            return null;

        }


        phone =
            String(phone).trim();


        console.log(
            "LOGGED-IN PHONE:",
            phone
        );


        return phone;

    }



    // ======================================================
    // UPDATE ALL BALANCE ELEMENTS
    // ======================================================

    function updateBalanceOnPage(balance) {

        const numericBalance =
            Number(balance || 0);


        const formattedBalance =
            numericBalance.toLocaleString("en-US") +
            " ETB";


        // ------------------------------------------
        // MAIN BALANCE
        // ------------------------------------------

        const mainBalance =
            document.getElementById("balance");


        if (mainBalance) {

            mainBalance.textContent =
                formattedBalance;

        }


        // ------------------------------------------
        // OTHER POSSIBLE BALANCE IDs
        // ------------------------------------------

        const balanceIds = [

            "walletBalance",

            "availableBalance",

            "currentBalance",

            "userBalance",

            "totalBalance"

        ];


        balanceIds.forEach(function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    formattedBalance;

            }

        });


        console.log(
            "DISPLAYED BALANCE:",
            formattedBalance
        );

    }



    // ======================================================
    // LOAD PRIVATE USER WALLET BALANCE
    // ======================================================

    async function loadWalletBalance() {

        console.log(
            "======================================"
        );

        console.log(
            "LOADING PRIVATE WALLET BALANCE"
        );


        const balanceElement =
            document.getElementById("balance");


        if (!balanceElement) {

            console.error(
                'wallet.html does not contain id="balance"'
            );

            return;

        }


        const phone =
            getUserPhone();


        console.log(
            "PHONE USED FOR WALLET:",
            phone
        );


        if (!phone) {

            updateBalanceOnPage(0);

            return;

        }


        try {

            balanceElement.textContent =
                "Loading...";


            const url =
                "/api/wallet/" +
                encodeURIComponent(phone) +
                "?t=" +
                Date.now();


            console.log(
                "REQUESTING WALLET:",
                url
            );


            const response =
                await fetch(
                    url,
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


            const data =
                await response.json();


            console.log(
                "WALLET API RESPONSE:",
                data
            );


            if (!response.ok) {

                console.error(
                    "WALLET SERVER ERROR:",
                    response.status
                );


                updateBalanceOnPage(0);

                return;

            }


            if (!data.success) {

                console.error(
                    "WALLET API ERROR:",
                    data.message
                );


                updateBalanceOnPage(0);

                return;

            }


            // ------------------------------------------
            // DATABASE BALANCE
            // ------------------------------------------

            const balance =
                Number(data.balance || 0);


            console.log(
                "DATABASE BALANCE:",
                balance
            );


            // ------------------------------------------
            // UPDATE WEBSITE
            // ------------------------------------------

            updateBalanceOnPage(
                balance
            );


            console.log(
                "WALLET DISPLAY UPDATED SUCCESSFULLY"
            );


        } catch (error) {

            console.error(
                "WALLET LOAD ERROR:",
                error
            );

        }


        console.log(
            "======================================"
        );

    }



    // ======================================================
    // MAKE BALANCE FUNCTION AVAILABLE TO HTML
    // ======================================================

    window.loadWalletBalance =
        loadWalletBalance;


    window.refreshWalletBalance =
        loadWalletBalance;



    // ======================================================
    // DEPOSIT
    // ======================================================

    async function deposit() {

        console.log(
            "STARTING DEPOSIT"
        );


        const amountInput =
            document.getElementById("amount");


        const txidInput =
            document.getElementById("txid");


        const message =
            document.getElementById("message");


        if (!amountInput) {

            console.error(
                'Deposit amount input id="amount" not found.'
            );

            return;

        }


        if (!txidInput) {

            console.error(
                'Deposit TXID input id="txid" not found.'
            );

            return;

        }


        const phone =
            getUserPhone();


        if (!phone) {

            if (message) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please login first.";

            }

            return;

        }


        const amount =
            Number(
                amountInput.value
            );


        const txid =
            txidInput.value.trim();


        if (!amount || amount <= 0) {

            if (message) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter a valid amount.";

            }

            return;

        }


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


            console.log(
                "DEPOSIT PHONE:",
                phone
            );


            console.log(
                "DEPOSIT AMOUNT:",
                amount
            );


            console.log(
                "DEPOSIT TXID:",
                txid
            );


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


            if (message) {

                message.style.color =
                    "green";

                message.textContent =
                    data.message ||
                    "Deposit submitted successfully. Waiting for admin approval.";

            }


            // ------------------------------------------
            // CLEAR FORM
            // ------------------------------------------

            amountInput.value =
                "";

            txidInput.value =
                "";


            // ------------------------------------------
            // LOAD CURRENT BALANCE
            // ------------------------------------------

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
                    encodeURIComponent(phone) +
                    "?t=" +
                    Date.now(),
                    {

                        method: "GET",

                        cache: "no-store",

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
    // PAGE LOAD
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
    // USER RETURNS TO PAGE
    // ======================================================

    window.addEventListener(
        "pageshow",
        function () {

            console.log(
                "PAGE SHOW - REFRESHING BALANCE"
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
                    "PAGE VISIBLE - REFRESHING BALANCE"
                );


                loadWalletBalance();

            }

        }
    );



    // ======================================================
    // REFRESH BALANCE EVERY 5 SECONDS
    // ======================================================

    setInterval(
        function () {

            loadWalletBalance();

        },
        5000
    );


})();
// ======================================================
// TEMPORARY WALLET DEBUG PANEL
// ======================================================

(function () {

    const debugBox = document.createElement("div");

    debugBox.id = "walletDebugBox";

    debugBox.style.position = "fixed";
    debugBox.style.bottom = "10px";
    debugBox.style.left = "10px";
    debugBox.style.right = "10px";
    debugBox.style.maxHeight = "250px";
    debugBox.style.overflowY = "auto";
    debugBox.style.background = "black";
    debugBox.style.color = "lime";
    debugBox.style.padding = "12px";
    debugBox.style.fontSize = "13px";
    debugBox.style.zIndex = "999999";
    debugBox.style.borderRadius = "8px";
    debugBox.style.fontFamily = "monospace";

    debugBox.innerHTML =
        "<b>WALLET DEBUG</b><br>";

    document.body.appendChild(debugBox);


    function debug(message) {

        console.log(message);

        debugBox.innerHTML +=
            "<div>" +
            String(message) +
            "</div>";

        debugBox.scrollTop =
            debugBox.scrollHeight;
    }


    // Check phone
    const phone =
        localStorage.getItem("phone") ||
        localStorage.getItem("userPhone") ||
        sessionStorage.getItem("phone") ||
        sessionStorage.getItem("userPhone");

    debug("PHONE = " + phone);


    if (!phone) {

        debug("❌ NO PHONE FOUND");

        return;
    }


    // Request wallet
    const url =
        "/api/wallet/" +
        encodeURIComponent(phone) +
        "?debug=" +
        Date.now();

    debug("REQUEST = " + url);


    fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        }
    })

    .then(function (response) {

        debug(
            "HTTP STATUS = " +
            response.status
        );

        return response.json();

    })

    .then(function (data) {

        debug(
            "API RESPONSE = " +
            JSON.stringify(data)
        );


        if (data.success) {

            debug(
                "✅ DATABASE BALANCE = " +
                data.balance
            );

        } else {

            debug(
                "❌ API ERROR = " +
                data.message
            );

        }

    })

    .catch(function (error) {

        debug(
            "❌ FETCH ERROR = " +
            error
        );

    });

})();