const params = new URLSearchParams(window.location.search);

const phone = params.get("phone");

async function loadUser() {

    const res = await fetch("/admin/user/" + phone);

    const data = await res.json();

    if (!data.success) {

        alert(data.message);

        return;

    }

    const user = data.user;

    document.getElementById("phone").innerText = user.phone;

    document.getElementById("balance").innerText = user.balance;

    document.getElementById("referral").innerText = user.referralEarnings;

    document.getElementById("invited").innerText = user.invitedUsers;

    document.getElementById("name").innerText =
        data.profile ? data.profile.name : "";

    document.getElementById("email").innerText =
        data.profile ? data.profile.email : "";

    loadDeposits();

    loadWithdrawals();

    loadTransactions();

}

async function loadDeposits() {

    const res = await fetch("/admin/deposits/" + phone);

    const deposits = await res.json();

    const table = document.getElementById("depositTable");

    table.innerHTML = "";

    deposits.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.amount}</td>

            <td>${item.status}</td>

            <td>${new Date(item.createdAt).toLocaleString()}</td>

        </tr>

        `;

    });

}

async function loadWithdrawals() {

    const res = await fetch("/admin/withdrawals/" + phone);

    const withdrawals = await res.json();

    const table = document.getElementById("withdrawTable");

    table.innerHTML = "";

    withdrawals.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.amount}</td>

            <td>${item.status}</td>

            <td>${new Date(item.createdAt).toLocaleString()}</td>

        </tr>

        `;

    });

}

async function loadTransactions() {

    const res = await fetch("/admin/transactions/" + phone);

    const transactions = await res.json();

    const table = document.getElementById("transactionTable");

    table.innerHTML = "";

    transactions.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.type}</td>

            <td>${item.amount}</td>

            <td>${item.status}</td>

            <td>${new Date(item.createdAt).toLocaleString()}</td>

        </tr>

        `;

    });

}

loadUser();