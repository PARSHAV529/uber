const form = document.getElementById("loginForm");
const btnLogin = document.getElementById("btnLogin");
const message = document.getElementById("msg");

btnLogin.addEventListener("click", async () => {
  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  // console.log(data);
  const responsetxt = await fetch(`/uber/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let statusCode = responsetxt.status;
  const response = await responsetxt.json();

  if(statusCode === 200){
    message.style.display = "block"
    message.style.color = "green"
    message.innerHTML = response.message
    setTimeout(() => {
      location.href = response.data.url;
    }, 1000);

  }else{
    message.style.display = "block"
    message.style.color = "red"
    message.innerHTML = response.error
    location.href = response.data.url
  }

  // console.log("response Text :", response);
});

const imgBtn = document.getElementById("img-pwd");
imgBtn.addEventListener("click", () => {
  const field = document.getElementById("password");
  if (field.type == "password") {
    field.type = "text";
    imgBtn.src = "/source/show.png";
  } else {
    field.type = "password";
    imgBtn.src = "/source/hide.png";
  }
});
