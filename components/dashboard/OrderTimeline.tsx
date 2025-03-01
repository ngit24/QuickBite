import { motion } from 'framer-motion';
import { FaCircle } from 'react-icons/fa';

interface TimelineOrder {
  id: string;
  status: string;
  time: string;
  items: string[];
}

export default function OrderTimeline({ orders }: { orders: TimelineOrder[] }) {
  return (
    <div className="space-y-8">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-6 border-l-2 border-gray-200"
        >
          <FaCircle className="absolute -left-[9px] text-primary-600 bg-white" size={16} />
          <div className="mb-1">
            <span className="text-sm text-gray-500">{order.time}</span>
          </div>
          <div className="font-medium text-gray-900">Order #{order.id}</div>
          <div className="mt-1 text-sm text-gray-500">
            {order.items.join(', ')}
          </div>
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
