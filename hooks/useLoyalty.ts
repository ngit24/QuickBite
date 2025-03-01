import { useState, useEffect } from 'react';

interface LoyaltyStatus {
  tier: string;
  points: number;
  total_spent: number;
  available_rewards: Array<{
    id: string;
    description: string;
    points_required: number;
    type: string;
    value: number;
  }>;
  next_tier: string | null;
}

export function useLoyalty() {
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user/loyalty', {
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoyaltyStatus(data.loyalty_status);
      }
    } catch (error) {
      console.error('Error fetching loyalty status:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async (rewardId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user/redeem-points', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reward_id: rewardId })
      });

      if (response.ok) {
        await fetchLoyaltyStatus(); // Refresh loyalty status
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      return { success: false, error: 'Failed to redeem points' };
    }
  };

  useEffect(() => {
    fetchLoyaltyStatus();
  }, []);

  return {
    loyaltyStatus,
    loading,
    redeemPoints,
    refreshStatus: fetchLoyaltyStatus
  };
}
