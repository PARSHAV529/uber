const email = document.querySelector("#email");
const signupBtn = document.querySelector("#signupBtn");
const message = document.querySelector("#msg")
const loader = document.querySelector(".loader")
const signupTxt = document.querySelector("#signupTxt")

signupBtn.addEventListener("click",async(e)=> {

    loader.style.display = "block"
    signupTxt.style.display = "none"
    message.innerHTML = "";
    signupBtn.style.pointerEvents = "none"
    signupBtn.style.backgroundColor = "grey"
    signupBtn.style.cursor = "not-allowed"
    const data = {
        email : email.value
    }


    let response = await fetch("/uber/api/email-auth",{
        method : "POST",
        credentials : "include",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })

    let statusCode = response.status;

    // console.log(statusCode)

    response = await response.json();
    // console.log(response)

    if(statusCode === 200){
        loader.style.display = "none"
        signupTxt.style.display = "inline"
        signupBtn.style.backgroundColor = "black"
        message.style.color = "green"
        message.innerHTML = response.message;
       setTimeout(() => {
            location.href = "/uber/otp-varification"
       }, 1000);
    }else{
        loader.style.display = "none"
        message.style.color = "red"
        message.innerHTML = response.error;
        signupBtn.style.pointerEvents = "auto"
        signupBtn.style.backgroundColor = "black"
        signupBtn.style.cursor = "pointer"
        loader.style.display = "none"
        signupTxt.style.display = "inline"
    }
})