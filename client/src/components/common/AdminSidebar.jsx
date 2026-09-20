import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GiCow } from 'react-icons/gi';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineTruck, HiOutlineUserGroup,
  HiOutlineCube, HiOutlineArchive, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineMail, HiOutlineCog, HiOutlineLogout, HiOutlineMenu, HiOutlineX,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const AdminSidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: HiOutlineHome },
    { name: 'Customers', path: '/admin/customers', icon: HiOutlineUsers },
    { name: 'Milk Delivery', path: '/admin/deliveries', icon: HiOutlineTruck },
    { name: 'Delivery Boys', path: '/admin/delivery-boys', icon: HiOutlineUserGroup },
    { name: 'Staff', path: '/admin/staff', icon: HiOutlineUserGroup },
    { name: 'Products', path: '/admin/products', icon: HiOutlineCube },
    { name: 'Stock', path: '/admin/stock', icon: HiOutlineArchive },
    { name: 'Invoices', path: '/admin/invoices', icon: HiOutlineDocumentText },
    { name: 'Reports', path: '/admin/reports', icon: HiOutlineChartBar },
    { name: 'Inquiries', path: '/admin/inquiries', icon: HiOutlineMail },
    { name: 'Settings', path: '/admin/settings', icon: HiOutlineCog },
  ];

  const staffLinks = adminLinks.filter((link) => {
    if (link.path === '/admin') return true;
    if (link.path === '/admin/customers' && hasPermission('customers')) return true;
    if (link.path === '/admin/deliveries' && hasPermission('deliveries')) return true;
    if (link.path === '/admin/stock' && hasPermission('stock')) return true;
    if (link.path === '/admin/products' && hasPermission('stock')) return true;
    if (link.path === '/admin/invoices' && hasPermission('invoices')) return true;
    if (link.path === '/admin/inquiries' && hasPermission('inquiries')) return true;
    return false;
  });

  const links = user?.role === 'admin' ? adminLinks : staffLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-primary-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
            <GiCow className="text-golden-400 text-xl" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">DAJIRAJ DAIRY</h2>
              <p className="text-[10px] text-golden-400 font-medium tracking-wider">& FARM</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-200 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <link.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{link.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-primary-700/50">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-primary-300 capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <HiOutlineLogout size={20} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-primary-500 text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-primary-800 z-40 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
