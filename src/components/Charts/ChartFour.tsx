import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

// Updated interface to match the actual table usage data
interface TableUsageData {
  table_id: number;
  table_code: string;
  total_orders: number;
  average_daily_orders: string;
  usage_ratio: string;
}

interface ChartFourProps {
  data: TableUsageData[];
}

const ChartFour: React.FC<ChartFourProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        tableCodes: [],
        orders: [],
        percentages: [],
        ids: [],
        averages: []
      };
    }

    const sortedData = [...data]
      .sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))
      .slice(0, 5); // Take top 5 tables

    return {
      tableCodes: sortedData.map(item => item.table_code || `Table ${item.table_id}`),
      orders: sortedData.map(item => item.total_orders || 0),
      percentages: sortedData.map(item => {
        // Parse percentage from usage_ratio or calculate if not available
        if (item.usage_ratio && item.usage_ratio.includes('%')) {
          return parseFloat(item.usage_ratio).toFixed(1);
        }
        return '0.0';
      }),
      ids: sortedData.map(item => 
        (typeof item.table_id === 'number' && !isNaN(item.table_id)) 
          ? item.table_id.toString() 
          : (item.table_code || Math.random().toString(36).substr(2, 9))
      ),
      averages: sortedData.map(item => parseFloat(item.average_daily_orders || '0').toFixed(1))
    };
  }, [data]);

  const options: ApexOptions = {
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF', '#4E36E2'],
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: '70%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " orders";
      },
      offsetX: 20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: chartData.tableCodes,
      labels: {
        formatter: function (val) {
          return Math.round(Number(val)).toString();
        },
      },
      title: {
        text: 'Number of Orders',
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Tables',
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value) => {
          const index = chartData.orders.indexOf(value);
          const avg = index >= 0 ? chartData.averages[index] : '0';
          return `${value} orders (avg: ${avg}/day)`;
        }
      }
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: 'Orders',
      data: chartData.orders,
    }
  ];

  // If no data is available, show a placeholder
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
        <div className="mb-3">
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Table Usage Analysis
          </h5>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No table usage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Table Usage Analysis
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartFour" className="mx-auto">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {chartData.tableCodes.map((code, index) => (
          <div key={chartData.ids[index] || index} className="sm:w-1/2 w-full px-8">
            <div className="flex w-full items-center">
              <span 
                className="mr-2 block h-3 w-full max-w-3 rounded-full"
                style={{ backgroundColor: options.colors?.[index % (options.colors?.length || 1)] }}
              ></span>
              <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                <span title={code} className="truncate max-w-[120px]">
                  {code}
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

export default ChartFour;