async function loadDashboard(){

    try{

        const res = await fetch("/admin/dashboard");

        const data = await res.json();

        if(!data.success){

            alert(data.message);

            return;

        }

        document.getElementById("users").textContent =
        data.totalUsers;

        document.getElementById("deposits").textContent =
        data.totalDeposits + " ETB";

        document.getElementById("withdrawals").textContent =
        data.totalWithdrawals + " ETB";

        document.getElementById("pendingDeposits").textContent =
        data.pendingDeposits;

        document.getElementById("pendingWithdrawals").textContent =
        data.pendingWithdrawals;

        document.getElementById("referralBonus").textContent =
        data.totalReferralBonus + " ETB";

        document.getElementById("transactions").textContent =
        data.totalTransactions;

        document.getElementById("balance").textContent =
        data.totalBalance + " ETB";

    }catch(err){

        alert("Server Error");

    }

}

loadDashboard();