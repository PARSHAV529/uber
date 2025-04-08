async function routeCheck() {
  try {
    const resp = await fetch("/uber/api/admin/protected-route", {
      method: "GET",
    });

    const data = await resp.json();
    if (resp.status === 200) {
      setDetails();
    } else if (resp.status === 401 || (await resp.status) === 403) {
      window.location.href = "/uber/admin/login";
    }
  } catch (e) {
    console.log(e);
  }
}

async function setDetails() {
  const driver_id = localStorage.getItem("driverProfile");
  try {
    const resp = await fetch("/uber/api/admin/driver", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ driver_id: driver_id }),
    });
    const data = await resp.json();
    if (resp.status === 200) {
      console.log(data.data);
      localStorage.removeItem("driverId");
    } else if (resp.status === 401 || resp.status === 403) {
      window.location.href = "/uber/admin/login";
      localStorage.removeItem("driverId");
    }
  } catch (e) {
    console.log(e);
  }
}
