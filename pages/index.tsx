import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaUtensils, FaShieldAlt, FaClock, FaArrowRight } from 'react-icons/fa';

export default function Home() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: <FaUtensils className="w-6 h-6 text-primary-600" />,
      title: 'Fresh Food Daily',
      description: 'Enjoy freshly prepared meals made with quality ingredients every day.',
    },
    {
      icon: <FaShieldAlt className="w-6 h-6 text-primary-600" />,
      title: 'Secure Ordering',
      description: 'Order with confidence using our secure payment system.',
    },
    {
      icon: <FaClock className="w-6 h-6 text-primary-600" />,
      title: 'Quick Delivery',
      description: 'Get your food delivered to your classroom or pick it up from the canteen.',
    },
  ];

  const testimonials = [
    {
      quote: "QuickByte has transformed how I eat at college. No more waiting in long lines!",
      author: "Sarah J.",
      role: "Computer Science Student"
    },
    {
      quote: "The classroom delivery option is a game-changer during busy days.",
      author: "Michael T.",
      role: "Engineering Student"
    },
    {
      quote: "I love being able to pre-order my meals before classes start.",
      author: "Priya M.",
      role: "Business Major"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Head>
        <title>QuickByte - Quick and Easy Food Ordering</title>
        <meta name="description" content="Order food quickly and easily with QuickByte" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaUtensils className="text-primary-600 text-xl" />
            <span className="text-xl font-semibold text-gray-800">QuickByte</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">
              Testimonials
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Login
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Replace image with animated UI */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <FaUtensils className="text-primary-600 text-3xl" />
              <h1 className="text-3xl font-bold text-gray-800">QuickByte</h1>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Quick and Easy Food Ordering for Students
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Skip the lines, order ahead, and enjoy your meal without the wait.
            </p>
            <Link 
              href="/menu"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Order Now <FaArrowRight />
            </Link>
          </motion.div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -right-4 top-1/4 w-72 h-72 bg-primary-200 rounded-full opacity-20"
            animate={{
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute right-1/4 top-1/3 w-48 h-48 bg-primary-300 rounded-full opacity-20"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute right-1/3 bottom-1/4 w-64 h-64 bg-primary-400 rounded-full opacity-20"
            animate={{
              y: [0, 40, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Food Icons Animation */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <motion.div
              className="absolute top-1/4 right-1/4 text-4xl text-primary-600"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🍕
            </motion.div>
            <motion.div
              className="absolute top-1/2 right-1/3 text-4xl text-primary-600"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🍔
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 text-4xl text-primary-600"
              animate={{
                y: [0, 15, 0],
                rotate: [0, 15, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🍜
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-4xl font-bold text-primary-600 mb-2">500+</span>
              <p className="text-gray-600">Daily Orders</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-4xl font-bold text-primary-600 mb-2">15min</span>
              <p className="text-gray-600">Average Preparation Time</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center text-center p-6 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-4xl font-bold text-primary-600 mb-2">98%</span>
              <p className="text-gray-600">Satisfaction Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose QuickByte?
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We make campus dining convenient, fast, and enjoyable with these amazing features.
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg"
                variants={childVariants}
              >
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How QuickByte Works
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Order your favorite campus meals in just a few simple steps.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600 font-bold text-xl">1</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Browse Menu</h3>
              <p className="text-gray-600">Check out the daily menu with available food items and their details.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600 font-bold text-xl">2</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Place Order</h3>
              <p className="text-gray-600">Select your items, choose delivery or pickup, and place your order.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600 font-bold text-xl">3</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Enjoy Your Meal</h3>
              <p className="text-gray-600">Get notified when your food is ready and enjoy a delicious meal.</p>
            </motion.div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-3 rounded-lg bg-primary-600 text-white text-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Ordering Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              What Students Say
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Hear from students who use QuickByte every day.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-4 text-primary-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.95.41-3 .96-3.22 3.59-5.39 3.59-5.39l-1.58-.61c-2.09 1.86-3.5 3.62-4.23 5.27-.52 1.18-.82 2.35-.9 3.52.17.49.43.95.76 1.35.33.39.73.7 1.18.92.44.18.89.26 1.33.26.88 0 1.58-.26 2.12-.76.51-.5.77-1.14.77-1.93zm7.65 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.695-1.327-.825-.56-.13-1.08-.136-1.54-.028-.16-.95.1-1.95.41-3 .96-3.22 3.59-5.39 3.59-5.39l-1.58-.61c-2.09 1.86-3.5 3.62-4.23 5.27-.52 1.18-.82 2.35-.9 3.52.17.49.42.95.75 1.35.33.39.73.7 1.18.92.44.18.89.26 1.33.26.88 0 1.58-.26 2.12-.76.51-.5.77-1.14.77-1.93z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-800">{testimonial.author}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to transform your campus dining experience?
            </motion.h2>
            <motion.p 
              className="text-primary-100 text-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of students who are saving time and enjoying better meals with QuickByte.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link 
                href="/signup" 
                className="px-8 py-3 rounded-lg bg-white text-primary-600 text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Now
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary-500 rounded-full opacity-20"></div>
          <div className="absolute -left-10 top-1/2 w-48 h-48 bg-primary-500 rounded-full opacity-20"></div>
          <div className="absolute right-1/4 bottom-0 w-36 h-36 bg-primary-500 rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <FaUtensils className="text-primary-500 text-xl" />
                <span className="text-xl font-semibold text-white">QuickByte</span>
              </div>
              <p className="mb-6">
                Making campus dining fast, convenient, and delicious for students and faculty.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>123 Campus Drive, College Town, CT 12345</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:contact@quickbyte.com" className="hover:text-white transition-colors">contact@quickbyte.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href="tel:+1234567890" className="hover:text-white transition-colors">(123) 456-7890</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-6 text-center">
            <p>&copy; {new Date().getFullYear()} QuickByte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}