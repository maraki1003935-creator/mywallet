// ======================================
// LOAD PRIVATE USER WALLET
// ======================================

async function loadWallet() {

    const phone = localStorage.getItem("phone");

    console.log("WALLET PHONE:", phone);

    if (!phone) {

        document.getElementById("balance").innerText =
            "0 ETB";

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" +
            encodeURIComponent(phone) +
            "?t=" +
            Date.now()
        );

        const data = await response.json();

        console.log(
            "WALLET RESPONSE:",
            data
        );

        if (data.success) {

            document.getElementById("balance").innerText =
                Number(
                    data.balance || 0
                ).toLocaleString() +
                " ETB";

        } else {

            document.getElementById("balance").innerText =
                "0 ETB";

        }

    } catch (error) {

        console.error(
            "WALLET ERROR:",
            error
        );

    }

}


// ======================================
// LOAD IMMEDIATELY
// ======================================

loadWallet();


// ======================================
// REFRESH EVERY 5 SECONDS
// ======================================

setInterval(
    loadWallet,
    5000
);