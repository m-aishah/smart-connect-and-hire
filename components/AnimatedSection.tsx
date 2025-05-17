'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

type AnimatedSectionProps = {
  children: ReactNode
  delay?: number
}

export default function AnimatedSection({ children, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-8 py-12 max-w-6xl mx-auto text-center"
    >
      {children}
    </motion.div>
  )
}
