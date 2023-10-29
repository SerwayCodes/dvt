"use strict";

//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------

$(document).ready(function () {
  const maxDataPoints = 10;

  const chartType = "bar";
  let chart1, chart2, chart3;

  //=======================================================================================================================================
  // HEART RATE
  //=======================================================================================================================================

  // Function to prefetch data from the server
  function prefetchData() {
    $.get("/api/prefetch-chart-data", function (data) {
      // Remove older data points if the count exceeds maxDataPoints
      while (options1.series[0].data.length > maxDataPoints) {
        options1.series[0].data.shift();
        options1.xaxis.categories.shift();
      }

      while (options2.series[0].data.length > maxDataPoints) {
        options2.series[0].data.shift();
        options2.xaxis.categories.shift();
      }

      while (options3.series[0].data.length > maxDataPoints) {
        options3.series[0].data.shift();
        options3.xaxis.categories.shift();
      }
      // Update the chart with new options
      chart1.updateOptions(options1);
      chart2.updateOptions(options2);
      chart3.updateOptions(options3);
    });
  }

  function getHeartRateIcon(hr) {
    if (hr >= 0 && hr <= 40) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FF0000;"></i>';
    } else if (hr > 40 && hr <= 59) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FFA500;"></i>';
    } else if (hr > 59 && hr <= 90) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #fff;"></i>';
    } else if (hr > 90 && hr <= 170) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FFA500;"></i>';
    } else {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FF0000;"></i>';
    }
  }

  const dataPoints = [];

  // Function to update the chart
  function updateChart() {
    $.get("/api/chart-data", function (data) {
      if (data.hr !== null) {
        // Determine color based on heart rate range
        let color;
        let notification = "";
        if (data.hr >= 0 && data.hr <= 40) {
          notification = "  Critically Low";
          //criticaly low
          color = "#D80032";
        } else if (data.hr > 40 && data.hr <= 59) {
          notification = "  Too low";
          // too low
          color = "#EE9322";
        } else if (data.hr > 60 && data.hr <= 90) {
          notification = "  Normal";
          //normal
          color = "#00EF00";
        } else if (data.hr > 90 && data.hr <= 170) {
          notification = "  Too high";
          //too high
          color = "#EE9322";
        } else {
          notification = "  Critically High";
          //critically high
          color = "#D80032";
        }

        // Create a data point with x, y, and color properties
        const dataPoint = {
          x: new Date().toLocaleTimeString(),
          y: data.hr,
          fillColor: color, // Use 'fillColor' for setting the point color
        };

        const heartRateIcon = getHeartRateIcon(data.hr);
        //=================================================================================================================

        updateTable(data);

        // Add the new data point to the list
        dataPoints.push(dataPoint);

        // Calculate the timestamp for 1 minute ago
        const oneMinuteAgo = new Date();
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

        // Filter out data points older than 1 minute
        const filteredDataPoints = dataPoints.filter((point) => {
          return new Date(point.x) > oneMinuteAgo;
        });

        // Calculate the average of heart rate values
        const total = filteredDataPoints.reduce((acc, point) => {
          return acc + point.y;
        }, 0);
        const averageHeartRate = total / filteredDataPoints.length;

        // Update x-axis categories with dynamically moving time
        options1.xaxis.categories.push(dataPoint.x);

        // Remove the oldest category if the count exceeds maxDataPoints
        if (options1.xaxis.categories.length > maxDataPoints) {
          options1.xaxis.categories.shift();
        }

        // Update chart data with the new data point
        options1.series[0].data.push(dataPoint);

        // Remove the oldest data point if the count exceeds maxDataPoints
        if (options1.series[0].data.length > maxDataPoints) {
          options1.series[0].data.shift();
        }

        // Update the chart with new options
        chart1.updateOptions(options1);
        // Update the average heart rate in the HTML element
        const averageHeartRateElement =
          document.getElementById("average-heart-rate");
        averageHeartRateElement.textContent = data.hr + " bpm";

        const hrnotification = document.getElementById("hrnoti");
        hrnotification.textContent = notification;

        const hrIconElement = document.getElementById("hr-icon");
        hrIconElement.innerHTML = heartRateIcon;
      }
    });
  }

  var options1 = {
    chart: {
      type: chartType,
      height: 350,
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#D80032", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
    series: [
      {
        name: "Heart Rate",
        data: [],
      },
    ],
    xaxis: {
      categories: [],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value;
        },
      },
      tickAmount: 10, // Set the number of ticks (adjust according to your preference)
      min: 0, // Set the minimum value of the y-axis
      max: 250, // Set the maximum value of the y-axis
      title: {
        text: "Heart Rate",
      },
    },
    markers: {
      size: 6,
      colors: ["#D80032", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  chart1 = new ApexCharts(document.querySelector("#apexcharts-1"), options1);
  chart1.render();

  // Prefetch data first
  prefetchData();

  // Call the updateChart function every 1 seconds
  setInterval(updateChart, 1000);

  //=======================================================================================================================================
  //RESPIRATORY RATE
  //=======================================================================================================================================

  var options2 = {
    chart: {
      type: chartType,
      height: 350,
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#00EF00", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
    series: [
      {
        name: "Respiratory Rate",
        data: [],
      },
    ],
    xaxis: {
      categories: [],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value;
        },
      },
      tickAmount: 10, // Set the number of ticks (adjust according to your preference)
      min: 0, // Set the minimum value of the y-axis
      max: 100, // Set the maximum value of the y-axis
      title: {
        text: "Respiratory Rate",
      },
    },
    markers: {
      size: 6,
      colors: ["#D80032", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  chart2 = new ApexCharts(document.querySelector("#apexcharts-2"), options2);
  chart2.render();
  setInterval(fetchDataForChart2, 1000);

  function getRespIcon(resp) {
    if (resp >= 0 && resp <= 5) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #D80032;"></i>';
    } else if (resp > 5 && resp <= 9) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FFA500;"></i>';
    } else if (resp > 9 && resp <= 30) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #fff;"></i>';
    } else if (resp > 30 && resp <= 60) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FFA500;"></i>';
    } else {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FF0000;"></i>';
    }
  }

  function fetchDataForChart2() {
    $.get("/api/chart-data", function (data) {
      if (data.resp !== null) {
        // Determine color based on heart rate range
        let color;
        let notification ='';
        if (data.resp >= 0 && data.resp <= 5) {
          notification = "  Critically Low";
          // criticaly low
          color = "#D80032";
        } else if (data.resp >= 5 && data.resp < 9) {
          notification = "  Too Low";
          //TO0 LOW
          color = "#EE9322";
        } else if (data.resp >= 9 && data.resp < 30) {
          notification = "  Normal";
          //NORMAL
          color = "#00EF00";
        } else if (data.resp >= 30 && data.resp < 60) {
          notification = "  Too high";

          color = "#EE9322";
        } else {
          notification = "  Critically High";
          color = "#D80032";
        }

        // Create a data point with x, y, and color properties
        const dataPoint = {
          x: new Date().toLocaleTimeString(),
          y: data.resp,
          fillColor: color, // Use 'fillColor' for setting the point color
        };

        const respIcon = getRespIcon(data.resp);
        // Update x-axis categories with dynamically moving time
        options2.xaxis.categories.push(dataPoint.x);

        // Remove the oldest category if the count exceeds maxDataPoints
        if (options2.xaxis.categories.length > maxDataPoints) {
          options2.xaxis.categories.shift();
        }

        // Update chart data with the new data point
        options2.series[0].data.push(dataPoint);

        // Remove the oldest data point if the count exceeds maxDataPoints
        if (options2.series[0].data.length > maxDataPoints) {
          options2.series[0].data.shift();
        }

        // Update the chart with new options
        chart2.updateOptions(options2);

        const averageRespElement = document.getElementById("average-resp-rate");
        averageRespElement.textContent = data.resp + "min";

        const respnotification = document.getElementById("Respnoti");
        respnotification.textContent = notification;

        const respIconElement = document.getElementById("resp-icon");
        respIconElement.innerHTML = respIcon;
      }
    });
  }

  //=======================================================================================================================================
  //SPO2
  //=======================================================================================================================================

  var options3 = {
    chart: {
      type: chartType,
      height: 350,
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#D80032", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
    series: [
      {
        name: "SPO2",
        data: [],
      },
    ],
    xaxis: {
      categories: [],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value;
        },
      },
      tickAmount: 10, // Set the number of ticks (adjust according to your preference)
      min: 60, // Set the minimum value of the y-axis
      max: 100, // Set the maximum value of the y-axis
      title: {
        text: "SPO2",
      },
    },
    markers: {
      size: 6,
      colors: ["#D80032", "#EE9322", "#00EF00", "#EE9322", "#D80032"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  chart3 = new ApexCharts(document.querySelector("#apexcharts-3"), options3);
  chart3.render();

  setInterval(fetchDataForChart3, 1000);

  function getSpo2Icon(spo2) {
    if (spo2 >= 60 && spo2 <= 80) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FF0000;"></i>';
    } else if (spo2 > 80 && spo2 <= 85) {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #FFA500;"></i>';
    } else {
      return '<i class="fa-solid fa-caret-up fa-2xl" style="color: #fff;"></i>';
    }
  }

  function fetchDataForChart3() {
    $.get("/api/chart-data", function (data) {
      if (data.spo2 !== null) {
        // Determine color based on heart rate range
        let color;
        let notification = "";
        if (data.spo2 >= 60 && data.spo2 <= 80) {
          notification = "  Critically Low";
          //CRTICALLY LOW
          color = "#D80032";
        } else if (data.spo2 > 80 && data.spo2 <= 85) {
          notification = "  Too Low";
          //TOO LOW
          color = "#EE9322";
        } else if (data.spo2 > 85 && data.spo2 < 100) {
          notification = "  Normal";
          // NORMAL
          color = "#00EF00";
        } else {
          notification = "  Critically High";
          color = "#D80032";
        }

        // Create a data point with x, y, and color properties
        const dataPoint = {
          x: new Date().toLocaleTimeString(),
          y: data.spo2,
          fillColor: color, // Use 'fillColor' for setting the point color
        };

        const spo2Icon = getSpo2Icon(data.spo2);
        // Update x-axis categories with dynamically moving time
        options3.xaxis.categories.push(dataPoint.x);

        // Remove the oldest category if the count exceeds maxDataPoints
        if (options3.xaxis.categories.length > maxDataPoints) {
          options3.xaxis.categories.shift();
        }

        // Update chart data with the new data point
        options3.series[0].data.push(dataPoint);

        // Remove the oldest data point if the count exceeds maxDataPoints
        if (options3.series[0].data.length > maxDataPoints) {
          options3.series[0].data.shift();
        }

        // Update the chart with new options
        chart3.updateOptions(options3);

        const averagespo2Element = document.getElementById("average-spo2-rate");
        averagespo2Element.textContent = data.spo2 + "%";

        const spo2notification = document.getElementById("spo2noti");
        spo2notification.textContent = notification;

        const spo2IconElement = document.getElementById("spo2-icon");
        spo2IconElement.innerHTML = spo2Icon;
      }
    });
  }

  function updateTable(data) {
    const tableBody = document.querySelector("#data-table tbody");
    const newRow = document.createElement("tr");

    // Create and append table cells for each data field
    const timeCell = document.createElement("td");
    timeCell.textContent = new Date().toLocaleTimeString();
    newRow.appendChild(timeCell);

    const heartRateCell = document.createElement("td");
    heartRateCell.textContent = data.hr + " bpm";
    newRow.appendChild(heartRateCell);

    const respiratoryRateCell = document.createElement("td");
    respiratoryRateCell.textContent = data.resp + " min";
    newRow.appendChild(respiratoryRateCell);

    const spo2Cell = document.createElement("td");
    spo2Cell.textContent = data.spo2 + "%";
    newRow.appendChild(spo2Cell);

    // Append the new row to the table
    tableBody.appendChild(newRow);

    // Remove the first row if there are more than 15 rows
    const rowCount = tableBody.children.length;
    if (rowCount > 15) {
      tableBody.removeChild(tableBody.children[0]);
    }
  }

  //=======================================================================================================================================
});
