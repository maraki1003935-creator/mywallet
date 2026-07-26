const table = document.getElementById("withdrawTable");

const token = localStorage.getItem("adminToken");

async function loadWithdrawals() {

    try {

        const res = await fetch("/admin/withdrawals", {

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const withdrawals = await res.json();

        table.innerHTML = "";

        withdrawals.forEach(item => {

            table.innerHTML += `

<tr>

<td>${item.phone}</td>

<td>${item.amount} ETB</td>

<td>${item.status}</td>

<td>

${item.status === "Pending" ? `

<button class="approve"
onclick="approveWithdraw('${item._id}')">

Approve

</button>

<button class="reject"
onclick="rejectWithdraw('${item._id}')">

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

async function approveWithdraw(id) {

    if (!confirm("Approve this withdrawal?")) return;

    const res = await fetch("/admin/withdraw/approve/" + id, {

        method: "POST",

        headers: {
            Authorization: "Bearer " + token
        }

    });

    const data = await res.json();

    alert(data.message);

    loadWithdrawals();

}

async function rejectWithdraw(id) {

    if (!confirm("Reject this withdrawal?")) return;

    const res = await fetch("/admin/withdraw/reject/" + id, {

        method: "POST",

        headers: {
            Authorization: "Bearer " + token
        }

    });

    const data = await res.json();

    alert(data.message);

    loadWithdrawals();

}

loadWithdrawals();