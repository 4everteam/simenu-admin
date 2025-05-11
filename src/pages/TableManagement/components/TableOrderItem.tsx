import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteTable } from '../../../fetch/table-management';
import { getOrderItems, updateOrderItemStatus } from '../../../fetch/order-management';
import { formatRupiah } from '../../../utils/formatCurrency';

// Define proper interfaces for type safety
interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  status: string;
}

interface Order {
  id: string;  
  items: OrderItem[];
  total_amount: string;
}

interface TableProps {
  code: string;
  addButton?: {
    text: string;
    link: string;
  };
  renderCustomCell?: (item: any, column: string, index: number) => React.ReactNode;
}

const TableOrderItem = ({ 
  code = '', 
  addButton = { text: "Tambah", link: "" },
  renderCustomCell
}: TableProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [order, setOrder] = useState<Order>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderItems = async () => {
    if (!code) return;
    
    try {
      setLoading(true);
      const response = await getOrderItems({ code });
      if (response && Array.isArray(response)) {
        // Flatten the order items from all orders
        const allItems: OrderItem[] = [];
        response.forEach((order: Order) => {
          if (order.items && Array.isArray(order.items)) {
            allItems.push(...order.items);
          }
          setOrder({
            id: order.id,
            items: order.items,
            total_amount: order.total_amount
          });
        });
        setOrderItems(allItems);
      } else {
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      setError('Failed to load order items');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrderItems();
  }, [code]);

  const handleDeleteClick = (code: string) => {
    setSelectedCode(code);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!selectedCode) return;
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await deleteTable({ code: selectedCode });
      
      if (response) {
        navigate(`/admin/detail-meja/${code}`, { replace: true });
      } else {
        throw new Error('Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setError('Terjadi kesalahan saat menghapus meja');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const renderStatusSelect = (item: OrderItem) => {
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, itemId: string) => {
      const newStatus = e.target.value;
      try {
        const response = await updateOrderItemStatus({ itemId : parseInt(itemId), newStatus});
        if (response && typeof response === 'object' && 'errors' in response) {
            setError(response.errors);
        }else {
            setSuccess('Berhasil mengubah status pesanan');
            setTimeout(() => {
              setSuccess(null);
            }, 1500);
            fetchOrderItems();
        }
      } catch (error) {
        console.log(error);
      }
    };
    
    return (
      <select
        value={item.status || 'pending'}
        onChange={(e) => handleStatusChange(e, item.id)}
        className={`rounded py-1 px-2 text-sm font-medium border ${
          item.status === 'completed'
            ? 'border-success text-success'
            : (item.status === 'pending'
              ? 'border-warning text-warning'
              : 'border-danger text-danger')
        }`}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">List Menu Pesanan</h4>
        {addButton.link && (
          <Link to={addButton.link} className="inline-flex items-center justify-center rounded-md bg-[#6A1B4D] py-2 px-4 text-center font-medium text-white hover:bg-opacity-90">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {addButton.text}
          </Link>
        )}
      </div>
      <div className="max-w-full overflow-x-auto">
        {error && (
          <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 mb-4 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success bg-opacity-10 text-success px-4 py-3 mb-4 rounded">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Id
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Menu Pesanan
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Jumlah Pesanan
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Status Pesanan
                </th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-[#eee] dark:border-strokedark">
                    <td className="py-5 px-4 dark:border-strokedark">
                      {item.id}
                    </td>
                    <td className="py-5 px-4 dark:border-strokedark">
                      {item.product?.name || 'N/A'}
                    </td>
                    <td className="py-5 px-4 dark:border-strokedark">
                      {item.quantity || 0}
                    </td>
                    <td className="py-5 px-4 dark:border-strokedark">
                      {renderStatusSelect(item)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Tidak ada data tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
            <div className="mb-5.5 flex flex-col">
              <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
                Konfirmasi Hapus
              </h3>
              <p className="text-sm text-body dark:text-bodydark">
                Apakah Anda yakin ingin menghapus meja ini?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex justify-center rounded bg-danger py-2 px-6 font-medium text-white hover:bg-opacity-90"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOrderItem;