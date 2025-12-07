const { pool } = require('../utils/db');
const { createNotification, notifyAdmins } = require('./notificationController');

/**
 * UC15: Xem lịch thi đấu
 * GET /api/public/matches
 * Access: Public (không cần đăng nhập)
 */
const getMatches = async (req, res) => {
    try {
        const { tournament_id, status, date_from, date_to, team_id } = req.query;

        let query = `
      SELECT m.match_id, m.match_date, m.match_time, m.round_type, m.match_round, m.status,
             m.home_score, m.away_score, m.result_confirmed, m.stage, m.group_id,
             t.tournament_name,
             ht.team_name as home_team, ht.short_name as home_team_short, ht.logo_url as home_team_logo,
             at.team_name as away_team, at.short_name as away_team_short, at.logo_url as away_team_logo,
             v.venue_name, v.address, v.city, v.capacity,
             r.user_id as referee_user_id,
             u_ref.full_name as referee_name,
             r.certification_level as referee_certification_level,
             g.group_name
      FROM matches m
      JOIN tournaments t ON m.tournament_id = t.tournament_id
      LEFT JOIN teams ht ON m.home_team_id = ht.team_id
      LEFT JOIN teams at ON m.away_team_id = at.team_id
      LEFT JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN referees r ON m.main_referee_id = r.user_id
      LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
      LEFT JOIN \`groups\` g ON m.group_id = g.group_id
      WHERE 1=1
    `;
        const params = [];

        if (tournament_id) {
            query += ' AND m.tournament_id = ?';
            params.push(tournament_id);
        }

        if (status) {
            query += ' AND m.status = ?';
            params.push(status);
        }

        if (date_from) {
            query += ' AND m.match_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            query += ' AND m.match_date <= ?';
            params.push(date_to);
        }

        if (team_id) {
            query += ' AND (m.home_team_id = ? OR m.away_team_id = ?)';
            params.push(team_id, team_id);
        }

        query += ' ORDER BY m.match_date ASC, m.match_time ASC';

        const [matches] = await pool.query(query, params);

        // Only show results if confirmed (hide unconfirmed results from public)
        const matchesWithFilteredResults = matches.map((match) => {
            if (!match.result_confirmed) {
                // Hide unconfirmed results from public view
                return {
                    ...match,
                    home_score: null,
                    away_score: null,
                };
            }
            return match;
        });

        res.status(200).json({
            success: true,
            data: matchesWithFilteredResults,
        });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting matches',
        });
    }
};

/**
 * GET /api/public/matches/:id
 * Chi tiết 1 trận đấu
 */
const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const [matches] = await pool.query(
            `SELECT m.*, 
              t.tournament_name, t.status as tournament_status,
              ht.team_name as home_team, ht.short_name as home_team_short, ht.logo_url as home_team_logo,
              at.team_name as away_team, at.short_name as away_team_short, at.logo_url as away_team_logo,
              v.venue_name, v.address, v.city, v.capacity,
              r.user_id as referee_user_id,
              u_ref.full_name as referee_name,
              r.certification_level as referee_certification_level,
              g.group_name
       FROM matches m
       JOIN tournaments t ON m.tournament_id = t.tournament_id
       JOIN teams ht ON m.home_team_id = ht.team_id
       JOIN teams at ON m.away_team_id = at.team_id
       LEFT JOIN venues v ON m.venue_id = v.venue_id
       LEFT JOIN referees r ON m.main_referee_id = r.user_id
       LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
       LEFT JOIN \`groups\` g ON m.group_id = g.group_id
       WHERE m.match_id = ?`,
            [id]
        );

        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Match not found',
            });
        }

        const match = matches[0];
        
        // Only show results if confirmed (hide unconfirmed results from public)
        if (!match.result_confirmed) {
            match.home_score = null;
            match.away_score = null;
        }

        res.status(200).json({
            success: true,
            data: match,
        });
    } catch (error) {
        console.error('Get match by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting match details',
        });
    }
};

/**
 * GET /api/public/matches/:id/lineups
 * Lấy đội hình của cả hai đội trong trận đấu
 * Access: Public
 */
