import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';

export default function RootLayout() {
  return (
    <>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-sage-400">
              ChartedArt
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/create" className="text-charcoal-300 hover:text-sage-400">
                Create Kit
              </Link>
              <Link to="/gallery" className="text-charcoal-300 hover:text-sage-400">
                Gallery
              </Link>
              <Link to="/events" className="text-charcoal-300 hover:text-sage-400">
                Events
              </Link>
              <Link to="/blog" className="text-charcoal-300 hover:text-sage-400">
                Blog
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 text-charcoal-300 hover:text-sage-400">
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <Link to="/account" className="p-2 text-charcoal-300 hover:text-sage-400">
              <User className="w-6 h-6" />
            </Link>
            <button className="md:hidden p-2 text-charcoal-300">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-charcoal-300 text-cream-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ChartedArt</h3>
              <p className="text-cream-200">Transform your photos into beautiful paint-by-numbers artwork.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/create" className="hover:text-sage-300">Create Kit</Link></li>
                <li><Link to="/gallery" className="hover:text-sage-300">Gallery</Link></li>
                <li><Link to="/events" className="hover:text-sage-300">Events</Link></li>
                <li><Link to="/blog" className="hover:text-sage-300">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="hover:text-sage-300">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-sage-300">Shipping Info</Link></li>
                <li><Link to="/contact" className="hover:text-sage-300">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-sage-300">Facebook</Link></li>
                <li><Link to="#" className="hover:text-sage-300">Instagram</Link></li>
                <li><Link to="#" className="hover:text-sage-300">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-charcoal-200 text-center text-sm">
            <p>&copy; 2025 ChartedArt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}