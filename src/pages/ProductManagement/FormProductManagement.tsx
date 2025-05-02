import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FormEvent, useState, useEffect, useRef, ChangeEvent } from 'react';
import { createProduct, getProduct, updateProduct } from '../../fetch/product-management';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories } from '../../fetch/categories-management';

interface FormProductManagementProps {
  titlePage: string;
}

interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: number;
  stock?: number;
  image: string | File;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface FormError {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  image?: string;
  general?: string;
}

const FormProductManagement = ({ titlePage }: FormProductManagementProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    price: 0,
    category: 0,
    stock: 0,
    image: ''
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const fetchedRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (fetchedRef.current || !id) return;

    const fetchProductDetail = async (productId: string) => {
      try {
        const response = await getProduct({ id: productId });
        if (response) {
          // Set the fetched data directly to productData
          setProductData({ 
            ...response,
            category: typeof response.category === "object" ? response.category.id : 0 });
          if (response.image_url) {
            setImagePreview(`${import.meta.env.VITE_SERVER_URL}/api/v1/file/${response.image_url}`);
          }

          fetchedRef.current = true;
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('An error occurred while fetching data');
      }
    };

    fetchProductDetail(id);
  }, [id]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        if (response) {
          setCategories(response);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'category' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clear any previous error for this field
      if (formErrors.image) {
        setFormErrors(prev => ({
          ...prev,
          image: undefined
        }));
      }
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Update the product data with the file
      setProductData(prev => ({
        ...prev,
        image: file ? file : imagePreview
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (id) {
        response = await updateProduct({ ...productData, id });
      } else {
        response = await createProduct({...productData, stock: productData.stock ?? 0});
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
          setSuccess('Produk berhasil disimpan');
          setProductData({
            name: '',
            description: '',
            price: 0,
            category: 0,
            stock: 0,
            image: ''
          });
          setImagePreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setSuccess('Produk berhasil diubah');
          setTimeout(() => {
            navigate('/admin/kelola-produk');
          }, 2000);
        }
      } else {
        throw new Error('Gagal menyimpan produk');
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
          {/* <!-- Add Product Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Nama Produk <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama produk"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.name ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.name ? (
                    <p className="text-danger text-sm mt-1">{formErrors.name}</p>
                  ) : <p className="text-sm mt-1">* Nama tidak boleh melebihi 100 huruf</p>}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Deskripsi <span className="text-meta-1">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan deskripsi produk"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.description ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.description ? (
                    <p className="text-danger text-sm mt-1">{formErrors.description}</p>
                  ) : <p className="text-sm mt-1">* Deskripsi tidak boleh melebihi 500 huruf</p> }
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Harga <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="numeric"
                    inputMode="text"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    min={1000}
                    placeholder="Masukkan harga produk"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.price ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.price ? (
                    <p className="text-danger text-sm mt-1">{formErrors.price}</p>
                  ) : <p className="text-sm mt-1">* Harga minimal Rp1.000</p> }
                </div>

                {!id && (
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Stock <span className="text-meta-1">*</span>
                    </label>
                    <input
                      type="numeric"
                      inputMode="text"
                      name="stock"
                      onChange={handleChange}
                      min={1}
                      placeholder="Masukkan stock produk"
                      className={`w-full rounded border-[1.5px] ${
                        formErrors.stock ? 'border-danger' : 'border-stroke'
                      } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    />
                    {formErrors.stock ? (
                      <p className="text-danger text-sm mt-1">{formErrors.stock}</p>
                    ) : <p className="text-sm mt-1">* Stock minimal 1/barang</p> }
                  </div>
                )}

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Kategori <span className="text-meta-1">*</span>
                  </label>
                  <select 
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.category ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-danger text-sm mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Gambar Produk {!id && <span className="text-meta-1">*</span>}
                  </label>
                  <input
                    type="file"
                    name="image"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.image ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.image && (
                    <p className="text-danger text-sm mt-1">{formErrors.image}</p>
                  )}
                  
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="mb-2 text-sm text-black dark:text-white">Preview:</p>
                      <img 
                        src={typeof imagePreview === 'string' && imagePreview.startsWith('http') 
                          ? imagePreview 
                          : typeof imagePreview === 'string' && imagePreview.startsWith('blob') 
                            ? imagePreview
                            : `${import.meta.env.VITE_SERVER_URL}/api/v1/file/${imagePreview}`} 
                        alt="Product preview" 
                        className="max-w-[200px] max-h-[200px] object-contain border border-stroke rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-produk')}
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
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

export default FormProductManagement;