const getMatchLineups = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify match exists
        const [matches] = await pool.query(
            'SELECT match_id, home_team_id, away_team_id FROM matches WHERE match_id = ?',
            [id]
        );

        if (matches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Match not found',
            });
        }

        const match = matches[0];

        // Get lineups for both teams
        const [lineups] = await pool.query(
            `SELECT 
                ml.lineup_id,
                ml.match_id,
                ml.team_id,
                ml.athlete_id,
                ml.position,
                a.jersey_number,
                u.full_name,
                u.user_id,
                t.team_name,
                t.short_name
            FROM match_lineups ml
            JOIN athletes a ON ml.athlete_id = a.athlete_id
            JOIN users u ON a.user_id = u.user_id
            JOIN teams t ON ml.team_id = t.team_id
            WHERE ml.match_id = ?
            ORDER BY ml.team_id, ml.position`,
            [id]
        );

        // Group by team
        const homeLineup = lineups.filter((l) => l.team_id === match.home_team_id);
        const awayLineup = lineups.filter((l) => l.team_id === match.away_team_id);

        res.status(200).json({
            success: true,
            data: {
                home_team_lineup: homeLineup,
                away_team_lineup: awayLineup,
            },
        });
    } catch (error) {
        console.error('Get match lineups error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting match lineups',
        });
    }
};

/**
 * UC16: Xem bảng xếp hạng
 * GET /api/public/standings
 * Access: Public
 */
const getStandings = async (req, res) => {
    try {
        const { tournament_id } = req.query;

        if (!tournament_id) {
            return res.status(400).json({
                success: false,
                message: 'Tournament ID is required',
            });
        }

        // Get standings with group information (Basketball - no draws)
        const [standings] = await pool.query(
            `SELECT 
                s.standing_id, 
                s.position, 
                s.matches_played, 
                s.wins, 
                s.losses,
                s.points, 
                s.goals_for, 
                s.goals_against, 
                s.goal_difference,
                t.team_name, 
                t.short_name, 
                t.logo_url,
                t.team_id,
                g.group_name,
                g.group_id
            FROM standings s
            JOIN teams t ON s.team_id = t.team_id
            LEFT JOIN group_teams gt ON s.team_id = gt.team_id
            LEFT JOIN \`groups\` g ON gt.group_id = g.group_id AND g.tournament_id = s.tournament_id
            WHERE s.tournament_id = ?
            ORDER BY g.group_name ASC, s.points DESC, s.goal_difference DESC, s.goals_for DESC`,
            [tournament_id]
        );

        // Group standings by group
        const groupedStandings = {};
        standings.forEach(team => {
            const groupName = team.group_name || 'Overall';
            if (!groupedStandings[groupName]) {
                groupedStandings[groupName] = [];
            }
            groupedStandings[groupName].push(team);
        });

        // Update positions within each group
        Object.keys(groupedStandings).forEach(groupName => {
            groupedStandings[groupName].forEach((team, index) => {
                team.group_position = index + 1;
            });
        });

        res.status(200).json({
            success: true,
            data: standings,
            grouped: groupedStandings,
        });
    } catch (error) {
        console.error('Get standings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting standings',
        });
    }
};

/**
 * UC17: Tìm kiếm trận đấu (Extend UC15)
 * GET /api/public/search
 * Access: Public
 */
