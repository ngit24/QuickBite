import { motion } from 'framer-motion';
import { FaCrown, FaCoins } from 'react-icons/fa';

interface LoyaltyCardProps {
  totalSpent: number;
  points: number;
  tier: string;
}

export default function LoyaltyCard({ totalSpent, points, tier }: LoyaltyCardProps) {
  const tiers = {
    bronze: { color: 'from-amber-700 to-amber-500', next: 1000, reward: '₹100 Cashback' },
    silver: { color: 'from-gray-400 to-gray-300', next: 5000, reward: '₹500 Cashback' },
    gold: { color: 'from-yellow-500 to-yellow-400', next: 10000, reward: '₹1000 Cashback' },
    platinum: { color: 'from-purple-600 to-purple-400', next: null, reward: 'VIP Benefits' }
  };

  const currentTier = tiers[tier.toLowerCase()];
  const progress = currentTier.next ? (totalSpent / currentTier.next) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${currentTier.color} p-6 rounded-2xl text-white`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-90">Loyalty Tier</p>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FaCrown /> {tier}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Points Balance</p>
          <p className="text-xl font-bold flex items-center gap-1 justify-end">
            <FaCoins className="text-yellow-300" /> {points}
          </p>
        </div>
      </div>

      {currentTier.next && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-white/50"
            />
          </div>
          <p className="text-sm">
            Spend ₹{currentTier.next - totalSpent} more to unlock {currentTier.reward}
          </p>
        </div>
      )}
    </motion.div>
  );
}
