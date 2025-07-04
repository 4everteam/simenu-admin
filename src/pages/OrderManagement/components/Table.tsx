import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteOrder } from '../../../fetch/order-management';
import { formatRupiah } from '../../../utils/formatCurrency';

// Define proper interfaces for type safety
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
  table_code: string;
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

interface TableProps {
  data: OrderData[];
  addButton?: {
    text: string;
    link: string;
  };
  onRefresh?: () => void;
}

const Table = ({ 
  data = [], 
  addButton = { text: "", link: "" },
  onRefresh
}: TableProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!selectedId) return;
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await deleteOrder({ id: selectedId.replace(/\//g, '|') });

      if (response && typeof response === 'object' && 'errors' in response) {
        let errorMsg = 'Failed to delete order';
        if (Array.isArray(response.errors)) {
          errorMsg = response.errors.join(', ');
        } else if (typeof response.errors === 'object') {
          errorMsg = Object.values(response.errors).join(', ');
        } else if (typeof response.errors === 'string') {
          errorMsg = response.errors;
        }
        setError(errorMsg);
        setTimeout(() => {
          setError(null);
        }, 1000);
      }

      if (response) {
        // Use onRefresh callback instead of navigate(0)
        if (onRefresh) {
          onRefresh();
        }
        setShowDeleteConfirm(false);
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pesanan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderActionButtons = (id: string, tableCode: string, status: string) => (
    <div className="flex items-center space-x-3.5">
      <Link to={status !== 'completed' && tableCode ? `/admin/detail-meja/${tableCode}`  : `/admin/detail-pesanan/${id.replace(/\//g, '|')}`} className="hover:text-primary">
        <svg
          className="fill-current"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
            fill=""
          />
          <path
            d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
            fill=""
          />
        </svg>
      </Link>
      {status !== 'completed' && (
        <button onClick={() => handleDeleteClick(id)} className="hover:text-primary">
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
              fill=""
            />
            <path
              d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
              fill=""
            />
            <path
              d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
              fill=""
            />
            <path
              d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
              fill=""
            />
          </svg>
        </button>
      )}
      <Link to={`/admin/edit-pesanan/${id.replace(/\//g, '|')}`} className="hover:text-primary">
        <svg
          className="fill-current"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.76 3.64a1.5 1.5 0 0 1 2.12 0l1.48 1.48a1.5 1.5 0 0 1 0 2.12L7.73 19.87l-4.24 1.06a1 1 0 0 1-1.22-1.22l1.06-4.24L16.76 3.64ZM15 6.76l-9.88 9.88-.71 2.83 2.83-.71L18 8.83 15 6.76Z"
            fill="currentColor"
          />
        </svg>
      </Link>
    </div>
  );

  const renderStatusBadge = (status: string) => {
    let statusClass = '';
    let displayText = status;
    
    switch(status.toLowerCase()) {
      case 'pending':
        statusClass = 'bg-warning text-warning';
        displayText = 'Menunggu';
        break;
      case 'processing':
        statusClass = 'bg-info text-info';
        displayText = 'Diproses';
        break;
      case 'completed':
        statusClass = 'bg-success text-success';
        displayText = 'Selesai';
        break;
      case 'cancelled':
        statusClass = 'bg-danger text-danger';
        displayText = 'Dibatalkan';
        break;
      default:
        statusClass = 'bg-gray-500 text-gray-500';
    }
    
    return (
      <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${statusClass}`}>
        {displayText}
      </p>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">Daftar Pesanan</h4>
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
          <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                ID
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Atas Nama
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Nomor / Kode Meja
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Tipe Pesanan
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Total
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Tanggal
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((order) => (
                <tr key={order.order_id} className="border-b border-[#eee] dark:border-strokedark">
                  <td className="py-5 px-4 dark:border-strokedark">
                    {order.order_id.substring(0, 8)}...
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {order.on_behalf || 'N/A'}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {order.table_id || 'N/A'}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {order.type === 'dine_in' ? 'Dine In' : 
                     order.type === 'take_away' ? 'Take Away' : 
                     order.type || 'N/A'}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {formatRupiah(order.total_amount || 0)}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {renderStatusBadge(order.status || 'pending')}
                  </td>
                  <td className="py-5 px-4 dark:border-strokedark">
                    {renderActionButtons(order.order_id, order.table_code, order.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Tidak ada data tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                Apakah Anda yakin ingin menghapus pesanan ini?
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

export default Table;