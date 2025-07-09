import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Plus, Users, Calendar, Heart, Target } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Initiative = Database['public']['Tables']['initiatives']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  events?: Database['public']['Tables']['events']['Row'];
  collage_count?: number;
};

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchInitiatives() {
      try {
        const { data, error } = await supabase
          .from('initiatives')
          .select(`
            *,
            profiles (full_name, email),
            events (title, event_date, location_name)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get collage submission counts for each initiative
        const initiativesWithCounts = await Promise.all(
          (data || []).map(async (initiative) => {
            const { count } = await supabase
              .from('collage_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('initiative_id', initiative.id)
              .eq('is_approved', true);

            return {
              ...initiative,
              collage_count: count || 0
            };
          })
        );

        setInitiatives(initiativesWithCounts);
      } catch (err) {
        console.error('Error fetching initiatives:', err);
        setError(err instanceof Error ? err.message : 'Failed to load initiatives');
      } finally {
        setLoading(false);
      }
    }

    fetchInitiatives();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400"></div>
            <span className="ml-3">Loading initiatives...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-300 mb-4">
            Art for Action
          </h1>
          <p className="text-lg text-charcoal-200 max-w-3xl mx-auto mb-8">
            Join collaborative art initiatives that make a difference. Create together, raise awareness, and drive positive change through the power of art.
          </p>
          
          {isAuthenticated && (
            <Link
              to="/initiatives/create"
              className="inline-flex items-center gap-2 bg-sage-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Start a New Initiative
            </Link>
          )}
        </div>

        {initiatives.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-sage-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-charcoal-300 mb-2">No Active Initiatives</h2>
            <p className="text-charcoal-200 mb-6">Be the first to start an Art for Action initiative!</p>
            {isAuthenticated && (
              <Link
                to="/initiatives/create"
                className="inline-flex items-center gap-2 bg-sage-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start a New Initiative
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-8">
            {initiatives.map((initiative) => (
              <div key={initiative.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-charcoal-300 mb-2">
                        {initiative.title}
                      </h2>
                      <p className="text-charcoal-300 mb-4 leading-relaxed">
                        {initiative.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-charcoal-200">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Organized by {initiative.profiles.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{initiative.collage_count} contributions</span>
                        </div>
                        {initiative.events && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Event: {new Date(initiative.events.event_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <Target className="w-12 h-12 text-sage-400" />
                    </div>
                  </div>

                  {initiative.events && (
                    <div className="bg-sage-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-charcoal-300 mb-2">
                        Related Event: {initiative.events.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-charcoal-200">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(initiative.events.event_date).toLocaleDateString('en-ZA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {initiative.events.location_name && (
                          <span>{initiative.events.location_name}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Link
                      to={`/initiatives/${initiative.id}`}
                      className="bg-sage-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
                    >
                      View Details
                    </Link>
                    {isAuthenticated && (
                      <Link
                        to={`/initiatives/${initiative.id}/submit`}
                        className="border-2 border-sage-400 text-sage-400 px-6 py-2 rounded-lg font-semibold hover:bg-sage-400 hover:text-white transition-colors"
                      >
                        Contribute Art
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}