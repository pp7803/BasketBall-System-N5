require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/db');

// Import routes
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const adminRoutes = require('./routes/admin');
const athleteRoutes = require('./routes/athletes');
const refereeRoutes = require('./routes/referee');
const publicRoutes = require('./routes/public');
const sponsorRoutes = require('./routes/sponsor');
const coachRoutes = require('./routes/coach');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const ratingRoutes = require('./routes/ratings');
const financialRoutes = require('./routes/financial');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for deployment (optional)
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/referee', refereeRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin/financial', financialRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Basketball Tournament API',
        version: '3.0.0',
        total_use_cases: '20 UC (with Coach)',
        endpoints: {
            auth: {
                signup: 'POST /api/auth/signup (UC01)',
                signin: 'POST /api/auth/signin (UC02)',
                info: 'GET /api/auth/info',
                forgotPassword: 'POST /api/auth/forgot-password (OTP via email)',
                resetPassword: 'POST /api/auth/reset-password (with OTP)',
            },
            tournaments: {
                list: 'GET /api/tournaments',
                detail: 'GET /api/tournaments/:id',
                create: 'POST /api/tournaments (UC03 - sponsor)',
                update: 'PUT /api/tournaments/:id (sponsor)',
                statistics: 'GET /api/tournaments/:id/statistics (UC04 - sponsor)',
            },
            coach: {
                createTeam: 'POST /api/coach/teams (UC18)',
                myTeams: 'GET /api/coach/teams (UC19)',
                teamDetail: 'GET /api/coach/teams/:id',
                updateTeam: 'PUT /api/coach/teams/:id',
                teamRequests: 'GET /api/coach/teams/:id/requests (UC20)',
                processRequest: 'PUT /api/coach/teams/requests/:id (UC20)',
                removePlayer: 'DELETE /api/coach/teams/:teamId/players/:playerId (UC19)',
                updateJersey: 'PUT /api/coach/teams/:teamId/players/:playerId/jersey (UC19)',
            },
            admin: {
                teamRegistrations: 'GET /api/admin/tournament-teams',
                approveTeam: 'PUT /api/admin/tournament-teams/:id/approve (UC05)',
                scheduleHome: 'POST /api/admin/tournaments/:id/schedule/home (UC06)',
                scheduleAway: 'POST /api/admin/tournaments/:id/schedule/away (UC07)',
                assignReferee: 'PUT /api/admin/matches/:id/assign-referee (UC08)',
                venues: 'GET/POST/PUT /api/admin/venues (UC09)',
                updateStandings: 'POST /api/admin/matches/:id/update-standings (UC10)',
            },
            athletes: {
                profile: 'GET/PUT /api/athletes/profile (UC12)',
                schedule: 'GET /api/athletes/my-schedule (UC11)',
            },
            referee: {
                myMatches: 'GET /api/referee/my-matches',
                submitResult: 'PUT /api/referee/matches/:id/result (UC13)',
                confirmResult: 'PUT /api/referee/matches/:id/confirm (UC14)',
            },
            public: {
                matches: 'GET /api/public/matches (UC15)',
                matchDetail: 'GET /api/public/matches/:id',
                standings: 'GET /api/public/standings (UC16)',
                search: 'GET /api/public/search (UC17)',
                teams: 'GET /api/public/teams',
            },
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log(`\n🚀 Server is running on port ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`\n📚 Available endpoints:`);
            console.log(`   POST   /api/auth/signup`);
            console.log(`   POST   /api/auth/signin`);
            console.log(`   GET    /api/auth/info (requires Bearer token)\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
