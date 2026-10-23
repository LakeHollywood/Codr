import { motion } from 'framer-motion';
import { Shield, Binary, Lock } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-300 text-sm tracking-wider uppercase">
            Version 1 — Canonical Serialization Engine
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">
            S.A.I.L.
          </span>
          <br />
          <span className="text-gray-200 text-3xl md:text-5xl">Codec Module</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Deterministic canonical encoding for byte identity establishment.
          Strict boundary enforcement between serialization and deserialization layers.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Immutable Artifacts</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/20 bg-blue-500/5">
            <Binary className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Canonical Encoding</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/20 bg-purple-500/5">
            <Lock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Strict Decoding</span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
