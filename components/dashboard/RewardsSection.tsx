import { motion } from 'framer-motion';
import { FaGift, FaCrown, FaCoins, FaLock } from 'react-icons/fa';

interface RewardCardProps {
  id: string;
  points: number;
  description: string;
  required: number;
  onRedeem: (id: string) => void;
  disabled?: boolean;
}

function RewardCard({ id, points, description, required, onRedeem, disabled }: RewardCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${
        disabled ? 'bg-gray-100' : 'bg-white'
      } rounded-xl p-6 shadow-sm border border-gray-200`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FaGift className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h4 className="font-medium">{description}</h4>
            <p className="text-sm text-gray-500">{points} points</p>
          </div>
        </div>
        {disabled ? (
          <div className="flex items-center gap-1 text-gray-500">
            <FaLock className="w-4 h-4" />
            <span className="text-sm">{required - points} more</span>
          </div>
        ) : (
          <button
            onClick={() => onRedeem(id)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
          >
            Redeem
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface RewardsSectionProps {
  points: number;
  tier: string;
  rewards: Array<{
    id: string;
    description: string;
    points_required: number;
  }>;
  onRedeemPoints: (rewardId: string) => void;
}

export default function RewardsSection({ points, tier, rewards, onRedeemPoints }: RewardsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            {tier} Member
          </h2>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <FaCoins className="text-yellow-500" />
            {points} points available
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            id={reward.id}
            points={points}
            description={reward.description}
            required={reward.points_required}
            onRedeem={onRedeemPoints}
            disabled={points < reward.points_required}
          />
        ))}
      </div>
    </div>
  );
}
