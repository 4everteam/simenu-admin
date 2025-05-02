import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { getOrderDetail, updateOrderItemStatus, deleteOrder } from '../../fetch/order-management';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { processPayment } from '../../fetch/payment-management';

interface OrderItem {
  id: number;
  product: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    description: string;
  };
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
    id: string;
    method: string;
    status: string;
  };
  total_amount: number;
}

interface PaymentMethod {
  id: string;
  name: string;
}

const DetailOrder = () => {
  let { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [change, setChange] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Format ID properly
  const formattedId = id ? id.replace(/\|/g, '/') : '';

  // Fetch order details
  const fetchOrderDetail = useCallback(async () => {
    if (!formattedId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getOrderDetail({ id: formattedId.replace(/\//g, '|') });
      
      if (response) {
        setOrderData(response);
        setPaymentSuccess(response.status === 'completed');
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [formattedId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleStatusChange = async (newStatus: string) => {
    if (!orderData) return;
    
    try {
      setStatusUpdateLoading(true);
      setError(null);
      
      // Uncomment and implement when API is ready
      // const response = await updateOrderStatus(orderData.order_id, newStatus);
      
      // if (response) {
      //   // Update local state with new status
      //   setOrderData({
      //     ...orderData,
      //     status: newStatus
      //   });
      //   setSuccess('Order status updated successfully');
      // } else {
      //   throw new Error('Failed to update order status');
      // }
      
      // Temporary implementation until API is ready
      setOrderData({
        ...orderData,
        status: newStatus
      });
      setSuccess('Order status updated successfully');
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
      
      // Hide dropdown after selection
      const dropdown = document.getElementById('statusDropdown');
      if (dropdown) {
        dropdown.classList.add('hidden');
      }
    }
  };

  const handleItemStatusChange = async (itemId: number, newStatus: string) => {
    if (!orderData) return;
    
    try {
      setUpdatingItemId(itemId);
      setError(null);
      
      const response = await updateOrderItemStatus({ 
        itemId,
        newStatus
      });
      
      if (response) {
        // Update local state with new item status
        const updatedItems = orderData.items.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        );
        
        setOrderData({
          ...orderData,
          items: updatedItems
        });
        
        setSuccess('Item status updated successfully');
      } else {
        throw new Error('Failed to update item status');
      }
    } catch (err) {
      console.error('Error updating item status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item status');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderData) return;
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      const response = await deleteOrder({ id: orderData.order_id });
      
      if (response) {
        // Redirect to order list after successful deletion
        navigate('/admin/kelola-pesanan');
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the order');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash' },
    { id: 'credit_card', name: 'Credit Card' },
    { id: 'debit_card', name: 'Debit Card' },
    { id: 'qris', name: 'QRIS' },
  ];

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and format as currency
    const value = e.target.value;
    setAmountPaid(value);
  };

  const handleProcessPayment = async () => {
    if (!orderData || processingPayment) return;
    
    // Validate payment amount for cash payments
    if (paymentMethod === 'cash') {
      const totalAmount = typeof orderData.total_amount === 'string' 
        ? parseInt(orderData.total_amount) 
        : orderData.total_amount;
      
      const paid = parseInt(amountPaid.replace(/[^\d]/g, ''));
      
      if (isNaN(paid) || paid < totalAmount) {
        setError('Jumlah yang dibayarkan harus sama atau lebih besar dari jumlah total');
        return;
      }
    }
    
    try {
      setProcessingPayment(true);
      setError(null);
      
      const paymentData = {
        orderId: orderData.order_id,
        paymentMethod,
        amountPaid : Number(amountPaid.replace(/[^\d]/g, '')),
      };
      
      const response = await processPayment(paymentData);
      
      if (response) {
        if (response && typeof response === 'object' && 'errors' in response) {
            if (Array.isArray(response.errors)) {
              setError(response.errors.join(', '));
            } else if (typeof response.errors === 'object') {
              console.log(response.errors);
              setError("Terjadi kesalahan");
            } else if (typeof response.errors === 'string') {
              setError(response.errors);
            }
        }else{
            setPaymentSuccess(true);
        }
      } else {
        throw new Error(response?.message || 'Payment processing failed');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success text-success';
      case 'processing':
        return 'bg-info text-info';
      case 'pending':
        return 'bg-warning text-warning';
      case 'cancelled':
        return 'bg-danger text-danger';
      default:
        return 'bg-gray-500 text-gray-500';
    }
  };

  // Helper function to get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Selesai';
      case 'processing':
        return 'Diproses';
      case 'pending':
        return 'Menunggu';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Render status select for order items
  const renderStatusSelect = (item: OrderItem) => {
    const isUpdating = updatingItemId === item.id;
    
    return (
      <div className="flex items-center gap-2">
        <select
          value={item.status}
          onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
          disabled={isUpdating}
          className={`rounded py-1 px-2 text-sm font-medium border ${
            item.status === 'completed'
              ? 'border-success text-success'
              : (item.status === 'pending'
                ? 'border-warning text-warning'
                : 'border-danger text-danger')
          }`}
        >
          <option value="pending">Menunggu</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        
        {isUpdating && (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        )}
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Detail Pesanan" />
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  // Render error state
  if (error && !orderData) {
    return (
      <>
        <Breadcrumb pageName="Detail Pesanan" />
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-danger">{error}</p>
          <button 
            onClick={fetchOrderDetail}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Coba Lagi
          </button>
        </div>
      </>
    );
  }

  // Render no data state
  if (!orderData) {
    return (
      <>
        <Breadcrumb pageName="Detail Pesanan" />
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="text-center py-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Data pesanan tidak ditemukan</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Detail Pesanan" />
      
      <div className="flex flex-col gap-9">
        {/* Success message */}
        {success && (
          <div className="bg-success bg-opacity-10 text-success px-4 py-3 rounded flex justify-between items-center">
            <p>{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="text-success hover:text-opacity-80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Error message (for non-fatal errors) */}
        {error && orderData && (
          <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 rounded flex justify-between items-center">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-danger hover:text-opacity-80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Order Header Section */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Pesanan #{orderData.order_id}
              </h3>
              <div className="flex items-center gap-2">
                <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${getStatusBadgeClass(orderData.status)}`}>
                  {getStatusDisplayText(orderData.status)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(orderData.created_at)}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <div className="relative">
                <button 
                  className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-4 text-center font-medium text-primary hover:bg-primary hover:text-white"
                  disabled={statusUpdateLoading}
                  onClick={() => {
                    const dropdown = document.getElementById('statusDropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                >
                  {statusUpdateLoading ? 'Memperbarui...' : 'Ubah Status'}
                </button>
                <div 
                  id="statusDropdown" 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-boxdark z-10 hidden"
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Menunggu
                    </button>
                    <button
                      onClick={() => handleStatusChange('processing')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Diproses
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Selesai
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Dibatalkan
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleDeleteClick}
                className="inline-flex items-center justify-center rounded-md border border-danger py-2 px-4 text-center font-medium text-danger hover:bg-danger hover:text-white"
              >
                Hapus Pesanan
              </button>
            </div>
          </div>
        </div>

        <div className="">
          {/* Order Details Section */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Detail Pesanan
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">ID Pesanan</span>
                    <span className="text-sm text-black dark:text-white">{orderData.order_id}</span>
                  </div>
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">Atas Nama</span>
                    <span className="text-sm text-black dark:text-white">{orderData.on_behalf || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">Kode Meja</span>
                    <span className="text-sm text-black dark:text-white">{orderData.table_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">Tipe Pesanan</span>
                    <span className="text-sm text-black dark:text-white">
                      {orderData.type === 'dine_in' ? 'Dine In' : 
                       orderData.type === 'take_away' ? 'Take Away' : 
                       orderData.type || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">Tanggal Pesanan</span>
                    <span className="text-sm text-black dark:text-white">{formatDate(orderData.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black dark:text-white">Total Pesanan</span>
                    <span className="text-sm font-semibold text-primary">{formatRupiah(orderData.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">List Menu Pesanan</h4>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                    ID
                  </th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                    Menu Pesanan
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Harga
                  </th>
                  <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                    Jumlah
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Subtotal
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderData.items && orderData.items.length > 0 ? (
                  orderData.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#eee] dark:border-strokedark">
                      <td className="py-5 px-4 dark:border-strokedark">
                        {item.id}
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        <div className="flex items-center gap-3">
                          <div>
                            <h5 className="font-medium text-black dark:text-white">
                              {item.product.name}
                            </h5>
                            {item.notes && (
                              <p className="text-xs text-gray-500">
                                Catatan: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        {formatRupiah(item.product.price)}
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        {item.quantity}
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        {formatRupiah(item.product.price * item.quantity)}
                      </td>
                      <td className="py-5 px-4 dark:border-strokedark">
                        {renderStatusSelect(item)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Tidak ada data tersedia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

                {/* Payment Information Section */}
                {paymentSuccess ? (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Informasi Pembayaran
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4.5">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">Status Pembayaran</span>
                    <span className="text-sm font-medium text-success">Lunas</span>
                  </div>
                  {orderData.payment && (
                    <>
                      <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                        <span className="font-medium text-black dark:text-white">ID Pembayaran</span>
                        <span className="text-sm text-black dark:text-white">{orderData.payment.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                        <span className="font-medium text-black dark:text-white">Metode Pembayaran</span>
                        <span className="text-sm text-black dark:text-white">
                          {paymentMethod === 'cash' ? 'Tunai' :
                           paymentMethod === 'credit_card' ? 'Kartu Kredit' :
                           paymentMethod === 'debit_card' ? 'Kartu Debit' :
                           paymentMethod === 'qris' ? 'QRIS' :
                           paymentMethod || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                  {paymentMethod === 'cash' && Number(amountPaid.replace(/[^\d]/g, '')) > orderData.total_amount && (
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">Kembalian</span>
                      <span className="text-sm text-black dark:text-white">
                        {formatRupiah(Number(amountPaid.replace(/[^\d]/g, '')) - orderData.total_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-black dark:text-white">Total Pembayaran</span>
                    <span className="text-sm font-semibold text-primary">{formatRupiah(orderData.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Struk
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Payment Bill
              </h3>
            </div>
            
            <div className="p-6.5">
              {/* Error message */}
              {error && (
                <div className="mb-6 bg-danger bg-opacity-10 text-danger px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {/* Order summary */}
              <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
                <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Order Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="text-sm font-medium">{orderData.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(orderData.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Table:</span>
                    <span className="text-sm font-medium">{orderData.table_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${
                      orderData.status === 'completed' 
                        ? 'text-success' 
                        : orderData.status === 'pending' 
                          ? 'text-warning' 
                          : 'text-danger'
                    }`}>
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Order items */}
              <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
                <h4 className="text-lg font-semibold mb-4 text-black dark:text-white">Order Items</h4>
                
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(item.product.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatRupiah(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Total amount */}
              <div className="mb-6 border-b border-stroke pb-6 dark:border-strokedark">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-black dark:text-white">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatRupiah(orderData.total_amount)}
                  </span>
                </div>
              </div>
              
              {/* Payment method */}
              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount paid (only for cash payment) */}
              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Amount Paid
                </label>
                <input
                  type="text"
                  value={amountPaid}
                  onChange={handleAmountPaidChange}
                  placeholder="Enter amount paid"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              
              {paymentMethod === 'cash' && amountPaid && (
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-black dark:text-white">Change:</span>
                    <span className="text-sm font-medium text-success">
                      {formatRupiah(Math.max(0, Number(amountPaid.replace(/[^\d]/g, '')) - orderData.total_amount))}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Process payment button */}
              <button
                onClick={handleProcessPayment}
                disabled={processingPayment || !amountPaid || (paymentMethod === 'cash' && Number(amountPaid.replace(/[^\d]/g, '')) < orderData.total_amount)}
                className="w-full flex justify-center rounded bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </div>
        )}

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
    </>
  );
};

export default DetailOrder;