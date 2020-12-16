let records = [];
let myChart;

fetch("/api/record")
  .then(response => {
    return response.json();
  })
  .then(data => {
    records = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  let total = records.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  records.forEach(record => {

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.name}</td>
      <td>${record.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  
  let reversed = records.slice().reverse();
  let sum = 0;

  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });


  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
      data: {
        labels,
        datasets: [{
            label: "Total Over Time",
            fill: true,
            backgroundColor: "rgb(255, 0, 191)",
            data
        }]
    }
  });
}

function sendrecord(isAdding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let record = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };
  if (!isAdding) {
    record.value *= -1;
  }


  records.unshift(record);

  populateChart();
  populateTable();
  populateTotal();
  

  fetch("/api/record", {
    method: "POST",
    body: JSON.stringify(record),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
  .then(response => {    
    return response.json();
  })
  .then(data => {
    if (data.errors) {
      errorEl.textContent = "Missing Information";
    }
    else {
      // clear form
      nameEl.value = "";
      amountEl.value = "";
    }
  })
  .catch(err => {
    // fetch failed, so save in indexed db
    saveRecord(record);

    // clear form
    nameEl.value = "";
    amountEl.value = "";
  });
}

document.querySelector("#add-btn").onclick = function() {
  sendrecord(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendrecord(false);
};
