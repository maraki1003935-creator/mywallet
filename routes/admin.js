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
// ADD MONEY + 600 BONUS TO USER WALLET
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

        // Find the exact user who made the deposit
        const user = await User.findOne({
            phone: deposit.phone
        }); console.log("===== DEPOSIT BALANCE DEBUG =====");
console.log("Deposit phone:", deposit.phone);
console.log("User found:", user ? "YES" : "NO");

if (user) {
    console.log("User phone:", user.phone);
    console.log("Old balance:", user.balance);
    console.log("Deposit amount:", deposit.amount);
}
console.log("=================================");

        if (!user) {
            return res.json({
                success: false,
                message: "User not found: " + deposit.phone
            });
        }

        const depositAmount = Number(deposit.amount);

        if (depositAmount < 5000) {
            return res.json({
                success: false,
                message: "Minimum deposit is 5000 ETB."
            });
        }

        // ======================================
        // ADD DEPOSIT MONEY TO THIS USER
        // ======================================

        user.balance = Number(user.balance || 0) + depositAmount;

        // ======================================
        // ADD 600 ETB BONUS TO THIS USER
        // ======================================

        let bonus = 0;

        if (!user.referralPaid) {

            bonus = 600;

            user.balance =
                Number(user.balance || 0) + 600;

            user.referralPaid = true;
        }

        // ======================================
        // SAVE USER
        // ======================================

        await user.save();
        console.log("===== AFTER BALANCE SAVE =====");
console.log("Phone:", user.phone);
console.log("New balance:", user.balance);

const checkUser = await User.findOne({
    phone: user.phone
});

console.log(
    "Balance read again from MongoDB:",
    checkUser ? checkUser.balance : "USER NOT FOUND"
);

console.log("==============================");

        // ======================================
// APPROVE DEPOSIT
// ADD DEPOSIT + 600 ETB BONUS TO USER
// ======================================