const searchMatches = async (req, res) => {
    try {
        const { keyword, tournament_id, date, team_name, venue_name } = req.query;

        let query = `
      SELECT m.match_id, m.match_date, m.match_time, m.round_type, m.match_round, m.status,
             m.home_score, m.away_score, m.stage,
             t.tournament_name,
             ht.team_name as home_team, ht.short_name as home_team_short,
             at.team_name as away_team, at.short_name as away_team_short,
             v.venue_name, v.address, v.city, v.capacity,
             r.user_id as referee_user_id,
             u_ref.full_name as referee_name,
             r.certification_level as referee_certification_level,
             g.group_name
      FROM matches m
      JOIN tournaments t ON m.tournament_id = t.tournament_id
      JOIN teams ht ON m.home_team_id = ht.team_id
      JOIN teams at ON m.away_team_id = at.team_id
      LEFT JOIN venues v ON m.venue_id = v.venue_id
      LEFT JOIN referees r ON m.main_referee_id = r.user_id
      LEFT JOIN users u_ref ON r.user_id = u_ref.user_id
      LEFT JOIN \`groups\` g ON m.group_id = g.group_id
      WHERE 1=1
    `;
        const params = [];

        // Tìm kiếm tổng quát
        if (keyword) {
            query += ` AND (
        t.tournament_name LIKE ? OR 
        ht.team_name LIKE ? OR 
        at.team_name LIKE ? OR 
        v.venue_name LIKE ?
      )`;
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Tìm theo tournament
        if (tournament_id) {
            query += ' AND m.tournament_id = ?';
            params.push(tournament_id);
        }

        // Tìm theo ngày
        if (date) {
            query += ' AND DATE(m.match_date) = ?';
            params.push(date);
        }

        // Tìm theo tên đội
        if (team_name) {
            query += ' AND (ht.team_name LIKE ? OR at.team_name LIKE ?)';
            const teamSearchTerm = `%${team_name}%`;
            params.push(teamSearchTerm, teamSearchTerm);
        }

        // Tìm theo sân
        if (venue_name) {
            query += ' AND v.venue_name LIKE ?';
            params.push(`%${venue_name}%`);
        }

        query += ' ORDER BY m.match_date ASC, m.match_time ASC LIMIT 50';

        const [results] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error('Search matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching matches',
        });
    }
};

/**
 * Get list of venues
 * GET /api/public/venues
 * Access: Public
 */
const getVenues = async (req, res) => {
    try {
        const [venues] = await pool.query(
            `SELECT venue_id, venue_name, address, city, capacity, is_available
       FROM venues
       WHERE is_available = TRUE
       ORDER BY venue_name`
        );

        res.status(200).json({
            success: true,
            data: venues,
        });
    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting venues',
        });
    }
};

/**
 * Public: Xem danh sách các đội (cho athlete tìm kiếm)
 * GET /api/public/teams
 * @access Public (hoặc authenticated)
 */
const getTeams = async (req, res) => {
    try {
        const [teams] = await pool.query(
            `SELECT 
        t.team_id,
        t.team_name,
        t.short_name,
        t.logo_url,
        t.entry_fee,
        t.is_active,
        t.created_at,
        c.coach_id,
        u.full_name as coach_name,
        u.phone as coach_phone,
        u.email as coach_email,
        COUNT(DISTINCT a.athlete_id) as player_count
       FROM teams t
       JOIN coaches c ON t.coach_id = c.coach_id
       JOIN users u ON c.user_id = u.user_id
       LEFT JOIN athletes a ON t.team_id = a.team_id
       WHERE t.is_active = TRUE
       GROUP BY t.team_id
       ORDER BY t.created_at DESC`
        );

        res.status(200).json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching teams',
        });
    }
};

/**
 * GET /api/public/coaches
 * Lấy danh sách huấn luyện viên công khai với rating stats
 */
const getCoaches = async (req, res) => {
    try {
        const [coaches] = await pool.query(
            `SELECT 
                c.coach_id,
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                c.coaching_license,
                c.years_of_experience,
                c.created_at,
                COALESCE(rs.total_ratings, 0) as total_ratings,
                COALESCE(rs.average_rating, 0) as average_rating
            FROM coaches c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN rating_stats rs ON rs.target_type = 'coach' AND rs.target_id = c.coach_id
            WHERE u.is_active = TRUE
            ORDER BY rs.average_rating DESC, c.years_of_experience DESC, u.full_name ASC`
        );

        res.status(200).json({
            success: true,
            data: coaches,
        });
    } catch (error) {
        console.error('Get coaches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching coaches',
        });
    }
};

/**
 * GET /api/public/athletes
 * Lấy danh sách vận động viên công khai với rating stats
 */
