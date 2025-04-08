// script.js
const inputs = document.querySelector("#inputBox");
const signupBtn = document.querySelector("#inputBox");
const input = document.querySelectorAll(".input");
const verifyBtn = document.querySelector("#verify")
const message = document.querySelector("#msg")

inputs.addEventListener("input", function (e) {
    const target = e.target;
    const val = target.value;

    if (isNaN(val)) {
        target.value = "";
        return;
    }

    if (val != "") {
        const next = target.nextElementSibling;
        if (next) {
            next.focus();
        }
    }
});

inputs.addEventListener("keyup", function (e) {
    const target = e.target;
    const key = e.key.toLowerCase();

    if (key == "backspace" || key == "delete") {
        target.value = "";
        const prev = target.previousElementSibling;
        if (prev) {
            prev.focus();
        }
        return;
    }
});

verifyBtn.addEventListener("click",async(e)=>{
    let otp = "";
    input.forEach(Element => {
        otp += Element.value;
    })

    let data = {
        otp : otp
    }

    console.log(otp)

    let response = await fetch("/uber/api/otp-verification",{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })

    let statusCode = response.status;

    response = await response.json();

    if(statusCode === 200){
        message.style.color = "green"
        message.innerHTML = response.message
        location.href = "/create-profile"
    }else{
        message.style.color = "red"
        message.innerHTML = response.error
        input.forEach(Element => {
            Element.value = ""
        })
    }

    console.log(response)
})
