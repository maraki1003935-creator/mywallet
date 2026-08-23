// ======================================================
// PUBLIC WALLET APP.JS
// ======================================================

(function () {

    "use strict";

    // ==================================================
    // GET USER PHONE
    // ==================================================

    function getUserPhone() {

        let phone =
            localStorage.getItem("phone") ||
            localStorage.getItem("userPhone") ||
            sessionStorage.getItem("phone") ||
            sessionStorage.getItem("userPhone");

        if (!phone) {
            console.log("❌ No phone found in storage.");
            return null;
        }

        phone = String(phone).trim();

        console.log("📱 Logged-in phone:", phone);

        return phone;
    }


    // ==================================================
    // LOAD WALLET BALANCE
    // ==================================================

    async function loadWalletBalance() {

        const balanceElement =
            document.getElementById("balance");

        console.log(
            "🔎 #balance element:",
            balanceElement
        );

        if (!balanceElement) {

            console.error(
                "❌ IMPORTANT: wallet.html does not contain id=\"balance\""
            );

            return;
        }


        const phone = getUserPhone();


        if (!phone) {

            balanceElement.textContent = "0 ETB";

            return;
        }


        const url =
            "/api/wallet/" +
            encodeURIComponent(phone) +
            "?t=" +
            Date.now();


        console.log(
            "🌐 Requesting:",
            url
        );


        try {

            balanceElement.textContent =
                "Loading...";


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            "Cache-Control": "no-cache",
                            "Pragma": "no-cache"
                        }
                    }
                );


            console.log(
                "📡 HTTP status:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "💰 WALLET API:",
                data
            );


            if (!data.success) {

                console.error(
                    "❌ Wallet API error:",
                    data.message
                );

                balanceElement.textContent =
                    "0 ETB";

                return;
            }


            const balance =
                Number(data.balance);


            console.log(
                "✅ DATABASE BALANCE:",
                balance
            );


            // ==========================================
            // SHOW BALANCE
            // ==========================================

            balanceElement.textContent =
                balance.toLocaleString("en-US") +
                " ETB";


            // ==========================================
            // ALSO UPDATE OTHER BALANCE ELEMENTS
            // ==========================================

            const ids = [
                "walletBalance",
                "availableBalance",
                "currentBalance",
                "userBalance"
            ];


            ids.forEach(function (id) {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.textContent =
                        balance.toLocaleString("en-US") +
                        " ETB";

                }

            });


        } catch (error) {

            console.error(
                "❌ WALLET LOAD ERROR:",
                error
            );

            balanceElement.textContent =
                "0 ETB";
        }
    }


    // ==================================================
    // MAKE FUNCTION GLOBAL
    // ==================================================

    window.loadWalletBalance =
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
    // WHEN USER RETURNS TO PAGE
    // ==================================================

    window.addEventListener(
        "pageshow",
        function () {

            loadWalletBalance();

        }
    );


    // ==================================================
    // WHEN PAGE BECOMES VISIBLE
    // ==================================================

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

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