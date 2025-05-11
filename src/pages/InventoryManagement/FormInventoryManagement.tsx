import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FormEvent, useState, useEffect, useRef, ChangeEvent } from 'react';
import { createInventory, getInventory, updateInventory } from '../../fetch/inventory-management';
import { getProducts } from '../../fetch/product-management';
import { useParams, useNavigate } from 'react-router-dom';

interface InventoryManagementProps {
  titlePage: string;
}

interface InventoryData {
  id?: number;
  name?: string;
  product_id: string;
  stock_qty: number;
  alert_threshold: number;
}

interface ProductOption {
  id: number;
  name: string;
}

interface FormError {
  product_id?: string;
  stock_qty?: string;
  alert_threshold?: string;
  general?: string;
}

const FormInventoryManagement = ({ titlePage }: InventoryManagementProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    product_id: '',
    stock_qty: 0,
    alert_threshold: 0
  });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const fetchedRef = useRef<boolean>(false);

  // Fetch inventory data if in edit mode
  useEffect(() => {
    if (fetchedRef.current || !id) return;

    const fetchInventoryDetail = async (inventoryId: number) => {
      try {
        const response = await getInventory({ id: inventoryId });
        if (response) {
          // Set the fetched data to inventoryData
          setInventoryData({ 
            ...response,
            product_id: typeof response.product === "object" ? response.product.id : '', 
            name: typeof response.product === "object" ? response.product.name : ''
          });
          fetchedRef.current = true;
        } else {
          setError('Inventory not found');
        }
      } catch (err) {
        console.error('Error fetching inventory details:', err);
        setError('An error occurred while fetching data');
      }
    };

    fetchInventoryDetail(parseInt(id));
  }, [id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (response) {
          setProducts(response);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Clear notifications after delay
  useEffect(() => {
    if (!error && !success) return;
    
    const timeout = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [error, success]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setInventoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (id) {
        response = await updateInventory({ id: parseInt(id), product_id: inventoryData.product_id, stock_qty : inventoryData.stock_qty, alert_threshold: inventoryData.alert_threshold });
      } else {
        response = await createInventory(inventoryData);
      }

      if (response && typeof response === 'object' && 'errors' in response) {
        if (Array.isArray(response.errors)) {
          const newFormErrors: FormError = {};
          response.errors.forEach((err: { field: string; message: string }) => {
            if (err.field) {
              newFormErrors[err.field as keyof FormError] = err.message;
            }
          });
          setFormErrors(newFormErrors);
        } else if (typeof response.errors === 'object') {
          // Handle object of errors
          const newFormErrors: FormError = {};
          Object.entries(response.errors).forEach(([field, message]) => {
            newFormErrors[field as keyof FormError] = message as string;
          });
          setFormErrors(newFormErrors);
        } else if (typeof response.errors === 'string') {
          // Handle string error
          setError(response.errors);
        }
      } else if (response === true) {
        if (!id) {
          setSuccess('Inventaris berhasil disimpan');
          setInventoryData({
            product_id: '',
            stock_qty: 0,
            alert_threshold: 0
          });
        } else {
          setSuccess('Inventaris berhasil diubah');
          setTimeout(() => {
            navigate('/admin/kelola-inventaris');
          }, 2000);
        }
      } else {
        throw new Error('Gagal menyimpan inventaris');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageName={titlePage} />

      <div className="">
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

        <div className="flex flex-col gap-9">
          {/* <!-- Add Inventory Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Produk <span className="text-meta-1">*</span>
                  </label>
                  <select 
                    name="product_id"
                    value={inventoryData.product_id ?? null}
                    onChange={handleChange}
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.product_id ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  >
                    <option value="">Pilih produk</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.product_id && (
                    <p className="text-danger text-sm mt-1">{formErrors.product_id}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Jumlah Stok <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="numeric"
                    inputMode="text"
                    name="stock_qty"
                    value={inventoryData.stock_qty}
                    onChange={handleChange}
                    min={0}
                    placeholder="Masukkan jumlah stok"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.stock_qty ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.stock_qty ? (
                    <p className="text-danger text-sm mt-1">{formErrors.stock_qty}</p>
                  ) : <p className="text-sm mt-1">* Jumlah stok tidak boleh negatif</p>}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Batas Minimum <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="numeric"
                    inputMode="text"
                    name="alert_threshold"
                    value={inventoryData.alert_threshold}
                    onChange={handleChange}
                    min={0}
                    placeholder="Masukkan batas minimum stok"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.alert_threshold ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.alert_threshold ? (
                    <p className="text-danger text-sm mt-1">{formErrors.alert_threshold}</p>
                  ) : <p className="text-sm mt-1">* Batas minimum untuk notifikasi stok hampir habis</p>}
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-inventaris')}
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center rounded bg-[#6A1B4D] py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormInventoryManagement;