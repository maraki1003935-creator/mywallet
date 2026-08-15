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
// ADD DEPOSIT + 600 ETB REFERRAL BONUS
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

        if (deposit.status === "Approved") {
            return res.json({
                success: false,
                message: "Deposit is already approved."
            });
        }

        const user = await User.findOne({
            phone: deposit.phone
        });

        if (!user) {
            return res.json({
                success: false,
                message:
                    "User not found for phone: " + deposit.phone
            });
        }

        const amount = Number(deposit.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.json({
                success: false,
                message: "Invalid deposit amount."
            });
        }

        // ----------------------------------
        // OLD BALANCE
        // ----------------------------------

        const oldBalance = Number(user.balance || 0);

        // ----------------------------------
        // ADD DEPOSIT
        // ----------------------------------

        user.balance = oldBalance + amount;

        // ----------------------------------
        // REFERRAL BONUS
        // ----------------------------------

        let bonus = 0;

        if (
            amount >= 5000 &&
            user.referredBy &&
            user.referralPaid !== true
        ) {

            const referrer = await User.findOne({
                referralCode: user.referredBy
            });

            if (referrer) {

                referrer.balance =
                    Number(referrer.balance || 0) + 600;

                referrer.referralEarnings =
                    Number(referrer.referralEarnings || 0) + 600;

                referrer.invitedUsers =
                    Number(referrer.invitedUsers || 0) + 1;

                await referrer.save();

                user.referralPaid = true;

                bonus = 600;

                await Transaction.create({
                    phone: referrer.phone,
                    type: "Referral Bonus",
                    amount: 600,
                    status: "Approved",
                    reference:
                        "REFERRAL-" + deposit._id
                });

                await Notification.create({
                    phone: referrer.phone,
                    title: "Referral Bonus",
                    message:
                        "You received 600 ETB referral bonus."
                });
            }
        }

        // ----------------------------------
        // SAVE DEPOSITOR
        // ----------------------------------

        await user.save();

        // ----------------------------------
        // APPROVE DEPOSIT
        // ----------------------------------

        deposit.status = "Approved";
        deposit.bonusAdded = bonus === 600;

        await deposit.save();

        // ----------------------------------
        // DEPOSIT TRANSACTION
        // ----------------------------------

        await Transaction.create({
            phone: user.phone,
            type: "Deposit",
            amount: amount,
            status: "Approved",
            reference: "DEPOSIT-" + deposit._id
        });

        // ----------------------------------
        // USER NOTIFICATION
        // ----------------------------------

        await Notification.create({
            phone: user.phone,
            title: "Deposit Approved",
            message:
                amount +
                " ETB has been added to your wallet." +
                (bonus === 600
                    ? " Referral bonus: 600 ETB."
                    : "")
        });

        console.log("==============================");
        console.log("DEPOSIT APPROVED");
        console.log("PHONE:", user.phone);
        console.log("DEPOSIT:", amount);
        console.log("BONUS:", bonus);
        console.log("OLD BALANCE:", oldBalance);
        console.log("NEW BALANCE:", user.balance);
        console.log("==============================");

        return res.json({
            success: true,
            message: "Deposit approved successfully.",
            phone: user.phone,
            depositAmount: amount,
            bonus: bonus,
            balance: user.balance
        });

    } catch (err) {

        console.log("APPROVE DEPOSIT ERROR:", err);

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