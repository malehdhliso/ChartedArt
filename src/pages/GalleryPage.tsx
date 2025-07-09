import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { mockGallerySubmissions } from '@/data/mockData';
import type { Database } from '@/lib/supabase/types';

type GallerySubmission = Database['public']['Tables']['gallery_submissions']['Row'];

export default function GalleryPage() {
  const [submissions, setSubmissions] = useState<GallerySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        // For development, use mock data
        setSubmissions(mockGallerySubmissions as GallerySubmission[]);
        setLoading(false);

        // Uncomment for production
        /*
        const { data, error } = await supabase
          .from('gallery_submissions')
          .select('*, profiles(full_name)')
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSubmissions(data || []);
        */
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Community Gallery
        </h1>

        {loading ? (
          <div className="text-center">Loading gallery...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={submission.image_url}
                    alt="Gallery submission"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  {submission.description && (
                    <p className="text-charcoal-300 mb-2">{submission.description}</p>
                  )}
                  <p className="text-sm text-charcoal-200">
                    Created at: {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}