import { Chart } from 'chart.js/auto';
import { CORS_PROXY } from '@/constants/constants';
import { COMTRADE_API_KEY } from '@/constants/constants';

let wtoChart = null;

function getLatestYear() {
  const currentYear = new Date().getFullYear();
  return currentYear - 2; // API typically provides data up to 2 years ago
}

async function fetchTradeData(iso3, indicator) {
  if (!iso3) {
    console.error('ISO3 code is missing.');
    return { success: false, error: 'ISO3 code is missing.' };
  }

  try {
    const year = getLatestYear();
    const tradeFlow = indicator === '10exportCountries' ? 'X' : 'M';
    // 새로운 Comtrade API 형식 사용
    const API_URL = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=840&flowCode=X&period=2022`;

    // API 키 헤더 추가 (등록 필요)
    const response = await fetch(`${CORS_PROXY}?url=${encodeURIComponent(API_URL)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.dataset) {
      console.log('Full Comtrade response:', data);
      throw new Error('Invalid data format. No dataset found.');
    }

    const parsedData = data.dataset
      .map(item => ({
        partnerDesc: item.ptTitle || item.pt || item.partner || "Unknown",
        primaryValue: parseFloat(item.TradeValue || item.value || item.Value || 0)
      }))
      .filter(item => !isNaN(item.primaryValue) && item.primaryValue > 0)
      .sort((a, b) => b.primaryValue - a.primaryValue)
      .slice(0, 10);

    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Error fetching trade data:', error);
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

  displayMessage(wtoCanvas, 'Loading trade data...', 'black');

  try {
    const tradeResult = await fetchTradeData(city.iso3, indicator);

    if (!tradeResult.success) {
      console.error(`Trade data fetch failed for ${city.iso3}: ${tradeResult.error}`);
      displayErrorMessage(wtoCanvas, `Data fetch failed: ${tradeResult.error}`);
      return;
    }

    const tradeData = tradeResult.data;

    if (!tradeData || tradeData.length === 0) {
      console.error(`No trade data found for ${city.iso3}`);
      displayErrorMessage(wtoCanvas, `No data available for ${city.country_name}.`);
      return;
    }

    const countries = tradeData.map(item => item.partnerDesc);
    const values = tradeData.map(item => item.primaryValue / 1000000); // Convert to millions

    const ctx = wtoCanvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

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
            text: `${city.country_name} - ${indicator === '10exportCountries' ? 'Top Export' : 'Top Import'} Partners (${getLatestYear()})`
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.formattedValue} Million USD`;
              }
            }
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
    displayErrorMessage(wtoCanvas, `Error creating chart: ${error.message}`);
  }
}

function displayErrorMessage(canvas, message) {
  displayMessage(canvas, message, 'red');
}

function displayMessage(canvas, message, color) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }
}

export {
  createWTOChart
};
