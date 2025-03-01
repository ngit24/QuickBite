import { motion } from 'framer-motion';
import { FaBell, FaCheck } from 'react-icons/fa';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationsPanel({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}: NotificationsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="font-semibold flex items-center gap-2">
          <FaBell className="text-primary-600" />
          Notifications
        </h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 border-b border-gray-100 last:border-0 ${
                notification.read ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-800">{notification.message}</p>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </div>
    </motion.div>
  );
}
