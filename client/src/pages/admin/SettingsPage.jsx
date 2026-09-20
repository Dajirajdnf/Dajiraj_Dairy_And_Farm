import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { HiOutlineCog, HiOutlineSave, HiOutlineMail, HiOutlineCurrencyRupee, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  const [formData, setFormData] = useState({
    businessName: 'DAJIRAJ DAIRY & FARM',
    tagline: 'Milking with Care',
    secondaryTagline: 'Farming with Love',
    phone: '',
    email: '',
    address: '',
    googleMapsLink: '',
    businessHours: '5:00 AM - 9:00 PM',
    defaultMilkRate: 60,
    invoicePrefix: 'DDF',
    deliveryAdjustmentMl: 250,
    taxEnabled: false,
    taxRate: 0,
    taxLabel: 'GST',
    paymentTerms: 'Due on receipt',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFromName: 'Dajiraj Dairy & Farm',
    smtpFromEmail: '',
    smtpSecure: false,
    autoEmailInvoice: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.get();
      if (res.data.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data.data,
          smtpPass: '', // don't expose password
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.smtpPass) {
        delete payload.smtpPass;
      }
      await settingsAPI.update(payload);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await settingsAPI.testSmtp();
      toast.success(res.data.message || 'SMTP connection test successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'SMTP test failed. Verify host, port, and credentials.');
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Farm & System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure business profile, milk pricing defaults, and email delivery</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition disabled:opacity-50"
        >
          <HiOutlineSave className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <HiOutlineLocationMarker className="w-5 h-5 text-emerald-600" />
            Farm & Brand Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Primary Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="contact@dajirajdairy.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Farm / Office Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="Survey No. 42, Green Meadows Village, Gujarat"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Billing Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <HiOutlineCurrencyRupee className="w-5 h-5 text-emerald-600" />
            Pricing & Invoicing Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Default Milk Rate (₹/L)</label>
              <input
                type="number"
                step="0.5"
                value={formData.defaultMilkRate}
                onChange={(e) => handleChange('defaultMilkRate', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. DDF"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivery +/- Step (ml)</label>
              <input
                type="number"
                step="50"
                value={formData.deliveryAdjustmentMl}
                onChange={(e) => handleChange('deliveryAdjustmentMl', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SMTP & Automated Email Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <HiOutlineMail className="w-5 h-5 text-emerald-600" />
              Email & SMTP Notifications
            </h3>
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="text-xs text-emerald-600 border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {testingSmtp ? 'Testing...' : 'Test SMTP Connection'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">SMTP Host</label>
              <input
                type="text"
                value={formData.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">SMTP Port</label>
              <input
                type="number"
                value={formData.smtpPort}
                onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">SMTP Username / Email</label>
              <input
                type="text"
                value={formData.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="billing@dajirajdairy.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                SMTP App Password {formData.smtpUser ? '(leave blank to keep existing)' : ''}
              </label>
              <input
                type="password"
                value={formData.smtpPass}
                onChange={(e) => handleChange('smtpPass', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoEmailInvoice}
                onChange={(e) => handleChange('autoEmailInvoice', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>Automatically email invoices to customer when monthly bill is generated</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition disabled:opacity-50"
          >
            <HiOutlineSave className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
