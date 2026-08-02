require("dotenv").config();
const Profile = require("./models/Profile");

const express = require("express");

const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const mongoose = require("mongoose");
const multer = require("multer");

const Deposit = require("./models/Deposit");
const Withdraw = require("./models/Withdraw");
const Transaction = require("./models/Transaction");
const Support = require("./models/Support");
const Notification = require("./models/Notification");
const User = require("./models/User");
const LoginActivity = require("./models/LoginActivity");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const PORT = process.env.PORT || 3000;

// Parse request body FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
// =======================
// MongoDB Connection
// =======================

console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
.then(() => {

    console.log("MongoDB Connected");

})
.catch((err) => {

    console.log(err);

});

// =======================
// Multer Upload Settings
// =======================
const fs = require("fs");
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
}

const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "uploads/");

    },

    filename: function(req, file, cb){

        cb(null, Date.now() + path.extname(file.originalname));

    }

});

const upload = multer({

    storage: storage

});

// =======================
// Middleware
// =======================

app.use(express.json());

app.use(express.urlencoded({

    extended: true

}));

app.use(express.static("public"));

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);

app.use("/admin", adminRoutes);
// =======================
// Deposit Route
// =======================

app.post("/deposit", upload.single("screenshot"), async (req, res) => {

    try {

        const { phone, amount } = req.body;

        if (!phone) {

            return res.json({

                success: false,
                message: "Phone number is required."

            });

        }

        if (Number(amount) < 5000) {

            return res.json({

                success: false,
                message: "Minimum deposit is 5000 ETB."

            });

        }

        if (Number(amount) > 300000) {

            return res.json({

                success: false,
                message: "Maximum deposit is 300000 ETB."

            });

        }

        if (!req.file) {

            return res.json({

                success: false,
                message: "Please upload your payment screenshot."

            });

        }

        const deposit = new Deposit({

            phone: phone,

            amount: Number(amount),

            screenshot: req.file.filename,

            status: "Pending"

        });

        await deposit.save();

        res.json({

            success: true,
            message: "Deposit request submitted successfully. Please wait for admin approval."

        });

    } catch (err) {

    console.error("Deposit Error:", err);

    res.status(500).json({
        success: false,
        message: "Server error"
    });

}

});
// =======================
// Start Server
// =======================
// =======================
// Withdraw Route
// =======================

