if(localStorage.getItem("admin")!=="true"){

    window.location.href="admin-login.html";

}

const table=document.getElementById("usersTable");
const search=document.getElementById("search");

let allUsers=[];

async function loadUsers(){

    try{

        const res=await fetch("/admin/users");

        const data=await res.json();

        if(!data.success){

            alert(data.message);

            return;

        }

        allUsers=data.users;

        displayUsers(allUsers);

    }catch(err){

        alert("Server Error");

    }

}

function displayUsers(users){

    table.innerHTML="";

    users.forEach(user=>{

        table.innerHTML+=`

        <tr>

        <td>${user.phone}</td>

        <td>${user.balance} ETB</td>

        <td>${user.referralCode}</td>

        <td>${user.invitedUsers}</td>

        <td>${user.banned?"Banned":"Active"}</td>

        <td>

        <button class="edit"

        onclick="editBalance('${user._id}')">

        Edit Balance

        </button>

        ${user.banned?

        `<button class="unban"

        onclick="unbanUser('${user._id}')">

        Unban

        </button>`

        :

        `<button class="ban"

        onclick="banUser('${user._id}')">

        Ban

        </button>`

        }

        </td>

        </tr>

        `;

    });

}

search.addEventListener("input",()=>{

    const keyword=search.value.toLowerCase();

    const filtered=allUsers.filter(user=>

        user.phone.toLowerCase().includes(keyword)

    );

    displayUsers(filtered);

});

async function editBalance(id){

    const amount=prompt("Enter new balance:");

    if(amount===null)return;

    const res=await fetch("/admin/user/balance/"+id,{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            balance:Number(amount)

        })

    });

    const data=await res.json();

    alert(data.message);

    loadUsers();

}

async function banUser(id){

    const res=await fetch("/admin/user/ban/"+id,{

        method:"POST"

    });

    const data=await res.json();

    alert(data.message);

    loadUsers();

}

async function unbanUser(id){

    const res=await fetch("/admin/user/unban/"+id,{

        method:"POST"

    });

    const data=await res.json();

    alert(data.message);

    loadUsers();

}

loadUsers();