const getAthletes = async (req, res) => {
    try {
        const { team_id, position } = req.query;

        let query = `
            SELECT 
                a.athlete_id,
                u.user_id,
                u.full_name,
                u.email,
                u.phone,
                a.team_id,
                a.jersey_number,
                a.position,
                a.height,
                a.weight,
                a.date_of_birth,
                a.created_at,
                t.team_name,
                t.short_name as team_short_name,
                t.logo_url as team_logo,
                COALESCE(rs.total_ratings, 0) as total_ratings,
                COALESCE(rs.average_rating, 0) as average_rating
            FROM athletes a
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN teams t ON a.team_id = t.team_id
            LEFT JOIN rating_stats rs ON rs.target_type = 'athlete' AND rs.target_id = a.athlete_id
            WHERE u.is_active = TRUE
        `;
        const params = [];

        if (team_id) {
            query += ' AND a.team_id = ?';
            params.push(team_id);
        }

        if (position) {
            query += ' AND a.position = ?';
            params.push(position);
        }

        query += ' ORDER BY rs.average_rating DESC, u.full_name ASC';

        const [athletes] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: athletes,
        });
    } catch (error) {
        console.error('Get athletes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching athletes',
        });
    }
};

/**
 * GET /api/public/tournaments
 * Lấy danh sách giải đấu công khai với rating stats
 */
const getTournaments = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                t.tournament_id,
                t.tournament_name,
                t.description,
                t.start_date,
                t.end_date,
                t.registration_deadline,
                t.max_teams,
                t.current_teams,
                t.total_prize_money,
                t.prize_1st,
                t.prize_2nd,
                t.prize_3rd,
                t.status,
                t.created_at,
                s.company_name as sponsor_name,
                t.description as location,
                COALESCE(rs.total_ratings, 0) as total_ratings,
                COALESCE(rs.average_rating, 0) as average_rating
            FROM tournaments t
            JOIN sponsors s ON t.sponsor_id = s.sponsor_id
            LEFT JOIN rating_stats rs ON rs.target_type = 'tournament' AND rs.target_id = t.tournament_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        } else {
            // Mặc định chỉ hiển thị giải đấu đang hoạt động hoặc sắp diễn ra
            query += ' AND t.status IN ("registration", "ongoing", "completed")';
        }

        query += ' ORDER BY rs.average_rating DESC, t.start_date DESC';

        const [tournaments] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: tournaments,
        });
    } catch (error) {
        console.error('Get tournaments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournaments',
        });
    }
};

/**
 * Public forum: xem chủ đề & bài viết (đã được admin duyệt)
 */
const getPublicForumTopics = async (req, res) => {
    try {
        const { search, limit = 50, offset = 0 } = req.query;

        let query = `
      SELECT ft.*, u.full_name as created_by_name
      FROM forum_topics ft
      JOIN users u ON ft.created_by = u.user_id
      WHERE ft.status = 'active'
    `;
        const params = [];

        if (search) {
            query += ' AND (ft.title LIKE ? OR ft.description LIKE ?)';
            const pattern = `%${search}%`;
            params.push(pattern, pattern);
        }

        query += ' ORDER BY ft.is_pinned DESC, ft.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [topics] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (error) {
        console.error('Get public forum topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting forum topics',
        });
    }
};

const getPublicForumPostsByTopic = async (req, res) => {
    try {
        const { topic_id } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Kiểm tra chủ đề còn active - chỉ lấy các trường cần thiết
        const [topics] = await pool.query(
            `SELECT topic_id, title, description, created_by, visibility, is_locked, status, created_at, updated_at
             FROM forum_topics 
             WHERE topic_id = ? AND status = 'active'`,
            [topic_id]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum topic not found',
            });
        }

        const [posts] = await pool.query(
            `SELECT fp.*, u.full_name as author_name
       FROM forum_posts fp
       JOIN users u ON fp.user_id = u.user_id
       WHERE fp.topic_id = ? AND fp.status = 'approved'
       ORDER BY fp.created_at DESC
       LIMIT ? OFFSET ?`,
            [topic_id, parseInt(limit), parseInt(offset)]
        );

        res.status(200).json({
            success: true,
            data: {
                topic: topics[0],
                posts,
            },
        });
    } catch (error) {
        console.error('Get public forum posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting forum posts',
        });
    }
};

