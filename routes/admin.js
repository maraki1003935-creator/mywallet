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
// ===============================
// Get All Withdrawal Requests
// ===============================

router.get("/withdrawals", async (req, res) => {

    try {

        const withdrawals = await Withdraw.find().sort({ createdAt: -1 });

        res.json(withdrawals);

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// ===============================
// Approve Withdrawal
// ===============================

router.post("/withdraw/approve/:id", async (req, res) => {

    try {

        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {

            return res.json({

                success: false,

                message: "Withdrawal not found."

            });

        }

        if (withdraw.status === "Approved") {

            return res.json({

                success: false,

                message: "Already approved."

            });

        }

        const user = await User.findOne({

            phone: withdraw.phone

        });

        if (!user) {

            return res.json({

                success: false,

                message: "User not found."

            });

        }

        if (user.balance < withdraw.amount) {

            return res.json({

                success: false,

                message: "Insufficient user balance."

            });

        }

        user.balance -= withdraw.amount;

        await user.save();

        withdraw.status = "Approved";

        await withdraw.save(); const notification = new Notification({

    phone: withdraw.phone,

    title: "Withdrawal Approved",

    message: "Your withdrawal of " + withdraw.amount + " ETB has been approved."

});

await notification.save();

        res.json({

            success: true,

            message: "Withdrawal approved."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            message: err.message

        });

    }

});

// ===============================
// Reject Withdrawal
// ===============================

router.post("/withdraw/reject/:id", async (req, res) => {

    try {

        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {

            return res.json({

                success: false,

                message: "Withdrawal not found."

            });

        }

        withdraw.status = "Rejected";

        await withdraw.save(); const notification = new Notification({

    phone: withdraw.phone,

    title: "Withdrawal Rejected",

    message: "Your withdrawal request has been rejected."

});

await notification.save();

        res.json({

            success: true,

            message: "Withdrawal rejected."

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
// ADD DEPOSIT + 600 ETB BONUS
// TO THE DEPOSITOR'S OWN WALLET
// ======================================

router.post("/deposit/approve/:id", verifyAdmin, async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.json({
                success: false,
                message: "Deposit not found."
            });
        }

        // Prevent double approval
        if (deposit.status === "Approved") {
            return res.json({
                success: false,
                message: "Deposit already approved."
            });
        }

        // ======================================
        // FIND THE EXACT DEPOSITOR
        // ======================================

        const phone = String(deposit.phone || "").trim();

        console.log("=================================");
        console.log("APPROVING DEPOSIT");
        console.log("Deposit ID:", deposit._id);
        console.log("Deposit phone:", phone);
        console.log("Deposit amount:", deposit.amount);

        const user = await User.findOne({
            phone: phone
        });

        console.log(
            "USER FOUND:",
            user ? "YES" : "NO"
        );

        if (user) {
            console.log("USER PHONE:", user.phone);
            console.log("OLD BALANCE:", user.balance);
        }

        console.log("=================================");

        if (!user) {

            return res.json({
                success: false,
                message:
                    "Depositor account not found for phone: " +
                    phone
            });

        }

        const depositAmount = Number(deposit.amount);

        if (!Number.isFinite(depositAmount) || depositAmount <= 0) {

            return res.json({
                success: false,
                message: "Invalid deposit amount."
            });

        }

        // ======================================
        // ADD DEPOSIT TO DEPOSITOR'S WALLET
        // ======================================

        const oldBalance = Number(user.balance || 0);

        // ======================================
        // ADD 600 ETB BONUS TO SAME DEPOSITOR
        // ======================================

        const bonus = 600;

        const newBalance =
            oldBalance +
            depositAmount +
            bonus;

        user.balance = newBalance;

        await user.save();

        // ======================================
        // VERIFY DATABASE
        // ======================================

        const savedUser = await User.findOne({
            phone: phone
        });

        console.log("=================================");
        console.log("BALANCE SAVED");
        console.log("PHONE:", phone);
        console.log("OLD BALANCE:", oldBalance);
        console.log("DEPOSIT:", depositAmount);
        console.log("BONUS:", bonus);
        console.log(
            "NEW BALANCE:",
            savedUser ? savedUser.balance : "NOT FOUND"
        );
        console.log("=================================");

        // ======================================
        // MARK DEPOSIT APPROVED
        // ======================================

        deposit.status = "Approved";

        await deposit.save();

        // ======================================
        // DEPOSIT TRANSACTION
        // ======================================

        await Transaction.create({

            phone: phone,

            type: "Deposit",

            amount: depositAmount,

            status: "Approved",

            reference: "DEP-" + deposit._id

        });

        // ======================================
        // BONUS TRANSACTION
        // ======================================

        await Transaction.create({

            phone: phone,

            type: "Deposit Bonus",

            amount: bonus,

            status: "Approved",

            reference: "BONUS-" + deposit._id

        });

        // ======================================
        // NOTIFY DEPOSITOR
        // ======================================

        await Notification.create({

            phone: phone,

            title: "Deposit Approved",

            message:
                depositAmount +
                " ETB deposit was added to your wallet. " +
                bonus +
                " ETB bonus was also added."

        });

        // ======================================
        // RESPONSE
        // ======================================

        return res.json({

            success: true,

            message:
                "Deposit approved. Deposit and 600 ETB bonus added to depositor wallet.",

            phone: phone,

            depositAmount: depositAmount,

            bonus: bonus,

            balance:
                Number(savedUser.balance || 0)

        });

    } catch (err) {

        console.log(
            "APPROVE DEPOSIT ERROR:",
            err
        );

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

});
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