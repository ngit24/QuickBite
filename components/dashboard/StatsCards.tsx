import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaGift, FaHeadset } from 'react-icons/fa';
import Link from 'next/link';

interface StatsCardsProps {
  totalSaved: number;
}

export default function StatsCards({ totalSaved }: StatsCardsProps) {
  const cards = [
    {
      title: "Saved",
      value: `₹${totalSaved.toFixed(0)}`,
      icon: FaMoneyBillWave,
      color: "bg-gradient-to-r from-green-400 to-emerald-500",
      link: null
    },
    {
      title: "Offers",
      value: "View",
      icon: FaGift,
      color: "bg-gradient-to-r from-purple-400 to-indigo-500",
      link: "/offers"
    },
    {
      title: "Help",
      value: "Support",
      icon: FaHeadset,
      color: "bg-gradient-to-r from-blue-400 to-blue-600",
      link: "/support"
    }
  ];

  return (
    <div className="px-4 max-w-7xl mx-auto">
      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
          >
            {card.link ? (
              <Link href={card.link}>
                <StatCard {...card} />
              </Link>
            ) : (
              <StatCard {...card} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="group cursor-pointer h-full">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex items-center">
        <div className={`${color} w-1 sm:w-2 h-full group-hover:w-2 sm:group-hover:w-3 transition-all duration-200`} />
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 p-2 sm:p-4 w-full">
          <div className={`${color} rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white shadow-sm`}>
            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500 font-medium">{title}</p>
            <p className="text-sm sm:text-base font-bold">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
