import { Chart } from 'chart.js/auto';
import { XMLParser } from 'fast-xml-parser'; // Import an XML parser library
import { CORS_PROXY } from '@/constants/constants';

let whoChart = null;

const WHO_INDICATORS = {
  'PVT-D': 'GHED_PVT-D_pc_US_SHA2011',
  'ROAD_TRAFFIC_DEATH': 'RS_198',
  'NEONATAL_MORTALITY': 'WHOSIS_000003'
};

const WHO_UNITS = {
  'PVT-D': 'US$',
  'ROAD_TRAFFIC_DEATH': 'per 100,000 population',
  'NEONATAL_MORTALITY': 'per 1,000 live births'
};

async function fetchWHOData(countryCode, indicator) {
  try {
    const end = new Date().getFullYear();
    const start = end - 10;
    const whoIndicator = WHO_INDICATORS[indicator];

    const API_URL = `https://apps.who.int/gho/athena/api/GHO/${whoIndicator}?filter=COUNTRY:${countryCode}&filter=YEAR:${start}:${end}`;
    const response = await fetch(`${CORS_PROXY}?url=${encodeURIComponent(API_URL)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser();
    const data = parser.parse(xmlText);

    if (data.GHO && data.GHO.Data && data.GHO.Data.Observation) {
      return data.GHO.Data.Observation
        .filter(observation => observation.Value && observation.Value.Display !== null)
        .map((observation) => {
          const yearDim = observation.Dim.find(dim => dim.Category === 'YEAR');
          const date = yearDim ? yearDim.Code : 'Unknown Date';
          return {
            date,
            value: parseFloat(observation.Value.Display)
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      console.error('No valid data found in the expected structure:', JSON.stringify(data, null, 2));
      return [];
    }
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

  loadingElement.style.display = 'flex';
  canvas.style.opacity = '0.5';

  if (whoChart instanceof Chart) {
    whoChart.destroy();
  }

  try {
    const data = await fetchWHOData(city.iso3, indicator);

    loadingElement.style.display = 'none';
    canvas.style.opacity = '1';

    if (!data.length) {
      console.error(`No WHO data found for ${city.iso3}`);
      const ctx = canvas.getContext('2d');
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No Data Available', canvas.width / 2, canvas.height / 2);
      return;
    }

    const years = data.map(item => item.date);
    const values = data.map(item => item.value);

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
    loadingElement.style.display = 'none';
    canvas.style.opacity = '1';
  }
}

export {
  createWHOChart
};
