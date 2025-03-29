import { useEffect, useState, useRef } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from './components/Table';
import { getInventories } from '../../fetch/inventory-management';

interface InventoryData {
  id: string;
  product: {
    id: string;
    name: string;
  };
  stock_qty: number;
  alert_threshold: number;
};

const InventoryManagement = () => {
  const [data, setData] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchInventory = async () => {
      // Skip if we've already fetched the data
      if (fetchedRef.current) return;
      
      try {
        setLoading(true);
        const response = await getInventories();
        if (response) {
          setData(response);
          // Mark that we've fetched the data
          fetchedRef.current = true;
        } else {
          setError('Gagal mengambil data inventaris');
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <>
      <Breadcrumb pageName="Kelola Inventaris" />
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <Table 
            columns={["ID", "Nama Produk", "Stok", "Batas Minimum", "Status", "Action"]}           
            data={data} 
            addButton={{ text: "Tambah Inventaris", link: "/tambah-kelola-inventaris" }}
          />
        )}
      </div>
    </>
  );
};

export default InventoryManagement;