import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  description?: string;
  trend?: number;
  color?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue'
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-2">{description}</p>
      )}
    </motion.div>
  );
}
