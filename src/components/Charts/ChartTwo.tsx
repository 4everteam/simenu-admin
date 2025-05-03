import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

interface PeakHourData {
  hour: number;
  order_count: number;
  total_sales: number;
}

interface ChartTwoProps {
  data: PeakHourData[];
}

const ChartTwo: React.FC<ChartTwoProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return {
      hours: [],
      orders: [],
      sales: []
    };

    const sortedData = [...data].sort((a, b) => a.hour - b.hour);
    return {
      hours: sortedData.map(item => `${item.hour}:00`),
      orders: sortedData.map(item => item.order_count),
      sales: sortedData.map(item => item.total_sales)
    };
  }, [data]);

  const options: ApexOptions = {
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '25%',
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.hours,
      title: {
        text: 'Hour of Day',
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: [
      {
        title: {
          text: 'Orders',
          style: {
            fontSize: '12px',
          },
        },
        labels: {
          formatter: (value) => Math.round(value).toString()
        }
      },
      {
        opposite: true,
        title: {
          text: 'Revenue',
          style: {
            fontSize: '12px',
          },
        },
        labels: {
          formatter: (value) => formatRupiah(value)
        }
      }
    ],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontFamily: 'Satoshi',
      fontWeight: 500,
      fontSize: '14px',
      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 0) return `${value} orders`;
          return formatRupiah(value);
        }
      }
    }
  };

  const series = [
    {
      name: 'Orders',
      data: chartData.orders,
    },
    {
      name: 'Revenue',
      data: chartData.sales,
    },
  ];

  // Find peak hour
  const peakHour = useMemo(() => {
    if (!data?.length) return null;
    return data.reduce((max, current) => 
      current.order_count > max.order_count ? current : max
    );
  }, [data]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Peak Hours Analysis
          </h4>
          {peakHour && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Peak: {peakHour.hour}:00 ({peakHour.order_count} orders)
            </p>
          )}
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-5 -mb-9">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;