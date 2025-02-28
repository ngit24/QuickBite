import { useState, useEffect } from 'react';
import { FaWallet, FaMoneyBillWave, FaHistory, FaTicketAlt, FaShoppingCart } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user', {
        headers: {
          Authorization: token || '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.wallet_balance);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/wallet/transactions', {
        headers: {
          Authorization: token || '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!voucherCode) {
      toast.error('Please enter a voucher code');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');  // Get user email from localStorage

      if (!userEmail) {
        toast.error('User not authenticated');
        return;
      }

      const response = await fetch('https://localhost969.pythonanywhere.com/wallet/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ 
          voucher_code: voucherCode,
          user_email: userEmail  // Add user email to request body
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Voucher redeemed successfully!');
        setVoucherCode('');
        fetchWalletData();
        fetchTransactions();
      } else {
        toast.error(data.message || 'Failed to redeem voucher');
      }
    } catch (error) {
      toast.error('Error redeeming voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    switch (type) {
      case 'WELCOME_BONUS':
      case 'COUPON':
        return 'text-green-600';
      case 'REFUND':
        return 'text-blue-600';
      case 'ORDER':
        return amount < 0 ? 'text-red-600' : 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'WELCOME_BONUS':
        return <FaWallet className="w-6 h-6 text-green-600" />;
      case 'COUPON':
        return <FaTicketAlt className="w-6 h-6 text-green-600" />;
      case 'REFUND':
        return <FaMoneyBillWave className="w-6 h-6 text-blue-600" />;
      case 'ORDER':
        return <FaShoppingCart className="w-6 h-6 text-red-600" />;
      default:
        return <FaHistory className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTransactionBackground = (type: string) => {
    switch (type) {
      case 'WELCOME_BONUS':
        return 'bg-green-50';
      case 'COUPON':
        return 'bg-green-50';
      case 'REFUND':
        return 'bg-blue-50';
      case 'ORDER':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Wallet Balance Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary-100 rounded-full">
                <FaWallet className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Wallet Balance</h2>
                <p className="text-3xl font-bold text-primary-600">₹{balance.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          {/* Voucher Redemption */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Redeem Voucher</h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <button
                onClick={handleRedeemVoucher}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((transaction: any, index: number) => (
                  <motion.div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${getTransactionBackground(transaction.type)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full bg-white`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                          {transaction.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                      {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
