import { motion } from 'framer-motion';
import { FaUtensils, FaHistory, FaWallet, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

const actions = [
  {
    icon: FaUtensils,
    label: "Order Now",
    href: "/menu",
    color: "from-orange-500 to-pink-500"
  },
  {
    icon: FaHistory,
    label: "Order History",
    href: "/orders",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: FaWallet,
    label: "Wallet",
    href: "/wallet",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: FaHeart,
    label: "Favorites",
    href: "/favorites",
    color: "from-red-500 to-rose-500"
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link href={action.href} key={action.label}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br ${action.color} p-6 rounded-xl text-white shadow-lg cursor-pointer`}
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-medium">{action.label}</h3>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
