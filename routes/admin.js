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

router.get("/deposits", async (req, res) => {

    try {

        const deposits = await Deposit.find().sort({ createdAt: -1 });

        res.json(deposits);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});



// Reject Deposit
router.post("/deposit/reject/:id", async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {

            return res.json({
                success: false,
                message: "Deposit not found."
            });

        }

        if (deposit.status === "Rejected") {

            return res.json({
                success: false,
                message: "Deposit already rejected."
            });

        }

        deposit.status = "Rejected";

        await deposit.save(); const notification = new Notification({

    phone: deposit.phone,

    title: "Deposit Rejected",

    message: "Your deposit request has been rejected."

});

await notification.save();

        res.json({

            success: true,

            message: "Deposit rejected successfully."

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
    username === "admin" &&
    password === "123456"
) {

            return res.json({

                success: true

            });

        }

        res.json({

            success: false,

            message: "Invalid username or password."

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
// ======================================

router.post("/deposit/approve/:id", async (req, res) => {

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
                message: "Deposit already approved."
            });

        }

        deposit.status = "Approved";
        await deposit.save();

        const user = await User.findOne({
            phone: deposit.phone
        });

        if (user) {

            user.balance += deposit.amount;
            await user.save();

            const depositTransaction = new Transaction({

                phone: user.phone,

                type: "Deposit",

                amount: deposit.amount,

                status: "Approved",

                reference: deposit._id.toString()

            });

            await depositTransaction.save();

            const notification = new Notification({

                phone: user.phone,

                title: "Deposit Approved",

                message: deposit.amount + " ETB has been added to your balance."

            });

            await notification.save();

            // ==========================
            // REFERRAL BONUS
            // ==========================

            if (user.referredBy && !user.referralPaid) {

                const referrer = await User.findOne({

                    referralCode: user.referredBy

                });

                if (referrer) {

                    referrer.balance += 600;
                    referrer.referralEarnings += 600;
                    referrer.invitedUsers += 1;

                    await referrer.save();

                    user.referralPaid = true;
                    await user.save();

                    const referralTransaction = new Transaction({

                        phone: referrer.phone,

                        type: "Referral Bonus",

                        amount: 600,

                        status: "Approved",

                        reference: user.phone

                    });

                    await referralTransaction.save();

                    const referralNotification = new Notification({

                        phone: referrer.phone,

                        title: "Referral Bonus",

                        message: "You received 600 ETB because " + user.phone + " made their first approved deposit."

                    });

                    await referralNotification.save();

                }

            }

        }

        res.json({

            success: true,

            message: "Deposit approved successfully."

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