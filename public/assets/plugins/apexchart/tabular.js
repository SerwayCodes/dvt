"use strict";

//------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------

$(document).ready(function () {
  const maxDataPoints = 10;

  const chartType=  'line'
  let chart1, chart2,chart3;

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
  
    const dataPoints = [];
    // Function to update the chart
    function updateChart() {
      $.get("/api/chart-data", function (data) {
        if (data.hr !== null) {
          // Determine color based on heart rate range
          let color;
          if (data.hr >= 0 && data.hr <= 40) {
            //criticaly low
            color = "#D80032";
          } else if (data.hr > 40 && data.hr <= 59) {
            // too low
            color = "#EE9322";
          } else if (data.hr > 60 && data.hr <= 90) {
            //normal
            color = "#00EF00";
          } else if (data.hr > 90 && data.hr <= 170) {
            //too high
            color = "#EE9322";
          } else {
            //critically high
            color = "#D80032";
          }
  
          // Create a data point with x, y, and color properties
          const dataPoint = {
            x: new Date().toLocaleTimeString(),
            y: data.hr,
            fillColor: color, // Use 'fillColor' for setting the point color
          };
  


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
          const averageHeartRateElement = document.getElementById('average-heart-rate');
          averageHeartRateElement.textContent = data.hr + ' bpm';
        }
      });
    }
  
    var options1 = {
      chart: {
        type:chartType,
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
        tickAmount:10, // Set the number of ticks (adjust according to your preference)
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
  
    chart1 = new ApexCharts(
      document.querySelector("#apexcharts-1"),
      options1
    );
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
      
  
  function fetchDataForChart2()  {
      $.get("/api/chart-data", function (data) {
        if (data.resp !== null) {
          // Determine color based on heart rate range
          let color;
          if (data.resp >= 0 && data.resp <= 5) {
            // criticaly low
            color = "#D80032";
          } else if (data.resp >= 5 && data.resp <9) {
            //TO0 LOW
            color = "#EE9322";
          } else if (data.resp >= 9 && data.resp < 30) {
            //NORMAL
            color = "#00EF00";
          } else if (data.resp >= 30 && data.resp < 60) {
            color = "#EE9322";
          } else {
            color = "#D80032";
          }
  
          // Create a data point with x, y, and color properties
          const dataPoint = {
            x: new Date().toLocaleTimeString(),
            y: data.resp,
            fillColor: color, // Use 'fillColor' for setting the point color
          };
  
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

          const averageRespElement = document.getElementById('average-resp-rate');
          averageRespElement.textContent = data.resp + 'min';
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
      
  
      function fetchDataForChart3()  {
          $.get("/api/chart-data", function (data) {
            if (data.spo2 !== null) {
              // Determine color based on heart rate range
              let color;
              if (data.spo2 >= 60 && data.spo2 <= 80) {
                //CRTICALLY LOW
                color = "#D80032";
              } else if (data.spo2 > 80 && data.spo2 <= 85) {
                //TOO LOW
                color = "#EE9322";
              } else if (data.spo2 > 85 && data.spo2 < 100) {
                // NORMAL
                color = "#00EF00";
              }  else {
                color = "#D80032";
              }
      
              // Create a data point with x, y, and color properties
              const dataPoint = {
                x: new Date().toLocaleTimeString(),
                y: data.spo2,
                fillColor: color, // Use 'fillColor' for setting the point color
              };
      
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
              const averagespo2Element = document.getElementById('average-spo2-rate');
              averagespo2Element.textContent = data.spo2 + '%';
            }
          });
        }
  
  //=======================================================================================================================================
  






    
});

