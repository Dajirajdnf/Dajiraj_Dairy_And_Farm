const PlaceholderPage = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-50 text-center">
      <p className="text-gray-500">This page is under development and will be available soon.</p>
    </div>
  </div>
);

// Admin placeholder pages
export const DeliveriesPage = () => <PlaceholderPage title="Milk Delivery Management" />;
export const DeliveryBoysPage = () => <PlaceholderPage title="Delivery Boys" />;
export const StaffPage = () => <PlaceholderPage title="Staff Management" />;
export const ProductsPage = () => <PlaceholderPage title="Products" />;
export const StockPage = () => <PlaceholderPage title="Stock Management" />;
export const InvoicesPage = () => <PlaceholderPage title="Invoices" />;
export const ReportsPage = () => <PlaceholderPage title="Reports" />;
export const InquiriesPage = () => <PlaceholderPage title="Inquiries" />;
export const SettingsPage = () => <PlaceholderPage title="Settings" />;

// Delivery boy placeholder pages
export const DeliveryHistoryPage = () => <PlaceholderPage title="Delivery History" />;
export const ProfilePage = () => <PlaceholderPage title="Profile" />;
