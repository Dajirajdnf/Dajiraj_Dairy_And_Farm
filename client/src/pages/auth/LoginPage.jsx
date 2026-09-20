import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GiCow } from 'react-icons/gi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      // Role-based safe redirect
      if (user.role === 'admin' || user.role === 'staff') {
        const from = location.state?.from?.pathname;
        if (from && from.startsWith('/admin')) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      } else if (user.role === 'delivery' || user.role === 'delivery_boy') {
        const from = location.state?.from?.pathname;
        if (from && from.startsWith('/delivery')) {
          navigate(from, { replace: true });
        } else {
          navigate('/delivery', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-golden-50 px-4">
      <div className="w-full max-w-md" style={{ animation: 'scale-in 0.3s ease-out' }}>
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <GiCow className="text-golden-400 text-3xl" />
            </div>
            <h1 className="text-xl font-bold text-white">DAJIRAJ DAIRY & FARM</h1>
            <p className="text-golden-300 text-sm mt-1 font-medium">Milking with Care • Farming with Love</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">Welcome Back</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                  autoComplete="current-password"
                />
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 focus:ring-4 focus:ring-primary-100 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.6s linear infinite' }}></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-6">
              Contact administrator for account access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
