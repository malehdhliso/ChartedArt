import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { mockEvents } from '@/data/mockData';
import type { Database } from '@/lib/supabase/types';
import { Target } from 'lucide-react';

type Event = Database['public']['Tables']['events']['Row'] & {
  initiatives?: Database['public']['Tables']['initiatives']['Row'];
  rsvp_count?: number;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            initiatives (id, title)
          `)
          .eq('is_approved', true)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true });

        if (error) throw error;
        
        // Get RSVP counts for events with initiatives
        const eventsWithRsvpCounts = await Promise.all(
          (data || []).map(async (event) => {
            if (event.initiatives) {
              const { count } = await supabase
                .from('event_rsvps')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id)
                .eq('status', 'attending');
              
              return { ...event, rsvp_count: count || 0 };
            }
            return event;
          })
        );
        
        setEvents(eventsWithRsvpCounts);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Upcoming Events
        </h1>

        {loading ? (
          <div className="text-center">Loading events...</div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm">
                {event.initiatives && (
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm font-medium">
                      <Target className="w-4 h-4" />
                      Art for Action Event
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="bg-sage-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-sage-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                    {event.initiatives && (
                      <p className="text-sage-400 font-medium mb-2">
                        Related to: {event.initiatives.title}
                      </p>
                    )}
                    <p className="text-charcoal-300 mb-4">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-charcoal-200">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(event.event_date).toLocaleDateString('en-ZA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {typeof event.rsvp_count === 'number' && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.rsvp_count} attending</span>
                        </div>
                      )}
                    </div>
                    {event.initiatives && (
                      <div className="mt-4">
                        <Link
                          to={`/initiatives/${event.initiatives.id}`}
                          className="text-sage-400 hover:text-sage-500 font-medium text-sm"
                        >
                          View Initiative Details →
                        </Link>
                      </div>
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