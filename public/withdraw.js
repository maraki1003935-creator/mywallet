const form = document.getElementById("withdrawForm");
const phone = document.getElementById("phone");
const telebirr = document.getElementById("telebirr");
const amount = document.getElementById("amount");
const message = document.getElementById("message");

phone.value = localStorage.getItem("phone") || "";

function generateWithdrawCode() {

    return "WD-" + Math.floor(100000 + Math.random() * 900000);

}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (phone.value === "") {

        message.style.color = "red";
        message.textContent = "Please login first.";
        return;

    }

    if (telebirr.value.trim() === "") {

        message.style.color = "red";
        message.textContent = "Enter your Telebirr number.";
        return;

    }

    if (Number(amount.value) < 10000) {

        message.style.color = "red";
        message.textContent = "Minimum withdrawal is 10,000 ETB.";
        return;

    }

    if (Number(amount.value) > 400000) {

        message.style.color = "red";
        message.textContent = "Maximum withdrawal is 400,000 ETB.";
        return;

    }

    const withdrawCode = generateWithdrawCode();

    try {

        const response = await fetch("/withdraw", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                phone: phone.value,

                telebirr: telebirr.value,

                amount: amount.value,

                withdrawCode: withdrawCode

            })

        });

        const data = await response.json();

        if (data.success) {

            message.style.color = "green";

            message.innerHTML =
            "Withdrawal request submitted.<br><br>" +
            "Your Withdrawal Code:<br><b>" +
            withdrawCode +
            "</b>";

            form.reset();

            phone.value = localStorage.getItem("phone");

        } else {

            message.style.color = "red";
            message.textContent = data.message;

        }

    } catch (err) {

        message.style.color = "red";
        message.textContent = "Server error.";

    }

});