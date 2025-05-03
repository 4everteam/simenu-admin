import { ApexOptions } from 'apexcharts';
import React, { useEffect, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

interface SalesData {
  date: string;
  total_sales: number;
  order_count: number;
}

interface ChartOneProps {
  data: SalesData[];
}

const ChartOne: React.FC<ChartOneProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return {
      dates: [],
      sales: [],
      orders: []
    };

    return {
      dates: data.map(item => new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })),
      sales: data.map(item => item.total_sales),
      orders: data.map(item => item.order_count)
    };
  }, [data]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'smooth',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#3056D3', '#80CAEE'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'category',
      categories: chartData.dates,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        title: {
          text: 'Revenue (Rp)',
          style: {
            fontSize: '12px',
          },
        },
        labels: {
          formatter: (value) => formatRupiah(value)
        },
      },
      {
        opposite: true,
        title: {
          text: 'Orders',
          style: {
            fontSize: '12px',
          },
        },
        labels: {
          formatter: (value) => Math.round(value).toString()
        },
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value, { seriesIndex }) => {
          if (seriesIndex === 0) return formatRupiah(value);
          return `${value} orders`;
        }
      }
    }
  };

  const series = [
    {
      name: 'Revenue',
      data: chartData.sales
    },
    {
      name: 'Orders',
      data: chartData.orders
    }
  ];

  // Get date range for display
  const dateRange = useMemo(() => {
    if (!data?.length) return 'No data available';
    const firstDate = new Date(data[0].date).toLocaleDateString();
    const lastDate = new Date(data[data.length - 1].date).toLocaleDateString();
    return `${firstDate} - ${lastDate}`;
  }, [data]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Total Revenue</p>
              <p className="text-sm font-medium">{dateRange}</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Total Orders</p>
              <p className="text-sm font-medium">{dateRange}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;