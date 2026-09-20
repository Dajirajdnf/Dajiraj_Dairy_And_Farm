import { useState } from 'react';
import { inquiryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const InquiryPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', product: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const productOptions = ['Fresh Cow Milk', 'Buffalo Milk', 'Curd', 'Paneer', 'Ghee', 'Buttermilk', 'Daily Milk Delivery', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await inquiryAPI.create(form);
      toast.success(data.message);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Inquiry Submitted!</h1>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your inquiry has been submitted successfully. We will get back to you soon!
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', product: '', message: '' }); }}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition"
            >
              Send Another Inquiry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Send Inquiry</h1>
          <p className="text-primary-200 text-lg">Interested in our products? Let us know!</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service Interested In</label>
                <select
                  value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                >
                  <option value="">Select a product</option>
                  {productOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
                  placeholder="Tell us about your requirements..."
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition disabled:opacity-60 text-sm"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InquiryPage;
