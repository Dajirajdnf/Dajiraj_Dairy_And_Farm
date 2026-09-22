import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { HiMenu, HiX, HiOutlineLogout } from 'react-icons/hi';
import { GiCow } from 'react-icons/gi';
import { useAuth } from '../../context/AuthContext';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
    { name: 'Inquiry', path: '/inquiry' },
  ];

  const isActive = (path) => location.pathname === path;

  const dashboardPath = user?.role === 'delivery' || user?.role === 'delivery_boy' ? '/delivery' : '/admin';
  const dashboardLabel = user?.role === 'delivery' || user?.role === 'delivery_boy' ? 'Delivery Panel' : 'Admin Panel';

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform bg-white">
              <img src="/assets/dajiraj_logo.png" alt="Dajiraj Dairy & Farm" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-bold text-primary-700 leading-tight">DAJIRAJ DAIRY</h1>
              <p className="text-[10px] md:text-xs text-golden-500 font-medium tracking-wider">& FARM</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-3">
                <Link
                  to={dashboardPath}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  {dashboardLabel}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Log out"
                >
                  <HiOutlineLogout size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-all shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg" style={{ animation: 'slide-up 0.2s ease-out' }}>
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="pt-2 space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold text-center"
                >
                  {dashboardLabel}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium text-center hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 bg-primary-500 text-white rounded-lg text-sm font-medium text-center mt-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
