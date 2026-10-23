import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-gray-800/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="mb-6">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
              S.A.I.L.
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            Canonical serialization establishment for byte identity.
            Strict boundary enforcement at the codec layer.
          </p>

          {/* Module info */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-lg font-semibold text-cyan-300">v1</div>
              <div className="text-xs text-gray-600">Version</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-300">5</div>
              <div className="text-xs text-gray-600">Error Variants</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-300">2</div>
              <div className="text-xs text-gray-600">Core Traits</div>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-300">2</div>
              <div className="text-xs text-gray-600">Enum Variants</div>
            </div>
          </div>

          {/* Design principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
            {[
              { title: 'Deterministic', desc: 'Same input always produces identical bytes' },
              { title: 'Strict', desc: 'Non-canonical forms are rejected at decode' },
              { title: 'Opaque', desc: 'Artifacts are immutable outside the module' },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <div className="text-sm font-medium text-gray-300 mb-1">{item.title}</div>
                <div className="text-xs text-gray-600">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-700">
            S.A.I.L. Codec Module — Canonical Serialization Engine
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
