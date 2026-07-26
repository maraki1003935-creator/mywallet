const form = document.getElementById("depositForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const amount = document.getElementById("amount").value;
    const screenshot = document.getElementById("screenshot").files[0];

    if (!phone) {
        alert("Enter your phone number.");
        return;
    }

    if (Number(amount) < 5000) {
        alert("Minimum deposit is 5000 ETB.");
        return;
    }

    if (Number(amount) > 300000) {
        alert("Maximum deposit is 300000 ETB.");
        return;
    }

    if (!screenshot) {
        alert("Please upload the payment screenshot.");
        return;
    }

    const formData = new FormData();

    formData.append("phone", phone);
    formData.append("amount", amount);
    formData.append("screenshot", screenshot);

    try {

        const res = await fetch("/deposit", {

            method: "POST",

            body: formData

        });

        const data = await res.json();

        if (data.success) {

            alert(data.message);

            form.reset();

        } else {

            alert(data.message);

        }

    } catch (err) {

        console.log(err);

        alert("Server Error");

    }

});