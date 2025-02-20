import { Chart } from 'chart.js/auto'; // Use auto-import for automatic registration
import cityEconomyData from '../assets/city_economy.json';
import { createWorldBankChart, updateWorldBankChart } from './EconomyGraph_WorldBank';

let economyChart = null;

function createEconomyChart(city) {
  const canvas = document.getElementById('economyChart');
  if (!canvas) {
    console.error('Economy chart canvas not found');
    return;
  }

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

  try {
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
  } catch (error) {
    console.error('Error creating economy chart:', error);
  }
}

async function createEconomyCharts(city) {
  // Create GDP and Population chart
  createEconomyChart(city);

  // Create initial World Bank chart with CPI data
  await createWorldBankChart(city);
}

// 새로운 함수 추가
function updateWorldBankIndicator(city, indicator) {
  updateWorldBankChart(city, indicator);
}

export {
  createEconomyChart,
  createEconomyCharts,
  updateWorldBankIndicator
};