const getPublicForumCommentsByPost = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        // Chỉ lấy bình luận của bài đã approved
        const [posts] = await pool.query("SELECT * FROM forum_posts WHERE post_id = ? AND status = 'approved'", [
            post_id,
        ]);

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found',
            });
        }

        const [comments] = await pool.query(
            `SELECT fc.*, u.full_name as author_name, u.role as author_role
       FROM forum_comments fc
       JOIN users u ON fc.user_id = u.user_id
       WHERE fc.post_id = ?
       ORDER BY fc.created_at ASC
       LIMIT ? OFFSET ?`,
            [post_id, parseInt(limit), parseInt(offset)]
        );

        res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        console.error('Get public forum comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting forum comments',
        });
    }
};

/**
 * Tạo bài viết mới trong chủ đề (yêu cầu đã đăng nhập)
 * Quy tắc:
 * - Chủ đề status phải = 'active'
 * - Nếu topic.visibility = 'public' -> post.status = 'approved'
 * - Nếu topic.visibility = 'moderated' -> post.status = 'pending' (chờ admin duyệt)
 */
const createForumPost = async (req, res) => {
    try {
        const { topic_id } = req.params;
        const { title, content } = req.body;
        const user_id = req.user?.user_id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung bài viết không được để trống',
            });
        }

        const [topics] = await pool.query("SELECT * FROM forum_topics WHERE topic_id = ? AND status = 'active'", [
            topic_id,
        ]);

        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum topic not found or inactive',
            });
        }

        const topic = topics[0];
        const visibility = topic.visibility || 'public';
        const status = visibility === 'moderated' ? 'pending' : 'approved';

        const [result] = await pool.query(
            `INSERT INTO forum_posts 
       (topic_id, user_id, title, content, status, rejection_reason, edit_request_note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, NOW(), NOW())`,
            [topic_id, user_id, title || null, content.trim(), status]
        );

        const [rows] = await pool.query(
            `SELECT fp.*, u.full_name as author_name
       FROM forum_posts fp
       JOIN users u ON fp.user_id = u.user_id
       WHERE fp.post_id = ?`,
            [result.insertId]
        );

        const createdPost = rows[0];

        // Thông báo cho tác giả bài viết
        try {
            await createNotification({
                user_id,
                type: 'forum_post_submitted',
                title: '📄 Bạn đã tạo bài viết mới',
                message:
                    status === 'approved'
                        ? `Bài viết của bạn trong chủ đề "${topic.title}" đã được đăng.`
                        : `Bài viết của bạn trong chủ đề "${topic.title}" đã được gửi và đang chờ admin phê duyệt.`,
                metadata: {
                    topic_id,
                    post_id: createdPost.post_id,
                    title: createdPost.title,
                    visibility,
                    status,
                },
                created_by: user_id,
            });
        } catch (notifError) {
            console.error('Notify author for forum post error:', notifError);
        }

        // Nếu bài viết cần duyệt, thông báo tới tất cả admin
        if (status === 'pending') {
            try {
                await notifyAdmins({
                    type: 'forum_post_pending',
                    title: '📝 Bài viết mới chờ duyệt',
                    message: `Có bài viết mới chờ duyệt trong chủ đề "${topic.title}".`,
                    metadata: {
                        topic_id,
                        post_id: createdPost.post_id,
                        author_id: user_id,
                        title: createdPost.title,
                    },
                    created_by: user_id,
                });
            } catch (notifError) {
                console.error('Notify admins for pending post error:', notifError);
            }
        }

        res.status(201).json({
            success: true,
            message:
                status === 'approved' ? 'Bài viết đã được đăng công khai' : 'Bài viết đã được gửi, chờ admin phê duyệt',
            data: createdPost,
        });
    } catch (error) {
        console.error('Create forum post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating forum post',
        });
    }
};

/**
 * Tạo bình luận cho bài viết (yêu cầu đã đăng nhập)
 * Quy tắc:
 * - Không cần duyệt bình luận (status = 'approved')
 * - Nếu user đang bị cấm bình luận (forum_comment_bans) thì từ chối
 * - Không cho bình luận vào topic/bài đã bị khóa hoặc không active
 */
