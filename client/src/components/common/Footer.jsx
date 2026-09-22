import { Link } from 'react-router-dom';
import { GiCow } from 'react-icons/gi';
import { HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const Footer = ({ settings = {} }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm">
                <img src="/assets/dajiraj_logo.png" alt="Dajiraj Dairy & Farm" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-lg">DAJIRAJ DAIRY</h3>
                <p className="text-golden-400 text-xs font-medium tracking-wider">& FARM</p>
              </div>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed mb-4">
              {settings.tagline || 'Milking with Care'} • {settings.secondaryTagline || 'Farming with Love'}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {settings.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <FaFacebook size={16} />
                </a>
              )}
              {settings.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <FaInstagram size={16} />
                </a>
              )}
              {settings.socialLinks?.whatsapp && (
                <a href={`https://wa.me/${settings.socialLinks.whatsapp}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                  <FaWhatsapp size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-golden-400 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Products', path: '/products' },
                { name: 'Contact Us', path: '/contact' },
                { name: 'Send Inquiry', path: '/inquiry' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-primary-200 hover:text-white text-sm transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-golden-400 mb-4 text-sm uppercase tracking-wider">Our Products</h4>
            <ul className="space-y-2.5">
              {['Fresh Cow Milk', 'Buffalo Milk', 'Fresh Curd', 'Paneer', 'Ghee', 'Buttermilk'].map((item) => (
                <li key={item}>
                  <span className="text-primary-200 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-golden-400 mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              {settings.phone && (
                <li className="flex items-start gap-2.5">
                  <HiPhone className="text-golden-400 mt-0.5 flex-shrink-0" size={16} />
                  <a href={`tel:${settings.phone}`} className="text-primary-200 hover:text-white text-sm transition">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-start gap-2.5">
                  <HiMail className="text-golden-400 mt-0.5 flex-shrink-0" size={16} />
                  <a href={`mailto:${settings.email}`} className="text-primary-200 hover:text-white text-sm transition break-all">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <HiLocationMarker className="text-golden-400 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-primary-200 text-sm">{settings.address}</span>
                </li>
              )}
              {settings.businessHours && (
                <li className="text-primary-200 text-sm mt-2">
                  <span className="text-golden-400 font-medium">Hours:</span><br />
                  {settings.businessHours}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-primary-300 text-xs">
            © {currentYear} {settings.businessName || 'DAJIRAJ DAIRY & FARM'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
