if(localStorage.getItem("phone")==null){

window.location.href="index.html";

}

const phone=localStorage.getItem("phone");

const history=document.getElementById("history");

async function loadHistory(){

const res=await fetch("/transactions/"+phone);

const data=await res.json();

if(!data.success){

alert(data.message);

return;

}

history.innerHTML="";

if(data.transactions.length===0){

history.innerHTML="<h3>No Transactions Found</h3>";

return;

}

data.transactions.forEach(item=>{

history.innerHTML+=`

<div class="card">

<div class="type">${item.type}</div>

<div class="amount">${item.amount} ETB</div>

<div class="status">${item.status}</div>

<div>${item.reference||""}</div>

<div class="date">

${new Date(item.createdAt).toLocaleString()}

</div>

</div>

`;

});

}

loadHistory();