const logoutBtn = document.querySelector("#logoutBtn")
const links = document.querySelectorAll(".links");

links.forEach(element => {
    console.log(element.href)
    if (element.href === location.href) {
        links.forEach(Element => {
            if (Element.classList.contains("active")) {
                Element.classList.remove("active")
            }
        })

        element.classList.add("active")
    } else {
        console.log("okay")
    }
});

logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault()
    let response = await fetch("/uber/api/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })

    let statusCode = response.status;

    response = await response.json();

    if (statusCode === 200) {
        alert("Logged out successfully...")
        location.href = response.data.url;
    } else {
        alert(`${response.error}`)
    }
})

const profile = document.querySelector(".profile");
profile.style.cursor = "pointer";

profile.addEventListener("click", (e) => {
    location.href = "/uber/driver/profile";
});

const func = () => {
    setTimeout(async () => {
        let result = await fetch(`/uber/api/get-notification-count`, {
            method: 'POST',
            headers: {
                "Content-ype": "application/json"
            }
        });
        result = await result.json();
        if (result.data.data[0]['count(*)']) {
            document.getElementById('badge').innerHTML = ""
            document.getElementById('badge').classList.add("badge")
            document.getElementById('badge').innerHTML = `${result.data.data[0]['count(*)']}`;
        }
        else {
            document.getElementById('badge').classList.remove("badge")
            document.getElementById('badge').innerHTML = ""
        }

        func();
    }, 1000);
}
func()