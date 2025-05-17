'use client'

import { motion } from 'framer-motion'
import ServiceForm from '@/components/ServiceForm'

export default function CreateClient() {
  return (
    <>
      <section className="bg-purple-50 py-16 px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-8 py-12 max-w-6xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-900 leading-tight">
            Create Your Service
          </h1>
          <p className="text-lg mt-4 text-purple-700 max-w-2xl mx-auto font-medium">
            Share your expertise and connect with clients
          </p>
        </motion.div>
      </section>

      <section className="bg-white py-12 px-4 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-8 py-12 max-w-6xl mx-auto"
        >
          <ServiceForm />
        </motion.div>
      </section>
    </>
  )
}
