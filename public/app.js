// ======================================
// GET USER PHONE
// ======================================

function getUserPhone() {

    const phone = localStorage.getItem("phone");

    if (!phone) {

        console.log("Phone number not found.");

        return null;
    }

    return phone;
}



// ======================================
// LOAD USER WALLET BALANCE
// ======================================

async function loadWallet() {

    const phone = getUserPhone();

    if (!phone) {

        const balanceElement =
            document.getElementById("balance");

        if (balanceElement) {

            balanceElement.innerText = "0 ETB";

        }

        return;
    }

    try {

        const response = await fetch(
            "/api/wallet/" +
            encodeURIComponent(phone)
        );

        const data = await response.json();

        console.log("Wallet response:", data);

        if (!data.success) {

            console.log(
                "Wallet error:",
                data.message
            );

            return;
        }

        const balance =
            Number(data.balance || 0);

        const balanceElement =
            document.getElementById("balance");

        if (balanceElement) {

            balanceElement.innerText =
                balance.toLocaleString() +
                " ETB";

        }

    } catch (error) {

        console.error(
            "Failed to load wallet:",
            error
        );

    }

}



// ======================================
// SUBMIT DEPOSIT
// ======================================

async function deposit() {

    const phone = getUserPhone();

    if (!phone) {

        document.getElementById("message").innerText =
            "Please login first.";

        return;
    }


    const amount =
        Number(
            document.getElementById("amount").value
        );


    const txid =
        document
            .getElementById("txid")
            .value
            .trim();


    // ==================================
    // VALIDATE AMOUNT
    // ==================================

    if (!amount || amount < 5000) {

        document.getElementById("message").innerText =
            "Minimum deposit is 5000 ETB.";

        return;
    }


    if (amount > 300000) {

        document.getElementById("message").innerText =
            "Maximum deposit is 300000 ETB.";

        return;
    }


    if (!txid) {

        document.getElementById("message").innerText =
            "Please enter your Telebirr TXID.";

        return;
    }


    try {

        const response = await fetch(
            "/deposit",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
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


        document.getElementById("message").innerText =
            data.message;


        if (data.success) {

            document.getElementById("amount").value = "";

            document.getElementById("txid").value = "";

        }

    } catch (error) {

        console.error(
            "Deposit error:",
            error
        );

        document.getElementById("message").innerText =
            "Unable to submit deposit.";

    }

}



// ======================================
// INITIAL LOAD
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadWallet();

    }
);



// ======================================
// AUTOMATIC BALANCE REFRESH
// ======================================

setInterval(
    loadWallet,
    10000
);