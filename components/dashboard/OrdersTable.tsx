import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaCheck, FaClock, FaTimes } from 'react-icons/fa';

const statusIcons = {
  pending: FaClock,
  processing: FaShoppingBag,
  completed: FaCheck,
  cancelled: FaTimes,
};

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-50',
  processing: 'text-blue-500 bg-blue-50',
  completed: 'text-green-500 bg-green-50',
  cancelled: 'text-red-500 bg-red-50',
};

interface Order {
  id: string;
  status: keyof typeof statusIcons;
  items: { name: string; quantity: number }[];
  total: number;
  created_at: string;
}

export default function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Recent Orders</h2>
      </div>
      <div className="divide-y">
        <AnimatePresence>
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            const statusColor = statusColors[order.status];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${statusColor}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
