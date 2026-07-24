async function login(){

const username=document.getElementById("username").value;
const password=document.getElementById("password").value;

try{

const response=await fetch("/admin/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username:username,
password:password

})

});

const data=await response.json();

if(data.success){

localStorage.setItem("adminToken",data.token);

window.location.href="/admin.html";

}else{

alert(data.message);

}

}catch(err){

alert("Server error");

console.log(err);

}

}