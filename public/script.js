const sendBtn = document.getElementById("sendBtn");
const phoneInput = document.getElementById("phone");
const message = document.getElementById("message");

sendBtn.addEventListener("click", async () => {

    const phone = phoneInput.value.trim();

    if (phone === "") {

        message.style.color = "red";
        message.textContent = "Please enter your phone number.";
        return;

    }

    try {

        const response = await fetch("/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                phone: phone
            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("phone", phone);

            window.location.href = "/dashboard.html";

        } else {

            message.style.color = "red";
            message.textContent = data.message || "Login failed.";

        }

    } catch (err) {

        message.style.color = "red";
        message.textContent = "Server error.";

    }

});