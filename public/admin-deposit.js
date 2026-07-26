const table = document.getElementById("depositTable");

async function loadDeposits() {

    const token = localStorage.getItem("adminToken");

    try {

        const res = await fetch("/admin/deposits", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const deposits = await res.json();

        table.innerHTML = "";

        deposits.forEach(item => {

            table.innerHTML += `
            <tr>

                <td>${item.phone}</td>

                <td>${item.amount} ETB</td>

                <td>${item.status}</td>

                <td>
                    <a href="/uploads/${item.screenshot}" target="_blank">
                        View Screenshot
                    </a>
                </td>

                <td>

                    ${
                        item.status === "Pending"
                        ? `
                        <button onclick="approveDeposit('${item._id}')">
                            Approve
                        </button>

                        <button onclick="rejectDeposit('${item._id}')">
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

        alert("Server Error");

        console.log(err);

    }

}

async function approveDeposit(id) {

    const token = localStorage.getItem("adminToken");

    const res = await fetch("/admin/deposit/approve/" + id, {

        method: "POST",

        headers: {
            Authorization: "Bearer " + token
        }

    });

    const data = await res.json();

    alert(data.message);

    loadDeposits();

}

async function rejectDeposit(id) {

    const token = localStorage.getItem("adminToken");

    const res = await fetch("/admin/deposit/reject/" + id, {

        method: "POST",

        headers: {
            Authorization: "Bearer " + token
        }

    });

    const data = await res.json();

    alert(data.message);

    loadDeposits();

}

loadDeposits();