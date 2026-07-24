const subject=document.getElementById("subject");
const message=document.getElementById("message");
const sendBtn=document.getElementById("sendBtn");

sendBtn.onclick=async()=>{

const phone=localStorage.getItem("phone");

if(!phone){

alert("Please login first.");

return;

}

if(subject.value===""){

alert("Enter subject.");

return;

}

if(message.value===""){

alert("Enter message.");

return;

}

const res=await fetch("/support",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

phone,

subject:subject.value,

message:message.value

})

});

const data=await res.json();

alert(data.message);

if(data.success){

subject.value="";

message.value="";

}

};