import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { GiMilkCarton } from 'react-icons/gi';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const categories = ['All', 'Milk', 'Curd', 'Paneer', 'Buttermilk', 'Ghee', 'Other Dairy Products'];

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      const params = { publicOnly: 'true' };
      if (category && category !== 'All') params.category = category;
      const { data } = await productAPI.getPublic();
      let filtered = data.data || [];
      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category === category);
      }
      setProducts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Products</h1>
          <p className="text-primary-200 text-lg">Fresh Dairy Products From Our Farm</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  (cat === 'All' && !category) || cat === category
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <GiMilkCarton className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="h-44 bg-gradient-to-br from-primary-50 to-golden-50 flex items-center justify-center">
                    <GiMilkCarton className="text-6xl text-primary-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                      <span className="text-xs px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xl font-bold text-primary-600">₹{product.sellingPrice}</span>
                      <span className="text-sm text-gray-400">per {product.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
