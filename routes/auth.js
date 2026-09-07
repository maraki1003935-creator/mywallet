const express = require("express");
const router = express.Router();

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
// LOGIN / CREATE USER
// ======================================================

router.post("/login", async (req, res) => {

    try {

        const phone =
            req.body.phone
                ? String(req.body.phone).trim()
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

            let myReferralCode =
                generateReferralCode();


            // ==================================================
            // MAKE SURE REFERRAL CODE IS UNIQUE
            // ==================================================

            while (
                await User.findOne({
                    referralCode:
                        myReferralCode
                })
            ) {

                myReferralCode =
                    generateReferralCode();

            }


            // ==================================================
            // VERIFY REFERRAL CODE
            // ==================================================

            let validReferralCode = "";

            if (referralCode) {

                const referrer =
                    await User.findOne({
                        referralCode:
                            referralCode
                    });


                if (referrer) {

                    // ==========================================
                    // PREVENT SELF REFERRAL
                    // ==========================================

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


            // ==================================================
            // CREATE USER
            // ==================================================

            user = new User({

                phone: phone,

                name: "New User",

                balance: 0,

                referralCode:
                    myReferralCode,

                referredBy:
                    validReferralCode,

                referralEarnings: 0,

                invitedUsers: 0,

                referralPaid: false,

                totalEarnings: 0,

                status: "Active"

            });


            // ==================================================
            // SAVE USER
            // ==================================================

            await user.save();


            // ==================================================
            // SHOW NEW USER INFORMATION
            // ==================================================

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


            // ==================================================
            // ADD REFERRAL TO OLD EXISTING USER
            // ==================================================
            //
            // This is important.
            //
            // If the user was created before the referral
            // system was added, referredBy may be empty.
            //
            // If they now login using:
            //
            // ?ref=ABC123
            //
            // we can attach ABC123 to their account.
            //
            // ==================================================

            if (
                !user.referredBy &&
                referralCode
            ) {

                // ==============================================
                // FIND REFERRER
                // ==============================================

                const referrer =
                    await User.findOne({
                        referralCode:
                            referralCode
                    });


                if (referrer) {

                    // ==========================================
                    // PREVENT SELF REFERRAL
                    // ==========================================

                    if (
                        String(referrer.phone) ===
                        String(user.phone)
                    ) {

                        console.log(
                            "SELF REFERRAL BLOCKED FOR EXISTING USER"
                        );

                    } else {

                        // ======================================
                        // SAVE REFERRER
                        // ======================================

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


            // ==================================================
            // SHOW FINAL USER INFORMATION
            // ==================================================

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
                    req.headers["user-agent"],

                status:
                    "Success"

            });


        await activity.save();


        // ======================================================
        // SEND USER DATA TO FRONTEND
        // ======================================================

        res.json({

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


        res.status(500).json({

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


            res.json({

                success: true,

                deposits:
                    deposits

            });


        } catch (err) {

            console.error(
                "DEPOSIT HISTORY ERROR:",
                err
            );


            res.status(500).json({

                success: false,

                message:
                    err.message

            });

        }

    }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;