'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface AnimatedViewWrapperProps {
  viewKey: string
  children: React.ReactNode
}

export function AnimatedViewWrapper({ viewKey, children }: AnimatedViewWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
