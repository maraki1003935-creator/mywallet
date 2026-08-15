// ======================================
// PHONE LOGIN
// ======================================

const sendBtn = document.getElementById("sendBtn");
const phoneInput = document.getElementById("phone");
const message = document.getElementById("message");


// ======================================
// CONTINUE / LOGIN
// ======================================

if (sendBtn) {

    sendBtn.addEventListener("click", async () => {

        const phone = phoneInput.value.trim();

        // --------------------------------------
        // CHECK PHONE
        // --------------------------------------

        if (!phone) {

            message.style.color = "red";

            message.textContent =
                "Please enter your phone number.";

            return;
        }


        // --------------------------------------
        // SEND LOGIN REQUEST
        // --------------------------------------

        try {

            message.style.color = "black";

            message.textContent =
                "Please wait...";


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


            console.log("LOGIN RESPONSE:", data);


            // --------------------------------------
            // LOGIN SUCCESS
            // --------------------------------------

            if (data.success) {

                // IMPORTANT:
                // Save the EXACT phone number.
                // The private wallet uses this.

                localStorage.setItem(
                    "phone",
                    phone
                );


                // Also save user ID if your website
                // uses it somewhere else.

                if (data.user && data.user._id) {

                    localStorage.setItem(
                        "userId",
                        data.user._id
                    );

                }


                console.log(
                    "LOGIN PHONE SAVED:",
                    localStorage.getItem("phone")
                );


                message.style.color = "green";

                message.textContent =
                    "Login successful.";


                // --------------------------------------
                // GO TO DASHBOARD
                // --------------------------------------

                setTimeout(() => {

                    window.location.href =
                        "/dashboard.html";

                }, 500);


            } else {

                message.style.color = "red";

                message.textContent =
                    data.message ||
                    "Login failed.";

            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            message.style.color = "red";

            message.textContent =
                "Server error. Please try again.";

        }

    });

}


// ======================================
// CHECK SAVED PHONE
// ======================================

console.log(
    "Saved phone:",
    localStorage.getItem("phone")
);


// ======================================
// OPTIONAL LOGOUT FUNCTION
// ======================================

function logout() {

    localStorage.removeItem("phone");

    localStorage.removeItem("userId");

    window.location.href = "/index.html";

}