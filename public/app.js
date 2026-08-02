// ======================================
// LOAD PRIVATE WALLET BALANCE
// ======================================

async function loadWallet() {

    const phone = localStorage.getItem("phone");

    if (!phone) {

        console.log("No logged-in phone.");

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" +
            encodeURIComponent(phone)
        );

        const data = await response.json();

        console.log("PRIVATE WALLET:", data);

        if (!data.success) {

            console.log(data.message);

            return;
        }

        const balance =
            Number(data.balance || 0);

        const balanceElement =
            document.getElementById("balance");

        if (balanceElement) {

            balanceElement.textContent =
                balance.toLocaleString() + " ETB";

        }

    } catch (error) {

        console.error(
            "Private wallet error:",
            error
        );

    }

}


// ======================================
// LOAD WHEN PAGE OPENS
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    loadWallet
);


// ======================================
// AUTOMATICALLY UPDATE BALANCE
// ======================================

setInterval(
    loadWallet,
    3000
);