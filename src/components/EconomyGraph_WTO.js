import { Chart } from 'chart.js/auto';
import { CORS_PROXY, COMTRADE_API_KEY } from '@/constants/constants';

let wtoChart = null;

function getLatestYear() {
  return new Date().getFullYear() - 1; // Use previous year for more reliable data
}

async function fetchComtradeData(iso3, indicator) {
  if (!iso3) {
    console.error('ISO3 code is missing.');
    return { success: false, error: 'ISO3 code is missing.' };
  }

  try {
    const year = getLatestYear();
    const tradeFlow = indicator === '10exportCountries' ? 'X' : 'M';

    const API_URL = `https://comtradeapi.un.org/data/v1/get/C/A/HS?reporterCode=${iso3}&period=${year}&flowCode=${tradeFlow}&cmdCode=TOTAL`;
    const response = await fetch(CORS_PROXY + API_URL, {
      method: 'GET',
      headers: {
        'Origin': window.location.origin,
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': COMTRADE_API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid Comtrade data format:', data);
      return { success: false, error: 'Invalid Comtrade data format.' };
    }

    const sortedData = data.data
      .sort((a, b) => b.primaryValue - a.primaryValue)
      .slice(0, 10);

    return { success: true, data: sortedData };
  } catch (error) {
    console.error('Error fetching Comtrade data:', error);
    return { success: false, error: error.message };
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

  if (!city || !city.iso3 || !city.country_name) {
    console.error('Invalid city object:', city);
    displayErrorMessage(wtoCanvas, 'Invalid city data.');
    return;
  }

  const comtradeResult = await fetchComtradeData(city.iso3, indicator);

  if (!comtradeResult.success) {
    console.error(`Comtrade data fetch failed for ${city.iso3}: ${comtradeResult.error}`);
    displayErrorMessage(wtoCanvas, `Data fetch failed: ${comtradeResult.error}`);
    return;
  }

  const comtradeData = comtradeResult.data;

  if (!comtradeData || comtradeData.length === 0) {
    console.error(`No Comtrade data found for ${city.iso3}`);
    displayErrorMessage(wtoCanvas, `No data available for ${city.country_name}.`);
    return;
  }

  const countries = comtradeData.map(item => item.partnerDesc);
  const values = comtradeData.map(item => item.primaryValue / 1000000); // Convert to millions

  const ctx = wtoCanvas.getContext('2d');
  if (!ctx) {
    console.error("Could not get canvas context");
    return;
  }

  try {
    wtoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: countries,
        datasets: [{
          label: indicator === '10exportCountries' ? 'Top Export Partners' : 'Top Import Partners',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y', // Horizontal bar chart
        plugins: {
          title: {
            display: true,
            text: `${city.country_name} - ${indicator === '10exportCountries' ? 'Top Export' : 'Top Import'} Partners`
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Trade Value (Million USD)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Partner Country'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating chart:', error);
    displayErrorMessage(wtoCanvas, 'Error creating chart.');
  }
}

function displayErrorMessage(canvas, message) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }
}

export {
  createWTOChart
};