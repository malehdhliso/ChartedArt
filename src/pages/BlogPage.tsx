import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { mockBlogPosts } from '@/data/mockData';
import { Calendar, User } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // For development, use mock data
        setPosts(mockBlogPosts as BlogPost[]);
        setLoading(false);

        // Uncomment for production
        /*
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*, profiles(full_name)')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
        */
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Art & Inspiration Blog
        </h1>

        {loading ? (
          <div className="text-center">Loading posts...</div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    <Link to={`/blog/${post.slug}`} className="text-charcoal-300 hover:text-sage-400">
                      {post.title}
                    </Link>
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-charcoal-200 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString('en-ZA')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{(post as any).author?.full_name}</span>
                    </div>
                  </div>
                  <p className="text-charcoal-300 mb-4">
                    {post.content.substring(0, 200)}...
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sage-400 hover:text-sage-500 font-semibold"
                  >
                    Read More
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}