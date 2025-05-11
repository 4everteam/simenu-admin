import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

// Updated interface to match the actual API response
interface PopularMenuItem {
  product_id: string;
  name: string;
  total_quantity: number;
  price: string;
  image_url?: string;
}

interface ChartThreeProps {
  data: PopularMenuItem[];
}

const ChartThree: React.FC<ChartThreeProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        names: [],
        quantities: [],
        percentages: [],
        ids: [],
        prices: []
      };
    }

    const totalQuantity = data.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
    const sortedData = [...data]
      .sort((a, b) => (b.total_quantity || 0) - (a.total_quantity || 0))
      .slice(0, 5); // Take top 5 items

    return {
      names: sortedData.map(item => item.name || 'Unnamed Item'),
      quantities: sortedData.map(item => item.total_quantity || 0),
      percentages: sortedData.map(item => 
        ((item.total_quantity || 0) / (totalQuantity || 1) * 100).toFixed(1)
      ),
      ids: sortedData.map(item => item.product_id || ''),
      prices: sortedData.map(item => item.price || '0')
    };
  }, [data]);

  const options: ApexOptions = {
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'donut',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    colors: ['#6A1B4D', '#F2C57C', '#8FD0EF', '#FFF8E1', '#2e2e2e'],
    labels: chartData.names,
    legend: {
      show: false,
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Satoshi, sans-serif',
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Satoshi, sans-serif',
              formatter: (value) => `${value} items`
            },
            total: {
              show: true,
              label: 'Total Items',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `${total}`;
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value, { seriesIndex, dataPointIndex, w }) => {
          const price = chartData.prices[dataPointIndex];
          return `${value} items (${formatRupiah(Number(price) * value)})`;
        }
      }
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  // If no data is available, show a placeholder
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
        <div className="mb-3">
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Popular Menu Items
          </h5>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No popular menu data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Popular Menu Items
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart
            options={options}
            series={chartData.quantities}
            type="donut"
            height={350}
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {chartData.names.map((name, index) => (
          <div key={chartData.ids[index] || index} className="sm:w-1/2 w-full px-8">
            <div className="flex w-full items-center">
              <span 
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{ backgroundColor: options.colors?.[index] }}
              ></span>
              <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                <span title={name} className="truncate max-w-[120px]">
                  {name}
                </span>
                <span>{chartData.percentages[index]}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartThree;