if(localStorage.getItem("admin")!=="true"){

    window.location.href="admin-login.html";

}

const table=document.getElementById("supportTable");

async function loadSupport(){

    try{

        const res=await fetch("/admin/support");

        const data=await res.json();

        if(!data.success){

            alert(data.message);

            return;

        }

        table.innerHTML="";

        data.support.forEach(item=>{

            table.innerHTML+=`

            <tr>

            <td>${item.phone}</td>

            <td>${item.subject}</td>

            <td>${item.message}</td>

            <td>${item.status}</td>

            <td>

            <button onclick="resolveSupport('${item._id}')">

            Mark Resolved

            </button>

            </td>

            </tr>

            `;

        });

    }catch(err){

        alert("Server Error");

    }

}

async function resolveSupport(id){

    const res=await fetch("/admin/support/resolve/"+id,{

        method:"POST"

    });

    const data=await res.json();

    alert(data.message);

    loadSupport();

}

loadSupport();