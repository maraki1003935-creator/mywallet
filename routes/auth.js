const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const Deposit = require("../models/Deposit");


// ======================================================
// GENERATE UNIQUE REFERRAL CODE
// ======================================================

function generateReferralCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}


// ======================================================
// CHECK STRONG PASSWORD
// ======================================================

function isStrongPassword(password) {

    if (!password) {
        return false;
    }

    // At least:
    // 8 characters
    // 1 uppercase letter
    // 1 lowercase letter
    // 1 number
    // 1 special character

    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );

}


// ======================================================
// LOGIN / CREATE USER
// ======================================================

router.post("/login", async (req, res) => {

    try {

        const phone =
            req.body.phone
                ? String(req.body.phone).trim()
                : "";

        const password =
            req.body.password
                ? String(req.body.password)
                : "";

        const referralCode =
            req.body.referralCode
                ? String(req.body.referralCode)
                    .trim()
                    .toUpperCase()
                : "";


        // ==================================================
        // CHECK PHONE
        // ==================================================

        if (!phone) {

            return res.status(400).json({

                success: false,

                message:
                    "Phone number is required."

            });

        }


        // ==================================================
        // CHECK PASSWORD
        // ==================================================

        if (!password) {

            return res.status(400).json({

                success: false,

                message:
                    "Password is required."

            });

        }


        // ==================================================
        // FIND EXISTING USER
        // ==================================================

        let user =
            await User.findOne({
                phone: phone
            });


        // ==================================================
        // CREATE NEW USER
        // ==================================================

        if (!user) {


            // ==============================================
            // NEW USER PASSWORD MUST BE STRONG
            // ==============================================

            if (!isStrongPassword(password)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number, and special character."

                });

            }


            // ==============================================
            // GENERATE UNIQUE REFERRAL CODE
            // ==============================================

            let myReferralCode =
                generateReferralCode();


            // ==============================================
            // MAKE SURE REFERRAL CODE IS UNIQUE
            // ==============================================

            while (
                await User.findOne({
                    referralCode:
                        myReferralCode
                })
            ) {

                myReferralCode =
                    generateReferralCode();

            }


            // ==============================================
            // VERIFY REFERRAL CODE
            // ==============================================

            let validReferralCode = "";


            if (referralCode) {

                const referrer =
                    await User.findOne({
                        referralCode:
                            referralCode
                    });


                if (referrer) {


                    // ======================================
                    // PREVENT SELF REFERRAL
                    // ======================================

                    if (
                        String(referrer.phone) ===
                        String(phone)
                    ) {

                        console.log(
                            "SELF REFERRAL BLOCKED:",
                            phone
                        );

                    } else {

                        validReferralCode =
                            referrer.referralCode;


                        console.log(
                            "================================"
                        );

                        console.log(
                            "VALID REFERRER FOUND"
                        );

                        console.log(
                            "REFERRER PHONE:",
                            referrer.phone
                        );

                        console.log(
                            "REFERRER CODE:",
                            referrer.referralCode
                        );

                        console.log(
                            "NEW USER PHONE:",
                            phone
                        );

                        console.log(
                            "================================"
                        );

                    }

                } else {

                    console.log(
                        "INVALID REFERRAL CODE:",
                        referralCode
                    );

                }

            }


            // ==============================================
            // HASH PASSWORD
            // ==============================================

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            // ==============================================
            // CREATE USER
            // ==============================================

            user = new User({

                phone: phone,

                password:
                    hashedPassword,

                name:
                    "New User",

                balance:
                    0,

                referralCode:
                    myReferralCode,

                referredBy:
                    validReferralCode,

                referralEarnings:
                    0,

                invitedUsers:
                    0,

                referralPaid:
                    false,

                totalEarnings:
                    0,

                status:
                    "Active"

            });


            // ==============================================
            // SAVE USER
            // ==============================================

            await user.save();


            // ==============================================
            // SHOW NEW USER INFORMATION
            // ==============================================

            console.log(
                "================================"
            );

            console.log(
                "NEW USER CREATED"
            );

            console.log(
                "PHONE:",
                user.phone
            );

            console.log(
                "OWN REFERRAL CODE:",
                user.referralCode
            );

            console.log(
                "REFERRED BY:",
                user.referredBy || "NONE"
            );

            console.log(
                "================================"
            );


        } else {


            // ==================================================
            // EXISTING USER
            // ==================================================

            console.log(
                "================================"
            );

            console.log(
                "EXISTING USER LOGIN:",
                user.phone
            );

            console.log(
                "OWN REFERRAL CODE:",
                user.referralCode
            );

            console.log(
                "REFERRED BY BEFORE:",
                user.referredBy || "NONE"
            );

            console.log(
                "REFERRAL CODE RECEIVED:",
                referralCode || "NONE"
            );


            // ==============================================
            // OLD USER WITHOUT PASSWORD
            // ==============================================

            if (!user.password) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This account does not have a password yet. Please create or reset your password."

                });

            }


            // ==============================================
            // CHECK PASSWORD
            // ==============================================

            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordCorrect) {

                // ==========================================
                // RECORD FAILED LOGIN
                // ==========================================

                const failedActivity =
                    new LoginActivity({

                        phone:
                            user.phone,

                        ip:
                            req.ip,

                        browser:
                            req.headers[
                                "user-agent"
                            ],

                        status:
                            "Failed"

                    });


                await failedActivity.save();


                return res.status(401).json({

                    success: false,

                    message:
                        "Incorrect password."

                });

            }


            // ==============================================
            // ADD REFERRAL TO OLD EXISTING USER
            // ==============================================

            if (
                !user.referredBy &&
                referralCode
            ) {

                // ==========================================
                // FIND REFERRER
                // ==========================================

                const referrer =
                    await User.findOne({

                        referralCode:
                            referralCode

                    });


                if (referrer) {


                    // ======================================
                    // PREVENT SELF REFERRAL
                    // ======================================

                    if (
                        String(referrer.phone) ===
                        String(user.phone)
                    ) {

                        console.log(
                            "SELF REFERRAL BLOCKED FOR EXISTING USER"
                        );

                    } else {


                        // ==================================
                        // SAVE REFERRER
                        // ==================================

                        user.referredBy =
                            referrer.referralCode;


                        await user.save();


                        console.log(
                            "================================"
                        );

                        console.log(
                            "REFERRAL ADDED TO EXISTING USER"
                        );

                        console.log(
                            "USER PHONE:",
                            user.phone
                        );

                        console.log(
                            "REFERRED BY:",
                            user.referredBy
                        );

                        console.log(
                            "REFERRER PHONE:",
                            referrer.phone
                        );

                        console.log(
                            "================================"
                        );

                    }

                } else {

                    console.log(
                        "INVALID REFERRAL CODE FOR EXISTING USER:",
                        referralCode
                    );

                }

            }


            // ==============================================
            // SHOW FINAL USER INFORMATION
            // ==============================================

            console.log(
                "REFERRED BY AFTER:",
                user.referredBy || "NONE"
            );

            console.log(
                "================================"
            );

        }


        // ======================================================
        // LOGIN ACTIVITY
        // ======================================================

        const activity =
            new LoginActivity({

                phone:
                    user.phone,

                ip:
                    req.ip,

                browser:
                    req.headers[
                        "user-agent"
                    ],

                status:
                    "Success"

            });


        await activity.save();


        // ======================================================
        // SEND USER DATA TO FRONTEND
        // ======================================================

        return res.json({

            success: true,

            message:
                "Login successful.",

            user: {

                _id:
                    user._id,

                phone:
                    user.phone,

                name:
                    user.name,

                balance:
                    Number(
                        user.balance || 0
                    ),

                referralCode:
                    user.referralCode,

                referredBy:
                    user.referredBy || "",

                referralEarnings:
                    Number(
                        user.referralEarnings || 0
                    ),

                invitedUsers:
                    Number(
                        user.invitedUsers || 0
                    ),

                referralPaid:
                    Boolean(
                        user.referralPaid
                    ),

                totalEarnings:
                    Number(
                        user.totalEarnings || 0
                    ),

                status:
                    user.status

            }

        });


    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );


        return res.status(500).json({

            success: false,

            message:
                err.message ||
                "Server error."

        });

    }

});


// ======================================================
// DEPOSIT HISTORY
// ======================================================

router.get(
    "/deposit-history/:phone",
    async (req, res) => {

        try {

            const phone =
                String(
                    req.params.phone
                ).trim();


            const deposits =
                await Deposit.find({

                    phone:
                        phone

                }).sort({

                    createdAt:
                        -1

                });


            return res.json({

                success: true,

                deposits:
                    deposits

            });


        } catch (err) {

            console.error(
                "DEPOSIT HISTORY ERROR:",
                err
            );


            return res.status(500).json({

                success: false,

                message:
                    err.message,

                deposits:
                    []

            });

        }

    }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;