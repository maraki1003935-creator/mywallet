let activities = [];

const table = document.getElementById("loginTable");

async function loadLogins() {

    const res = await fetch("/admin/logins");

    const data = await res.json();

    if (!data.success) {

        alert(data.message);

        return;

    }

    activities = data.activities;

    display(activities);

}

function display(list) {

    table.innerHTML = "";

    list.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.phone}</td>

            <td>${item.ip}</td>

            <td>${item.browser}</td>

            <td>${item.status}</td>

            <td>${new Date(item.createdAt).toLocaleString()}</td>

        </tr>

        `;

    });

}

function searchLogin() {

    const keyword = document

        .getElementById("search")

        .value

        .toLowerCase();

    const filtered = activities.filter(item =>

        item.phone.toLowerCase().includes(keyword)

    );

    display(filtered);

}

loadLogins();

setInterval(loadLogins,5000);