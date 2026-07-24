const express = require("express");
const router = express.Router();

const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");

function generateReferralCode() {

    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

}

router.post("/login", async (req, res) => {

    try {

        const { phone, referralCode } = req.body;

        if (!phone) {

            return res.json({

                success: false,

                message: "Phone number is required."

            });

        }

        let user = await User.findOne({

            phone

        });

        if (!user) {

            let myReferralCode = generateReferralCode();

            while (await User.findOne({ referralCode: myReferralCode })) {

                myReferralCode = generateReferralCode();

            }

            user = new User({

                phone,

                balance: 0,

                referralCode: myReferralCode,

                referredBy: referralCode || ""

            });

            await user.save();

        } const activity = new LoginActivity({

    phone: user.phone,

    ip: req.ip,

    browser: req.headers["user-agent"],

    status: "Success"

});

await activity.save();

        res.json({

            success: true,

            user

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            message: err.message

        });

    }

});
// ======================================
// DEPOSIT HISTORY
// ======================================

router.get("/deposit-history/:phone", async (req, res) => {

    try {

        const deposits = await Deposit.find({

            phone: req.params.phone

        }).sort({

            createdAt: -1

        });

        res.json(deposits);

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;