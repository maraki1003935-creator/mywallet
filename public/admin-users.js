const table = document.getElementById("usersTable");

const token = localStorage.getItem("adminToken");

let users = [];

async function loadUsers() {

    try {

        const res = await fetch("/admin/users", {

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await res.json();

        if (!data.success) {

            alert(data.message);
            return;

        }

        users = data.users;

        displayUsers(users);

    } catch (err) {

        alert("Server Error");

    }

}

function displayUsers(list) {

    table.innerHTML = "";

    list.forEach(user => {

        table.innerHTML += `
        <tr>
            <td>${user.phone}</td>
            <td>${user.balance} ETB</td>
            <td>${user.blocked ? "Blocked" : "Active"}</td>
            <td>
                <button onclick="editBalance('${user._id}',${user.balance})">
                Edit Balance
                </button>

                <button onclick="toggleBlock('${user._id}')">
                ${user.blocked ? "Unblock" : "Block"}
                </button>
            </td>
        </tr>
        `;

    });

}

function searchUser() {

    const keyword = document.getElementById("search").value.toLowerCase();

    const filtered = users.filter(user =>
        user.phone.toLowerCase().includes(keyword)
    );

    displayUsers(filtered);

}

async function editBalance(id, balance) {

    const newBalance = prompt("Enter new balance", balance);

    if (newBalance == null) return;

    const res = await fetch("/admin/user/balance/" + id, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",
            Authorization: "Bearer " + token

        },

        body: JSON.stringify({

            balance: Number(newBalance)

        })

    });

    const data = await res.json();

    alert(data.message);

    loadUsers();

}

async function toggleBlock(id) {

    const res = await fetch("/admin/user/block/" + id, {

        method: "POST",

        headers: {

            Authorization: "Bearer " + token

        }

    });

    const data = await res.json();

    alert(data.message);

    loadUsers();

}

loadUsers();