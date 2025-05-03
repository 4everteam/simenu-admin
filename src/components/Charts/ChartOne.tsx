import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

// Updated interface to match the actual API response
interface SalesData {
  period: string;
  total_sales: number;
  order_count: number;
  items_sold: number;
}

interface ChartOneProps {
  data: SalesData[];
}

const ChartOne: React.FC<ChartOneProps> = ({ data }) => {
  // Safely process chart data with proper validation
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        dates: [],
        sales: [],
        orders: [],
        items: []
      };
    }

    return {
      dates: data.map(item => new Date(item.period).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })),
      sales: data.map(item => item.total_sales || 0),
      orders: data.map(item => item.order_count || 0),
      items: data.map(item => item.items_sold || 0)
    };
  }, [data]);

  // Get date range for display
  const dateRange = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 'No data available';
    
    // Parse dates more safely
    const parseDateSafely = (dateStr: string) => {
      try {
        // Try different date formats
        const date = new Date(dateStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Try parsing YYYY-MM-DD format
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            return new Date(
              parseInt(parts[0]), 
              parseInt(parts[1]) - 1, // Month is 0-indexed
              parseInt(parts[2])
            );
          }
          return null;
        }
        
        return date;
      } catch (e) {
        console.error('Error parsing date:', dateStr, e);
        return null;
      }
    };
    
    const firstDate = parseDateSafely(data[0].period);
    const lastDate = parseDateSafely(data[data.length - 1].period);
    
    if (!firstDate || !lastDate) return 'Date range unavailable';
    
    return `${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`;
  }, [data]);

  // Chart options with improved configuration
  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#3C50E0', '#80CAEE', '#5DDAB4'],
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
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
      width: [2, 2, 2],
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
      strokeColors: ['#3056D3', '#80CAEE', '#5DDAB4'],
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
            fontWeight: 500,
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
            fontWeight: 500,
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
          if (seriesIndex === 1) return `${value} orders`;
          return `${value} items`;
        }
      }
    }
  };

  // Series data with proper fallbacks
  const series = [
    {
      name: 'Revenue',
      data: chartData.sales
    },
    {
      name: 'Orders',
      data: chartData.orders
    },
    {
      name: 'Items Sold',
      data: chartData.items
    }
  ];

  // If no data is available, show a placeholder
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No sales data available</p>
        </div>
      </div>
    );
  }

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
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-success">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-success"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-success">Items Sold</p>
              <p className="text-sm font-medium">{dateRange}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5 mt-5">
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