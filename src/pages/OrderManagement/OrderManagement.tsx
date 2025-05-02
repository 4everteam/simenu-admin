import { useEffect, useState, useRef, useCallback } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { getOrders } from '../../fetch/order-management';
import Table from './components/Table';

interface OrderItem {
  id: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    description: string;
  },
  quantity: number;
  notes: string;
  status: string;
}

interface OrderData {
  order_id: string;
  table_id: number;
  on_behalf: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment: {
    id: string,
    method: string,
    status: string,
  };
  total_amount: number,
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetch function
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getOrders();
      
      if (response && Array.isArray(response)) {
        setOrders(response);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <Breadcrumb pageName="Kelola Meja" />
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <Table
            data={orders} 
            addButton={{ text: "Buat Pesanan Baru", link: "/admin/create-order" }}
          />
        )}
      </div>
    </>
  );
};

export default OrderManagement;