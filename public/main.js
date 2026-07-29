window.onload=function(){

    let user =
    localStorage.getItem("userId");


    if(!user){

        localStorage.setItem(
            "userId",
            Date.now()
        );

    }

};