app.post("/withdraw", async (req, res) => {

    try {

        const { phone, telebirr, amount, withdrawCode } = req.body;

        if (!phone || !telebirr || !amount || !withdrawCode) {

            return res.json({

                success: false,

                message: "All fields are required."

            });

        }

        if (Number(amount) < 10000) {

            return res.json({

                success: false,

                message: "Minimum withdrawal is 10000 ETB."

            });

        }

        if (Number(amount) > 400000) {

            return res.json({

                success: false,

                message: "Maximum withdrawal is 400000 ETB."

            });

        }

        const withdraw = new Withdraw({

            phone,

            telebirr,

            amount: Number(amount),

            withdrawCode,

            status: "Pending"

        });

        await withdraw.save();

        res.json({

            success: true,

            message: "Withdrawal request submitted."

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
// Get User Transaction History
// ===============================

app.get("/transactions/:phone", async (req, res) => {

    try {

        const transactions = await Transaction.find({

            phone: req.params.phone

        }).sort({

            createdAt: -1

        });

        res.json(transactions);

    } catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});
// =======================================
// Transfer Money
// =======================================

app.post("/transfer", async (req, res) => {

    try {

        const { sender, receiver, amount } = req.body;

        if (!sender || !receiver || !amount) {

            return res.json({

                success: false,

                message: "All fields are required."

            });

        }

        const senderUser = await User.findOne({

            phone: sender

        });

        const receiverUser = await User.findOne({

            phone: receiver

        });

        if (!senderUser) {

            return res.json({

                success: false,

                message: "Sender account not found."

            });

        }

        if (!receiverUser) {

            return res.json({

                success: false,

                message: "Receiver account not found."

            });

        }

        if (senderUser.phone === receiverUser.phone) {

            return res.json({

                success: false,

                message: "You cannot transfer to yourself."

            });

        }

        if (senderUser.balance < Number(amount)) {

            return res.json({

                success: false,

                message: "Insufficient balance."

            });

        }

        senderUser.balance -= Number(amount);

        receiverUser.balance += Number(amount);

        await senderUser.save();

        await receiverUser.save(); const senderTransaction = new Transaction({

    phone: sender.phone,

    type: "Transfer Sent",

    amount: amount,

    status: "Completed",

    reference: "TRF-" + Date.now()

});

await senderTransaction.save();

const receiverTransaction = new Transaction({

    phone: receiver.phone,

    type: "Transfer Received",

    amount: amount,

    status: "Completed",

    reference: "TRF-" + Date.now()

});

await receiverTransaction.save();

        const ref = "TR-" + Date.now();

        await Transaction.create({

            phone: senderUser.phone,

            type: "Transfer Sent",

            amount: Number(amount),

            status: "Completed",

            reference: ref

        });

        await Transaction.create({

            phone: receiverUser.phone,

            type: "Transfer Received",

            amount: Number(amount),

            status: "Completed",

            reference: ref

        });

        res.json({

            success: true,

            message: "Transfer completed successfully."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            message: err.message

        });

    }

});
app.get("/referral/:phone", async (req, res) => {

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

        res.json({

            success: true,

            user

        });

    } catch (err) {

        res.json({

            success: false,

            message: err.message

        });

    }

});
// ======================================
// SUPPORT
// ======================================

app.post("/support", async (req, res) => {

    try {

        const { phone, subject, message } = req.body;

        if (!phone || !subject || !message) {

            return res.json({

                success: false,

                message: "All fields are required."

            });

        }

        const support = new Support({

            phone,

            subject,

            message

        });

        await support.save();

        res.json({

            success: true,

            message: "Your support request has been sent."

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
// GET USER NOTIFICATIONS
// ======================================

app.get("/notifications/:phone", async (req, res) => {

    try {

        const notifications = await Notification.find({

            phone: req.params.phone

        }).sort({

            createdAt: -1

        });

        res.json({

            success: true,

            notifications

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
// MARK NOTIFICATION AS READ
// ======================================

app.post("/notifications/read/:id", async (req, res) => {

    try {

        const notification = await Notification.findById(req.params.id);

        if (!notification) {

            return res.json({

                success: false,

                message: "Notification not found."

            });

        }

        notification.isRead = true;

        await notification.save();

        res.json({

            success: true,

            message: "Notification marked as read."

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
// GET USER TRANSACTIONS
// ======================================

app.get("/transactions/:phone", async (req, res) => {

    try {

        const transactions = await Transaction.find({

            phone: req.params.phone

        }).sort({

            createdAt: -1

        });

        res.json({

            success: true,

            transactions

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
// GET PROFILE
// ======================================

app.get("/profile/:phone", async (req, res) => {

    try {

        let profile = await Profile.findOne({

            phone: req.params.phone

        });

        if (!profile) {

            profile = new Profile({

                phone: req.params.phone

            });

            await profile.save();

        }

        res.json({

            success: true,

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
// SAVE PROFILE
// ======================================

app.post("/profile", upload.single("photo"), async (req, res) => {

    try {

        const {

phone,

name,

email,

currentPassword,

newPassword,

confirmPassword

} = req.body;

        let profile = await Profile.findOne({

            phone

        });

        if (!profile) {

            profile = new Profile({

                phone

            });

        }

        profile.name = name;

        profile.email = email;

        if (newPassword && newPassword.trim() !== "") {

    if (profile.password !== currentPassword) {

        return res.json({

            success: false,

            message: "Current password is incorrect."

        });

    }

    if (newPassword !== confirmPassword) {

        return res.json({

            success: false,

            message: "Passwords do not match."

        });

    }

    profile.password = newPassword;

}

        if (req.file) {

            profile.photo = req.file.filename;

        }

        await profile.save();

        res.json({

            success: true,

            message: "Profile updated successfully."

        });

    } catch (err) {

        console.log(err);

        res.json({

            success: false,

            message: err.message

        });

    }

});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
// ======================================
// GET USER WALLET BALANCE
// ======================================

app.get("/api/wallet/:phone", async (req, res) => {

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

        res.json({

            success: true,

            phone: user.phone,

            balance: Number(user.balance || 0)

        });

    } catch (err) {

        console.log("WALLET ERROR:", err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



// ======================================
// ADMIN APPROVE DEPOSIT FUNCTION
// ======================================

app.post("/admin/approve-deposit/:id", async(req,res)=>{

try{


const deposit = await Deposit.findById(req.params.id);


if(!deposit){

return res.json({

success:false,
message:"Deposit not found"

});

}



if(deposit.status === "Approved"){

return res.json({

success:false,
message:"Already approved"

});

}



// find user by phone

const user = await User.findOne({

phone:deposit.phone

});


if(!user){

return res.json({

success:false,
message:"User not found"

});

}



// add deposit amount

user.balance = (user.balance || 0) + Number(deposit.amount);



// give 600 ETB referral bonus only once

if(!user.referralBonusGiven){

user.balance += 600;

user.referralBonusGiven = true;


await Transaction.create({

phone:user.phone,

type:"Referral Bonus",

amount:600,

status:"Completed",

reference:"REF-"+Date.now()

});


}



// save user

await user.save();



// update deposit

deposit.status="Approved";

await deposit.save();



// create transaction

await Transaction.create({

phone:user.phone,

type:"Deposit",

amount:Number(deposit.amount),

status:"Completed",

reference:"DEP-"+Date.now()

});



res.json({

success:true,

message:"Deposit approved. Wallet updated and 600 ETB referral bonus added."

});



}catch(err){

console.log(err);

res.json({

success:false,

message:err.message

});

}


});

app.listen(PORT, () => {

    console.log("Server running on http://localhost:" + PORT);

});