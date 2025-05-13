import React, { useState, useEffect } from 'react';
import CardDataStats from '../../components/CardDataStats';
import ChartOne from '../../components/Charts/ChartOne';
import ChartThree from '../../components/Charts/ChartThree';
import ChartTwo from '../../components/Charts/ChartTwo';
import { getSalesReport, getPopularMenu, getPeakHours, getTableUsage } from '../../fetch/report-management';
import { formatRupiah } from '../../utils/formatCurrency';
import ChartFour from '../../components/Charts/ChartFour';
import { set } from 'lodash';

const ECommerce: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<any>(null);
  const [popularMenu, setPopularMenu] = useState<any>(null);
  const [peakHours, setPeakHours] = useState<any>(null);
  const [tableUsage, setTableUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 // Helper function to handle API errors
  const handleApiError = (response: any, errorType: string) => {
    if (response && typeof response === 'object' && 'errors' in response) {
      if (Array.isArray(response.errors)) {
        // setError(response.errors.join(', '));
      } else if (typeof response.errors === 'object') {
        // setError(Object.values(response.errors).join(', '));
      } else if (typeof response.errors === 'string') {
        // setError(response.errors);
      } else {
        setError(`Failed to fetch ${errorType}`);
      }
      return true;
    }
    return false;
  };
        
  const getDateRange = (filter: typeof timeFilter) => {
    const today = new Date();
    const startDate = new Date(today); // clone today
  
    switch (filter) {
      case 'daily':
        // hanya hari ini → start = end = today
        break;
  
      case 'weekly':
        // mundur 6 hari → total 7 hari
        startDate.setDate(today.getDate() - 6);
        break;
  
      case 'monthly':
        // dari awal tahun ini (1 Januari)
        startDate.setMonth(0); // bulan Januari (0-indexed)
        startDate.setDate(1);  // tanggal 1
        break;
        
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
    return {
      start_date: formatDate(startDate),
      end_date: formatDate(today),
    };
  };  

  const fetchDashboardData = async () => {
    
    setSalesData(null);
+   setPopularMenu(null);
+   setPeakHours(null);
+   setTableUsage(null);
    setLoading(true);
    setError(null);

    try {
      const dateParams = getDateRange(timeFilter);

      // Fetch all data concurrently
      const [sales, menu, hours, tables] = await Promise.all([
        getSalesReport({ ...dateParams, period: timeFilter }),
        getPopularMenu({ ...dateParams, limit: 10 }),
        getPeakHours({ ...dateParams, interval: 1 }),
        getTableUsage(dateParams)
      ]);

      // Handle potential errors from each API call
      if (!handleApiError(sales, 'sales data')) setSalesData(sales || []);
      if (!handleApiError(menu, 'menu data')) setPopularMenu(menu || []);
      if (!handleApiError(hours, 'peak hours data')) setPeakHours(hours || []);
      if (!handleApiError(tables, 'table usage data')) setTableUsage(tables || []);

    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when timeFilter changes
  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  // Calculate total sales from sales data
  const getTotalSales = () => {
    if (!salesData) return 0;
    return salesData.reduce((total: number, day: any) => total + day.total_sales, 0);
  };

  // Calculate sales growth rate
  const getSalesGrowth = () => {
    if (!salesData || salesData.length < 2) return 0;
    const currentSales = salesData[salesData.length - 1].total_sales;
    const previousSales = salesData[0].total_sales;
    return ((currentSales - previousSales) / previousSales) * 100;
  };

  return (
    <>
      {/* Show error if any */}
      {error && (
        <div className="mb-4 p-4 bg-danger bg-opacity-10 text-danger rounded-lg">
          {error}
        </div>
      )}

      {/* Time Period Filter */}
      <div className="mb-4 flex items-center space-x-4">
        <button
          onClick={() => setTimeFilter('daily')}
          className={`px-4 py-2 rounded-lg ${
            timeFilter === 'daily' 
              ? 'bg-[#6A1B4D] text-white' 
              : 'bg-white dark:bg-boxdark'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setTimeFilter('weekly')}
          className={`px-4 py-2 rounded-lg ${
            timeFilter === 'weekly' 
              ? 'bg-[#6A1B4D] text-white' 
              : 'bg-white dark:bg-boxdark'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTimeFilter('monthly')}
          className={`px-4 py-2 rounded-lg ${
            timeFilter === 'monthly' 
              ? 'bg-[#6A1B4D] text-white' 
              : 'bg-white dark:bg-boxdark'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Sales"
          total={formatRupiah(getTotalSales())}
          rate={`${getSalesGrowth().toFixed(2)}%`}
          levelUp={getSalesGrowth() > 0}
        >
          <svg className="fill-[#6A1B4D] dark:fill-white" width="22" height="16" viewBox="0 0 22 16">
            <path
              d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
              fill=""
            />
            <path
              d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
              fill=""
            />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Total Orders"
          total={salesData?.length ? salesData.reduce((total: number, day: any) => total + day.order_count, 0).toString() : '0'}
          rate={`${((salesData?.length ? salesData[salesData.length - 1].order_count / salesData[0].order_count - 1 : 0) * 100).toFixed(2)}%`}
          levelUp={salesData?.length && salesData[salesData.length - 1].order_count > salesData[0].order_count}
        >
          <svg
            className="fill-[#6A1B4D] dark:fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2687 19.8687 11.7531 19.8687Z"
              fill=""
            />
            <path
              d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.56245 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.70620 19.8687 4.29370 19.4562 4.29370 18.9406C4.29370 18.425 4.70620 18.0125 5.22183 18.0125C5.73745 18.0125 6.14995 18.425 6.14995 18.9406C6.14995 19.4219 5.73745 19.8687 5.22183 19.8687Z"
              fill=""
            />
            <path
              d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937C0.237478 7.49374 0.237478 7.49374 0.237478 7.52812L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19999 17.0125 2.16562 17.0812 2.16562H18.9375C19.35 2.16562 19.7281 1.82187 19.7281 1.37499C19.7281 0.928119 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9531 12.8219 13.5062 13.2 12.9906 13.2H3.7781L1.92185 7.56249H14.7094L14.0219 12.3062Z"
              fill=""
            />
          </svg>
        </CardDataStats>

        <CardDataStats
        title="Table Usage"
        total={tableUsage?.length 
          ? tableUsage.reduce((total: number, table: any) => total + table.total_orders, 0).toString()
          : '0'
        }
        rate={`${(
          tableUsage?.length && tableUsage[0].total_orders !== 0
            ? (tableUsage[tableUsage.length - 1].total_orders / tableUsage[0].total_orders - 1)
            : 0
        * 100).toFixed(2)}%`}
        levelUp={tableUsage?.length && tableUsage[tableUsage.length - 1].total_orders > tableUsage[0].total_orders}
      >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#6A1B4D" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
            <path d="M3 10h18" />
            <path d="M10 3v18" />
          </svg>
        </CardDataStats>

        <CardDataStats
          title="Peak Hour"
          total={peakHours?.length ? `${Math.max(...peakHours.map((h: any) => h.order_count))} orders` : '0'}
          subtitle={peakHours?.length ? 
            `${peakHours.reduce((max: any, hour: any) => 
              hour.order_count > max.order_count ? hour : max
            ).hour}:00` : 'No data'
          }
        >
          <svg
            className="fill-[#6A1B4D] dark:fill-white"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
              fill=""
            />
            <path
              d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
              fill=""
            />
            <path
              d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7874 10.8563C11.8593 9.61876 10.3812 8.79376 8.73115 8.79376H5.67178C2.85303 8.82814 0.618652 11.0625 0.618652 13.8469V16.3219C0.618652 16.975 1.13428 17.4906 1.7874 17.4906H20.2468C20.8999 17.4906 21.4499 16.9406 21.4499 16.2875V15.4625C21.4155 12.4719 18.9749 10.0313 15.9843 10.0313ZM2.16553 15.9438V13.8469C2.16553 11.9219 3.74678 10.3406 5.67178 10.3406H8.73115C10.6562 10.3406 12.2374 11.9219 12.2374 13.8469V15.9438H2.16553V15.9438ZM19.8687 15.9438H13.7499V13.8469C13.7499 13.2969 13.6468 12.7469 13.4749 12.2313C14.0937 11.7844 14.8499 11.5781 15.6405 11.5781H15.9499C18.0812 11.5781 19.8343 13.3313 19.8343 15.4625V15.9438H19.8687Z"
              fill=""
            />
          </svg>
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne data={salesData} />
        <ChartTwo data={peakHours} />
        <ChartThree data={popularMenu} />
        <ChartFour data={tableUsage} />
      </div>
    </>
  );
};

export default ECommerce;