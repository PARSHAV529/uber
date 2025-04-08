function toggleDropdown() {
    console.log("toggle");
    const dropdown = document.getElementById("aboutDropdown");
    const toggleLink = document.querySelector("#About");
    dropdown.classList.toggle("show");
    toggleLink.setAttribute(
      "aria-expanded",
      dropdown.classList.contains("show")
    );
  }

  window.onclick = function (event) {
    if (!event.target.matches("#About")) {
      const dropdowns = document.getElementsByClassName("dropdown");
      for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("show")) {
          openDropdown.classList.remove("show");
          const toggleLink = document.querySelector("#About");
          toggleLink.setAttribute("aria-expanded", "false");
        }
      }
    }
  };

  window.addEventListener("load", async() => {
    console.log("get details");
    generateCard();
    document.getElementById('otp').addEventListener('click', async () => {
        const response = await fetch("/uber/api/rider/update-password-otp",{
            method: 'GET'
        });

        if (response.status === 201) {
        let data = await response.json();

        alert("password updated successfully")
        window.location.href = 'security'
        } else {
        let data = await response.json();
        console.log(data.message);
        }
    })
  });
    
  function createBreak(){
    return document.createElement('br');
    }

  function generateCard() {
   
    var form = document.getElementById('form');

    var password = document.createElement('input');
    var label = document.createElement('label');
    label.innerText = 'New Password'
    password.setAttribute('class','password');
    password.value = "";
    form.appendChild(label)
    form.appendChild(createBreak())
    form.appendChild(password);
    form.appendChild(createBreak())
    form.appendChild(createBreak())

    var confirmpwd = document.createElement('input');
    var label = document.createElement('label');
    label.innerText = 'Confirm Password'
    confirmpwd.setAttribute('class','confirmpwd');
    confirmpwd.value = "";
    form.appendChild(label)
    form.appendChild(createBreak())
    form.appendChild(confirmpwd);
    form.appendChild(createBreak())
    form.appendChild(createBreak())

    document.getElementById('otp').addEventListener('click', function(){

        document.getElementById('otp').style = "visibility: hidden"
        
        var otp = document.createElement('input');
        var label = document.createElement('label');
        label.innerText = 'Enter OTP'
        otp.setAttribute('class','otp');
        otp.value = "";
        form.appendChild(label)
        form.appendChild(createBreak())
        form.appendChild(otp);
        form.appendChild(createBreak())
        form.appendChild(createBreak())

        var btn = document.createElement('button')
        btn.innerText = "Save Changes"
        btn.setAttribute('type','submit')
        form.appendChild(btn);
    
        btn.addEventListener('click', async function(event){
            event.preventDefault();
            const response = await fetch("/uber/api/rider/update-password",{
                method: 'POST',
                headers: {
                    "content-type": "application/json",
                  },
                body: JSON.stringify({
                    password: password.value,
                    confirmpwd: confirmpwd.value,
                }),
            });
    
            if (response.status === 201) {
            let data = await response.json();
    
            alert("password updated successfully")
            window.location.href = 'security'
            } else {
            let data = await response.json();
            console.log(data.message);
            }
    
        })

    })
    
  }
