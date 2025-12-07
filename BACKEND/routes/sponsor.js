const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authentication');
const sponsorController = require('../controllers/sponsorController');

// All routes require sponsor role
router.use(authenticate);
router.use(authorize('sponsor'));

// Tournament Management
router.post('/tournaments', sponsorController.createTournament);
router.get('/tournaments', sponsorController.getMyTournaments);
router.get('/tournaments/:id', sponsorController.getTournamentDetail);
router.put('/tournaments/:id', sponsorController.updateTournament);
router.delete('/tournaments/:id', sponsorController.deleteTournament);

// Team Registration Management (approval by sponsor)
router.get('/tournaments/:id/team-registrations', sponsorController.getTeamRegistrations);
router.put('/team-registrations/:id/approve', sponsorController.approveTeamRegistration);

// Tournament Leave Requests Management
router.get('/tournaments/:id/leave-requests', sponsorController.getTournamentLeaveRequests);
router.put('/tournament-leave-requests/:id', sponsorController.processTournamentLeaveRequest);

// Tournament Schedule Management
router.get('/tournaments/:tournamentId/teams', sponsorController.getTournamentTeams);
router.post('/tournaments/:tournamentId/schedule/groups', sponsorController.createGroupStageSchedule);
router.post('/tournaments/:tournamentId/schedule/playoffs', sponsorController.createPlayoffSchedule);
router.get('/tournaments/:tournamentId/schedule', sponsorController.getTournamentSchedule);
router.get('/tournaments/:tournamentId/format', sponsorController.getTournamentFormat);

// Venue and Referee Management (for sponsor)
router.get('/venues', sponsorController.getVenues);
router.get('/venues/availability', sponsorController.getAvailableVenues);
router.get('/venues/:venueId/schedule', sponsorController.getVenueSchedule);
router.get('/venues/:venueId/availability', sponsorController.getVenueAvailability);
router.get('/referees', sponsorController.getReferees);
router.get('/referees/availability', sponsorController.getAvailableReferees);
router.get('/referees/:refereeId/schedule', sponsorController.getRefereeSchedule);
router.get('/referees/:refereeId/availability', sponsorController.getRefereeAvailability);

// Match Management
router.put('/matches/:matchId', sponsorController.updateMatch);

// Financial Management
router.get('/tournaments/:tournamentId/financial', sponsorController.getTournamentFinancialTransactions);

module.exports = router;
