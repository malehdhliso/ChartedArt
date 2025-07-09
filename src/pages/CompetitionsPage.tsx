import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Calendar, Trophy, Users, Clock, Award } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Competition = Database['public']['Tables']['competitions']['Row'];

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const { data, error } = await supabase
          .from('competitions')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setCompetitions(data || []);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load competitions');
      } finally {
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  const getCompetitionStatus = (competition: Competition) => {
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);

    if (now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    } else if (now >= startDate && now <= endDate && competition.is_active) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-700' };
    } else {
      return { status: 'ended', label: 'Ended', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400"></div>
            <span className="ml-3">Loading competitions...</span>
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
            Competitions & Community Challenges
          </h1>
          <p className="text-lg text-charcoal-200 max-w-2xl mx-auto">
            Join our exciting art competitions and showcase your creativity. Win amazing prizes and get recognized in our community!
          </p>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-sage-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-charcoal-300 mb-2">No Competitions Yet</h2>
            <p className="text-charcoal-200">Check back soon for exciting competitions and challenges!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {competitions.map((competition) => {
              const statusInfo = getCompetitionStatus(competition);
              
              return (
                <div key={competition.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-charcoal-300">{competition.title}</h2>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        {competition.theme && (
                          <p className="text-sage-400 font-medium mb-2">Theme: {competition.theme}</p>
                        )}
                        <p className="text-charcoal-300 mb-4">{competition.description}</p>
                      </div>
                      <div className="ml-6">
                        <Trophy className="w-12 h-12 text-sage-400" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-sage-400" />
                        <div>
                          <p className="text-sm text-charcoal-200">Start Date</p>
                          <p className="font-semibold">{formatDate(competition.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-sage-400" />
                        <div>
                          <p className="text-sm text-charcoal-200">End Date</p>
                          <p className="font-semibold">{formatDate(competition.end_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-sage-400" />
                        <div>
                          <p className="text-sm text-charcoal-200">Prize</p>
                          <p className="font-semibold">{competition.prize_details || 'TBA'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Link
                        to={`/gallery?competition=${competition.id}`}
                        className="bg-sage-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
                      >
                        View Submissions
                      </Link>
                      {statusInfo.status === 'active' && (
                        <Link
                          to={`/gallery?competition=${competition.id}&submit=true`}
                          className="border-2 border-sage-400 text-sage-400 px-6 py-2 rounded-lg font-semibold hover:bg-sage-400 hover:text-white transition-colors"
                        >
                          Submit Entry
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}