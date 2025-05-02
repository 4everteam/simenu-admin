import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import TableManagement from './pages/TableManagement/TableManagement';
import FormTableManagement from './pages/TableManagement/FormTableManagement';
import DetailTable from './pages/TableManagement/DetailTable';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import FormProductManagement from './pages/ProductManagement/FormProductManagement';
import CategoryManagement from './pages/CategoryManagement/CategoryManagement';
import FormCategoryManagement from './pages/CategoryManagement/FormCategoryManagement';
import DetailProduct from './pages/ProductManagement/DetailProduct';
import InventoryManagement from './pages/InventoryManagement/InventoryManagement';
import FormInventoryManagement from './pages/InventoryManagement/FormInventoryManagement';
import AuthCallback from './pages/Authentication/AuthCallback';
import Error404 from './pages/Error/404';
import Error401 from './pages/Error/401';
import useAuth from './hooks/AuthCheck';
import CreateOrder from './pages/OrderManagement/CreateOrder';
import DetailOrder from './pages/OrderManagement/DetailOrder';
import OrderManagement from './pages/OrderManagement/OrderManagement';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, role } = useAuth();
  if (isLoggedIn === null) {
    return <Loader />;
  }
  
  if (role === 'Guest') {
    return <Navigate to="/401" replace />;
  }
  
  if (!isLoggedIn || role !== 'Admin') {
    return <Navigate to="/admin/auth/signin" replace />;
  }
  
  return <>{children}</>;
};


function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        {/* 404 Route - This should be the last route */}
        <Route
          path="*"
          element={
            <>
              <PageTitle title="Halaman Tidak Ditemukan | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
              <Error404 />
            </>
          }
        />
        {/* 404 Route - This should be the last route */}
        <Route
          path="/401"
          element={
            <>
              <PageTitle title="Tidak memiliki akses | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
              <Error401 />
            </>
          }
        />
        <Route
          path="/admin/auth/signin"
          element={
            <>
              <PageTitle title="Signin | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <>
              <AuthCallback />
            </>
          }
        />
        <Route element={
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
          }>
          <Route
            path='/admin/dashboard'
            element={
              <>
                <PageTitle title="Dashboard | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <ECommerce />
              </>
            }
          />
          <Route
            index
            element={
              <>
                <PageTitle title="Dashboard | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/admin/kelola-kategori"
            element={
              <>
                <PageTitle title="Kelola Kategori | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <CategoryManagement />
              </>
            }
          />
          <Route
            path="/admin/tambah-kelola-kategori"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormCategoryManagement titlePage="Tambah Kategori Baru"/>
              </>
            }
          />
          <Route
            path="/admin/update-kelola-kategori/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormCategoryManagement titlePage="Ubah Kategori"/>
              </>
            }
          />
          <Route
            path="/admin/kelola-produk"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <ProductManagement />
              </>
            }
          />
          <Route
            path="/admin/detail-produk/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <DetailProduct />
              </>
            }
          />
          <Route
            path="/admin/tambah-kelola-produk"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormProductManagement titlePage="Tambah Produk Baru"/>
              </>
            }
          />
          <Route
            path="/admin/update-kelola-produk/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormProductManagement titlePage="Ubah Produk"/>
              </>
            }
          />
          <Route
            path="/admin/kelola-inventaris"
            element={
              <>
                <PageTitle title="Kelola Inventaris | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <InventoryManagement />
              </>
            }
          />
          <Route
            path="/admin/tambah-kelola-inventaris"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormInventoryManagement titlePage="Tambah Data Baru"/>
              </>
            }
          />
          <Route
            path="/admin/update-kelola-inventaris/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormInventoryManagement titlePage="Ubah Inventaris"/>
              </>
            }
          />
          <Route
            path="/admin/kelola-meja"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <TableManagement />
              </>
            }
          />
          <Route
            path="/admin/detail-meja/:code"
            element={
              <>
                <PageTitle title="Detail Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <DetailTable />
              </>
            }
          />
          <Route
            path="/admin/tambah-kelola-meja"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormTableManagement titlePage="Tambah Meja Baru"/>
              </>
            }
          />
          <Route
            path="/admin/update-kelola-meja/:code"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormTableManagement titlePage="Ubah Meja"/>
              </>
            }
          />
          <Route
            path="/admin/kelola-pesanan"
            element={
              <>
                <PageTitle title="Kelola Pesanan | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <OrderManagement />
              </>
            }
          />
          <Route
            path="/admin/detail-pesanan/:id"
            element={
              <>
                <PageTitle title="Detail Kelola Pesanan | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <DetailOrder />
              </>
            }
          />
          <Route
            path="/admin/tambah-pesanan"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <CreateOrder titlePage="Tambah Meja Baru"/>
              </>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <>
                <PageTitle title="Settings | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Settings />
              </>
            }
          />
          <Route
            path="/admin/chart"
            element={
              <>
                <PageTitle title="Basic Chart | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Chart />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
