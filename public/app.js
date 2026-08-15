async function loadWallet() {

    const phone = localStorage.getItem("phone");

    console.log("=================================");
    console.log("LOADING PRIVATE WALLET");
    console.log("PHONE:", phone);

    if (!phone) {

        console.log("NO PHONE IN LOCAL STORAGE");

        const balanceElement =
            document.getElementById("balance");

        if (balanceElement) {
            balanceElement.innerText = "0 ETB";
        }

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" + encodeURIComponent(phone),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const data = await response.json();

        console.log("WALLET SERVER RESPONSE:", data);

        const balanceElement =
            document.getElementById("balance");

        if (!balanceElement) {

            console.log(
                "ERROR: Element with id='balance' not found."
            );

            return;
        }

        if (data.success) {

            const balance =
                Number(data.balance || 0);

            balanceElement.innerText =
                balance.toLocaleString() + " ETB";

            console.log(
                "PRIVATE WALLET BALANCE:",
                balance
            );

        } else {

            balanceElement.innerText = "0 ETB";

            console.log(
                "WALLET ERROR:",
                data.message
            );

        }

    } catch (error) {

        console.error(
            "PRIVATE WALLET FETCH ERROR:",
            error
        );

    }

    console.log("=================================");

}