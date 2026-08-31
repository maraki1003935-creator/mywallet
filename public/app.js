// ======================================================
// PUBLIC APP.JS
// PRIVATE USER WALLET
// ======================================================

(function () {

    "use strict";


    // ==================================================
    // GET LOGGED-IN USER PHONE
    // ==================================================

    function getUserPhone() {

        let phone =
            localStorage.getItem("phone") ||
            localStorage.getItem("userPhone") ||
            sessionStorage.getItem("phone") ||
            sessionStorage.getItem("userPhone");


        // ----------------------------------------------
        // ALSO CHECK SAVED USER OBJECT
        // ----------------------------------------------

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
                "❌ NO LOGGED-IN PHONE FOUND"
            );

            return null;

        }


        phone =
            String(phone).trim();


        console.log(
            "📱 LOGGED-IN PHONE:",
            phone
        );


        return phone;

    }


    // ==================================================
    // UPDATE ALL BALANCE ELEMENTS
    // ==================================================

    function updateBalanceOnPage(balance) {

        const number =
            Number(balance || 0);


        const formatted =
            number.toLocaleString("en-US") +
            " ETB";


        // ----------------------------------------------
        // MAIN BALANCE
        // ----------------------------------------------

        const balanceElement =
            document.getElementById("balance");


        if (balanceElement) {

            balanceElement.textContent =
                formatted;

        }


        // ----------------------------------------------
        // OTHER BALANCE ELEMENTS
        // ----------------------------------------------

        const ids = [

            "walletBalance",
            "availableBalance",
            "currentBalance",
            "userBalance",
            "totalBalance"

        ];


        ids.forEach(function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    formatted;

            }

        });


        console.log(
            "💰 BALANCE DISPLAYED:",
            formatted
        );

    }


    // ==================================================
    // LOAD PRIVATE WALLET
    // ==================================================

    async function loadWalletBalance() {

        console.log(
            "======================================"
        );

        console.log(
            "🔄 LOADING PRIVATE USER WALLET"
        );


        const phone =
            getUserPhone();


        console.log(
            "PHONE FOR WALLET:",
            phone
        );


        // ----------------------------------------------
        // NO PHONE
        // ----------------------------------------------

        if (!phone) {

            console.log(
                "❌ Wallet cannot load because phone is missing."
            );

            updateBalanceOnPage(0);

            return;

        }


        // ----------------------------------------------
        // SHOW PHONE ON PAGE IF ELEMENT EXISTS
        // ----------------------------------------------

        const phoneElements = [

            "phone",
            "userPhone",
            "phoneNumber",
            "loggedInPhone"

        ];


        phoneElements.forEach(function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    phone;

            }

        });


        // ----------------------------------------------
        // API URL
        // ----------------------------------------------

        const url =
            "/api/wallet/" +
            encodeURIComponent(phone) +
            "?t=" +
            Date.now();


        console.log(
            "🌐 WALLET API REQUEST:",
            url
        );


        try {

            // ------------------------------------------
            // LOADING
            // ------------------------------------------

            updateBalanceOnPage("Loading...");


            // ------------------------------------------
            // REQUEST DATABASE WALLET
            // ------------------------------------------

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
                "📡 WALLET HTTP STATUS:",
                response.status
            );


            // ------------------------------------------
            // READ RESPONSE
            // ------------------------------------------

            const data =
                await response.json();


            console.log(
                "📦 WALLET API RESPONSE:",
                data
            );


            // ------------------------------------------
            // SERVER ERROR
            // ------------------------------------------

            if (!response.ok) {

                console.error(
                    "❌ WALLET SERVER ERROR:",
                    response.status
                );

                updateBalanceOnPage(0);

                return;

            }


            // ------------------------------------------
            // API ERROR
            // ------------------------------------------

            if (!data.success) {

                console.error(
                    "❌ WALLET API ERROR:",
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
                "======================================"
            );

            console.log(
                "👤 USER PHONE:",
                data.phone || phone
            );

            console.log(
                "💰 DATABASE BALANCE:",
                balance
            );

            console.log(
                "======================================"
            );


            // ------------------------------------------
            // DISPLAY REAL DATABASE BALANCE
            // ------------------------------------------

            updateBalanceOnPage(balance);

        }


        catch (error) {

            console.error(
                "❌ WALLET FETCH ERROR:",
                error
            );


            updateBalanceOnPage(0);

        }


        console.log(
            "======================================"
        );

    }


    // ==================================================
    // MAKE FUNCTIONS GLOBAL
    // ==================================================

    window.getUserPhone =
        getUserPhone;


    window.loadWalletBalance =
        loadWalletBalance;


    window.refreshWalletBalance =
        loadWalletBalance;


    // ==================================================
    // PAGE LOADED
    // ==================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "✅ PUBLIC APP.JS LOADED"
            );


            loadWalletBalance();

        }
    );


    // ==================================================
    // PAGE SHOW
    // ==================================================

    window.addEventListener(
        "pageshow",
        function () {

            console.log(
                "🔄 PAGE SHOW - RELOADING WALLET"
            );


            loadWalletBalance();

        }
    );


    // ==================================================
    // PAGE VISIBLE AGAIN
    // ==================================================

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                console.log(
                    "👁️ PAGE VISIBLE - RELOADING WALLET"
                );


                loadWalletBalance();

            }

        }
    );


    // ==================================================
    // REFRESH EVERY 5 SECONDS
    // ==================================================

    setInterval(
        function () {

            loadWalletBalance();

        },
        5000
    );


})();