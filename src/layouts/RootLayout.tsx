import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useCart } from '@/contexts/CartContext';

export default function RootLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        if (session) {
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (error && !error.message.includes('relation "public.admin_users" does not exist')) {
            console.error('Error checking admin status:', error);
          }

          setIsAdmin(!!adminUser);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm relative z-50">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-sage-400">
              ChartedArt
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {/* Public routes */}
              <Link to="/gallery" className="text-charcoal-300 hover:text-sage-400">
                Gallery
              </Link>
              <Link to="/events" className="text-charcoal-300 hover:text-sage-400">
                Events
              </Link>
              <Link to="/blog" className="text-charcoal-300 hover:text-sage-400">
                Blog
              </Link>
              <Link to="/competitions" className="text-charcoal-300 hover:text-sage-400">
                Competitions
              </Link>
              
              {/* Protected routes - only show when authenticated */}
              {isAuthenticated && (
                <Link to="/create" className="text-charcoal-300 hover:text-sage-400">
                  Create Kit
                </Link>
              )}
              
              {/* Admin routes */}
              {isAdmin && (
                <Link 
                  to="/admin/orders" 
                  className="text-charcoal-300 hover:text-sage-400 flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link to="/cart" className="p-2 text-charcoal-300 hover:text-sage-400 relative">
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sage-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <Link 
              to={isAuthenticated ? "/account" : "/auth/login"} 
              className="p-2 text-charcoal-300 hover:text-sage-400"
            >
              <User className="w-6 h-6" />
            </Link>
            <button 
              className="md:hidden p-2 text-charcoal-300"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`
          md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="pt-20 px-4">
            <div className="space-y-4">
              {/* Public routes */}
              <Link 
                to="/gallery" 
                className="block text-lg text-charcoal-300 hover:text-sage-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/events" 
                className="block text-lg text-charcoal-300 hover:text-sage-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/blog" 
                className="block text-lg text-charcoal-300 hover:text-sage-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/competitions" 
                className="block text-lg text-charcoal-300 hover:text-sage-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Competitions
              </Link>

              {/* Protected routes - only show when authenticated */}
              {isAuthenticated && (
                <Link 
                  to="/create" 
                  className="block text-lg text-charcoal-300 hover:text-sage-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Kit
                </Link>
              )}

              {/* Admin routes */}
              {isAdmin && (
                <Link 
                  to="/admin/orders" 
                  className="block text-lg text-charcoal-300 hover:text-sage-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Authentication link */}
              <Link 
                to={isAuthenticated ? "/account" : "/auth/login"}
                className="block text-lg text-charcoal-300 hover:text-sage-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isAuthenticated ? "Account" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="bg-charcoal-300 text-cream-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold mb-4">ChartedArt</h3>
              <p className="text-cream-200">Transform your photos into beautiful paint-by-numbers artwork.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {isAuthenticated && (
                  <li><Link to="/create" className="hover:text-sage-300">Create Kit</Link></li>
                )}
                <li><Link to="/gallery" className="hover:text-sage-300">Gallery</Link></li>
                <li><Link to="/events" className="hover:text-sage-300">Events</Link></li>
                <li><Link to="/blog" className="hover:text-sage-300">Blog</Link></li>
                <li><Link to="/competitions" className="hover:text-sage-300">Competitions</Link></li>
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