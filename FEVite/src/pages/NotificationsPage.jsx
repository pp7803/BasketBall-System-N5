import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTrash,
  FaFilter,
} from 'react-icons/fa';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [processingIds, setProcessingIds] = useState(new Set());

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setProcessingIds(prev => new Set(prev).add(notificationId));
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.notification_id);

      await Promise.all(
        unreadIds.map(id =>
          axios.put(
            `${API_URL}/notifications/${id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament_created':
      case 'tournament_creation_approved':
      case 'team_registration_approved':
      case 'join_request_approved':
      case 'tournament_update_approved':
        return { icon: '✅', color: 'text-green-600', bg: 'bg-green-50' };
      case 'team_registration_rejected':
      case 'join_request_rejected':
      case 'tournament_update_rejected':
        return { icon: '❌', color: 'text-red-600', bg: 'bg-red-50' };
      case 'referee_assigned':
        return { icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'player_removed':
      case 'team_deleted':
        return { icon: '🔴', color: 'text-red-600', bg: 'bg-red-50' };
      case 'jersey_updated':
        return { icon: '👕', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      default:
        return { icon: '🔔', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-full">
              <FaBell className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0
                  ? `Bạn có ${unreadCount} thông báo chưa đọc`
                  : 'Tất cả thông báo đã được đọc'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-primary flex items-center space-x-2"
            >
              <FaCheckCircle />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-6 py-3 font-medium transition-colors ${
              filter === 'read'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Đã đọc ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-16">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16">
          <FaBell className="text-8xl text-gray-300 mx-auto mb-6" />
          <p className="text-xl text-gray-600 mb-2">Không có thông báo nào</p>
          <p className="text-sm text-gray-500">
            {filter === 'unread'
              ? 'Tất cả thông báo đã được đọc'
              : filter === 'read'
              ? 'Chưa có thông báo đã đọc'
              : 'Bạn chưa có thông báo nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => {
            const style = getNotificationIcon(notif.type);
            const isProcessing = processingIds.has(notif.notification_id);

            return (
              <div
                key={notif.notification_id}
                className={`card hover:shadow-lg transition-all ${
                  !notif.is_read ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`${style.bg} p-4 rounded-full text-3xl flex-shrink-0`}
                  >
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1 animate-pulse"></div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{notif.message}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {formatDate(notif.created_at)}
                      </p>

                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.notification_id)}
                          disabled={isProcessing}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaCheckCircle />
                          )}
                          <span>Đánh dấu đã đọc</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
