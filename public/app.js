// ======================================
// LOAD USER WALLET BALANCE
// ======================================

async function loadWallet() {

    const phone =
        localStorage.getItem("phone");

    console.log(
        "LOGIN PHONE:",
        phone
    );

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

        const data =
            await response.json();

        console.log(
            "WALLET RESPONSE:",
            data
        );

        if (data.success) {

            const balance =
                Number(data.balance || 0);

            document.getElementById("balance").innerText =
                balance.toLocaleString() +
                " ETB";

        } else {

            document.getElementById("balance").innerText =
                "0 ETB";

            console.log(
                "Wallet error:",
                data.message
            );

        }

    } catch (error) {

        console.error(
            "Wallet loading error:",
            error
        );

        document.getElementById("balance").innerText =
            "0 ETB";

    }

}


// ======================================
// SUBMIT DEPOSIT
// ======================================

async function deposit() {

    const phone =
        localStorage.getItem("phone");

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
        document.getElementById("txid").value.trim();


    // Minimum

    if (amount < 5000) {

        document.getElementById("message").innerText =
            "Minimum deposit is 5000 ETB.";

        return;

    }


    // Maximum

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

        const response =
            await fetch("/deposit", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    phone: phone,

                    amount: amount,

                    txid: txid

                })

            });


        const data =
            await response.json();


        document.getElementById("message").innerText =
            data.message;


        if (data.success) {

            document.getElementById("amount").value =
                "";

            document.getElementById("txid").value =
                "";

            // Refresh wallet
            loadWallet();

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
// LOAD WALLET WHEN PAGE OPENS
// ======================================

loadWallet();


// ======================================
// REFRESH BALANCE EVERY 5 SECONDS
// ======================================

setInterval(
    loadWallet,
    5000
);