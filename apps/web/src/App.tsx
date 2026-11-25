import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StaffAuthProvider } from './context/StaffAuthContext';
import AdminLayout from './components/admin/AdminLayout';
import { AdminUiProvider } from './components/admin/AdminUiProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nProvider } from './i18n/I18nContext';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductAdd from './admin/AdminProductAdd';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminCategories from './admin/AdminCategories';
import AdminAttributes from './admin/AdminAttributes';
import AdminInventory from './admin/AdminInventory';
import AdminInventoryHistory from './admin/AdminInventoryHistory';
import AdminInventoryAlerts from './admin/AdminInventoryAlerts';
import AdminSuppliers from './admin/AdminSuppliers';
import AdminStockReceipts from './admin/AdminStockReceipts';
import AdminStockReceiptNew from './admin/AdminStockReceiptNew';
import AdminStockReceiptDetail from './admin/AdminStockReceiptDetail';
import AdminCoupons from './admin/AdminCoupons';
import AdminPromotions from './admin/AdminPromotions';
import AdminReports from './admin/AdminReports';
import AdminProfile from './admin/AdminProfile';
import AdminSettings from './admin/AdminSettings';
import AdminLogin from './admin/AdminLogin';
import AdminStaff from './admin/AdminStaff';
import AdminRoles from './admin/AdminRoles';
import AdminLots from './admin/AdminLots';
import AdminPOS from './admin/AdminPOS';
import './App.css';
import './styles/admin-staff.css';

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <StaffAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<AdminUiProvider><AdminLayout /></AdminUiProvider>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AdminProductAdd />} />
                  <Route path="products/edit/:id" element={<AdminProductAdd />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="attributes" element={<AdminAttributes />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route element={<AdminProtectedRoute permission="inventory.view" />}><Route path="inventory/lots" element={<AdminLots />} /></Route>
                  <Route element={<AdminProtectedRoute permission="orders.update_status" />}><Route path="pos" element={<AdminPOS />} /></Route>
                  <Route path="inventory/history" element={<AdminInventoryHistory />} />
                  <Route path="inventory/alerts" element={<AdminInventoryAlerts />} />
                  <Route path="suppliers" element={<AdminSuppliers />} />
                  <Route path="stock-receipts" element={<AdminStockReceipts />} />
                  <Route path="stock-receipts/new" element={<AdminStockReceiptNew />} />
                  <Route path="stock-receipts/:id" element={<AdminStockReceiptDetail />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route element={<AdminProtectedRoute permission="staff.view" />}>
                    <Route path="staff" element={<AdminStaff />} />
                  </Route>
                  <Route element={<AdminProtectedRoute permission="roles.manage" />}>
                    <Route path="roles" element={<AdminRoles />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </BrowserRouter>
        </StaffAuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
