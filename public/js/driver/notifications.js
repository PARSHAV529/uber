
const cbNotificationData = () => {
    setTimeout(async function getNotificationData() {
        let response = await fetch("/uber/api/get-notification-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        response = await response.json();
        const notification = document.getElementById("notifications1");
        notification.innerHTML = "";

        if (response.data.data.length > 0) {

            response.data.data.forEach((ele) => {
                const newDiv = document.createElement("div");

                newDiv.setAttribute("class", "notification-details");

                if (ele.read_status == 'un_read') {
                    //  newDiv.setAttribute("class" , "unReadedNotifiaction");  
                    newDiv.classList.add("unReadedNotifiaction")

                }
                newDiv.innerHTML = `
                <div class="notification-header">
                    <h4 class="notification-subject">${ele.message_subject}</h4>
                    <span class="notification-time">${ele.formattedTime}</span>
                </div>
                <div class="message_para">
                <div class="arrow" >
                <p class="notification-text" style="width: 85%; " >${ele.message_text}</p>
                <p><i class="fa fa-solid fa-arrow-right"></i></p>
                </div
                </div>
                `;

                newDiv.onclick = async function () {
                    popupNotification(ele);

                    let result = await fetch(`/uber/api/update-notification-count/${ele.id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        }
                    })
                    result = await result.json();
                    newDiv.classList.remove('unReadedNotifiaction');

                };

                notification.appendChild(newDiv);
            });
        }
        else {
            const newDiv = document.createElement("div");
            newDiv.setAttribute("class", "blank-notification");
            newDiv.innerHTML = `
            <p> Currently No Notifications Received !</p>
        `;
            notification.appendChild(newDiv);

        }

        cbNotificationData();
    }
        , 1000);


}
cbNotificationData();

function popupNotification(ele) {
    document.getElementById("popupBackground").style.display = "block";
    document.getElementById("main").innerHTML = `
        <div style="background-color: white; border-radius: 8px; padding: 20px; width: 500px; position: absolute; box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px; top: 35%; left: calc(50vw - 250px); font-family: 'Arial', sans-serif; color: #333;">
            <span style="position: absolute; top: 10px; right: 10px; font-size: 24px; cursor: pointer; color: #aaa; transition: color 0.3s;" 
                  onmouseover="this.style.color='#ff0000'" 
                  onmouseout="this.style.color='#aaa'" 
                  onclick="offPopupNotification()"><i class="fa fa-times-circle" aria-hidden="true"></i></span>
            <span style="margin: 0; font-weight: bold; font-size: 18px; color: #222; padding-right : 6px">${ele.message_subject}</span>
            <span style="margin: 5px 0; font-size: 14px; color: #666; display : inline;">${ele.formattedTime}</span>
            <p style="margin: 5px 0; font-size: 16px; line-height: 1.5;">${ele.message_text}</p>
        </div>
    `;
}


function offPopupNotification() {
    document.getElementById("popupBackground").style.display = "none";
}

const profile = document.querySelector(".profile");
profile.style.cursor = "pointer"

  profile.addEventListener("click",(e)=>{
    // console.log(e.currentTarget);
    location.href = '/uber/driver/profile'
  })



 