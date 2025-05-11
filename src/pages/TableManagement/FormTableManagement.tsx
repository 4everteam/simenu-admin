import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FormEvent, useState, useEffect, useRef } from 'react';
import { createTable, getTable, updateTable } from '../../fetch/table-management';
import { useParams, useNavigate } from 'react-router-dom';

interface FormTableManagementProps {
  titlePage: string;
}

interface TableData {
  id?: number;
  code: string;
  status: string;
  capacity: number;
}

interface FormError {
  code?: string;
  status?: string;
  capacity?: string;
  general?: string;
}

const FormTableManagement = ({ titlePage }: FormTableManagementProps) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<TableData>({
    code: '',
    status: '',
    capacity: 0
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const fetchedRef = useRef<boolean>(false);

  // Fetch table data if in edit mode
  useEffect(() => {
    if (fetchedRef.current || !code) return;

    const fetchTableDetail = async (tableCode: string) => {
      try {
        const response = await getTable({ code: tableCode });
        if (response) {
          // Set the fetched data directly to tableData
          setTableData(response);
          fetchedRef.current = true;
        } else {
          setError('Table not found');
        }
      } catch (err) {
        console.error('Error fetching table details:', err);
        setError('An error occurred while fetching data');
      }
    };

    fetchTableDetail(code);
  }, [code]);

  // Clear notifications after delay
  useEffect(() => {
    if (!error && !success) return;
    
    const timeout = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [error, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setTableData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (code) {
        if (!tableData.id) {
          throw new Error('ID meja tidak ditemukan untuk update');
        }
        response = await updateTable({ ...tableData, id: tableData.id });
      } else {
        response = await createTable(tableData);
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
      }else if (response === true) {
        if (!code) {
          setSuccess('Data meja berhasil disimpan');
          setTableData({
            code: '',
            status: '',
            capacity: 0
          });
        } else {
          setSuccess('Data meja berhasil diubah');
          setTimeout(() => {
            navigate('/admin/kelola-meja');
          }, 2000);
        }
      } else {
        throw new Error('Gagal menyimpan data meja');
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
          {/* <!-- Add Table Form --> */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Kode Meja <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={tableData.code}
                    onChange={handleChange}
                    placeholder="M001/M01/M1"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.code ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.code && (
                    <p className="text-danger text-sm mt-1">{formErrors.code}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Status <span className="text-meta-1">*</span>
                  </label>
                  <select 
                    name="status"
                    value={tableData.status}
                    onChange={handleChange}
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.status ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  >
                    <option value="">Pilih status</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="terisi">Terisi</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {formErrors.status && (
                    <p className="text-danger text-sm mt-1">{formErrors.status}</p>
                  )}
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Kapasitas <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="numeric"
                    inputMode="text"
                    name="capacity"
                    value={tableData.capacity}
                    onChange={handleChange}
                    placeholder="Masukkan kapasitas meja"
                    className={`w-full rounded border-[1.5px] ${
                      formErrors.capacity ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                  />
                  {formErrors.capacity && (
                    <p className="text-danger text-sm mt-1">{formErrors.capacity}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/kelola-meja')}
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

export default FormTableManagement;