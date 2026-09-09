// ======================================
// REFERRAL CODE
// SAVE REFERRAL CODE FROM URL
// ======================================

(function saveReferralCodeFromURL() {

    try {

        const params =
            new URLSearchParams(window.location.search);

        const referral =
            params.get("ref");

        if (referral) {

            const cleanReferral =
                referral
                    .trim()
                    .toUpperCase();

            if (cleanReferral) {

                localStorage.setItem(
                    "referralCode",
                    cleanReferral
                );

                console.log(
                    "================================"
                );

                console.log(
                    "REFERRAL CODE FOUND IN URL:"
                );

                console.log(
                    cleanReferral
                );

                console.log(
                    "REFERRAL CODE SAVED"
                );

                console.log(
                    "================================"
                );

            }

        }

    } catch (error) {

        console.error(
            "REFERRAL URL ERROR:",
            error
        );

    }

})();


// ======================================
// PHONE LOGIN
// ======================================

const sendBtn =
    document.getElementById("sendBtn");

const phoneInput =
    document.getElementById("phone");

const message =
    document.getElementById("message");


// ======================================
// CONTINUE / LOGIN
// ======================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        async () => {

            const phone =
                phoneInput.value.trim();


            // --------------------------------------
            // CHECK PHONE
            // --------------------------------------

            if (!phone) {

                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Please enter your phone number.";

                }

                return;
            }


            // ======================================
            // GET SAVED REFERRAL CODE
            // ======================================

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );


            const urlReferral =
                urlParams.get("ref");


            let referralCode =
                urlReferral ||
                localStorage.getItem(
                    "referralCode"
                ) ||
                "";


            referralCode =
                String(referralCode)
                    .trim()
                    .toUpperCase();


            // ======================================
            // SAVE REFERRAL CODE
            // ======================================

            if (referralCode) {

                localStorage.setItem(
                    "referralCode",
                    referralCode
                );

            }


            // ======================================
            // SHOW REFERRAL CODE IN CONSOLE
            // ======================================

            console.log(
                "================================"
            );

            console.log(
                "LOGIN PHONE:",
                phone
            );

            console.log(
                "REFERRAL CODE:",
                referralCode || "NONE"
            );

            console.log(
                "================================"
            );


            // --------------------------------------
            // SEND LOGIN REQUEST
            // --------------------------------------

            try {

                if (message) {

                    message.style.color =
                        "black";

                    message.textContent =
                        "Please wait...";

                }


                const response =
                    await fetch(
                        "/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    phone:
                                        phone,

                                    referralCode:
                                        referralCode

                                })
                        }
                    );


                // ==================================
                // CHECK HTTP RESPONSE
                // ==================================

                if (!response.ok) {

                    throw new Error(
                        "Server returned HTTP " +
                        response.status
                    );

                }


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


                    // ==================================
                    // SAVE REFERRAL CODE
                    // ==================================

                    if (referralCode) {

                        localStorage.setItem(
                            "referralCode",
                            referralCode
                        );

                    }


                    // ----------------------------------
                    // SAVE USER OBJECT
                    // ----------------------------------

                    let savedUser = {

                        phone:
                            loggedInPhone

                    };


                    if (data.user) {

                        savedUser = {

                            ...data.user,

                            phone:
                                loggedInPhone

                        };

                    }


                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            savedUser
                        )
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
                    // VERIFY EVERYTHING WAS SAVED
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
                        "REFERRAL CODE SAVED:",
                        localStorage.getItem(
                            "referralCode"
                        )
                    );

                    console.log(
                        "localStorage phone:",
                        localStorage.getItem(
                            "phone"
                        )
                    );

                    console.log(
                        "localStorage userPhone:",
                        localStorage.getItem(
                            "userPhone"
                        )
                    );

                    console.log(
                        "sessionStorage phone:",
                        sessionStorage.getItem(
                            "phone"
                        )
                    );

                    console.log(
                        "SAVED USER:",
                        localStorage.getItem(
                            "user"
                        )
                    );

                    console.log(
                        "================================"
                    );


                    // --------------------------------------
                    // SUCCESS MESSAGE
                    // --------------------------------------

                    if (message) {

                        message.style.color =
                            "green";

                        message.textContent =
                            "Login successful.";

                    }


                    // --------------------------------------
                    // GO TO DASHBOARD
                    // --------------------------------------

                    setTimeout(
                        () => {

                            window.location.href =
                                "/dashboard.html";

                        },
                        500
                    );


                } else {


                    // --------------------------------------
                    // LOGIN FAILED
                    // --------------------------------------

                    if (message) {

                        message.style.color =
                            "red";

                        message.textContent =
                            data.message ||
                            "Login failed.";

                    }

                }


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Server error. Please try again.";

                }

            }

        }
    );

}


// ======================================
// CHECK SAVED LOGIN WHEN PAGE OPENS
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
    "Referral code:",
    localStorage.getItem(
        "referralCode"
    )
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

    localStorage.removeItem(
        "phone"
    );

    localStorage.removeItem(
        "userPhone"
    );

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "user"
    );

    // ----------------------------------
    // REMOVE REFERRAL CODE TOO
    // ----------------------------------

    localStorage.removeItem(
        "referralCode"
    );


    sessionStorage.removeItem(
        "phone"
    );

    sessionStorage.removeItem(
        "userPhone"
    );


    window.location.href =
        "/index.html";

}


window.logout =
    logout;