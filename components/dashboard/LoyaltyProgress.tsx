import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaCrown, FaCoins, FaGift, FaTrophy, FaRupeeSign, FaChevronDown } from 'react-icons/fa';

interface LoyaltyProgressProps {
  points: number;
  tier: string;
  nextTierPoints: number;
}

export default function LoyaltyProgress({ points, tier, nextTierPoints }: LoyaltyProgressProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRedeemOptions, setShowRedeemOptions] = useState(false);
  
  // Calculate progress to next cashback (1000 points = ₹100)
  const progressToCashback = (points % 1000) / 1000 * 100;
  const pointsToNextCashback = 1000 - (points % 1000);
  const availableCashback = Math.floor(points / 1000) * 100;
  const progress = Math.min(100, (points / (nextTierPoints || 1000) * 100));

  // Get tier color
  const getTierColor = () => {
    switch (tier.toUpperCase()) {
      case 'SILVER': return 'from-gray-400 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-amber-500';
      case 'PLATINUM': return 'from-violet-500 to-purple-600';
      default: return 'from-amber-600 to-amber-700'; // Bronze
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 py-1">
      {/* Collapsible Loyalty Card */}
      <motion.div
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Compact Header - Always visible */}
        <motion.div 
          className="cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gradient-to-r ${getTierColor()} shadow-sm`}>
                <FaCrown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-800">Loyalty Points</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">{tier}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <FaCoins className="w-3 h-3 text-amber-500" /> 
                  <span>{points} points</span>
                  {availableCashback > 0 && (
                    <span className="ml-1 text-green-600 font-medium">
                      (₹{availableCashback} available)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaChevronDown className="text-gray-400" />
            </motion.div>
          </div>

          {/* Progress Bar - Always Visible */}
          <div className="px-4 pb-4">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${getTierColor()}`}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span className="font-medium">{points} pts</span>
              <span>{nextTierPoints} pts</span>
            </div>
          </div>
        </motion.div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100"
            >
              <div className="p-4 space-y-4">
                {/* Cashback Progress Section */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FaRupeeSign className="w-3 h-3 text-green-500" />
                      <h4 className="text-sm font-medium text-gray-800">Cashback Progress</h4>
                    </div>
                    <div className="text-xs text-gray-500">{pointsToNextCashback} points to ₹100</div>
                  </div>

                  {/* Cashback Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToCashback}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    />
                  </div>
                </div>

                {/* Available Cashback Section */}
                {availableCashback > 0 ? (
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => setShowRedeemOptions(!showRedeemOptions)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg text-green-700 transition-all text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-green-100 rounded-full">
                          <FaGift className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">₹{availableCashback} Ready to Redeem</div>
                          <div className="text-xs text-green-600">Tap to claim your rewards</div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: showRedeemOptions ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="text-green-700" />
                      </motion.div>
                    </motion.button>

                    {/* Redeem Options */}
                    <AnimatePresence>
                      {showRedeemOptions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Array.from({ length: Math.min(3, Math.floor(availableCashback / 100)) }, (_, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="flex items-center justify-between p-2.5 bg-white rounded-lg shadow-sm hover:shadow transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-green-100 rounded-full">
                                    <FaRupeeSign className="w-3 h-3 text-green-600" />
                                  </div>
                                  <span className="font-medium text-sm">₹{(i + 1) * 100}</span>
                                </div>
                                <span className="text-xs text-gray-500">{(i + 1) * 1000} pts</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <FaCoins className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">Keep collecting points!</div>
                      <div className="text-xs text-gray-400">Earn 1000 points to get ₹100 cashback</div>
                    </div>
                  </div>
                )}

                {/* Next Tier Info */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-100 rounded-full">
                      <FaTrophy className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Next Tier</div>
                      <div className="text-xs text-gray-500">{nextTierPoints - points} points to go</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                    {tier === 'BRONZE' ? 'SILVER' : 
                     tier === 'SILVER' ? 'GOLD' : 
                     tier === 'GOLD' ? 'PLATINUM' : 'MAX'}
                  </span>
                </div>
                
                <div className="text-xs text-center text-gray-500 pt-1">
                  Every ₹10 spent = 1 point | 1000 points = ₹100 reward
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}