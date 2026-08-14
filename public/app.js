async function loadWallet() {

    const phone = localStorage.getItem("phone");

    console.log("LOADING WALLET FOR:", phone);

    if (!phone) {

        document.getElementById("balance").innerText =
            "0 ETB";

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" +
            encodeURIComponent(phone)
        );

        const data = await response.json();

        console.log("WALLET RESPONSE:", data);

        if (data.success) {

            document.getElementById("balance").innerText =
                Number(data.balance || 0).toLocaleString() +
                " ETB";

        } else {

            document.getElementById("balance").innerText =
                "0 ETB";

            console.log(data.message);
        }

    } catch (error) {

        console.error("Wallet error:", error);

    }
}

loadWallet();

setInterval(loadWallet, 5000);