import { Chart } from 'chart.js/auto';

let interestInflationChart = null;

async function fetchWorldBankData(countryCode, indicatorId) {
  try {
    // 최근 10년 데이터 추출
    const end = new Date().getFullYear();
    const start = end - 10;

    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorId}?date=${start}:${end}&format=json`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const [, data] = await response.json();
    
    if (!data) {
      return [];
    }

    // 연도별 데이터 정리 (최신 데이터부터 오므로 reverse)
    return data
      .filter(item => item.value != null)
      .map(item => ({
        date: item.date,
        value: item.value
      }))
      .reverse();
  } catch (error) {
    console.error(`Error fetching World Bank data for ${indicatorId}:`, error);
    return [];
  }
}

async function createInterestInflationChart(city) {
  const canvas = document.getElementById('interestInflationChart');
  const loadingElement = document.getElementById('interestInflationChartLoading');
  
  if (!canvas || !loadingElement) {
    console.error('Interest and Inflation chart elements not found');
    return;
  }

  // Show loading spinner
  loadingElement.style.display = 'flex';
  canvas.style.opacity = '0.5';

  // Destroy existing chart if it exists
  if (interestInflationChart) {
    interestInflationChart.destroy();
  }

  try {
    // World Bank 데이터 가져오기
    const [interestRateData, inflationData] = await Promise.all([
      fetchWorldBankData(city.code, 'FR.INR.LEND'),  // benchmark interest rate (%)
      fetchWorldBankData(city.code, 'FP.CPI.TOTL.ZG')  // Inflation, consumer prices (annual %)
    ]);

    // Hide loading spinner
    loadingElement.style.display = 'none';
    canvas.style.opacity = '1';

    if (!interestRateData.length && !inflationData.length) {
      console.error(`No interest rate or inflation data found for ${city.code}`);
      const ctx = canvas.getContext('2d');
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No Data Available', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Combine and sort years from both datasets
    const years = [...new Set([
      ...interestRateData.map(item => item.date),
      ...inflationData.map(item => item.date)
    ])].sort();

    // Map values to years
    const interestValues = years.map(year => {
      const dataPoint = interestRateData.find(item => item.date === year);
      return dataPoint ? dataPoint.value : null;
    });

    const inflationValues = years.map(year => {
      const dataPoint = inflationData.find(item => item.date === year);
      return dataPoint ? dataPoint.value : null;
    });

    // Create the chart
    interestInflationChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Benchmark Interest Rate (%)',
            data: interestValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            yAxisID: 'y1'
          },
          {
            label: 'Inflation Rate (%)',
            data: inflationValues,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 4/3,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 30,
              padding: 8,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2) + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y1: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Percentage (%)',
              font: {
                size: 11
              }
            },
            ticks: {
              font: {
                size: 10
              },
              callback: function(value) {
                return value.toFixed(1) + '%';
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
    console.error('Error creating interest and inflation chart:', error);
    // Hide loading spinner in case of error
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    if (canvas) {
      canvas.style.opacity = '1';
    }
  }
}

export {
  createInterestInflationChart
}; 