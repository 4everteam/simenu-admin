import { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatRupiah } from '../../utils/formatCurrency';

// Updated interface to match the actual API response
interface PeakHourData {
  time_slot: string;
  order_count: number;
}

interface ChartTwoProps {
  data: PeakHourData[];
}

const ChartTwo: React.FC<ChartTwoProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        timeSlots: [],
        orders: []
      };
    }

    // Parse time slots and sort by hour
    const parsedData = data.map(item => {
      const hourMatch = item.time_slot.match(/^(\d{2}):00/);
      const hour = hourMatch ? parseInt(hourMatch[1], 10) : 0;
      return {
        ...item,
        hour,
        displayTime: item.time_slot
      };
    }).sort((a, b) => a.hour - b.hour);

    return {
      timeSlots: parsedData.map(item => item.displayTime),
      orders: parsedData.map(item => item.order_count || 0)
    };
  }, [data]);

  // Find peak hour
  const peakHour = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;
    
    return data.reduce((max, current) => 
      (current.order_count || 0) > (max.order_count || 0) ? current : max, 
      data[0]
    );
  }, [data]);

  const options: ApexOptions = {
    colors: ['#6A1B4D'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      type: 'bar',
      height: 335,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: '40%',
            },
          },
        },
      },
      {
        breakpoint: 1280,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 3,
              columnWidth: '50%',
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '40%',
        borderRadiusApplication: 'end',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.timeSlots,
      title: {
        text: 'Time Slots',
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Orders',
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value) => Math.round(value).toString()
      }
    },
    legend: {
      show: false,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} orders`
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
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
      <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Peak Hours Analysis
          </h4>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No peak hour data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Peak Hours Analysis
          </h4>
          {peakHour && peakHour.order_count > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Peak: {peakHour.time_slot} ({peakHour.order_count} orders)
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