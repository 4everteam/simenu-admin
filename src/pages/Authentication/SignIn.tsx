import React, { ChangeEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../images/logo/logo.svg';
import authImg from '../../images/authentication/image-signin.png';
import { getAuthURL, login } from '../../fetch/auth';

interface LoginData {
  email: string;
  password: string;
}

interface FormError {
  email?: string;
  password?: string;
  general?: string;
}

const SignIn: React.FC = () => {
  const [data, setData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear any previous error for this field
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await login(data);
      
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
          const newFormErrors: FormError = {};
          Object.entries(response.errors).forEach(([field, message]) => {
            newFormErrors[field as keyof FormError] = message as string;
          });
          setFormErrors(newFormErrors);
        } else if (typeof response.errors === 'string') {
          setError(response.errors);
        }
      } else if (response && typeof response === 'object' && ('token' in response && 'user' in response)) {
        // Store user data in localStorage
        localStorage.setItem('user_data', JSON.stringify({
          token: response.token,
          user: response.user
        }));
        
        setError(null);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        throw new Error('Gagal login');
      }
    } catch (err) {
      setError(`Terjadi kesalahan saat login: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      const response = await getAuthURL();
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
          const newFormErrors: FormError = {};
          Object.entries(response.errors).forEach(([field, message]) => {
            newFormErrors[field as keyof FormError] = message as string;
          });
          setFormErrors(newFormErrors);
        } else if (typeof response.errors === 'string') {
          setError(response.errors);
        }
      } else if (response && typeof response === 'object' && 'url' in response) {
        setError(null);
        window.location.href = response.url;
      } else {
        throw new Error('Gagal login');
      }
    } catch (err) {
      setError(`Terjadi kesalahan saat login google: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return (
    <div className="flex h-screen flex-wrap items-center justify-center bg-gray-2 dark:bg-boxdark-2">
      <div className="w-full xl:w-[96%] 2xl:w-[90%] flex h-[95vh] overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center h-full flex flex-col items-center justify-center">
            <Link className="mb-5.5 inline-block" to="/">
              <img className="w-45" src={Logo} alt="Logo" />
            </Link>

            <p className="2xl:px-20 text-lg">
              Selamat datang di siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu
            </p>

            <span className="mt-8 inline-block">
              <img 
                className="w-full max-w-[40vh] object-contain mx-auto" 
                src={authImg} 
                alt="Authentication illustration"
              />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {error && (
              <div className="mb-6 rounded-lg bg-danger bg-opacity-10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
            
            <span className="mb-1.5 block font-medium">Selamat Datang</span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Masuk ke siMenu Admin
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="email" className="mb-2.5 block font-medium text-black dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Masukkan email anda"
                    value={data.email}
                    onChange={handleOnChange}
                    className={`w-full rounded-lg border ${
                      formErrors.email ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    required
                  />

                  <span className="absolute right-4 top-4">
                    <svg
                      className="fill-current"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.5">
                        <path
                          d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                          fill=""
                        />
                      </g>
                    </svg>
                  </span>
                </div>
                {formErrors.email && (
                  <p className="text-danger text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="mb-2.5 block font-medium text-black dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={data.password}
                    onChange={handleOnChange}
                    className={`w-full rounded-lg border ${
                      formErrors.password ? 'border-danger' : 'border-stroke'
                    } bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                    required
                    minLength={6}
                  />

                  <span 
                    className="absolute right-4 top-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 5C7 5 2.73 8.11 1 12C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 12C21.27 8.11 17 5 12 5ZM12 17C8.69 17 5.85 14.84 4.34 12C5.85 9.16 8.69 7 12 7C15.31 7 18.15 9.16 19.66 12C18.15 14.84 15.31 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C7 6 2.73 9.11 1 13C1.73 14.66 2.92 16.15 4.34 17.38L2.71 19L4.12 20.41L20.41 4.12L19 2.71L15.66 6H12ZM12 18C8.69 18 5.85 15.84 4.34 13C4.91 11.97 5.7 11.06 6.66 10.34L5.24 8.92C3.92 10.07 2.92 11.66 2.29 13.5C2.73 14.64 3.33 15.68 4.12 16.59L5.53 15.18C6.85 16.24 8.37 17 10 17H12V18ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C12.63 15 13.22 14.79 13.69 14.41L12.34 13.05C12.23 13.02 12.12 13 12 13C11.45 13 11 12.55 11 12C11 11.88 11.02 11.77 11.05 11.66L9.64 10.25C9.23 10.72 9 11.34 9 12C9 13.66 10.34 15 12 15C13.14 15 14.12 14.31 14.53 13.34L16.37 15.18C16.69 14.71 16.94 14.19 17.11 13.63C17.37 12.85 17.5 12.03 17.5 11.18L19.67 9.01C18.31 7.39 16.31 6 14 6H12V9Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </span>
                </div>
                {formErrors.password && (
                  <p className="text-danger text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="mb-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer rounded-lg border border-[#6A1B4D] bg-[#6A1B4D] p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Memproses...' : 'Masuk'}
                </button>
              </div>

              <button 
                onClick={handleLoginGoogle}
                type="button"
                className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-4 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
              >
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_191_13499)">
                      <path
                        d="M19.999 10.2217C20.0111 9.53428 19.9387 8.84788 19.7834 8.17737H10.2031V11.8884H15.8266C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.9986 13.2661 19.9986 10.2217"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.2055 19.9999C12.9605 19.9999 15.2734 19.111 16.9629 17.5777L13.7429 15.1331C12.8813 15.7221 11.7248 16.1333 10.2055 16.1333C8.91513 16.1259 7.65991 15.7205 6.61791 14.9745C5.57592 14.2286 4.80007 13.1801 4.40044 11.9777L4.28085 11.9877L1.13101 14.3765L1.08984 14.4887C1.93817 16.1456 3.24007 17.5386 4.84997 18.5118C6.45987 19.4851 8.31429 20.0004 10.2059 19.9999"
                        fill="#34A853"
                      />
                      <path
                        d="M4.39899 11.9777C4.1758 11.3411 4.06063 10.673 4.05807 9.99996C4.06218 9.32799 4.1731 8.66075 4.38684 8.02225L4.38115 7.88968L1.19269 5.4624L1.0884 5.51101C0.372763 6.90343 0 8.4408 0 9.99987C0 11.5589 0.372763 13.0963 1.0884 14.4887L4.39899 11.9777Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.2059 3.86663C11.668 3.84438 13.0822 4.37803 14.1515 5.35558L17.0313 2.59996C15.1843 0.901848 12.7383 -0.0298855 10.2059 -3.6784e-05C8.31431 -0.000477834 6.4599 0.514732 4.85001 1.48798C3.24011 2.46124 1.9382 3.85416 1.08984 5.51101L4.38946 8.02225C4.79303 6.82005 5.57145 5.77231 6.61498 5.02675C7.65851 4.28118 8.9145 3.87541 10.2059 3.86663Z"
                        fill="#EB4335"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_191_13499">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                Masuk dengan Google
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;