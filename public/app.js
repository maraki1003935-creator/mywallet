// ======================================
// LOAD USER BALANCE
// ======================================

async function loadWallet() {

    const phone = localStorage.getItem("phone");

    console.log("PHONE FROM LOCAL STORAGE:", phone);

    if (!phone) {

        document.getElementById("balance").innerText =
            "0 ETB";

        return;
    }

    try {

        const url =
            "/api/wallet/" +
            encodeURIComponent(phone);

        console.log("REQUESTING:", url);

        const response = await fetch(url);

        const data = await response.json();

        console.log("WALLET DATA:", data);

        if (data.success) {

            const balance =
                Number(data.balance || 0);

            document.getElementById("balance").innerText =
                balance.toLocaleString() + " ETB";

        } else {

            document.getElementById("balance").innerText =
                "0 ETB";

            console.log(
                "Wallet message:",
                data.message
            );

        }

    } catch (error) {

        console.error(
            "BALANCE LOAD ERROR:",
            error
        );

    }

}


// ======================================
// START
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadWallet();

    }
);


// ======================================
// REFRESH EVERY 5 SECONDS
// ======================================

setInterval(
    loadWallet,
    5000
);