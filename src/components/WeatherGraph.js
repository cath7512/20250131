import { Chart, registerables } from 'chart.js';
import { WEATHER_API_KEY } from '../constants/constants.js';

Chart.register(...registerables);

let weatherForecastChart = null;
let weatherHistoryChart = null;

export function createWeatherForecastChart(cityData) {
    
    if (weatherForecastChart) {
        weatherForecastChart.destroy();
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityData.coordinates.lat}&lon=${cityData.coordinates.lng}&appid=${WEATHER_API_KEY}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.list) {
                console.error('No weather data available');
                return;
            }

            const dailyTemps = {};

            data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // DD-MMM format
                const temp = forecast.main.temp;

                if (!dailyTemps[day]) {
                    dailyTemps[day] = { min: temp, max: temp };
                } else {
                    dailyTemps[day].min = Math.min(dailyTemps[day].min, temp);
                    dailyTemps[day].max = Math.max(dailyTemps[day].max, temp);
                }
            });

            const labels = Object.keys(dailyTemps);
            const minTemps = labels.map(day => dailyTemps[day].min);
            const maxTemps = labels.map(day => dailyTemps[day].max);

            const ctx = document.getElementById('weatherForecastChart').getContext('2d');
            weatherForecastChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Max(°C)',
                            data: maxTemps,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false
                        },
                        {
                            label: 'Min(°C)',
                            data: minTemps,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

export function createWeatherHistoryChart(cityData) {
    const ctx = document.getElementById('weatherHistoryChart').getContext('2d');
    
    if (weatherHistoryChart) {
        weatherHistoryChart.destroy();
    }

    weatherHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(cityData.monthly_weather).map(month => new Date(Date.parse(month +" 1, 2024")).getMonth() + 1), // Convert month names to numbers
            datasets: [
                {
                    label: 'Avg high(°C)',
                    data: Object.values(cityData.monthly_weather).map(month => month.max),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                    yAxisID: 'y-temp'
                },
                {
                    label: 'Avg low(°C)',
                    data: Object.values(cityData.monthly_weather).map(month => month.min),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                    yAxisID: 'y-temp'
                },
                {
                    label: 'precip(mm)',
                    data: Object.values(cityData.monthly_weather).map(month => month.precipitation),
                    type: 'bar',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'y-precip'
                },
                {
                    label: 'AQI(PM2.5)',
                    data: Object.values(cityData.monthly_weather).map(month => month.air_quality),
                    type: 'bar',
                    borderColor: 'rgba(192, 132, 75, 0.09)',
                    backgroundColor: 'rgba(192, 132, 75, 0.2)',
                    yAxisID: 'y-AQI'
                }                
            ]
        },
        options: {
            responsive: true,
            scales: {
                'y-temp': {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                'y-precip': {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Precipitation (mm)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                'y-AQI': {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'PM2.5(µg/m³)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }                
            }
        }
    });
}