const createForumComment = async (req, res) => {
    try {
        const { post_id } = req.params;
        const { content } = req.body;
        const user_id = req.user?.user_id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung bình luận không được để trống',
            });
        }

        // Check comment ban
        const [bans] = await pool.query(
            `SELECT ban_id FROM forum_comment_bans 
       WHERE user_id = ? 
         AND is_active = 1 
         AND (end_at IS NULL OR end_at > NOW())
       LIMIT 1`,
            [user_id]
        );

        if (bans.length > 0) {
            return res.status(403).json({
                success: false,
                message: 'Bạn đang bị cấm bình luận trên diễn đàn.',
            });
        }

        // Check post & topic status/lock
        const [posts] = await pool.query(
            `SELECT fp.*, ft.status as topic_status, ft.is_locked 
       FROM forum_posts fp
       JOIN forum_topics ft ON fp.topic_id = ft.topic_id
       WHERE fp.post_id = ?`,
            [post_id]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found',
            });
        }

        const post = posts[0];
        if (post.topic_status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Chủ đề đã bị ẩn hoặc lưu trữ, không thể bình luận',
            });
        }
        if (post.is_locked) {
            return res.status(400).json({
                success: false,
                message: 'Chủ đề đã bị khóa bình luận',
            });
        }

        const [result] = await pool.query(
            `INSERT INTO forum_comments
       (post_id, user_id, content, visibility, created_at, updated_at)
       VALUES (?, ?, ?, 'visible', NOW(), NOW())`,
            [post_id, user_id, content.trim()]
        );

        const [rows] = await pool.query(
            `SELECT fc.*, u.full_name as author_name, u.role as author_role
       FROM forum_comments fc
       JOIN users u ON fc.user_id = u.user_id
       WHERE fc.comment_id = ?`,
            [result.insertId]
        );

        const createdComment = rows[0];

        // Thông báo cho tác giả bài viết (nếu khác người bình luận)
        if (post.user_id && post.user_id !== user_id) {
            try {
                await createNotification({
                    user_id: post.user_id,
                    type: 'forum_comment_created',
                    title: '💬 Có bình luận mới trong bài viết của bạn',
                    message: 'Bài viết của bạn trên diễn đàn vừa có bình luận mới.',
                    metadata: {
                        post_id,
                        comment_id: createdComment.comment_id,
                        topic_id: post.topic_id,
                        commenter_id: user_id,
                    },
                    created_by: user_id,
                });
            } catch (notifError) {
                console.error('Notify post author for comment error:', notifError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Bình luận đã được đăng',
            data: createdComment,
        });
    } catch (error) {
        console.error('Create forum comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating forum comment',
        });
    }
};

/**
 * Người dùng báo cáo một bình luận
 * POST /api/public/forum/comments/:comment_id/report
 */
const reportForumComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { report_type = 'violation', description = '' } = req.body;
        const user_id = req.user?.user_id;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Kiểm tra bình luận tồn tại
        const [comments] = await pool.query(
            `SELECT fc.*, fp.topic_id, u.role as author_role
       FROM forum_comments fc
       JOIN forum_posts fp ON fc.post_id = fp.post_id
       JOIN users u ON fc.user_id = u.user_id
       WHERE fc.comment_id = ?`,
            [comment_id]
        );

        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            });
        }

        const comment = comments[0];

        // Không cho tự báo cáo bình luận của chính mình
        if (comment.user_id === user_id) {
            return res.status(400).json({
                success: false,
                message: 'Bạn không thể tự báo cáo bình luận của chính mình.',
            });
        }

        // Không cho báo cáo bình luận của admin
        if (comment.author_role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Không thể báo cáo bình luận của admin. Vui lòng liên hệ admin khác nếu cần.',
            });
        }

        // Không cho cùng một user báo cáo nhiều lần cùng một bình luận (khi báo cáo trước chưa bị bỏ qua)
        const [existingReports] = await pool.query(
            `SELECT report_id, status 
       FROM forum_reports 
       WHERE target_type = 'comment' 
         AND target_id = ? 
         AND created_by = ?
         AND status != 'dismissed'`,
            [comment_id, user_id]
        );

        if (existingReports.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã báo cáo bình luận này rồi, vui lòng chờ admin xử lý.',
            });
        }

        await pool.query(
            `INSERT INTO forum_reports
       (target_type, target_id, report_type, description, status, created_by, created_at)
       VALUES ('comment', ?, ?, ?, 'pending', ?, NOW())`,
            [comment_id, report_type, description || null, user_id]
        );

        // Thông báo cho admin về báo cáo mới
        try {
            await notifyAdmins({
                type: 'forum_comment_reported',
                title: '🚩 Báo cáo bình luận mới',
                message: 'Có một bình luận trên diễn đàn bị báo cáo vi phạm.',
                metadata: {
                    comment_id,
                    report_type,
                    topic_id: comments[0].topic_id,
                    reported_by: user_id,
                },
                created_by: user_id,
            });
        } catch (notifError) {
            console.error('Notify admins for comment report error:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Đã gửi báo cáo bình luận. Cảm ơn bạn đã đóng góp.',
        });
    } catch (error) {
        console.error('Report forum comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while reporting comment',
        });
    }
};

/**
 * Public: Xem chi tiết đội (coach info + members list)
 * GET /api/public/teams/:id
 * @access Public (coach info always visible, members only for team members)
 */
const getTeamDetail = async (req, res) => {
    try {
        const team_id = req.params.id;
        const user_id = req.user?.user_id; // May be null if not authenticated

        console.log('═══════════════════════════════════════════');
        console.log('🏀 GET TEAM DETAIL REQUEST');
        console.log('   team_id:', team_id);
        console.log('   user_id:', user_id);
        console.log('   req.user:', req.user);
        console.log('═══════════════════════════════════════════');

        // Get team with coach info (ALWAYS PUBLIC)
        const [teams] = await pool.query(
            `SELECT 
        t.team_id,
        t.team_name,
        t.short_name,
        t.logo_url,
        t.entry_fee,
        t.is_active,
        t.created_at,
        c.coach_id,
        c.coaching_license,
        c.years_of_experience,
        u.full_name as coach_name,
        u.phone as coach_phone,
        u.email as coach_email,
        u.avatar_url as coach_avatar,
        COUNT(DISTINCT CASE WHEN a.team_id = t.team_id THEN a.athlete_id END) as player_count
       FROM teams t
       JOIN coaches c ON t.coach_id = c.coach_id
       JOIN users u ON c.user_id = u.user_id
       LEFT JOIN athletes a ON t.team_id = a.team_id AND a.team_id IS NOT NULL
       WHERE t.team_id = ?
       GROUP BY t.team_id`,
            [team_id]
        );

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found',
            });
        }

        let members = [];
        let isMember = false;

        // Check if user is a member of this team (PRIVACY CHECK)
        if (user_id) {
            console.log('🔍 Checking membership:');
            console.log('   user_id:', user_id);
            console.log('   team_id:', team_id);

            const [userTeam] = await pool.query(`SELECT athlete_id, team_id FROM athletes WHERE user_id = ?`, [
                user_id,
            ]);

            console.log('   user athlete records:', userTeam);

            const [teamCheck] = await pool.query(
                `SELECT athlete_id, team_id FROM athletes WHERE user_id = ? AND team_id = ?`,
                [user_id, team_id]
            );

            console.log('   team membership check:', teamCheck);

            isMember = teamCheck.length > 0;
            console.log('   isMember:', isMember);
        } else {
            console.log('⚠️  No user_id provided (not authenticated)');
        }

        // Only return members list if user is a member of this team
        if (isMember) {
            const [membersList] = await pool.query(
                `SELECT 
          a.athlete_id,
          a.jersey_number,
          a.position,
          a.height,
          a.weight,
          u.user_id,
          COALESCE(u.full_name, 'Unknown Player') as full_name,
          u.phone,
          u.email,
          u.avatar_url
         FROM athletes a
         LEFT JOIN users u ON a.user_id = u.user_id
         WHERE a.team_id = ?
         ORDER BY a.jersey_number`,
                [team_id]
            );
            members = membersList;
        }

        res.status(200).json({
            success: true,
            data: {
                team: teams[0],
                members: members, // Empty array if not a member
                isMember: isMember, // Flag to inform frontend
            },
        });
    } catch (error) {
        console.error('Get team detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team details',
        });
    }
};

