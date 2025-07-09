import { Palette, Image as ImageIcon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase/client';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-cream-100 px-4 py-16 md:py-0">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2400"
            alt="ChartedArt Background"
            className="object-cover w-full h-full opacity-20"
          />
        </div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-300 mb-6">
            Transform Your Photos into
            <span className="text-sage-400 block mt-2">ChartedArt</span>
          </h1>
          <p className="text-lg md:text-xl text-charcoal-300 mb-8 max-w-2xl mx-auto">
            Create your own personalized ChartedArt kit from any photo. Perfect for beginners and art enthusiasts alike.
          </p>
          {isAuthenticated ? (
            <Link
              to="/create"
              className="inline-block bg-sage-400 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors"
            >
              Create Your Kit
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="inline-block bg-sage-400 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors"
            >
              Sign In to Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Only show these sections for authenticated users */}
      {isAuthenticated && (
        <>
          {/* Features Section */}
          <section className="py-16 md:py-20 bg-cream-50 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-charcoal-300 mb-12">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-sage-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Upload Your Photo</h3>
                  <p className="text-charcoal-300">Choose any photo to transform into a ChartedArt masterpiece</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-full flex items-center justify-center">
                    <Palette className="w-8 h-8 text-sage-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Customize Your Kit</h3>
                  <p className="text-charcoal-300">Select your preferred size and frame options</p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-sage-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Create & Share</h3>
                  <p className="text-charcoal-300">Paint your masterpiece and share it in our gallery</p>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery Preview */}
          <section className="py-16 md:py-20 bg-white px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-charcoal-300 mb-12">
                Featured Artworks
              </h2>
              <div className="grid md:grid-cols-3 gap-4 md:gap-8">
                {[
                  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
                  "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800",
                  "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800"
                ].map((src, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={src}
                      alt={`Featured Artwork ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  to="/gallery"
                  className="inline-block border-2 border-sage-400 text-sage-400 px-6 md:px-8 py-3 rounded-lg text-lg font-semibold hover:bg-sage-400 hover:text-white transition-colors"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}