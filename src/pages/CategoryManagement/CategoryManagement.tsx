import { useEffect, useState, useRef } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Table from './components/Table';
import { getCategories } from '../../fetch/categories-management';

interface TableData {
  id: string;
  code: string;
  status: string;
  capacity: number;
};

const CategoryManagement = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      // Skip if we've already fetched the data
      if (fetchedRef.current) return;
      
      try {
        setLoading(true);
        const response = await getCategories();
        if (response) {
          setData(response);
          // Mark that we've fetched the data
          fetchedRef.current = true;
        } else {
          setError('Failed to fetch table data');
        }
      } catch (error) {
        console.error('Error fetching tables:', error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Breadcrumb pageName="Kelola Kategori" />
      <div className="flex flex-col gap-10">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <Table 
            columns={["ID", "Logo", "Nama", "Action"]}           
            data={data} 
            addButton={{ text: "Tambah Kategori", link: "/tambah-kelola-kategori" }}
          />
        )}
      </div>
    </>
  );
};

export default CategoryManagement;