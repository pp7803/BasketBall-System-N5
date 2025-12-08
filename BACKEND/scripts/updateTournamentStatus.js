require('dotenv').config();
const { pool } = require('../utils/db');
const { createNotification } = require('../controllers/notificationController');

/**
 * Auto-set default lineup for a team if they haven't set it before match starts
 */
const autoSetDefaultLineup = async (connection, match_id, team_id, coach_id, hasStarted, isUrgent = true, notificationsToCreate) => {
    try {
        const [athletes] = await connection.query(
            `SELECT a.athlete_id, a.position, a.jersey_number, u.full_name
            FROM athletes a
            LEFT JOIN users u ON a.user_id = u.user_id
            WHERE a.team_id = ?
            ORDER BY a.jersey_number`,
            [team_id]
        );

        if (athletes.length < 5) {
            console.log(`   ⚠️  Team ${team_id} doesn't have enough players`);
            return;
        }

        const requiredPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const selectedPlayers = [];
        const usedAthleteIds = new Set();

        for (const position of requiredPositions) {
            const player = athletes.find((a) => a.position === position && !usedAthleteIds.has(a.athlete_id));
            if (player) {
                selectedPlayers.push({ athlete_id: player.athlete_id, position });
                usedAthleteIds.add(player.athlete_id);
            }
        }

        for (const position of requiredPositions) {
            if (!selectedPlayers.find((p) => p.position === position)) {
                const player = athletes.find((a) => !usedAthleteIds.has(a.athlete_id));
                if (player) {
                    selectedPlayers.push({ athlete_id: player.athlete_id, position });
                    usedAthleteIds.add(player.athlete_id);
                }
            }
        }

        if (selectedPlayers.length !== 5) return;

        await connection.query('DELETE FROM match_lineups WHERE match_id = ? AND team_id = ?', [match_id, team_id]);

        for (const player of selectedPlayers) {
            await connection.query(
                'INSERT INTO match_lineups (match_id, team_id, athlete_id, position) VALUES (?, ?, ?, ?)',
                [match_id, team_id, player.athlete_id, player.position]
            );
        }

        const [coaches] = await connection.query('SELECT user_id FROM coaches WHERE coach_id = ?', [coach_id]);
        if (coaches.length > 0) {
            notificationsToCreate.push({
                user_id: coaches[0].user_id,
                type: 'lineup_auto_set',
                title: isUrgent ? '⚙️ Đội hình đã được tự động thiết lập' : '📅 Đội hình đã được tự động sắp xếp',
                message: isUrgent 
                    ? `Hệ thống đã tự động thiết lập đội hình mặc định cho trận đấu.`
                    : `Hệ thống đã tự động sắp xếp đội hình mặc định. Bạn có thể điều chỉnh bất cứ lúc nào.`,
                metadata: { match_id, team_id, lineup: selectedPlayers },
                created_by: null,
            });
        }

        console.log(`   ✅ Auto-set lineup for team ${team_id}`);
    } catch (error) {
        console.error(`   ❌ Error auto-setting lineup:`, error);
    }
};

