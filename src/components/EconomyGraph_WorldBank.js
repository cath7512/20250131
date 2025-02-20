import { Chart } from 'chart.js/auto'; // Use auto-import for automatic registration

function getDateRange() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  return {
    start: startYear,
    end: currentYear
  };
}

const indicatorMap = {
  'CPI': {
    id: 'FP.CPI.TOTL',
    title: 'Consumer Price Index'
  },
  'savings': {
    id: 'NY.GNS.ICTR.ZS',
    title: 'Gross savings (% of GDP)'
  },
  'internet': {
    id: 'IT.NET.USER.ZS',
    title: 'Individuals using the Internet (%)'
  }
};

async function fetchWorldBankData(countryCode, indicator) {
  try {
    const { start, end } = getDateRange();
    const indicatorId = indicatorMap[indicator].id;
    const response = await fetch(
      `https://api.worldbank.org/v2/countries/${countryCode}/indicators/${indicatorId}?date=${start}:${end}&format=json`
    );
    const [metadata, data] = await response.json();
    return data ? data.reverse() : [];
  } catch (error) {
    console.error('Error fetching World Bank data:', error);
    return [];
  }
}

async function createWorldBankChart(city) {
  await updateWorldBankChart(city, 'CPI');
}

async function updateWorldBankChart(city, indicator) {
  const oldCanvas = document.getElementById('worldbankChart');
  const loadingElement = document.getElementById('worldbankChartLoading');
  if (!oldCanvas || !loadingElement) {
    console.error('Required elements not found');
    return;
  }

  // 로딩 표시 시작
  loadingElement.style.display = 'block';

  try {
    // 기존 차트 제거
    let existingChart = Chart.getChart(oldCanvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // 새로운 캔버스로 교체
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'worldbankChart';
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    const data = await fetchWorldBankData(city.code, indicator);
    
    if (!data.length) {
      console.error(`No World Bank data found for ${city.code}`);
      return;
    }

    const years = data.map(item => item.date);
    const values = data.map(item => item.value);

    const chart = new Chart(newCanvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: indicatorMap[indicator].title,
          data: values,
          borderColor: '#87CEEB',
          backgroundColor: 'rgba(135, 206, 235, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 4/3,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 30,
              padding: 8,
              font: {
                size: 10
              }
            }
          }
        },
        layout: {
          padding: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: indicatorMap[indicator].title,
              font: {
                size: 11
              }
            },
            ticks: {
              font: {
                size: 10
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year',
              font: {
                size: 11
              }
            },
            ticks: {
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating World Bank chart:', error);
  } finally {
    // 로딩 표시 종료
    loadingElement.style.display = 'none';
  }
}

export {
  createWorldBankChart,
  updateWorldBankChart
};
