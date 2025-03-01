import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaPercent, FaHeadset } from 'react-icons/fa';
import Link from 'next/link';

interface StatsSectionProps {
  totalSaved: number;
}

export default function StatsSection({ totalSaved }: StatsSectionProps) {
  const cards = [
    {
      title: 'Total Savings',
      value: `₹${totalSaved.toFixed(2)}`,
      icon: FaMoneyBillWave,
      color: 'from-green-500 to-emerald-700',
      textColor: 'text-emerald-500',
      link: null
    },
    {
      title: 'Explore Offers',
      value: 'Active Deals',
      icon: FaPercent,
      color: 'from-purple-500 to-indigo-700',
      textColor: 'text-purple-500',
      link: '/offers',
      subtitle: 'Check latest deals'
    },
    {
      title: 'Need Help?',
      value: 'Contact Support',
      icon: FaHeadset,
      color: 'from-blue-500 to-blue-700',
      textColor: 'text-blue-500',
      link: '/support',
      subtitle: '24/7 assistance'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative group ${card.link ? 'cursor-pointer' : ''}`}
        >
          {card.link ? (
            <Link href={card.link}>
              <div className="h-full">
                <StatCard {...card} />
              </div>
            </Link>
          ) : (
            <StatCard {...card} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, textColor, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-xl font-bold ${textColor}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${color}`} />
    </div>
  );
}