router.post("/deposit/approve/:id", verifyAdmin, async (req, res) => {

    try {

        console.log("======================================");
        console.log("APPROVING DEPOSIT:", req.params.id);

        // Find deposit
        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {

            console.log("Deposit not found");

            return res.json({
                success: false,
                message: "Deposit not found."
            });

        }

        console.log("Deposit phone:", deposit.phone);
        console.log("Deposit amount:", deposit.amount);
        console.log("Deposit status:", deposit.status);

        // Prevent approving same deposit twice
        if (deposit.status === "Approved") {

            return res.json({
                success: false,
                message: "Deposit already approved."
            });

        }

        // ======================================
        // FIND THE USER WHO MADE THIS DEPOSIT
        // ======================================

        const phone = String(deposit.phone).trim();

        const user = await User.findOne({
            phone: phone
        });

        console.log(
            "USER FOUND:",
            user ? "YES" : "NO"
        );

        if (!user) {

            console.log(
                "USER NOT FOUND FOR PHONE:",
                phone
            );

            return res.json({
                success: false,
                message:
                    "User account not found for phone: " + phone
            });

        }

        console.log(
            "USER PHONE:",
            user.phone
        );

        console.log(
            "OLD BALANCE:",
            user.balance
        );

        // ======================================
        // DEPOSIT AMOUNT
        // ======================================

        const depositAmount = Number(deposit.amount);

        if (!Number.isFinite(depositAmount) || depositAmount < 5000) {

            return res.json({
                success: false,
                message: "Invalid deposit amount."
            });

        }

        // ======================================
        // 600 ETB BONUS
        // ======================================

        // Give 600 ETB bonus only once
        let bonus = 0;

        if (!user.referralPaid) {

            bonus = 600;

        }

        // ======================================
        // CALCULATE NEW BALANCE
        // ======================================

        const oldBalance = Number(user.balance || 0);

        const newBalance =
            oldBalance +
            depositAmount +
            bonus;

        console.log("OLD BALANCE:", oldBalance);
        console.log("DEPOSIT:", depositAmount);
        console.log("BONUS:", bonus);
        console.log("NEW BALANCE:", newBalance);

        // ======================================
        // SAVE USER BALANCE
        // ======================================

        user.balance = newBalance;

        // Mark bonus as already given
        if (bonus === 600) {

            user.referralPaid = true;

        }

        await user.save();

        // ======================================
        // VERIFY BALANCE WAS REALLY SAVED
        // ======================================

        const savedUser = await User.findOne({
            phone: phone
        });

        console.log(
            "BALANCE AFTER MONGODB SAVE:",
            savedUser ? savedUser.balance : "USER NOT FOUND"
        );

        if (!savedUser) {

            return res.status(500).json({
                success: false,
                message: "User disappeared after balance update."
            });

        }

        if (Number(savedUser.balance) !== newBalance) {

            console.log("BALANCE SAVE FAILED");

            return res.status(500).json({
                success: false,
                message: "Balance was not saved correctly."
            });

        }

        // ======================================
        // MARK DEPOSIT APPROVED
        // ======================================

        deposit.status = "Approved";

        await deposit.save();

        // ======================================
        // DEPOSIT TRANSACTION
        // ======================================

        await Transaction.create({

            phone: user.phone,

            type: "Deposit",

            amount: depositAmount,

            status: "Approved",

            reference: "DEP-" + deposit._id

        });

        // ======================================
        // BONUS TRANSACTION
        // ======================================

        if (bonus === 600) {

            await Transaction.create({

                phone: user.phone,

                type: "Deposit Bonus",

                amount: 600,

                status: "Approved",

                reference: "BONUS-" + deposit._id

            });

        }

        // ======================================
        // NOTIFICATION
        // ======================================

        await Notification.create({

            phone: user.phone,

            title: "Deposit Approved",

            message:
                depositAmount +
                " ETB deposit was added to your wallet." +
                (bonus === 600
                    ? " You also received 600 ETB bonus."
                    : "")

        });

        console.log(
            "FINAL USER BALANCE:",
            savedUser.balance
        );

        console.log("DEPOSIT APPROVED SUCCESSFULLY");
        console.log("======================================");

        return res.json({

            success: true,

            message:
                "Deposit approved. Money and bonus added to user's wallet.",

            phone: user.phone,

            depositAmount: depositAmount,

            bonus: bonus,

            balance: savedUser.balance

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

router.get("/reports", async(req,res)=>{

try{

const users = await User.countDocuments();

const pendingDeposits =
await Deposit.countDocuments({
status:"Pending"
});

const pendingWithdrawals =
await Withdraw.countDocuments({
status:"Pending"
});

const deposits =
await Deposit.find({
status:"Approved"
});

const withdrawals =
await Withdraw.find({
status:"Approved"
});

let todayDeposits=0;

let todayWithdrawals=0;

let revenue=0;

const today=new Date();

deposits.forEach(item=>{

const d=new Date(item.createdAt);

if(
d.toDateString()===today.toDateString()
){

todayDeposits+=item.amount;

}

revenue+=item.amount;

});

withdrawals.forEach(item=>{

const d=new Date(item.createdAt);

if(
d.toDateString()===today.toDateString()
){

todayWithdrawals+=item.amount;

}

});

const start=new Date();

start.setHours(0,0,0,0);

const newUsers=
await User.countDocuments({

createdAt:{
$gte:start
}

});

res.json({

success:true,

todayDeposits,

todayWithdrawals,

newUsers,

revenue,

pendingDeposits,

pendingWithdrawals,

totalUsers:users

});

}catch(err){

console.log(err);

res.json({

success:false,

message:err.message

});

}

});
// ===============================
// EXPORT REPORT AS CSV
// ===============================

router.get("/reports/export", async (req, res) => {

    try {

        const deposits = await Deposit.find().sort({ createdAt: -1 });

        const withdrawals = await Withdraw.find().sort({ createdAt: -1 });

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