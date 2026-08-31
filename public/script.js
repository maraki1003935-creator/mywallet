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


            const response = await fetch(
                "/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        phone: phone
                    })
                }
            );


            const data =
                await response.json();


            console.log(
                "LOGIN RESPONSE:",
                data
            );


            // --------------------------------------
            // LOGIN SUCCESS
            // --------------------------------------

            if (data.success) {


                // ==================================
                // SAVE EXACT PHONE NUMBER
                // ==================================

                const loggedInPhone =
                    phone.trim();


                // ----------------------------------
                // LOCAL STORAGE
                // ----------------------------------

                localStorage.setItem(
                    "phone",
                    loggedInPhone
                );

                localStorage.setItem(
                    "userPhone",
                    loggedInPhone
                );


                // ----------------------------------
                // SESSION STORAGE
                // ----------------------------------

                sessionStorage.setItem(
                    "phone",
                    loggedInPhone
                );

                sessionStorage.setItem(
                    "userPhone",
                    loggedInPhone
                );


                // ----------------------------------
                // SAVE USER OBJECT
                // ----------------------------------

                let savedUser = {
                    phone: loggedInPhone
                };


                if (data.user) {

                    savedUser = {
                        ...data.user,
                        phone: loggedInPhone
                    };

                }


                localStorage.setItem(
                    "user",
                    JSON.stringify(savedUser)
                );


                // ----------------------------------
                // SAVE USER ID
                // ----------------------------------

                if (
                    data.user &&
                    data.user._id
                ) {

                    localStorage.setItem(
                        "userId",
                        data.user._id
                    );

                }


                // ==================================
                // VERIFY PHONE WAS SAVED
                // ==================================

                console.log(
                    "================================"
                );

                console.log(
                    "LOGIN SUCCESS"
                );

                console.log(
                    "PHONE SAVED:",
                    loggedInPhone
                );

                console.log(
                    "localStorage phone:",
                    localStorage.getItem("phone")
                );

                console.log(
                    "localStorage userPhone:",
                    localStorage.getItem("userPhone")
                );

                console.log(
                    "sessionStorage phone:",
                    sessionStorage.getItem("phone")
                );

                console.log(
                    "SAVED USER:",
                    localStorage.getItem("user")
                );

                console.log(
                    "================================"
                );


                // --------------------------------------
                // SUCCESS MESSAGE
                // --------------------------------------

                message.style.color =
                    "green";

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

                // --------------------------------------
                // LOGIN FAILED
                // --------------------------------------

                message.style.color =
                    "red";

                message.textContent =
                    data.message ||
                    "Login failed.";

            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            message.style.color =
                "red";

            message.textContent =
                "Server error. Please try again.";

        }

    });

}


// ======================================
// CHECK SAVED PHONE WHEN PAGE OPENS
// ======================================

console.log(
    "================================"
);

console.log(
    "CHECKING SAVED LOGIN"
);

console.log(
    "Phone:",
    localStorage.getItem("phone")
);

console.log(
    "User phone:",
    localStorage.getItem("userPhone")
);

console.log(
    "Session phone:",
    sessionStorage.getItem("phone")
);

console.log(
    "User:",
    localStorage.getItem("user")
);

console.log(
    "================================"
);


// ======================================
// OPTIONAL LOGOUT FUNCTION
// ======================================

function logout() {

    localStorage.removeItem("phone");

    localStorage.removeItem("userPhone");

    localStorage.removeItem("userId");

    localStorage.removeItem("user");

    sessionStorage.removeItem("phone");

    sessionStorage.removeItem("userPhone");


    window.location.href =
        "/index.html";

}


window.logout = logout;