import { GiCow, GiFarmer } from 'react-icons/gi';
import { HiOutlineHeart, HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';

const AboutPage = () => {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">About Us</h1>
          <p className="text-primary-200 text-lg">Our Story, Our Commitment</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiCow className="text-primary-500 text-4xl" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome to <span className="text-primary-500">Dajiraj Dairy & Farm</span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                At <strong className="text-primary-700">Dajiraj Dairy & Farm</strong>, we are passionate about
                delivering the freshest, purest dairy products directly from our farm to your family. Our journey
                is rooted in a deep love for farming and a commitment to providing dairy products that are as
                natural and wholesome as nature intended.
              </p>

              <p>
                Our farming philosophy centers around <em className="text-golden-600 font-semibold">"Milking with Care"</em> and{' '}
                <em className="text-golden-600 font-semibold">"Farming with Love"</em>. These aren't just taglines — they
                represent the core values that guide everything we do, from how we care for our cattle to how
                we handle and deliver our dairy products.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                {[
                  { icon: HiOutlineHeart, title: 'Care for Animals', desc: 'Our cattle are treated with love, fed nutritious natural feed, and given open space to graze.' },
                  { icon: HiOutlineSparkles, title: 'Quality First', desc: 'Every step of our process is designed to maintain the highest quality and freshness.' },
                  { icon: HiOutlineShieldCheck, title: 'Trust & Reliability', desc: 'We deliver consistently, rain or shine, because your family deserves the best.' },
                ].map((item, i) => (
                  <div key={i} className="bg-primary-50 rounded-2xl p-6 text-center">
                    <item.icon className="text-primary-500 text-3xl mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <p>
                We understand that milk is a daily essential for families, and we take that responsibility seriously.
                Our daily milk delivery service ensures that you receive fresh milk at your doorstep every morning,
                with quantities customized to your family's needs.
              </p>

              <p>
                Beyond milk, we produce a range of traditional dairy products including curd, paneer, ghee, and
                buttermilk — all made using time-tested methods that preserve the natural goodness of fresh milk.
              </p>

              <p>
                We are committed to building lasting relationships with our customers based on trust, quality, and
                genuine care. When you choose Dajiraj Dairy & Farm, you're not just buying dairy products — you're
                becoming part of our family.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
