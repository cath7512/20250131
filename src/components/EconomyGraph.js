// economygraph.js
import { Chart, registerables } from 'chart.js';
import cityEconomyData from '../assets/city_economy.json';
Chart.register(...registerables);

let economyChart = null;

export function createEconomyChart(city) {
  const canvas = document.getElementById('economyChart');
  if (!canvas) return;

  // 1. Destroy existing chart
  if (economyChart) {
    economyChart.destroy();
  }

  const countryData = cityEconomyData.find(country => country.country === city.code);

  if (!countryData || !countryData.gdp_per_capita || !countryData.population) {
    console.error(`No economy or population data found for ${city.code}`);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const labels = Object.keys(countryData.gdp_per_capita);
  const gdpValues = Object.values(countryData.gdp_per_capita);
  const populationValues = Object.values(countryData.population);

  // Set canvas dimensions
  const parentWidth = canvas.parentElement.offsetWidth;
  const canvasWidth = Math.min(parentWidth, 400);
  const canvasHeight = 300;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("Could not get canvas context. Chart cannot be created.");
    return;
  }

  economyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { // GDP per capita dataset
          label: 'GDP per capita',
          data: gdpValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          yAxisID: 'yGDP' // Assign to the left y-axis
        },
        { // Population dataset
          label: 'Population',
          data: populationValues,
          borderColor: 'rgba(255, 99, 132, 1)', // Red color for population
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          yAxisID: 'yPopulation'
        }
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Year',
          },
        },
        yGDP: { // Left y-axis for GDP
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'GDP per Capita ($)',
          },
        },
        yPopulation: { // Right y-axis for Population
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Population',
          },
        },
      },
    },
  });
}
