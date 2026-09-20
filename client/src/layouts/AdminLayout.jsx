import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/common/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
