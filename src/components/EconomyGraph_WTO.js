import { Chart } from 'chart.js/auto'; // Use auto-import for automatic registration

let wtoChart = null;

function getDateRange() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  return {
    start: startYear,
    end: currentYear
  };
}

async function fetchWTOData(countryCode, indicator) {
  try {
    const { start, end } = getDateRange();
    const response = await fetch(
      `https://api.wto.org/timeseries/v1/data?country=${countryCode}&indicator=${indicator}&startYear=${start}&endYear=${end}`
    );
    const data = await response.json();
    return data ? data.reverse() : [];
  } catch (error) {
    console.error('Error fetching WTO data:', error);
    return [];
  }
}

async function createWTOChart(city, indicator) {
  const wtoCanvas = document.getElementById('wtoChart');
  if (!wtoCanvas) {
    console.error('WTO chart canvas not found');
    return;
  }

  if (wtoChart) {
    wtoChart.destroy();
  }

  const wtoData = await fetchWTOData(city.code, indicator);
  
  if (!wtoData.length) {
    console.error(`No WTO data found for ${city.code}`);
    return;
  }

  const years = wtoData.map(item => item.year);
  const values = wtoData.map(item => item.value);

  const ctx = wtoCanvas.getContext('2d');
  if (!ctx) {
    console.error("Could not get canvas context. Chart cannot be created.");
    return;
  }

  try {
    wtoChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: indicator,
          data: values,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `WTO Data: ${indicator}`
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Value (Million US dollar)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating WTO chart:', error);
  }
}

export {
  createWTOChart,
  fetchWTOData
};
