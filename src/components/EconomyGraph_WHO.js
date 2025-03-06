import { Chart } from 'chart.js/auto';
import { CORS_PROXY } from '@/constants/constants';

let whoChart = null;

// WHO 지표 ID 매핑
const WHO_INDICATORS = {
  'PVT-D': 'CHE_PC_USD',  // Current health expenditure per capita
  'ROAD_TRAFFIC_DEATH': 'RTI_EST',  // Estimated road traffic death rate
  'FOODBORNE_ILLNESS': 'FBI_EST',  // Foodborne disease burden
  'NEONATAL_MORTALITY': 'NMR'  // Neonatal mortality rate
};

// WHO 지표 단위 매핑
const WHO_UNITS = {
  'PVT-D': 'US$',
  'ROAD_TRAFFIC_DEATH': 'per 100,000 population',
  'FOODBORNE_ILLNESS': 'per 100,000 population',
  'NEONATAL_MORTALITY': 'per 1,000 live births'
};

async function fetchWHOData(countryCode, indicator) {
  try {
    // 최근 10년 데이터 추출
    const end = new Date().getFullYear();
    const start = end - 10;  
    const whoIndicator = WHO_INDICATORS[indicator];

    const API_URL = `https://data.who.int/data/api/numeric/${whoIndicator}?dimension=COUNTRY:${countryCode}&dimension=YEAR:${start}:${end}`;
    const response = await fetch(CORS_PROXY + API_URL, {
      method: 'GET',
      headers: {
        'Origin': window.location.origin,
        'Accept': 'application/json'
      }
    });


    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 데이터 필터링 및 정리
    if (!data.data || !data.data.rows) {
      return [];
    }

    return data.data.rows
      .filter(row => row.Value !== null)
      .map(row => ({
        date: row.YEAR.toString(),
        value: parseFloat(row.Value)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error(`Error fetching WHO data for ${indicator}:`, error);
    return [];
  }
}

async function createWHOChart(city, indicator) {
  const canvas = document.getElementById('whoChart');
  const loadingElement = document.getElementById('whoChartLoading');
  
  if (!canvas || !loadingElement) {
    console.error('WHO chart elements not found');
    return;
  }

  // Show loading spinner
  loadingElement.style.display = 'flex';
  canvas.style.opacity = '0.5';

  // Destroy existing chart if it exists
  if (whoChart) {
    whoChart.destroy();
  }

  try {
    const data = await fetchWHOData(city.code, indicator);

    // Hide loading spinner
    loadingElement.style.display = 'none';
    canvas.style.opacity = '1';

    if (!data.length) {
      console.error(`No WHO data found for ${city.code}`);
      const ctx = canvas.getContext('2d');
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No Data Available', canvas.width / 2, canvas.height / 2);
      return;
    }

    const years = data.map(item => item.date);
    const values = data.map(item => item.value);

    // Create the chart
    whoChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: `${document.getElementById('whoIndicator').options[document.getElementById('whoIndicator').selectedIndex].text}`,
            data: values,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false
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
                  label += context.parsed.y.toFixed(2) + ' ' + WHO_UNITS[indicator];
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: WHO_UNITS[indicator],
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
    console.error('Error creating WHO chart:', error);
    // Hide loading spinner in case of error
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    if (canvas) {
      canvas.style.opacity = '1';
    }
  }
}

export function setupWHOSelect(city) {
  const select = document.getElementById('whoIndicator');
  if (!select) return;

  select.addEventListener('change', () => {
    createWHOChart(city, select.value);
  });

  // 초기 차트 로드
  createWHOChart(city, select.value);
}

export {
  createWHOChart
}; 