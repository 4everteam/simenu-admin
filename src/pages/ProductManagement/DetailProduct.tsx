import { useEffect, useRef, useState } from 'react';
import { getProduct, deleteProduct } from '../../fetch/product-management';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../../utils/formatCurrency';

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  image_url: string;
  is_available: boolean;
}

const DetailProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const fetchedRef = useRef<boolean>(false);

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoading(true);        
      const responseData = await getProduct({ id: productId });
      setProductData(responseData);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Terjadi kesalahan saat mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {  
    // Skip if we've already fetched the data
    if (fetchedRef.current || !id) return;
    
    fetchProductDetail(id);
    fetchedRef.current = true;
  }, [id]);  

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!productData) return;
    
    try {
      setDeleteLoading(true);
      const response = await deleteProduct({ id: productData.id });
      if (response) {
        // Redirect to product list after successful deletion
        navigate('/admin/kelola-produk');
      } else {
        setError('Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Terjadi kesalahan saat menghapus produk');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center py-10">
      <div className="spinner"></div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <p className="text-danger">{error}</p>
    </div>
  );

  // Render delete confirmation modal
  const renderDeleteConfirmModal = () => (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-md rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
        <div className="mb-5.5 flex flex-col">
          <h3 className="mb-3 text-xl font-bold text-black dark:text-white">
            Konfirmasi Hapus
          </h3>
          <p className="text-sm text-body dark:text-bodydark">
            Apakah Anda yakin ingin menghapus produk <strong>{productData?.name}</strong>?
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
  );

  return (
    <>
      <Breadcrumb pageName="Detail Produk" />
      
      {loading ? renderLoading() : 
       error ? renderError() : 
       productData ? (
        <div className="flex flex-col gap-9">
          {/* Product Header Section */}
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-5">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    {productData.name}
                  </h3>
                  <p className={`mt-1 text-sm font-medium ${
                    productData.is_available 
                      ? 'text-success' 
                      : 'text-danger'
                  }`}>
                    {productData.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Link 
                  to={`/admiin/update-kelola-produk/${productData.id}`} 
                  className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-4 text-center font-medium text-primary hover:bg-primary hover:text-white mr-2"
                >
                  Edit Produk
                </Link>
                <button 
                  onClick={handleDeleteClick}
                  className="inline-flex items-center justify-center rounded-md border border-danger py-2 px-4 text-center font-medium text-danger hover:bg-danger hover:text-white"
                >
                  Hapus Produk
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-9 md:grid-cols-2">
            {/* Product Details Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Detail Produk
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">ID</span>
                      <span className="text-sm text-black dark:text-white">{productData.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">Nama Produk</span>
                      <span className="text-sm text-black dark:text-white">{productData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">Kategori</span>
                      <span className="text-sm text-black dark:text-white">
                        {productData.category?.name || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">Harga</span>
                      <span className="text-sm text-black dark:text-white">
                        {formatRupiah(productData.price)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-stroke pb-5 dark:border-strokedark">
                      <span className="font-medium text-black dark:text-white">Status</span>
                      <span className={`text-sm ${
                        productData.is_available 
                          ? 'text-success' 
                          : 'text-danger'
                      }`}>
                        {productData.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-black dark:text-white mb-2">Deskripsi</span>
                      <p className="text-sm text-black dark:text-white">
                        {productData.description || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Image Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Gambar Produk
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-4.5 flex flex-col items-center">
                  {productData.image_url ? (
                    <div className="bg-white p-4 rounded-md shadow-sm mb-4 w-full">
                      <img 
                        src={`${import.meta.env.VITE_SERVER_URL}/api/v1/file/${productData.image_url}`}
                        alt={productData.name}
                        className="w-full h-auto object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-40 w-full">
                      <div className="text-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-16 w-16 mx-auto mb-2 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p>Tidak ada gambar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && renderDeleteConfirmModal()}
        </div>
      ) : null}
    </>
  );
};

export default DetailProduct;