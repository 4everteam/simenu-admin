import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteInventory } from '../../../fetch/inventory-management';

interface TableProps {
  columns: string[];
  data: any[];
  addButton?: {
    text: string;
    link: string;
  };
  renderCustomCell?: (item: any, column: string, index: number) => React.ReactNode;
}

const Table = ({ 
  columns = [], 
  data = [], 
  addButton = { text: "Tambah", link: "" },
  renderCustomCell
}: TableProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async (event: FormEvent<HTMLButtonElement>) => {
    try {
      event.preventDefault();

      setDeleteLoading(true);
      const response = await deleteInventory({id: selectedId});
      if (response) {
        navigate(0);
      } else {
        setError('Gagal menghapus data inventaris');
      }
    } catch (error) {
      console.error('Error deleting inventory:', error);
      setError('Terjadi kesalahan saat menghapus data inventaris');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderProductName = (product: any) => {
    if (!product || !product.name) return '-';
    return product.name;
  };

  const renderStockStatus = (stockQty: number, alertThreshold: number) => {
    if (stockQty === undefined || stockQty === null) return '-';
    
    if (stockQty <= 0) {
      return <span className="text-danger font-medium">Habis</span>;
    } else if (stockQty <= alertThreshold) {
      return <span className="text-warning font-medium">Restock</span>;
    } else {
      return <span className="text-success font-medium">Tersedia</span>;
    }
  };

  const renderActionButtons = (id: string) => (
    <div className="flex items-center space-x-3.5">
      <button onClick={() => handleDeleteClick(parseInt(id))} className="hover:text-primary">
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
      <Link to={`/admin/update-kelola-inventaris/${id}`} className="hover:text-primary">
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

  const renderCell = (item: any, column: string, colIndex: number) => {
    if (renderCustomCell) {
      return renderCustomCell(item, column, colIndex);
    }
    
    const columnLower = column.toLowerCase();

    // Default rendering based on column name
    if (["action", "aksi"].includes(columnLower)) {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {renderActionButtons(item.id)}
        </td>
      );
    } else if (["product", "product_name","nama produk"].includes(columnLower)) {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          <p className="text-black dark:text-white">
            {renderProductName(item.product)}
          </p>
        </td>
      );
    } else if (["stock", "stock_qty", "stok"].includes(columnLower)) {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          <p className="text-black dark:text-white">
            {item.stock_qty !== undefined ? item.stock_qty : '-'}
          </p>
        </td>
      );
    } else if (["alert_threshold", "batas minimum"].includes(columnLower)) {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          <p className="text-black dark:text-white">
            {item.alert_threshold !== undefined ? item.alert_threshold : '-'}
          </p>
        </td>
      );
    } else if (["status"].includes(columnLower)) {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {renderStockStatus(item.stock_qty, item.alert_threshold)}
        </td>
      );
    } else {
      return (
        <td key={colIndex} className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          <p className="text-black dark:text-white">
            {typeof item[columnLower] === 'object' 
              ? JSON.stringify(item[columnLower])
              : item[columnLower] || item[column] || '-'}
          </p>
        </td>
      );
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white"></h4>
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
          <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-danger">{error}</p>
          </div>
        )}
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[#eee] dark:border-strokedark">
                  {columns.map((column, colIndex) => renderCell(item, column, colIndex))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Tidak ada data inventaris tersedia
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
                Apakah Anda yakin ingin menghapus data inventaris ini?
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