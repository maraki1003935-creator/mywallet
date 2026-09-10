const Support = require("../models/Support");
const Notification = require("../models/Notification");
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

const Deposit = require("../models/Deposit");
const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

const SECRET_KEY = "mywallet_admin_secret";
function verifyAdmin(req,res,next){

const token=req.headers.authorization;

if(!token){

return res.status(401).json({

success:false,
message:"Unauthorized"

});

}

try{

jwt.verify(token.replace("Bearer ",""),SECRET_KEY);

next();

}catch(err){

return res.status(401).json({

success:false,
message:"Invalid Token"

});

}

}

// ======================================
// GET ALL DEPOSITS
// ======================================

router.get("/deposits", verifyAdmin, async (req, res) => {

    try {

        const deposits = await Deposit.find().sort({
            createdAt: -1
        });

        res.json({
            success: true,
            deposits
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
// ======================================
// REJECT DEPOSIT
// ======================================

router.post("/deposit/reject/:id", verifyAdmin, async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.json({
                success: false,
                message: "Deposit not found."
            });
        }

        deposit.status = "Rejected";

        await deposit.save();

        await Notification.create({
            phone: deposit.phone,
            title: "Deposit Rejected",
            message: "Your deposit request has been rejected."
        });

        res.json({
            success: true,
            message: "Deposit rejected successfully."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
// ======================================
// WITHDRAWAL MANAGEMENT
// ======================================

// ======================================
// GET ALL WITHDRAWAL REQUESTS
// ADMIN ONLY
// ======================================

router.get("/withdrawals", verifyAdmin, async (req, res) => {

    try {

        const withdrawals = await Withdraw
            .find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            withdrawals
        });

    } catch (err) {

        console.log("GET WITHDRAWALS ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// ======================================
// APPROVE WITHDRAWAL
// ADMIN ONLY
// ======================================

router.post(
    "/withdraw/approve/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            // ======================================
            // FIND WITHDRAWAL
            // ======================================

            const withdraw =
                await Withdraw.findById(req.params.id);

            if (!withdraw) {

                return res.status(404).json({
                    success: false,
                    message: "Withdrawal not found."
                });

            }


            // ======================================
            // PREVENT DOUBLE APPROVAL
            // ======================================

            if (
                String(withdraw.status).toLowerCase() ===
                "approved"
            ) {

                return res.json({
                    success: false,
                    message: "Withdrawal already approved."
                });

            }


            // ======================================
            // PREVENT APPROVING REJECTED WITHDRAWAL
            // ======================================

            if (
                String(withdraw.status).toLowerCase() ===
                "rejected"
            ) {

                return res.json({
                    success: false,
                    message: "Rejected withdrawal cannot be approved."
                });

            }


            // ======================================
            // VALIDATE AMOUNT
            // ======================================

            const amount = Number(withdraw.amount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid withdrawal amount."
                });

            }


            // ======================================
            // VALIDATE TELEBIRR NUMBER
            // ======================================

            const telebirr =
                String(withdraw.telebirr || "").trim();

            if (!telebirr) {

                return res.status(400).json({
                    success: false,
                    message: "Telebirr number is missing."
                });

            }


            // ======================================
            // FIND USER
            // ======================================

            const user =
                await User.findOne({
                    phone: withdraw.phone
                });

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found: " +
                        withdraw.phone
                });

            }


            // ======================================
            // CHECK USER BALANCE
            // ======================================

            // ======================================
// CALCULATE 15% VAT
// ======================================

const VAT_RATE = 0.15;

const vat =
    Math.round(
        amount * VAT_RATE * 100
    ) / 100;

const payoutAmount =
    Math.round(
        (amount - vat) * 100
    ) / 100;


// ======================================
// CHECK USER BALANCE
// ======================================

const currentBalance =
    Number(user.balance || 0);

if (currentBalance < amount) {

    return res.json({
        success: false,
        message:
            "Insufficient user balance. " +
            "Available: " +
            currentBalance +
            " ETB, requested: " +
            amount +
            " ETB."
    });

}


// ======================================
// SAVE OLD BALANCE
// ======================================

const oldBalance =
    currentBalance;


// ======================================
// DEDUCT FULL WITHDRAWAL AMOUNT
// VAT IS INCLUDED IN THIS AMOUNT
// ======================================

user.balance =
    Math.round(
        (oldBalance - amount) * 100
    ) / 100;


// ======================================
// SAVE USER
// ======================================

await user.save();


            // ======================================
            // MARK WITHDRAWAL APPROVED
            // ======================================

            withdraw.status = "Approved";

            await withdraw.save();


            // ======================================
            // CREATE WITHDRAWAL TRANSACTION
            // ======================================

            await Transaction.create({

    phone:
        user.phone,

    type:
        "Withdrawal",

    amount:
        amount,

    status:
        "Approved",

    reference:
        "WITHDRAW-" +
        String(withdraw._id)

});


            // ======================================
            // USER NOTIFICATION
            // ======================================

            await Notification.create({

                phone:
                    user.phone,

                title:
                    "Withdrawal Approved",

                message:
    "Your withdrawal request of " +
    amount +
    " ETB has been approved. " +
    "VAT (15%): " +
    vat +
    " ETB. " +
    "Amount sent to Telebirr: " +
    payoutAmount +
    " ETB."

            });


            // ======================================
            // LOG
            // ======================================

            console.log(
                "===================================="
            );

            console.log(
                "WITHDRAWAL APPROVED"
            );

            console.log(
                "USER:",
                user.phone
            );

            console.log(
                "TELEBIRR:",
                telebirr
            );

            console.log(
                "AMOUNT:",
                amount
            );

            console.log(
                "OLD BALANCE:",
                oldBalance
            );

            console.log(
                "NEW BALANCE:",
                user.balance
            );

            console.log(
                "WITHDRAW CODE:",
                withdraw.withdrawCode
            );

            console.log(
                "===================================="
            );


            // ======================================
            // RESPONSE
            // ======================================

            return res.json({

    success: true,

    message:
        "Withdrawal approved successfully.",

    withdrawalId:
        withdraw._id,

    phone:
        user.phone,

    telebirr:
        telebirr,

    requestedAmount:
        amount,

    vatRate:
        15,

    vat:
        vat,

    payoutAmount:
        payoutAmount,

    oldBalance:
        oldBalance,

    newBalance:
        Number(user.balance || 0),

        status:
        withdraw.status

});

        } catch (err) {

            console.error(
                "APPROVE WITHDRAWAL ERROR:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Server error."

            });

        }

    }

);


// ======================================
// REJECT WITHDRAWAL
// ADMIN ONLY
// ======================================

router.post(
    "/withdraw/reject/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            // ======================================
            // FIND WITHDRAWAL
            // ======================================

            const withdraw =
                await Withdraw.findById(req.params.id);

            if (!withdraw) {

                return res.status(404).json({
                    success: false,
                    message: "Withdrawal not found."
                });

            }


            // ======================================
            // PREVENT REJECTING APPROVED WITHDRAWAL
            // ======================================

            if (
                String(withdraw.status).toLowerCase() ===
                "approved"
            ) {

                return res.json({
                    success: false,
                    message:
                        "Approved withdrawal cannot be rejected."
                });

            }


            // ======================================
            // PREVENT DOUBLE REJECTION
            // ======================================

            if (
                String(withdraw.status).toLowerCase() ===
                "rejected"
            ) {

                return res.json({
                    success: false,
                    message:
                        "Withdrawal already rejected."
                });

            }


            // ======================================
            // MARK REJECTED
            // ======================================

            withdraw.status = "Rejected";

            await withdraw.save();


            // ======================================
            // USER NOTIFICATION
            // ======================================

            await Notification.create({

                phone:
                    withdraw.phone,

                title:
                    "Withdrawal Rejected",

                message:
                    "Your withdrawal request of " +
                    withdraw.amount +
                    " ETB has been rejected."

            });


            // ======================================
            // CREATE REJECTION TRANSACTION
            // ======================================

            await Transaction.create({

                phone:
                    withdraw.phone,

                type:
                    "Withdrawal Rejected",

                amount:
                    Number(withdraw.amount),

                status:
                    "Rejected",

                reference:
                    "WITHDRAW-REJECTED-" +
                    String(withdraw._id)

            });


            // ======================================
            // LOG
            // ======================================

            console.log(
                "===================================="
            );

            console.log(
                "WITHDRAWAL REJECTED"
            );

            console.log(
                "USER:",
                withdraw.phone
            );

            console.log(
                "TELEBIRR:",
                withdraw.telebirr
            );

            console.log(
                "AMOUNT:",
                withdraw.amount
            );

            console.log(
                "WITHDRAW CODE:",
                withdraw.withdrawCode
            );

            console.log(
                "===================================="
            );


            // ======================================
            // RESPONSE
            // ======================================

            return res.json({

                success: true,

                message:
                    "Withdrawal rejected successfully.",

                withdrawalId:
                    withdraw._id,

                phone:
                    withdraw.phone,

                telebirr:
                    withdraw.telebirr,

                amount:
                    Number(withdraw.amount),

                status:
                    withdraw.status

            });

        } catch (err) {

            console.error(
                "REJECT WITHDRAWAL ERROR:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Server error."

            });

        }

    }
);
// ======================================
// ADMIN DASHBOARD
// ======================================

