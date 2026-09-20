import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DeliveryLayout from './layouts/DeliveryLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProductsPage from './pages/public/ProductsPage';
import ContactPage from './pages/public/ContactPage';
import InquiryPage from './pages/public/InquiryPage';
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import CustomersPage from './pages/admin/CustomersPage';
import DeliveriesPage from './pages/admin/DeliveriesPage';
import DeliveryBoysPage from './pages/admin/DeliveryBoysPage';
import StaffPage from './pages/admin/StaffPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import StockPage from './pages/admin/StockPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import ReportsPage from './pages/admin/ReportsPage';
import InquiriesPage from './pages/admin/InquiriesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Delivery Boy Pages
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import TodayDeliveriesPage from './pages/delivery/TodayDeliveriesPage';
import DeliveryHistoryPage from './pages/delivery/DeliveryHistoryPage';
import ProfilePage from './pages/delivery/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />

        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/inquiry" element={<InquiryPage />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Panel (Admin & Staff) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="delivery-boys" element={<DeliveryBoysPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Delivery Boy Mobile Panel */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute roles={['delivery', 'delivery_boy']}>
                <DeliveryLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DeliveryDashboardPage />} />
            <Route path="today" element={<TodayDeliveriesPage />} />
            <Route path="history" element={<DeliveryHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
