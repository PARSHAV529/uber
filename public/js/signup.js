const email = document.querySelector("#email");
const signupBtn = document.querySelector("#signupBtn");
const message = document.querySelector("#msg")

signupBtn.addEventListener("click",async(e)=> {
    console.log(email.value)

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

    console.log(statusCode)

    response = await response.json();
    console.log(response)

    if(statusCode === 200){
       message.innerHTML = response.message;
       message.style.color = "green"

       setTimeout(() => {
            location.href = "/otp-varification"
       }, 1000);
    }else{
        message.innerHTML = response.error;
        message.style.color = "red"
    }
})