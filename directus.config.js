export default {
  // General
  host: '0.0.0.0',
  port: 8055,
  public_url: '/admin',
  
  // Database
  database: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: true,
    },
  },

  // Admin Account
  admin: {
    email: process.env.DIRECTUS_ADMIN_EMAIL,
    password: process.env.DIRECTUS_ADMIN_PASSWORD,
  },

  // Collections Configuration
  collections: {
    blog_posts: {
      singleton: false,
      sort: 'created_at',
      accountability: 'all',
      archive_field: 'status',
      archive_value: 'archived',
      unarchive_value: 'draft',
      archive_app_filter: true,
      icon: 'article',
    },
    events: {
      singleton: false,
      sort: 'event_date',
      accountability: 'all',
      archive_field: 'is_approved',
      archive_app_filter: true,
      icon: 'event',
    },
    gallery_submissions: {
      singleton: false,
      sort: 'created_at',
      accountability: 'all',
      archive_field: 'is_approved',
      archive_app_filter: true,
      icon: 'photo_library',
    },
    testimonials: {
      singleton: false,
      sort: 'created_at',
      accountability: 'all',
      archive_field: 'is_approved',
      archive_app_filter: true,
      icon: 'format_quote',
    },
    products: {
      singleton: false,
      sort: 'created_at',
      accountability: 'all',
      icon: 'inventory_2',
    },
    homepage: {
      singleton: true,
      icon: 'home',
    }
  },

  // Storage
  storage: {
    locations: {
      local: {
        driver: 'local',
        root: './uploads',
      },
    },
  },

  // CORS
  cors: {
    enabled: true,
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range'],
    credentials: true,
    maxAge: 18000,
  },
};