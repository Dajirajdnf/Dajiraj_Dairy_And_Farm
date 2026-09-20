import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiCow } from 'react-icons/gi';
import { HiOutlineHome, HiOutlineTruck, HiOutlineClock, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';

const DeliveryLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/delivery', icon: HiOutlineHome },
    { name: "Today's Deliveries", path: '/delivery/today', icon: HiOutlineTruck },
    { name: 'History', path: '/delivery/history', icon: HiOutlineClock },
    { name: 'Profile', path: '/delivery/profile', icon: HiOutlineUser },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <header className="bg-primary-600 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center">
              <GiCow className="text-golden-400 text-lg" />
            </div>
            <div>
              <h1 className="text-sm font-bold">DAJIRAJ DAIRY</h1>
              <p className="text-[9px] text-golden-300 font-medium">Delivery Panel</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">{user?.name}</p>
            <p className="text-[10px] text-primary-200">{user?.assignedArea || 'Delivery'}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation (mobile-optimized) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/delivery'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <link.icon size={22} />
              <span className="text-[10px]">{link.name}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-500 transition"
          >
            <HiOutlineLogout size={22} />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DeliveryLayout;
