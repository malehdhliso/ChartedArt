import { createDirectus, rest, readItems, readSingleton } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055').with(rest());

export const getDirectusClient = () => directus;

export const getPublicItems = async (collection: string) => {
  try {
    const items = await directus.request(readItems(collection, {
      filter: {
        status: {
          _eq: 'published'
        }
      }
    }));
    return items;
  } catch (error) {
    console.error('Error fetching items from Directus:', error);
    throw error;
  }
};

export const getHomepage = async () => {
  try {
    const homepage = await directus.request(readSingleton('homepage'));
    return homepage;
  } catch (error) {
    console.error('Error fetching homepage from Directus:', error);
    throw error;
  }
};

export const getBlogPosts = async () => {
  try {
    const posts = await directus.request(readItems('blog_posts', {
      filter: {
        status: {
          _eq: 'published'
        }
      },
      sort: ['-created_at']
    }));
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts from Directus:', error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const events = await directus.request(readItems('events', {
      filter: {
        is_approved: {
          _eq: true
        },
        event_date: {
          _gte: new Date().toISOString()
        }
      },
      sort: ['event_date']
    }));
    return events;
  } catch (error) {
    console.error('Error fetching events from Directus:', error);
    throw error;
  }
};