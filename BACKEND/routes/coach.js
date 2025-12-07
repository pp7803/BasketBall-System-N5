const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authentication');
const coachController = require('../controllers/coachController');

// All routes require coach role
router.use(authenticate);
router.use(authorize('coach')); // REST parameters - không cần []

// Team Management (UC18, UC19)
router.post('/teams', coachController.createTeam);
router.get('/teams', coachController.getMyTeams);
router.get('/teams/:id', coachController.getTeamDetail);
router.put('/teams/:id', coachController.updateTeam);
router.post('/teams/:id/resubmit', coachController.resubmitTeam);
router.delete('/teams/:id', coachController.deleteTeam);

// Join Request Management (UC20)
router.get('/teams/:id/requests', coachController.getTeamRequests);
router.put('/teams/requests/:id', coachController.processJoinRequest);

// Leave Request Management
router.get('/teams/:id/leave-requests', coachController.getTeamLeaveRequests);
router.put('/leave-requests/:id', coachController.processLeaveRequest);

// Player Management (UC19)
router.delete('/teams/:teamId/athletes/:athleteId', coachController.removePlayerFromTeam);
router.put('/teams/:teamId/athletes/:athleteId/jersey', coachController.updatePlayerJersey);

// Tournament Management
router.get('/tournaments', coachController.getTournamentsWithStatus);
router.post('/tournaments/:tournamentId/register', coachController.registerTeamForTournament);
router.post('/tournaments/:tournamentId/leave', coachController.requestLeaveTournament);

// Match Management
router.get('/teams/:teamId/matches', coachController.getTeamMatches);
router.get('/matches/:matchId/lineup', coachController.getMatchLineup);
router.put('/matches/:matchId/lineup', coachController.updateMatchLineup);

// Financial Management
router.get('/teams/:teamId/financial', coachController.getTeamFinancialTransactions);

module.exports = router;
