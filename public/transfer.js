const receiver = document.getElementById("receiver");
const amount = document.getElementById("amount");
const transferBtn = document.getElementById("transferBtn");
const message = document.getElementById("message");

transferBtn.addEventListener("click", async () => {

    const sender = localStorage.getItem("phone");

    if (!sender) {

        message.style.color = "red";
        message.textContent = "Please login first.";

        return;

    }

    if (receiver.value.trim() === "") {

        message.style.color = "red";
        message.textContent = "Enter receiver phone number.";

        return;

    }

    if (Number(amount.value) <= 0) {

        message.style.color = "red";
        message.textContent = "Enter a valid amount.";

        return;

    }

    try {

        const response = await fetch("/transfer", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                sender,

                receiver: receiver.value,

                amount: Number(amount.value)

            })

        });

        const data = await response.json();

        if (data.success) {

            message.style.color = "green";

            message.textContent = data.message;

            receiver.value = "";

            amount.value = "";

        } else {

            message.style.color = "red";

            message.textContent = data.message;

        }

    } catch (err) {

        message.style.color = "red";

        message.textContent = "Server error.";

    }

});