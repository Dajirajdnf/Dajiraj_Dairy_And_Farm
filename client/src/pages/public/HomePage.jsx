import { Link, useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { GiCow, GiMilkCarton, GiWheat, GiFarmer } from 'react-icons/gi';
import { HiOutlineHeart, HiOutlineShieldCheck, HiOutlineTruck, HiOutlineSparkles, HiOutlineStar, HiOutlinePhone } from 'react-icons/hi';

const HomePage = () => {
  const { settings } = useOutletContext();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productAPI.getPublic()
      .then(({ data }) => setProducts(data.data?.slice(0, 6) || []))
      .catch(() => {});
  }, []);

  const whyChooseUs = [
    { icon: HiOutlineSparkles, title: 'Fresh Daily', desc: 'Milk delivered fresh from our farm every single morning.' },
    { icon: GiFarmer, title: 'Farm Fresh', desc: 'Directly from our healthy, well-cared-for cows to your doorstep.' },
    { icon: HiOutlineShieldCheck, title: 'Quality Focused', desc: 'Strict quality checks ensure the purest dairy products.' },
    { icon: HiOutlineHeart, title: 'Hygienic Handling', desc: 'Modern hygiene practices from milking to delivery.' },
    { icon: HiOutlineTruck, title: 'Reliable Delivery', desc: 'Consistent, on-time delivery you can count on daily.' },
    { icon: HiOutlineStar, title: 'Farming with Love', desc: 'Our cows are treated with love and care, naturally.' },
  ];

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-60 h-60 border-2 border-white rounded-full"></div>
          <div className="absolute top-40 right-40 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center" style={{ animation: 'slide-up 0.6s ease-out' }}>
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
              <GiCow className="text-golden-400 text-4xl md:text-5xl" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              DAJIRAJ DAIRY
              <span className="block text-golden-400">& FARM</span>
            </h1>

            <p className="text-lg md:text-xl text-golden-300 font-semibold mb-2">
              Milking with Care
            </p>
            <p className="text-base md:text-lg text-primary-200 font-medium mb-8">
              Farming with Love
            </p>

            <p className="text-primary-100 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Farm-fresh dairy products delivered daily to your doorstep.
              Pure, natural, and crafted with love from our family farm to yours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-golden-400 text-primary-900 rounded-xl font-semibold hover:bg-golden-300 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                Contact Us
              </Link>
              <Link
                to="/inquiry"
                className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 text-sm"
              >
                Send Inquiry
              </Link>
              <Link
                to="/products"
                className="px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg text-sm"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 40L48 35C96 30 192 20 288 22C384 24 480 38 576 44C672 50 768 48 864 42C960 36 1056 26 1152 24C1248 22 1344 28 1392 31L1440 34V80H0V40Z" fill="#fafbfc"/>
          </svg>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="py-16 md:py-20 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center" style={{ animation: 'fade-in 0.5s ease-out' }}>
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-semibold mb-4 tracking-wider uppercase">
              About Us
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Fresh From Our Farm <span className="text-primary-500">To Your Family</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At Dajiraj Dairy & Farm, we believe in delivering the purest and freshest dairy products
              directly from our farm to your table. Our commitment to quality, hygiene, and animal welfare
              ensures that every drop of milk is produced with care and love.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm"
            >
              Learn More About Us →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      {products.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-golden-50 text-golden-600 rounded-full text-xs font-semibold mb-4 tracking-wider uppercase">
                Our Products
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Fresh Dairy <span className="text-primary-500">Products</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-primary-50 to-golden-50 flex items-center justify-center">
                    <GiMilkCarton className="text-5xl text-primary-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">₹{product.sellingPrice}</span>
                      <span className="text-xs text-gray-400">per {product.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition shadow-sm"
              >
                View All Products →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 md:py-20 bg-primary-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-600 rounded-full text-xs font-semibold mb-4 tracking-wider uppercase">
              Why Choose Us
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              What Makes Us <span className="text-primary-500">Different</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border border-gray-50"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition">
                  <item.icon className="text-primary-500 text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DAILY MILK DELIVERY ===== */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative">
              <HiOutlineTruck className="mx-auto text-4xl text-golden-400 mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Daily Milk Delivery Service
              </h2>
              <p className="text-primary-100 max-w-xl mx-auto mb-8 leading-relaxed">
                Subscribe to our daily milk delivery service and get fresh, pure milk
                delivered right to your doorstep every morning. Customize your quantity
                and enjoy hassle-free daily dairy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/inquiry"
                  className="px-8 py-3 bg-golden-400 text-primary-900 rounded-xl font-semibold hover:bg-golden-300 transition shadow-lg text-sm"
                >
                  Subscribe Now
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition border border-white/20 text-sm"
                >
                  <HiOutlinePhone className="inline mr-2" />
                  Call Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="py-16 md:py-20 bg-golden-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get <span className="text-primary-500">Fresh Dairy</span>?
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            Contact us today to start your daily milk delivery or inquire about our products.
            We'd love to serve your family!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition shadow-md text-sm"
            >
              Contact Us
            </Link>
            <Link
              to="/inquiry"
              className="px-8 py-3.5 bg-golden-400 text-primary-900 rounded-xl font-semibold hover:bg-golden-300 transition shadow-md text-sm"
            >
              Send Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
