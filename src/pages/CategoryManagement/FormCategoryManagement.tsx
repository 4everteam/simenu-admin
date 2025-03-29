import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FormEvent, useState, useEffect, useRef } from 'react';
import { createCategory, getCategory, updateCategory } from '../../fetch/categories-management';
import { useParams, useNavigate } from 'react-router-dom';

interface FormCategoryManagementProps {
  titlePage: string;
}

interface CategoryData {
  id?: number;
  name: string;
}

interface FormError {
  name?: string;
  general?: string;
}

const FormCategoryManagement = ({ titlePage }: FormCategoryManagementProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState<CategoryData>({
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const fetchedRef = useRef<boolean>(false);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (fetchedRef.current || !id) return;

    const fetchCategoryDetail = async (categoryId: number) => {
      try {
        const response = await getCategory({ id: categoryId });
        if (response) {
          // Set the fetched data directly to categoryData
          setCategoryData(response);
          fetchedRef.current = true;
        } else {
          setError('Kategori tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching category details:', err);
        setError('Terjadi kesalahan saat mengambil data');
      }
    };

    fetchCategoryDetail(parseInt(id));
  }, [id]);

  // Clear notifications after delay
  useEffect(() => {
    if (!error && !success) return;
    
    const timeout = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [error, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setCategoryData(prev => ({
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
        response = await updateCategory({ ...categoryData, id: Number(id) });
      } else {
        response = await createCategory(categoryData);
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
          setSuccess('Kategori berhasil disimpan');
          setCategoryData({
            name: '',
          });
        } else {
          setSuccess('Kategori berhasil diubah');
          setTimeout(() => {
            navigate('/kelola-kategori');
          }, 2000);
        }
      } else {
        throw new Error('Gagal menyimpan kategori');
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
          {/* <!-- Add Category Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Nama Kategori <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama kategori"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.name ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.name && (
                    <p className="text-danger text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    type="button"
                    onClick={() => navigate('/kelola-kategori')}
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

export default FormCategoryManagement;