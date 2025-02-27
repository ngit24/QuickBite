import { motion } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Server Error - QuickByte</title>
        <meta name="description" content="Server error occurred" />
      </Head>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="text-6xl text-red-500" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-800">Server Error</h1>
        <p className="text-gray-600 mt-2 mb-8 max-w-md">
          Sorry, something went wrong on our servers. We're working to fix the issue.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaHome />
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