/**
 * Get tournament format and rules
 * GET /api/public/tournaments/:tournamentId/format
 * Access: Public
 */
const getTournamentFormat = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        // Get tournament info
        const [tournaments] = await pool.query(
            `SELECT tournament_id, tournament_name, max_teams, start_date, end_date
             FROM tournaments
             WHERE tournament_id = ?`,
            [tournamentId]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found',
            });
        }

        const tournament = tournaments[0];
        const is8Teams = tournament.max_teams === 8;

        const format = {
            tournament_id: tournament.tournament_id,
            tournament_name: tournament.tournament_name,
            max_teams: tournament.max_teams,
            format: is8Teams ? '8 teams' : '16 teams',
            stages: [
                {
                    stage: 'group_stage',
                    name: 'Vòng bảng',
                    description: is8Teams
                        ? '8 đội chia thành 2 bảng (A và B), mỗi bảng 4 đội. Mỗi đội thi đấu với tất cả các đội khác trong bảng một lần.'
                        : '16 đội chia thành 2 bảng (A và B), mỗi bảng 8 đội. Mỗi đội thi đấu với tất cả các đội khác trong bảng một lần.',
                    teams_per_group: tournament.max_teams / 2,
                    matches_per_group: is8Teams ? 6 : 28, // C(n,2) = n*(n-1)/2
                    advancing_teams: is8Teams ? 2 : 4, // Top teams from each group
                },
                ...(is8Teams
                    ? [
                          {
                              stage: 'semifinal',
                              name: 'Bán kết',
                              description: 'Top 2 đội mỗi bảng (4 đội) vào bán kết: A1 vs B2, A2 vs B1',
                              matches: 2,
                          },
                          {
                              stage: 'final',
                              name: 'Chung kết',
                              description: '2 đội thắng bán kết thi đấu chung kết',
                              matches: 1,
                          },
                      ]
                    : [
                          {
                              stage: 'quarterfinal',
                              name: 'Tứ kết',
                              description: 'Top 4 đội mỗi bảng (8 đội) vào tứ kết: A1 vs B4, A2 vs B3, A3 vs B2, A4 vs B1',
                              matches: 4,
                          },
                          {
                              stage: 'semifinal',
                              name: 'Bán kết',
                              description: '4 đội thắng tứ kết thi đấu bán kết: Winner QF1 vs Winner QF2, Winner QF3 vs Winner QF4',
                              matches: 2,
                          },
                          {
                              stage: 'final',
                              name: 'Chung kết',
                              description: '2 đội thắng bán kết thi đấu chung kết',
                              matches: 1,
                          },
                      ]),
            ],
            rules: {
                group_stage: {
                    points: 'Thắng: 2 điểm, Thua: 0 điểm',
                    tiebreaker: '1. Điểm số, 2. Hiệu số bàn thắng, 3. Số bàn thắng, 4. Kết quả đối đầu',
                },
                playoff: {
                    format: 'Loại trực tiếp (knockout)',
                    advancing: 'Đội thắng vào vòng tiếp theo',
                },
            },
        };

        res.status(200).json({
            success: true,
            data: format,
        });
    } catch (error) {
        console.error('Get tournament format error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tournament format',
        });
    }
};

module.exports = {
    getMatches,
    getMatchById,
    getMatchLineups,
    getStandings,
    searchMatches,
    getVenues,
    getTeams,
    getTeamDetail,
    getCoaches,
    getAthletes,
    getTournaments,
    // Forum (public)
    getPublicForumTopics,
    getPublicForumPostsByTopic,
    getPublicForumCommentsByPost,
    createForumPost,
    createForumComment,
    reportForumComment,
    getTournamentFormat,
};
