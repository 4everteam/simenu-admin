import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "../../fetch/auth";

interface FormError {
  [key: string]: string;
}

interface AuthResponse {
  token?: string;
  user?: any;
  errors?: string | Array<{ field: string; message: string }> | Record<string, string>;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      const code = window.location.search;
      if (!code) {
        window.location.href = '/admin/auth/signin';
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        const response = await getAuthToken({ code });
        
        if (response && typeof response === 'object' && 'errors' in response) {
          const newErrors: string[] = [];
          
          if (Array.isArray(response.errors)) {
            response.errors.forEach((err: { field: string; message: string }) => {
              if (err.message) {
                newErrors.push(err.message);
              }
            });
          } else if (typeof response.errors === 'object' && response.errors !== null) {
            Object.values(response.errors).forEach((message) => {
              if (typeof message === 'string') {
                newErrors.push(message);
              }
            });
          } else if (typeof response.errors === 'string') {
            newErrors.push(response.errors);
          }
          
          setErrors(newErrors);
        } else if (
          response && 
          typeof response === 'object' && 
          'token' in response && 
          'user' in response
        ) {
          localStorage.setItem('user_data', JSON.stringify({
            token: response.token,
            user: response.user
          }));
          navigate('/admin/dashboard');
          return;
        } else {
          setErrors(['Gagal login: Respons tidak valid']);
        }
      } catch (err) {
        console.error(`Terjadi kesalahan saat login: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setErrors([`Terjadi kesalahan saat login: ${err instanceof Error ? err.message : 'Unknown error'}`]);
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-6 py-4 text-center">
            <div className="mb-2 text-2xl font-bold">Loading...</div>
            <p>Memproses autentikasi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errors.length > 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-6 py-4">
            <div className="mb-2 text-2xl font-bold text-center">Error</div>
            <div className="rounded bg-red-50 p-4 text-red-600">
              {errors.map((err, index) => (
                <div key={index} className="mb-1">{err}</div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/admin/auth/signin')}
                className="rounded bg-[#6A1B4D] px-4 py-2 text-white hover:bg-[#6A1B4D]/90"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;