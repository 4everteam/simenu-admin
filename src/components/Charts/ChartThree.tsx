import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

interface PopularMenuItem {
  id: string;
  name: string;
  order_count: number;
  total_sales: number;
}

interface ChartThreeProps {
  data: PopularMenuItem[];
}

const ChartThree: React.FC<ChartThreeProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return {
      names: [],
      orders: [],
      percentages: []
    };

    const totalOrders = data.reduce((sum, item) => sum + item.order_count, 0);
    const sortedData = [...data]
      .sort((a, b) => b.order_count - a.order_count)
      .slice(0, 5); // Take top 5 items

    return {
      names: sortedData.map(item => item.name),
      orders: sortedData.map(item => item.order_count),
      percentages: sortedData.map(item => ((item.order_count / totalOrders) * 100).toFixed(1))
    };
  }, [data]);

  const options: ApexOptions = {
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'donut',
    },
    colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF', '#4E36E2'],
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
              formatter: (value) => `${value} orders`
            },
            total: {
              show: true,
              label: 'Total Orders',
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
            series={chartData.orders}
            type="donut"
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {chartData.names.map((name, index) => (
          <div key={name} className="sm:w-1/2 w-full px-8">
            <div className="flex w-full items-center">
              <span 
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{ backgroundColor: options.colors?.[index] }}
              ></span>
              <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                <span title={name}>
                  {name.length > 15 ? `${name.substring(0, 15)}...` : name}
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