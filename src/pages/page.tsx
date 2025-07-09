import { Palette, Image as ImageIcon, Star, Calendar, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative h-[80vh] flex items-center justify-center bg-cream-100">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2400"
            alt="ChartedArt Background"
            className="object-cover opacity-20 w-full h-full"
            loading="eager"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-charcoal-300 mb-6">
            Transform Your Photos into
            <span className="text-sage-400 block">ChartedArt</span>
          </h1>
          <p className="text-xl text-charcoal-300 mb-8">
            Create your own personalized ChartedArt kit from any photo. Perfect for beginners and art enthusiasts alike.
          </p>
          <Link
            to="/create"
            className="inline-block bg-sage-400 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors"
          >
            Create Your Kit
          </Link>
        </div>
      </section>

      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-charcoal-300 mb-12">How It Works</h2>
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-charcoal-300 mb-12">Featured Artworks</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
              "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800",
              "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800"
            ].map((src, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt={`Featured Artwork ${index + 1}`}
                  className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-block border-2 border-sage-400 text-sage-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-sage-400 hover:text-white transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-sage-400" />
                <h2 className="text-2xl font-bold text-charcoal-300">Upcoming Events</h2>
              </div>
              <div className="space-y-6">
                {[1, 2].map((_, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Art Workshop in Midrand</h3>
                    <p className="text-charcoal-300 mb-3">Join us for a guided painting session perfect for beginners.</p>
                    <div className="text-sm text-sage-400">April 15, 2025 • 14:00</div>
                  </div>
                ))}
              </div>
              <Link
                to="/events"
                className="inline-block mt-6 text-sage-400 font-semibold hover:text-sage-500"
              >
                View All Events →
              </Link>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-sage-400" />
                <h2 className="text-2xl font-bold text-charcoal-300">Latest Articles</h2>
              </div>
              <div className="space-y-6">
                {[1, 2].map((_, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Tips for Perfect ChartedArt</h3>
                    <p className="text-charcoal-300 mb-3">Learn the secrets to creating stunning artwork with our guide.</p>
                    <div className="text-sm text-sage-400">5 min read</div>
                  </div>
                ))}
              </div>
              <Link
                to="/blog"
                className="inline-block mt-6 text-sage-400 font-semibold hover:text-sage-500"
              >
                Read More Articles →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}