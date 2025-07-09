import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Users, Calendar, MapPin, Heart, Plus, CheckCircle } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Initiative = Database['public']['Tables']['initiatives']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  events?: Database['public']['Tables']['events']['Row'];
};

type CollageSubmission = Database['public']['Tables']['collage_submissions']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

type EventRSVP = Database['public']['Tables']['event_rsvps']['Row'];

export default function InitiativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [submissions, setSubmissions] = useState<CollageSubmission[]>([]);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [userRsvp, setUserRsvp] = useState<EventRSVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id || null);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchInitiativeDetails() {
      try {
        // Fetch initiative details
        const { data: initiativeData, error: initiativeError } = await supabase
          .from('initiatives')
          .select(`
            *,
            profiles (full_name, email),
            events (*)
          `)
          .eq('id', id)
          .single();

        if (initiativeError) throw initiativeError;
        setInitiative(initiativeData);

        // Fetch approved collage submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('collage_submissions')
          .select(`
            *,
            profiles (full_name)
          `)
          .eq('initiative_id', id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);

        // If there's a related event, fetch RSVP data
        if (initiativeData.related_event_id) {
          // Get RSVP count
          const { count } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', initiativeData.related_event_id)
            .eq('status', 'attending');

          setRsvpCount(count || 0);

          // Get user's RSVP status if authenticated
          if (userId) {
            const { data: userRsvpData } = await supabase
              .from('event_rsvps')
              .select('*')
              .eq('event_id', initiativeData.related_event_id)
              .eq('user_id', userId)
              .maybeSingle();

            setUserRsvp(userRsvpData);
          }
        }
      } catch (err) {
        console.error('Error fetching initiative details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load initiative details');
      } finally {
        setLoading(false);
      }
    }

    fetchInitiativeDetails();
  }, [id, userId]);

  const handleRSVP = async (status: 'attending' | 'interested' | 'not_attending') => {
    if (!isAuthenticated || !initiative?.related_event_id || !userId) {
      return;
    }

    try {
      setRsvpLoading(true);
      setError(null);

      if (userRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', userRsvp.id);

        if (updateError) throw updateError;

        setUserRsvp({ ...userRsvp, status });
      } else {
        // Create new RSVP
        const { data: newRsvp, error: insertError } = await supabase
          .from('event_rsvps')
          .insert([{
            event_id: initiative.related_event_id,
            user_id: userId,
            status
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setUserRsvp(newRsvp);
      }

      // Update RSVP count if status is attending
      if (status === 'attending') {
        if (!userRsvp || userRsvp.status !== 'attending') {
          setRsvpCount(prev => prev + 1);
        }
      } else if (userRsvp?.status === 'attending') {
        setRsvpCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setError(err instanceof Error ? err.message : 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400"></div>
            <span className="ml-3">Loading initiative...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error || 'Initiative not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Initiative Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-charcoal-300 mb-4">
            {initiative.title}
          </h1>
          <p className="text-lg text-charcoal-300 mb-6 leading-relaxed">
            {initiative.description}
          </p>
          
          <div className="flex items-center gap-6 text-charcoal-200 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Organized by {initiative.profiles.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>{submissions.length} contributions</span>
            </div>
          </div>

          {isAuthenticated && (
            <Link
              to={`/initiatives/${initiative.id}/submit`}
              className="inline-flex items-center gap-2 bg-sage-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Submit Your Piece
            </Link>
          )}
        </div>

        {/* Related Event Section */}
        {initiative.events && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-charcoal-300 mb-4">
              Assembly Event
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{initiative.events.title}</h3>
                <p className="text-charcoal-300 mb-4">{initiative.events.description}</p>
                
                <div className="space-y-2 text-charcoal-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {new Date(initiative.events.event_date).toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {initiative.events.location_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{initiative.events.location_name}</span>
                    </div>
                  )}
                  {initiative.events.location_address && (
                    <div className="text-sm text-charcoal-200 ml-7">
                      {initiative.events.location_address}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-sage-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-charcoal-300 mb-3">
                    Event Attendance
                  </h4>
                  <p className="text-2xl font-bold text-sage-400 mb-4">
                    {rsvpCount} attending
                  </p>
                  
                  {isAuthenticated && (
                    <div className="space-y-2">
                      <p className="text-sm text-charcoal-200 mb-3">
                        Will you be attending?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRSVP('attending')}
                          disabled={rsvpLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userRsvp?.status === 'attending'
                              ? 'bg-sage-400 text-white'
                              : 'bg-white border border-sage-400 text-sage-400 hover:bg-sage-400 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {userRsvp?.status === 'attending' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                          Attending
                        </button>
                        <button
                          onClick={() => handleRSVP('interested')}
                          disabled={rsvpLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userRsvp?.status === 'interested'
                              ? 'bg-blue-400 text-white'
                              : 'bg-white border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {userRsvp?.status === 'interested' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                          Interested
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collage Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-charcoal-300 mb-6">
            Community Contributions
          </h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-sage-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-charcoal-300 mb-2">
                No contributions yet
              </h3>
              <p className="text-charcoal-200 mb-6">
                Be the first to contribute to this important cause!
              </p>
              {isAuthenticated && (
                <Link
                  to={`/initiatives/${initiative.id}/submit`}
                  className="inline-flex items-center gap-2 bg-sage-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Submit Your Piece
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-cream-50 rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={submission.image_url}
                      alt="Community contribution"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    {submission.description && (
                      <p className="text-charcoal-300 mb-2">{submission.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-charcoal-200">
                      <span>By {submission.profiles.full_name}</span>
                      <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}