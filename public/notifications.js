if(localStorage.getItem("phone")==null){

    window.location.href="index.html";

}

const phone=localStorage.getItem("phone");

const container=document.getElementById("notifications");

async function loadNotifications(){

    try{

        const res=await fetch("/notifications/"+phone);

        const data=await res.json();

        if(!data.success){

            alert(data.message);

            return;

        }

        container.innerHTML="";

        if(data.notifications.length===0){

            container.innerHTML="<h3>No notifications.</h3>";

            return;

        }

        data.notifications.forEach(item=>{

            container.innerHTML+=`

            <div class="card">

            <h3>${item.title}</h3>

            <p>${item.message}</p>

            <small>

            ${new Date(item.createdAt).toLocaleString()}

            </small>

            <br><br>

            <button onclick="markRead('${item._id}')">

            Mark as Read

            </button>

            </div>

            `;

        });

    }catch(err){

        alert("Server Error");

    }

}

async function markRead(id){

    const res=await fetch("/notifications/read/"+id,{

        method:"POST"

    });

    const data=await res.json();

    if(data.success){

        loadNotifications();

    }else{

        alert(data.message);

    }

}

loadNotifications();