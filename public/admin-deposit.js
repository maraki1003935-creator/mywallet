const table = document.getElementById("depositTable");

const token = localStorage.getItem("adminToken");

async function loadDeposits() {

    try {

        const res = await fetch("/admin/deposits", {

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const deposits = await res.json();

        table.innerHTML = "";

        deposits.forEach(deposit => {

            table.innerHTML += `

<tr>

<td>${deposit.phone}</td>

<td>${deposit.amount} ETB</td>

<td>
<a href="/uploads/${deposit.screenshot}" target="_blank">
<img src="/uploads/${deposit.screenshot}" width="120">
</a>
</td>

<td>${deposit.status}</td>

<td>

${deposit.status==="Pending" ? `

<button class="approve"
onclick="approveDeposit('${deposit._id}')">

Approve

</button>

<button class="reject"
onclick="rejectDeposit('${deposit._id}')">

Reject

</button>

` : "-"}

</td>

</tr>

`;

        });

    } catch (err) {

        alert("Server Error");

        console.log(err);

    }

}

async function approveDeposit(id){

if(!confirm("Approve this deposit?")) return;

const res=await fetch("/admin/deposit/approve/"+id,{

method:"POST",

headers:{
Authorization:"Bearer "+token
}

});

const data=await res.json();

alert(data.message);

loadDeposits();

}

async function rejectDeposit(id){

if(!confirm("Reject this deposit?")) return;

const res=await fetch("/admin/deposit/reject/"+id,{

method:"POST",

headers:{
Authorization:"Bearer "+token
}

});

const data=await res.json();

alert(data.message);

loadDeposits();

}

loadDeposits();