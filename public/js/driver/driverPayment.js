fetch("/driver/earnings-data")
  .then((res) => res.json())
  .then(({ data }) => {
    console.log(data);
    const driver_earnings = document.getElementById("driver_earnings");
    const allTabs = document.querySelectorAll(".tabs");
    allTabs.forEach((activeTab) => {
      console.log(data);

      document.getElementById(
        "current_balance_amount"
      ).innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i>${data["This_Month"][0].payment}`;

      // console.log(data[activeTab.id]);
      if (activeTab.classList.contains("active")) {
        // console.log(activeTab.id);
        driver_earnings.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i>${
          data[activeTab.id][0].payment
        }`;
      }
    });

    const label = data.rows.map((label) => {
      return `${label.label}-${label.period_number}`;
    });
    const fare_amount = data.rows.map((fare_amount) => {
      return fare_amount.fare_amount;
    });
    console.log(label);
    console.log(fare_amount);

    let xValues = label;
    let yValues = fare_amount;
    let barColors = ["#b91d47", "#00aba9", "#2b5797", "#e8c3b9", "#1e7145"];

    new Chart("myChart", {
      type: "pie",
      data: {
        labels: xValues,
        datasets: [
          {
            backgroundColor: barColors,
            data: yValues,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "World Wide Wine Production 2018",
        },
      },
    });
  })
  .catch((err) => console.log(err));

const allTabs = document.querySelectorAll(".tabs");

allTabs.forEach((tabs) => {
  tabs.addEventListener("click", () => {
    allTabs.forEach((tabs) => {
      tabs.classList.remove("active");
    });
    tabs.classList.add("active");

    fetch("/driver/earnings-data")
      .then((res) => res.json())
      .then(({ data }) => {
        const driver_earnings = document.getElementById("driver_earnings");
        const allTabs = document.querySelectorAll(".tabs");
        allTabs.forEach((activeTab) => {
          // console.log(activeTab.id);
          // console.log(data);

          // console.log(data[activeTab.id]);
          if (activeTab.classList.contains("active")) {
            // console.log(activeTab.id);
            driver_earnings.innerHTML = `<i class="fa-solid fa-indian-rupee-sign"></i>${
              data[activeTab.id][0].payment
            }`;
          }
        });
      })
      .catch((err) => console.log(err));
  });
});

document.getElementById("submit_dates")?.addEventListener("click", async () => {
  // console.log('kk');

  // console.log(document.getElementById("start_date").value);
  // console.log(document.getElementById("end_date").value);

  const response = await fetch("/driver/dates", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_date: document.getElementById("start_date").value,
      end_date: document.getElementById("end_date").value,
      groupby: document.getElementById("groupby").value,
    }),
  });
  const { data } = await response.json();
  console.log("data post ");
  // document.getElementById("myChart")?.remove();
  // document.getElementById('otherContent').innerHTML+=`<canvas id="myChart" style="width: 100%; max-width: 700px"></canvas>`;
  console.log(data);

  const label = data.rows.map((label) => {
    return `${label.label}-${label.period_number}`;
  });
  const fare_amount = data.rows.map((fare_amount) => {
    return fare_amount.fare_amount;
  });
  console.log(label);
  console.log(fare_amount);

  let xValues = label;
  let yValues = fare_amount;
  let barColors = ["#b91d47", "#00aba9", "#2b5797", "#e8c3b9", "#1e7145"];
  // <canvas id="myChart" style="width: 100%; max-width: 700px"></canvas>


  new Chart("myChart", {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "World Wide Wine Production 2018",
      },
    },
  });
});
