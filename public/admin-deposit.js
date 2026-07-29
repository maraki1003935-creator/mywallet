const table = document.getElementById("depositTable");

let token = localStorage.getItem("adminToken");

if (!token) {
    location.href = "admin-login.html";
}

async function loadDeposits() {

    try {

        const res = await fetch("/admin/deposits", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

if (!data.success) {
    alert(data.message);
    return;
}

table.innerHTML = "";

data.deposits.forEach(item => {

            table.innerHTML += `
            <tr>

                <td>${item.phone}</td>

                <td>${item.amount} ETB</td>

                <td>
                    <a href="/uploads/${item.screenshot}" target="_blank">
                        View Screenshot
                    </a>
                </td>

                <td>${item.status}</td>

                <td>

                    ${
                        item.status === "Pending"
                        ? `
                        <button class="approve" onclick="approveDeposit('${item._id}')">
                            Approve
                        </button>

                        <button class="reject" onclick="rejectDeposit('${item._id}')">
                            Reject
                        </button>
                        `
                        : "-"
                    }

                </td>

            </tr>
            `;

        });

    } catch (err) {

    console.error(err);
    alert(err.message);

}

}

async function approveDeposit(id) {

    if (!confirm("Approve this deposit?")) return;

    try {

        const res = await fetch("/admin/deposit/approve/" + id, {

            method: "POST",

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await res.json();

        alert(data.message);

        loadDeposits();

    } catch (err) {

        console.log(err);
        alert("Server Error");

    }

}

async function rejectDeposit(id) {

    if (!confirm("Reject this deposit?")) return;

    try {

        const res = await fetch("/admin/deposit/reject/" + id, {

            method: "POST",

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await res.json();

        alert(data.message);

        loadDeposits();

    } catch (err) {

        console.log(err);
        alert("Server Error");

    }

}

loadDeposits();