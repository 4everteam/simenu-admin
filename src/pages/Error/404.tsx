import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-9xl font-bold text-[#691B4C]">404</h1>
        <h2 className="mb-6 text-3xl font-semibold text-black">Halaman Tidak Ditemukan</h2>
        <p className="mb-8 text-gray-600">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-[#691B4C] px-6 py-3 text-center font-medium text-white hover:bg-[#691B4C]/90"
        >
          Kembali ke Halaman Sebelumnya
        </Link>
      </div>
    </div>
  );
};

export default Error404;