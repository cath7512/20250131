// economygraph.js
import { Chart, registerables } from 'chart.js';
import cityEconomyData from '../assets/city_economy.json';
Chart.register(...registerables);

let economyChart = null;

export function createEconomyChart(city) {
    if (economyChart) {
      economyChart.destroy();
    }
    
    const countryData = cityEconomyData.find(country => country.country === city.code); // Use city.code
  
    if (!countryData || !countryData.gdp_per_capita) { // Check for country data and gdp_per_capita
      console.error(`No economy data found for ${city.code}`);
      const ctx = document.getElementById('economyChart').getContext('2d');
      if (ctx) { // Clear canvas if it exists
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      return;
    }
    
    const labels = Object.keys(countryData.gdp_per_capita);
    const gdpValues = Object.values(countryData.gdp_per_capita);
  
    const formattedGDPValues = gdpValues.map(value => {
      const roundedValue = Math.round(value);
      return '$' + roundedValue.toLocaleString('en-US');
    });
  
    const ctx = document.getElementById('economyChart').getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context.  Chart cannot be created.");
      return;
    }
  
    economyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'GDP per capita',
          data: formattedGDPValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        }],
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
          y: {
            display: true,
            title: {
              display: true,
              text: 'GDP per capita (USD)',
            },
          },
        },
      },
    });
  }