const updateTournamentStatus = async () => {
    const connection = await pool.getConnection();
    const notificationsToCreate = [];

    try {
        await connection.beginTransaction();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        console.log(`\n🔄 [${now.toISOString()}] Starting tournament status update...`);

        // 1. Check tournaments that should be ongoing
        const [ongoingCandidates] = await connection.query(
            `SELECT t.tournament_id, t.tournament_name, t.start_date, t.max_teams,
                    COUNT(DISTINCT CASE WHEN tt.status = 'approved' THEN tt.team_id END) as approved_teams_count
            FROM tournaments t
            LEFT JOIN tournament_teams tt ON t.tournament_id = tt.tournament_id
            WHERE t.status = 'registration' AND DATE(t.start_date) <= DATE(?)
            GROUP BY t.tournament_id
            HAVING approved_teams_count >= t.max_teams`,
            [today]
        );

        for (const tournament of ongoingCandidates) {
            console.log(`\n▶️  Tournament ${tournament.tournament_name} → ongoing`);
            await connection.query('UPDATE tournaments SET status = ? WHERE tournament_id = ?', [
                'ongoing',
                tournament.tournament_id,
            ]);
        }

        // 2. AUTO-UPDATE PLAYOFF TEAMS when group stage completed
        const [groupStageCompleted] = await connection.query(
            `SELECT t.tournament_id, t.tournament_name, t.max_teams,
                    COUNT(DISTINCT CASE WHEN m.stage = 'group_stage' AND m.status = 'completed' THEN m.match_id END) as completed_group_matches,
                    COUNT(DISTINCT CASE WHEN m.stage = 'group_stage' THEN m.match_id END) as total_group_matches
            FROM tournaments t
            JOIN matches m ON t.tournament_id = m.tournament_id
            WHERE t.status = 'ongoing' AND m.stage = 'group_stage'
            GROUP BY t.tournament_id
            HAVING completed_group_matches = total_group_matches AND total_group_matches > 0`,
            []
        );

        for (const tournament of groupStageCompleted) {
            console.log(`\n🎯 Processing playoff for: ${tournament.tournament_name}`);

            // Get standings (top 2 from each group for 8-team, top 4 for 16-team)
            const [standings] = await connection.query(
                `SELECT s.team_id, g.group_name, t.team_name
                FROM standings s
                JOIN group_teams gt ON s.team_id = gt.team_id
                JOIN groups g ON gt.group_id = g.group_id
                JOIN teams t ON s.team_id = t.team_id
                WHERE s.tournament_id = ?
                ORDER BY g.group_name, s.points DESC, s.wins DESC, s.goal_difference DESC`,
                [tournament.tournament_id]
            );

            const groupA = standings.filter(s => s.group_name === 'A');
            const groupB = standings.filter(s => s.group_name === 'B');
            
            const A1 = groupA[0]?.team_id;
            const A2 = groupA[1]?.team_id;
            const B1 = groupB[0]?.team_id;
            const B2 = groupB[1]?.team_id;
            
            console.log(`   📊 Top teams: A1=${groupA[0]?.team_name}, A2=${groupA[1]?.team_name}, B1=${groupB[0]?.team_name}, B2=${groupB[1]?.team_name}`);

            // Get playoff matches (created by sponsor when scheduling)
            const [playoffMatches] = await connection.query(
                `SELECT match_id, stage, match_round, home_team_id, away_team_id
                FROM matches
                WHERE tournament_id = ? AND stage IN ('semifinal', 'final')
                ORDER BY CASE stage WHEN 'semifinal' THEN 1 WHEN 'final' THEN 2 END, match_round`,
                [tournament.tournament_id]
            );

            if (playoffMatches.length === 0) {
                console.log(`   ⚠️  No playoff matches found! Sponsor needs to create schedule first.`);
                continue;
            }

            let updatedCount = 0;

            // Update semifinal teams
            for (const match of playoffMatches) {
                if (match.stage === 'semifinal' && (match.home_team_id === null || match.away_team_id === null)) {
                    let homeTeamId, awayTeamId;
                    
                    if (match.match_round === 1) {
                        homeTeamId = A1;  // SF1: A1 vs B2
                        awayTeamId = B2;
                    } else {
                        homeTeamId = A2;  // SF2: A2 vs B1
                        awayTeamId = B1;
                    }
                    
                    if (homeTeamId && awayTeamId) {
                        await connection.query(
                            `UPDATE matches SET home_team_id = ?, away_team_id = ? WHERE match_id = ?`,
                            [homeTeamId, awayTeamId, match.match_id]
                        );
                        
                        console.log(`   ✅ Updated semifinal ${match.match_round}`);
                        updatedCount++;
                        
                        // Auto-set lineup
                        const [homeCoach] = await connection.query('SELECT coach_id FROM teams WHERE team_id = ?', [homeTeamId]);
                        const [awayCoach] = await connection.query('SELECT coach_id FROM teams WHERE team_id = ?', [awayTeamId]);
                        
                        if (homeCoach.length > 0) {
                            await autoSetDefaultLineup(connection, match.match_id, homeTeamId, homeCoach[0].coach_id, false, false, notificationsToCreate);
                        }
                        if (awayCoach.length > 0) {
                            await autoSetDefaultLineup(connection, match.match_id, awayTeamId, awayCoach[0].coach_id, false, false, notificationsToCreate);
                        }
                    }
                }
            }

            // Update final teams (after semifinals completed)
            for (const match of playoffMatches) {
                if (match.stage === 'final' && (match.home_team_id === null || match.away_team_id === null)) {
                    const [completedSemifinals] = await connection.query(
                        `SELECT match_id, home_team_id, away_team_id, home_score, away_score
                        FROM matches
                        WHERE tournament_id = ? AND stage = 'semifinal' AND status = 'completed'
                        ORDER BY match_round`,
                        [tournament.tournament_id]
                    );
                    
                    if (completedSemifinals.length === 2) {
                        const sf1Winner = completedSemifinals[0].home_score > completedSemifinals[0].away_score 
                            ? completedSemifinals[0].home_team_id 
                            : completedSemifinals[0].away_team_id;
                        const sf2Winner = completedSemifinals[1].home_score > completedSemifinals[1].away_score 
                            ? completedSemifinals[1].home_team_id 
                            : completedSemifinals[1].away_team_id;
                        
                        if (sf1Winner && sf2Winner) {
                            await connection.query(
                                `UPDATE matches SET home_team_id = ?, away_team_id = ? WHERE match_id = ?`,
                                [sf1Winner, sf2Winner, match.match_id]
                            );
                            
                            console.log(`   ✅ Updated final`);
                            updatedCount++;
                            
                            // Auto-set lineup for final
                            const [homeCoach] = await connection.query('SELECT coach_id FROM teams WHERE team_id = ?', [sf1Winner]);
                            const [awayCoach] = await connection.query('SELECT coach_id FROM teams WHERE team_id = ?', [sf2Winner]);
                            
                            if (homeCoach.length > 0) {
                                await autoSetDefaultLineup(connection, match.match_id, sf1Winner, homeCoach[0].coach_id, false, false, notificationsToCreate);
                            }
                            if (awayCoach.length > 0) {
                                await autoSetDefaultLineup(connection, match.match_id, sf2Winner, awayCoach[0].coach_id, false, false, notificationsToCreate);
                            }
                        }
                    }
                }
            }

            console.log(`   🎯 Updated ${updatedCount} playoff matches`);
        }

        // 3. Auto-set lineup for matches starting soon or already started
        console.log(`\n🔧 Checking matches that need lineup auto-set...`);
        
        const [upcomingMatches] = await connection.query(
            `SELECT m.match_id, m.tournament_id, m.home_team_id, m.away_team_id, 
                    m.match_date, m.match_time, m.status,
                    ht.team_name as home_team_name, at.team_name as away_team_name,
                    ht.coach_id as home_coach_id, at.coach_id as away_coach_id
            FROM matches m
            JOIN teams ht ON m.home_team_id = ht.team_id
            JOIN teams at ON m.away_team_id = at.team_id
            WHERE m.status = 'scheduled' 
            AND m.home_team_id IS NOT NULL 
            AND m.away_team_id IS NOT NULL
            AND CONCAT(m.match_date, ' ', m.match_time) <= DATE_ADD(NOW(), INTERVAL 24 HOUR)`,
            []
        );

        for (const match of upcomingMatches) {
            const matchDateTime = new Date(`${match.match_date.toISOString().split('T')[0]} ${match.match_time}`);
            const hasStarted = matchDateTime <= now;
            
            console.log(`\n⚙️  Checking match: ${match.home_team_name} vs ${match.away_team_name}`);
            console.log(`   📅 Scheduled: ${matchDateTime.toLocaleString('vi-VN')}`);
            
            // Check if home team has lineup
            const [homeLineup] = await connection.query(
                `SELECT COUNT(*) as count FROM match_lineups WHERE match_id = ? AND team_id = ?`,
                [match.match_id, match.home_team_id]
            );
            
            if (homeLineup[0].count === 0) {
                console.log(`   🏠 Auto-setting lineup for home team: ${match.home_team_name}`);
                await autoSetDefaultLineup(
                    connection, 
                    match.match_id, 
                    match.home_team_id, 
                    match.home_coach_id, 
                    hasStarted,
                    hasStarted,
                    notificationsToCreate
                );
            }
            
            // Check if away team has lineup
            const [awayLineup] = await connection.query(
                `SELECT COUNT(*) as count FROM match_lineups WHERE match_id = ? AND team_id = ?`,
                [match.match_id, match.away_team_id]
            );
            
            if (awayLineup[0].count === 0) {
                console.log(`   ✈️  Auto-setting lineup for away team: ${match.away_team_name}`);
                await autoSetDefaultLineup(
                    connection, 
                    match.match_id, 
                    match.away_team_id, 
                    match.away_coach_id, 
                    hasStarted,
                    hasStarted,
                    notificationsToCreate
                );
            }
        }

        console.log(`\n✅ Checked ${upcomingMatches.length} upcoming matches for lineup auto-set`);

        // 4. Check tournaments that should be completed
        const [completedCandidates] = await connection.query(
            `SELECT tournament_id, tournament_name, end_date
            FROM tournaments
            WHERE status = 'ongoing' AND DATE(end_date) < DATE(?)`,
            [today]
        );

        for (const tournament of completedCandidates) {
            console.log(`\n🏁 Tournament ${tournament.tournament_name} → completed`);
            await connection.query('UPDATE tournaments SET status = ? WHERE tournament_id = ?', [
                'completed',
                tournament.tournament_id,
            ]);
        }

        await connection.commit();

        // Create notifications after commit
        for (const notification of notificationsToCreate) {
            try {
                await createNotification(notification);
            } catch (err) {
                console.error('Error creating notification:', err);
            }
        }

        console.log(`\n✅ Tournament status update completed!`);
        console.log(`   - Ongoing: ${ongoingCandidates.length}`);
        console.log(`   - Completed: ${completedCandidates.length}`);
        console.log(`   - Playoff updates: ${groupStageCompleted.length}\n`);
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error updating tournament status:', error);
        throw error;
    } finally {
        connection.release();
    }
};

if (require.main === module) {
    updateTournamentStatus()
        .then(() => {
            console.log('Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { updateTournamentStatus };
