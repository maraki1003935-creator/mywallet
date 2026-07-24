const form = document.getElementById("depositForm");
const phone = document.getElementById("phone");
const amount = document.getElementById("amount");
const screenshot = document.getElementById("screenshot");
const message = document.getElementById("message");

// Load logged-in user's phone
phone.value = localStorage.getItem("phone") || "";

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (phone.value === "") {

        message.style.color = "red";
        message.textContent = "Please login first.";
        return;

    }

    if (Number(amount.value) < 5000) {

        message.style.color = "red";
        message.textContent = "Minimum deposit is 5000 ETB.";
        return;

    }

    if (Number(amount.value) > 300000) {

        message.style.color = "red";
        message.textContent = "Maximum deposit is 300000 ETB.";
        return;

    }

    if (screenshot.files.length === 0) {

        message.style.color = "red";
        message.textContent = "Please upload your payment screenshot.";
        return;

    }

    const formData = new FormData();

    formData.append("phone", phone.value);
    formData.append("amount", amount.value);
    formData.append("screenshot", screenshot.files[0]);

    try {

        const response = await fetch("/deposit", {

            method: "POST",
            body: formData

        });

        const data = await response.json();

        if (data.success) {

            message.style.color = "green";
            message.textContent =
                "Deposit request submitted successfully. Please wait for admin approval.";

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