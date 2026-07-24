async function loadReports(){

    try{

        const res = await fetch("/admin/reports");

        const data = await res.json();

        if(!data.success){

            alert(data.message);

            return;

        }

        document.getElementById("todayDeposits").innerHTML =
            data.todayDeposits + " ETB";

        document.getElementById("todayWithdrawals").innerHTML =
            data.todayWithdrawals + " ETB";

        document.getElementById("newUsers").innerHTML =
            data.newUsers;

        document.getElementById("revenue").innerHTML =
            data.revenue + " ETB";

        document.getElementById("pendingDeposits").innerHTML =
            data.pendingDeposits;

        document.getElementById("pendingWithdrawals").innerHTML =
            data.pendingWithdrawals;

    }catch(err){

        console.log(err);

    }

}

function exportCSV(){

    window.location.href="/admin/reports/export";

}

loadReports();

setInterval(loadReports,5000);