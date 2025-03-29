import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

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
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
              <SignIn />
            </>
          }
        />
        <Route element={<DefaultLayout />}>
          <Route
            path='/dashboard'
            element={
              <>
                <PageTitle title="eCommerce Dashboard | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/calendar"
            element={
              <>
                <PageTitle title="Calendar | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Calendar />
              </>
            }
          />
          <Route
            path="/tables"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <Tables />
              </>
            }
          />
          <Route
            path="/kelola-kategori"
            element={
              <>
                <PageTitle title="Kelola Kategori | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <CategoryManagement />
              </>
            }
          />
          <Route
            path="/tambah-kelola-kategori"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormCategoryManagement titlePage="Tambah Kategori Baru"/>
              </>
            }
          />
          <Route
            path="/update-kelola-kategori/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormCategoryManagement titlePage="Ubah Kategori"/>
              </>
            }
          />
          <Route
            path="/kelola-produk"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <ProductManagement />
              </>
            }
          />
          <Route
            path="/detail-produk/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <DetailProduct />
              </>
            }
          />
          <Route
            path="/tambah-kelola-produk"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormProductManagement titlePage="Tambah Produk Baru"/>
              </>
            }
          />
          <Route
            path="/update-kelola-produk/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormProductManagement titlePage="Ubah Produk"/>
              </>
            }
          />
          <Route
            path="/kelola-inventaris"
            element={
              <>
                <PageTitle title="Kelola Inventaris | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <InventoryManagement />
              </>
            }
          />
          <Route
            path="/tambah-kelola-inventaris"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormInventoryManagement titlePage="Tambah Data Baru"/>
              </>
            }
          />
          <Route
            path="/update-kelola-inventaris/:id"
            element={
              <>
                <PageTitle title="Kelola Produk | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormInventoryManagement titlePage="Ubah Inventaris"/>
              </>
            }
          />
          <Route
            path="/kelola-meja"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <TableManagement />
              </>
            }
          />
          <Route
            path="/detail-meja/:code"
            element={
              <>
                <PageTitle title="Detail Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <DetailTable />
              </>
            }
          />
          <Route
            path="/tambah-kelola-meja"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormTableManagement titlePage="Tambah Meja Baru"/>
              </>
            }
          />
          <Route
            path="/update-kelola-meja/:code"
            element={
              <>
                <PageTitle title="Kelola Meja | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu " />
                <FormTableManagement titlePage="Ubah Meja"/>
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <PageTitle title="Settings | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Settings />
              </>
            }
          />
          <Route
            path="/chart"
            element={
              <>
                <PageTitle title="Basic Chart | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Chart />
              </>
            }
          />
          <Route
            path="/ui/alerts"
            element={
              <>
                <PageTitle title="Alerts | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Alerts />
              </>
            }
          />
          <Route
            path="/ui/buttons"
            element={
              <>
                <PageTitle title="Buttons | siMenuAdmin - Scan, Pesan, Santai! Semua Mudah dengan siMenu" />
                <Buttons />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
