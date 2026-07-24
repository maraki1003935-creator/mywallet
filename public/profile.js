const phone = localStorage.getItem("phone");

if (!phone) {

    window.location.href = "index.html";

}

async function loadProfile() {

    try {

        const res = await fetch("/profile/" + phone);

        const data = await res.json();

        if (!data.success) {

            return;

        }

        document.getElementById("name").value = data.profile.name || "";

        document.getElementById("email").value = data.profile.email || "";

        document.getElementById("phone").value = data.profile.phone || phone;

        document.getElementById("photo").src =
            "/uploads/" + (data.profile.photo || "default.png");

    } catch (err) {

        console.log(err);

    }

}

async function saveProfile() {

    const formData = new FormData();

    formData.append("phone", phone);

    formData.append("name", document.getElementById("name").value);

    formData.append("email", document.getElementById("email").value);

    formData.append("currentPassword", document.getElementById("currentPassword").value);

formData.append("newPassword", document.getElementById("newPassword").value);

formData.append("confirmPassword", document.getElementById("confirmPassword").value);

    const image = document.getElementById("image").files[0];

    if (image) {

        formData.append("photo", image);

    }

    const res = await fetch("/profile", {

        method: "POST",

        body: formData

    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {

        loadProfile();

        document.getElementById("password").value = "";

    }

}

loadProfile();