router.get("/dashboard", async (req, res) => {

    try {

        const totalUsers = await User.countDocuments();

        const pendingDeposits = await Deposit.countDocuments({

            status: "Pending"

        });

        const pendingWithdrawals = await Withdraw.countDocuments({

            status: "Pending"

        });

        const totalTransactions = await Transaction.countDocuments();

        const deposits = await Deposit.find({

            status: "Approved"

        });

        let totalDeposits = 0;

        deposits.forEach(d => {

            totalDeposits += d.amount;

        });

        const withdrawals = await Withdraw.find({

            status: "Approved"

        });

        let totalWithdrawals = 0;

        withdrawals.forEach(w => {

            totalWithdrawals += w.amount;

        });

        const users = await User.find();

        let totalBalance = 0;

        let totalReferralBonus = 0;

        users.forEach(user => {

            totalBalance += user.balance;

            totalReferralBonus += user.referralEarnings;

        });

        res.json({

            success: true,

            totalUsers,

            totalDeposits,

            totalWithdrawals,

            pendingDeposits,

            pendingWithdrawals,

            totalTransactions,

            totalBalance,

            totalReferralBonus

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
// ADMIN LOGIN
// ======================================

router.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (
            username !== ADMIN_USERNAME ||
            password !== ADMIN_PASSWORD
        ) {

            return res.json({
                success: false,
                message: "Invalid username or password."
            });

        }

        const token = jwt.sign(
            {
                admin: true
            },
            SECRET_KEY,
            {
                expiresIn: "24h"
            }
        );

        res.json({
            success: true,
            token: token
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
// GET ALL USERS
// ======================================

router.get("/users",verifyAdmin,async(req,res)=>{

    try {

        const users = await User.find().sort({ createdAt: -1 });

        res.json({

            success: true,

            users

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
// ADMIN: GET USER BALANCE
// ======================================

router.get("/user/:id/balance", verifyAdmin, async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            phone: user.phone,
            balance: Number(user.balance || 0)
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
// ======================================
// ADMIN: SET USER BALANCE
// ======================================

router.post("/user/:id/set-balance", verifyAdmin, async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const newBalance = Number(req.body.balance);

        if (!Number.isFinite(newBalance) || newBalance < 0) {
            return res.json({
                success: false,
                message: "Invalid balance."
            });
        }

        const oldBalance = Number(user.balance || 0);

        user.balance = newBalance;

        await user.save();

        await Transaction.create({
            phone: user.phone,
            type: "Admin Balance Update",
            amount: newBalance - oldBalance,
            status: "Approved",
            reference: "ADMIN-BALANCE-" + Date.now()
        });

        await Notification.create({
            phone: user.phone,
            title: "Wallet Balance Updated",
            message:
                "Your wallet balance has been updated to " +
                newBalance +
                " ETB."
        });

        res.json({
            success: true,
            message: "User balance updated successfully.",
            phone: user.phone,
            oldBalance: oldBalance,
            newBalance: user.balance
        });

    } catch (err) {

        console.log("SET BALANCE ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ======================================
// BAN USER
// ======================================

router.post("/user/ban/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        user.banned = true;

        await user.save();

        res.json({

            success: true,

            message: "User banned successfully."

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
// UNBAN USER
// ======================================

router.post("/user/unban/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        user.banned = false;

        await user.save();

        res.json({

            success: true,

            message: "User unbanned successfully."

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
// GET ALL SUPPORT REQUESTS
// ======================================

router.get("/support", async (req, res) => {

    try {

        const support = await Support.find().sort({ createdAt: -1 });

        res.json({

            success: true,

            support

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
// MARK SUPPORT AS RESOLVED
// ======================================

router.post("/support/resolve/:id", async (req, res) => {

    try {

        const support = await Support.findById(req.params.id);

        if (!support) {

            return res.json({

                success: false,

                message: "Support request not found."

            });

        }

        support.status = "Resolved";

        await support.save(); const notification = new Notification({

    phone: support.phone,

    title: "Support Request",

    message: "Your support request has been resolved."

});

await notification.save();

        res.json({

            success: true,

            message: "Support request marked as resolved."

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
// UPDATE USER BALANCE
// ======================================

router.post("/user/balance/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        user.balance = Number(req.body.balance);

        await user.save();

        res.json({

            success: true,

            message: "Balance updated successfully."

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
// BLOCK / UNBLOCK USER
// ======================================

router.post("/user/block/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        user.blocked = !user.blocked;

        await user.save();

        res.json({

            success: true,

            message: user.blocked
                ? "User blocked successfully."
                : "User unblocked successfully."

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
// APPROVE DEPOSIT
// DEPOSIT + NEW USER BONUS + REFERRER BONUS
// ======================================

router.post(
    "/deposit/approve/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            // ======================================
            // FIND DEPOSIT
            // ======================================

            const deposit = await Deposit.findById(req.params.id);

            if (!deposit) {
                return res.status(404).json({
                    success: false,
                    message: "Deposit not found."
                });
            }


            // ======================================
            // PREVENT DOUBLE APPROVAL
            // ======================================

            if (
                String(deposit.status).toLowerCase() === "approved"
            ) {
                return res.json({
                    success: false,
                    message: "Deposit already approved."
                });
            }


            // ======================================
            // GET PHONE
            // ======================================

            const phone = String(deposit.phone || "").trim();

            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: "Deposit has no phone number."
                });
            }


            // ======================================
            // GET AMOUNT
            // ======================================

            const amount = Number(deposit.amount);

            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid deposit amount."
                });
            }


            // ======================================
            // FIND DEPOSITOR
            // ======================================

            const user = await User.findOne({
                phone: phone
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found: " + phone
                });
            }


            console.log("====================================");
            console.log("APPROVING DEPOSIT");
            console.log("PHONE:", user.phone);
            console.log("AMOUNT:", amount);
            console.log("USER REFERRAL CODE:", user.referralCode);
            console.log("REFERRED BY:", user.referredBy);
            console.log("====================================");


            // ======================================
            // CHECK FIRST APPROVED DEPOSIT
            // ======================================

            const previousApprovedDeposit = await Deposit.findOne({
                phone: user.phone,
                status: "Approved",
                _id: {
                    $ne: deposit._id
                }
            });


            const isFirstApprovedDeposit =
                !previousApprovedDeposit;


            console.log(
                "FIRST APPROVED DEPOSIT:",
                isFirstApprovedDeposit
            );


            // ======================================
            // SAVE OLD BALANCE
            // ======================================

            const oldUserBalance =
                Number(user.balance || 0);


            // ======================================
            // ADD ACTUAL DEPOSIT
            // ======================================

            user.balance =
                oldUserBalance + amount;


            // ======================================
            // NEW USER BONUS
            // ONLY ON FIRST APPROVED DEPOSIT
            // ======================================

            let userBonus = 0;

if (
    isFirstApprovedDeposit &&
    user.referralPaid !== true
) {

    // ======================================
    // FIRST DEPOSIT BONUS = 12%
    // ======================================

    userBonus =
        Math.round(
            Number(amount) * 0.12 * 100
        ) / 100;


    user.balance =
        Number(user.balance || 0) +
        userBonus;


    user.referralPaid = true;


    user.totalEarnings =
        Number(user.totalEarnings || 0) +
        userBonus;


    console.log(
        "NEW USER BONUS:",
        userBonus,
        "ETB"
    );
}

            // ======================================
            // SAVE DEPOSITOR
            // ======================================

            await user.save();


            console.log(
                "DEPOSITOR FINAL BALANCE:",
                user.balance
            );


            // ======================================
            // MARK DEPOSIT APPROVED
            // ======================================

            deposit.status = "Approved";

            await deposit.save();


            // ======================================
            // CREATE DEPOSIT TRANSACTION
            // ======================================

            await Transaction.create({

                phone: user.phone,

                type: "Deposit",

                amount: amount,

                status: "Approved",

                reference:
                    "DEP-" + deposit._id

            });


            // ======================================
            // CREATE NEW USER BONUS TRANSACTION
            // ======================================

            if (userBonus > 0) {

                await Transaction.create({

                    phone: user.phone,

                    type: "Deposit Bonus",

                    amount: userBonus,

                    status: "Approved",

                    reference:
                        "NEW-BONUS-" + deposit._id

                });
            }


            // ======================================
            // REFERRER BONUS
            //
            // B joins using A referral code
            // B first approved deposit
            // A receives +600
            //
            // C first approved deposit
            // A receives another +600
            //
            // D first approved deposit
            // A receives another +600
            //
            // IMPORTANT:
            // This is based on B/C/D's first deposit.
            // It is NOT based on A's referralPaid.
            // ======================================

            // ======================================
// ======================================
// REFERRER BONUS
// ======================================
//
// RULE:
//
// A refers B
// A refers C
// A refers D
//
// Every different referred user gets ONE referral bonus
// on their FIRST approved deposit.
//
// Referral bonus = 12% of that referred user's
// FIRST approved deposit.
//
// Example:
//
// B first deposit = 50,000
// B gets 50,000 + 6,000
// A gets 6,000
//
// C first deposit = 20,000
// C gets 20,000 + 2,400
// A gets 2,400
//
// D first deposit = 5,000
// D gets 5,000 + 600
// A gets 600
//
// B's second deposit = NO referral bonus to A.
// C's second deposit = NO referral bonus to A.
// D's second deposit = NO referral bonus to A.
//
// A can therefore earn from B + C + D + more users.
// ======================================

let referrerBonus = 0;
let referrer = null;


if (
    isFirstApprovedDeposit &&
    user.referredBy &&
    String(user.referredBy).trim() !== ""
) {

    const referralCode =
        String(user.referredBy)
            .trim()
            .toUpperCase();


    console.log(
        "===================================="
    );

    console.log(
        "CHECKING REFERRAL"
    );

    console.log(
        "INVITED USER:",
        user.phone
    );

    console.log(
        "REFERRED BY CODE:",
        referralCode
    );


    // ======================================
    // FIND REFERRER
    // ======================================

    referrer =
        await User.findOne({
            referralCode: referralCode
        });


    if (!referrer) {

        console.log(
            "REFERRER NOT FOUND:",
            referralCode
        );

    } else {

        console.log(
            "REFERRER FOUND:",
            referrer.phone
        );


        // ======================================
        // PREVENT SELF REFERRAL
        // ======================================

        if (
            String(referrer.phone).trim() ===
            String(user.phone).trim()
        ) {

            console.log(
                "SELF REFERRAL BLOCKED."
            );

            referrer = null;

        } else {


            // ======================================
            // CHECK IF THIS SPECIFIC USER
            // ALREADY GENERATED A REFERRAL BONUS
            // ======================================

            const previousReferralBonus =
                await Transaction.findOne({

                    phone:
                        referrer.phone,

                    type:
                        "Referral Bonus",

                    reference: {
                        $regex:
                            "^REFERRAL-" +
                            String(user._id) +
                            "-"
                    }

                });


            if (previousReferralBonus) {

                console.log(
                    "REFERRAL BONUS ALREADY PAID FOR THIS USER."
                );

                console.log(
                    "INVITED USER:",
                    user.phone
                );

                console.log(
                    "REFERRER:",
                    referrer.phone
                );


            } else {


                // ======================================
                // REFERRAL BONUS
                // ======================================
                //
                // IMPORTANT:
                //
                // Uses the invited user's FIRST
                // approved deposit amount.
                //
                // 12% of first deposit.
                //
                // ======================================

                const referralBonus =
                    Math.round(
                        Number(amount) * 0.12 * 100
                    ) / 100;


                referrerBonus =
                    referralBonus;


                console.log(
                    "===================================="
                );

                console.log(
                    "REFERRAL BONUS CALCULATION"
                );

                console.log(
                    "INVITED USER:",
                    user.phone
                );

                console.log(
                    "FIRST DEPOSIT:",
                    amount
                );

                console.log(
                    "12% BONUS:",
                    referralBonus
                );

                console.log(
                    "REFERRER:",
                    referrer.phone
                );

                console.log(
                    "===================================="
                );


                // ======================================
                // ADD BONUS TO REFERRER WALLET
                // ======================================

                const oldReferrerBalance =
                    Number(
                        referrer.balance || 0
                    );


                referrer.balance =
                    oldReferrerBalance +
                    referralBonus;


                // ======================================
                // UPDATE REFERRAL EARNINGS
                // ======================================

                referrer.referralEarnings =
                    Number(
                        referrer.referralEarnings || 0
                    ) +
                    referralBonus;


                // ======================================
                // UPDATE TOTAL EARNINGS
                // ======================================

                referrer.totalEarnings =
                    Number(
                        referrer.totalEarnings || 0
                    ) +
                    referralBonus;


                // ======================================
                // COUNT THIS INVITED USER
                // ======================================

                referrer.invitedUsers =
                    Number(
                        referrer.invitedUsers || 0
                    ) +
                    1;


                // ======================================
                // SAVE REFERRER
                // ======================================

                await referrer.save();


                // ======================================
                // CREATE REFERRAL TRANSACTION
                // ======================================

                await Transaction.create({

                    phone:
                        referrer.phone,

                    type:
                        "Referral Bonus",

                    amount:
                        referralBonus,

                    status:
                        "Approved",

                    reference:
                        "REFERRAL-" +
                        String(user._id) +
                        "-" +
                        String(deposit._id)

                });


                // ======================================
                // REFERRER NOTIFICATION
                // ======================================

                await Notification.create({

                    phone:
                        referrer.phone,

                    title:
                        "Referral Bonus",

                    message:
                        "You received " +
                        referralBonus +
                        " ETB referral bonus from your invited user's first approved deposit."

                });


                // ======================================
                // LOG
                // ======================================

                console.log(
                    "===================================="
                );

                console.log(
                    "REFERRAL BONUS PAID"
                );

                console.log(
                    "REFERRER:",
                    referrer.phone
                );

                console.log(
                    "INVITED USER:",
                    user.phone
                );

                console.log(
                    "FIRST DEPOSIT:",
                    amount
                );

                console.log(
                    "BONUS 12%:",
                    referralBonus
                );

                console.log(
                    "REFERRER NEW BALANCE:",
                    referrer.balance
                );

                console.log(
                    "===================================="
                );

            }

        }

    }

}        
            // ======================================
            // DEPOSITOR NOTIFICATION
            // ======================================

            let userMessage =
                amount +
                " ETB deposit was added to your wallet.";


            if (userBonus > 0) {

    userMessage +=
        " You received " +
        userBonus +
        " ETB first-deposit bonus.";

}


            await Notification.create({

                phone: user.phone,

                title: "Deposit Approved",

                message: userMessage

            });


            // ======================================
            // FINAL USER
            // ======================================

            const finalUser =
                await User.findOne({
                    phone: user.phone
                });


            console.log("====================================");
            console.log("DEPOSIT APPROVED");
            console.log("USER:", finalUser.phone);
            console.log(
                "DEPOSIT:",
                amount
            );
            console.log(
                "NEW USER BONUS:",
                userBonus
            );
            console.log(
                "REFERRER BONUS:",
                referrerBonus
            );
            console.log(
                "FINAL USER BALANCE:",
                finalUser.balance
            );

            if (referrer) {
                console.log(
                    "REFERRER:",
                    referrer.phone
                );
            }

            console.log("====================================");


            // ======================================
            // RESPONSE
            // ======================================

            return res.json({

                success: true,

                message:
                    "Deposit approved successfully.",

                phone:
                    finalUser.phone,

                depositAmount:
                    amount,

                userBonus:
                    userBonus,

                referrerBonus:
                    referrerBonus,

                balance:
                    Number(
                        finalUser.balance || 0
                    ),

                referrerPhone:
                    referrer
                        ? referrer.phone
                        : null

            });


        } catch (err) {

            console.error(
                "APPROVE DEPOSIT ERROR:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Server error."

            });

        }

    }
);
// ======================================
// GET USER DETAILS
// ======================================

router.get("/user/:phone", async (req, res) => {

    try {

        const user = await User.findOne({

            phone: req.params.phone

        });

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        const profile = await Profile.findOne({

            phone: req.params.phone

        });

        res.json({

            success: true,

            user,

            profile

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
// USER DEPOSITS
// ======================================

router.get("/deposits/:phone", async (req, res) => {

    const deposits = await Deposit.find({

        phone: req.params.phone

    }).sort({

        createdAt: -1

    });

    res.json(deposits);

});

// ======================================
// USER WITHDRAWALS
// ======================================

router.get("/withdrawals/:phone", async (req, res) => {

    const withdrawals = await Withdraw.find({

        phone: req.params.phone

    }).sort({

        createdAt: -1

    });

    res.json(withdrawals);

});

// ======================================
// USER TRANSACTIONS
// ======================================

router.get("/transactions/:phone", async (req, res) => {

    const transactions = await Transaction.find({

        phone: req.params.phone

    }).sort({

        createdAt: -1

    });

    res.json(transactions);

});
// ======================================
// GET LOGIN ACTIVITIES
// ======================================

router.get("/logins", async (req, res) => {

    try {

        const activities = await LoginActivity.find()

            .sort({

                createdAt: -1

            });

        res.json({

            success: true,

            activities

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            message: err.message

        });

    }

});
// ===========================
// ADMIN REPORTS
// ===========================

router.get("/reports/export", async (req, res) => {

    try {

        const deposits = await Deposit.find().sort({
            createdAt: -1
        });

        const withdrawals = await Withdraw.find().sort({
            createdAt: -1
        });

        let csv = "Type,Phone,Amount,Status,Reference,Date\n";

        deposits.forEach(item => {

            csv += `Deposit,${item.phone},${item.amount},${item.status},${item.reference || ""},${item.createdAt}\n`;

        });

        withdrawals.forEach(item => {

            csv += `Withdrawal,${item.phone},${item.amount},${item.status},${item.reference || ""},${item.createdAt}\n`;

        });

        res.setHeader("Content-Type", "text/csv");

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=wallet-report.csv"
        );

        res.send(csv);

    } catch (err) {

        console.log(err);

        res.status(500).send("Error generating report.");

    }

});

module.exports = router;