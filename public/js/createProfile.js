const showHideBtn1 = document.querySelector("#showHide1");
const showHideBtn2 = document.querySelector("#showHide2");
const passInput = document.querySelector("#password");
const cmfpassInput = document.querySelector("#cmfpassword");
const message = document.querySelector("#msg");
const submitBtn = document.querySelector("#submitBtn")

const fname = document.querySelector("#fname");
const lname = document.querySelector("#lname");
const phone = document.querySelector("#phone");
const password = document.querySelector("#password");

showHideBtn1.addEventListener("click",()=>{
    if(showHideBtn1.classList.contains("hide")){
        showHideBtn1.classList.remove("hide");
        showHideBtn1.setAttribute("src","/source/show.png")
        showHideBtn1.classList.add("show")
        passInput.setAttribute("type","text");
    }else{
        passInput.setAttribute("type","password")
        showHideBtn1.classList.remove("show");
        showHideBtn1.classList.add("hide");
        showHideBtn1.setAttribute("src","/source/hide.png")
    }
})

showHideBtn2.addEventListener("click",()=>{
    if(showHideBtn2.classList.contains("hide")){
        showHideBtn2.classList.remove("hide");
        showHideBtn2.setAttribute("src","/source/show.png")
        showHideBtn2.classList.add("show")
        cmfpassInput.setAttribute("type","text");
    }else{
        cmfpassInput.setAttribute("type","password")
        showHideBtn2.classList.remove("show");
        showHideBtn2.classList.add("hide");
        showHideBtn2.setAttribute("src","/source/hide.png")
    }
})

submitBtn.addEventListener("click",async(e)=>{
    let data = {
        fname : fname.value,
        lname : lname.value,
        password : passInput.value,
        cmfpassword : cmfpassInput.value,
        phone : phone.value
    }

    let response = await fetch("/uber/api/sign-up-details",{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(data)
    })

    let statusCode = response.status;

    response = await response.json();

    if(statusCode !== 200){
        message.innerHTML = response.error;
        message.style.color = "red";
    }else{
        message.innerHTML = response.message;
        message.style.color = "green";
        location.href= '/uploadDocument'
    }
})