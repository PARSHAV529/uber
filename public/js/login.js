const form = document.getElementById("loginForm");
const btnLogin = document.getElementById("btnLogin");

btnLogin.addEventListener("click", async () => {
  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  console.log(data);
  const responsetxt = await fetch(`/uber/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });

  let statusCode = responsetxt.status;
  const response = await responsetxt.json();

  if(statusCode === 200){
    setTimeout(() => {
      location.href = "driver/home"
    }, 1000);
  }

  console.log("response Text :", response);
});

const imgBtn = document.getElementById("img-pwd");
imgBtn.addEventListener("click", () => {
  const field = document.getElementById("password");
  if (field.type == "password") {
    field.type = "text";
    imgBtn.src = "source/hide_pwd.png";
  } else {
    field.type = "password";
    imgBtn.src = "source/show_pwd.png";
  }
});