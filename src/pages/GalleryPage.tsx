import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { mockGallerySubmissions } from '@/data/mockData';
import { Heart, Trophy, Users } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type GallerySubmission = Database['public']['Tables']['gallery_submissions']['Row'];
type Competition = Database['public']['Tables']['competitions']['Row'];
type CompetitionSubmission = Database['public']['Tables']['competition_submissions']['Row'] & {
  gallery_submissions: GallerySubmission;
  votes: { count: number }[];
  user_voted: boolean;
};

export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const competitionId = searchParams.get('competition');
  const showSubmitForm = searchParams.get('submit') === 'true';
  
  const [submissions, setSubmissions] = useState<GallerySubmission[]>([]);
  const [competitionSubmissions, setCompetitionSubmissions] = useState<CompetitionSubmission[]>([]);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<GallerySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
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
    async function fetchGallery() {
      try {
        if (competitionId) {
          // Fetch competition details
          const { data: competitionData, error: competitionError } = await supabase
            .from('competitions')
            .select('*')
            .eq('id', competitionId)
            .single();

          if (competitionError) throw competitionError;
          setCompetition(competitionData);

          // Fetch competition submissions with vote counts
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;

          const { data: compSubmissions, error: submissionsError } = await supabase
            .from('competition_submissions')
            .select(`
              *,
              gallery_submissions (*),
              votes (count)
            `)
            .eq('competition_id', competitionId);

          if (submissionsError) throw submissionsError;

          // Check which submissions the user has voted for
          let userVotes: string[] = [];
          if (userId) {
            const { data: votes } = await supabase
              .from('votes')
              .select('submission_id')
              .eq('user_id', userId);
            
            userVotes = votes?.map(v => v.submission_id) || [];
          }

          const submissionsWithVotes = compSubmissions?.map(sub => ({
            ...sub,
            votes: [{ count: sub.votes?.length || 0 }],
            user_voted: userVotes.includes(sub.id)
          })) || [];

          setCompetitionSubmissions(submissionsWithVotes);

          // If showing submit form, fetch user's gallery submissions
          if (showSubmitForm && userId) {
            const { data: userGallery, error: userGalleryError } = await supabase
              .from('gallery_submissions')
              .select('*')
              .eq('user_id', userId)
              .eq('is_approved', true);

            if (userGalleryError) throw userGalleryError;
            setUserSubmissions(userGallery || []);
          }
        } else {
          // For development, use mock data for regular gallery
          setSubmissions(mockGallerySubmissions as GallerySubmission[]);
        }

        // Uncomment for production
        /*
        if (!competitionId) {
          const { data, error } = await supabase
            .from('gallery_submissions')
            .select('*, profiles(full_name)')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setSubmissions(data || []);
        }
        */
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setError(error instanceof Error ? error.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [competitionId, showSubmitForm]);

  const handleVote = async (submissionId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to vote');
      return;
    }

    try {
      setVoting(submissionId);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          user_id: session.user.id,
          submission_id: submissionId
        }]);

      if (voteError) {
        if (voteError.code === '23505') { // Unique constraint violation
          throw new Error('You have already voted for this submission');
        }
        throw voteError;
      }

      // Update local state
      setCompetitionSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { 
                ...sub, 
                votes: [{ count: (sub.votes[0]?.count || 0) + 1 }],
                user_voted: true 
              }
            : sub
        )
      );
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const handleSubmitToCompetition = async (submissionId: string) => {
    if (!isAuthenticated || !competition) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error: submitError } = await supabase
        .from('competition_submissions')
        .insert([{
          competition_id: competition.id,
          submission_id: submissionId,
          user_id: session.user.id
        }]);

      if (submitError) {
        if (submitError.code === '23505') { // Unique constraint violation
          throw new Error('This artwork has already been submitted to this competition');
        }
        throw submitError;
      }

      // Refresh the page to show updated submissions
      window.location.reload();
    } catch (err) {
      console.error('Error submitting to competition:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit to competition');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        {competition ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-charcoal-300 mb-4">
              {competition.title} - Submissions
            </h1>
            {competition.theme && (
              <p className="text-lg text-sage-400 font-medium mb-2">
                Theme: {competition.theme}
              </p>
            )}
            <p className="text-charcoal-200 max-w-2xl mx-auto">
              {competition.description}
            </p>
          </div>
        ) : (
          <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
            Community Gallery
          </h1>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">Loading gallery...</div>
        ) : showSubmitForm && competition ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Submit Your Artwork</h2>
            {userSubmissions.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-charcoal-300 mb-4">
                  You don't have any approved gallery submissions yet.
                </p>
                <p className="text-charcoal-200">
                  Create and submit artwork to your gallery first, then return to enter competitions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {userSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={submission.image_url}
                        alt="Your artwork"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      {submission.description && (
                        <p className="text-charcoal-300 mb-3">{submission.description}</p>
                      )}
                      <button
                        onClick={() => handleSubmitToCompetition(submission.id)}
                        disabled={submitting}
                        className="w-full bg-sage-400 text-white py-2 rounded-lg font-semibold hover:bg-sage-500 transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit to Competition'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : competition ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitionSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={submission.gallery_submissions.image_url}
                    alt="Competition submission"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold">{submission.votes[0]?.count || 0}</span>
                  </div>
                </div>
                <div className="p-4">
                  {submission.gallery_submissions.description && (
                    <p className="text-charcoal-300 mb-3">{submission.gallery_submissions.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-charcoal-200">
                      Submitted: {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                    {isAuthenticated && !submission.user_voted && (
                      <button
                        onClick={() => handleVote(submission.id)}
                        disabled={voting === submission.id}
                        className="flex items-center gap-1 text-sage-400 hover:text-sage-500 font-semibold disabled:opacity-50"
                      >
                        {voting === submission.id ? (
                          <div className="w-4 h-4 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart className="w-4 h-4" />
                        )}
                        Vote
                      </button>
                    )}
                    {submission.user_voted && (
                      <span className="text-sm text-sage-500 font-medium">✓ Voted</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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