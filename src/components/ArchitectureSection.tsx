import { motion } from 'framer-motion';
import { Layers, ArrowRight, Code2 } from 'lucide-react';

const architectureItems = [
  {
    title: 'CanonicalArtifact',
    description: 'Opaque canonical byte representation. Immutable from outside the codec module — bytes can be read but never mutated.',
    icon: '📦',
    details: ['Internal constructor (pub(crate))', 'as_bytes() → &[u8]', 'Clone + Debug + PartialEq + Eq'],
  },
  {
    title: 'CanonicalEncode',
    description: 'Trait implemented by structures capable of deterministic canonical encoding to byte sequences.',
    icon: '🔒',
    details: ['encode_canonical() → Result<CanonicalArtifact, CodecError>', 'Deterministic output', 'No ambiguity in representation'],
  },
  {
    title: 'CanonicalDecode',
    description: 'Trait implemented by structures capable of strict canonical decoding from byte slices.',
    icon: '🔓',
    details: ['decode_canonical(input: &[u8]) → Result<Self, CodecError>', 'Strict validation', 'Rejects non-canonical forms'],
  },
  {
    title: 'TaggedPredecessor',
    description: 'Tagged enum eliminating zero-byte ambiguity. Discriminants 0x00 (Genesis) and 0x01 (Digest) ensure unambiguous parsing.',
    icon: '🏷️',
    details: ['Genesis → [0x00]', 'Digest → [0x01, ...32 bytes]', 'Trailing byte rejection'],
  },
];

const cardStyles = [
  { border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', text: 'text-cyan-300', glow: 'hover:shadow-lg hover:shadow-cyan-500/10' },
  { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-300', glow: 'hover:shadow-lg hover:shadow-blue-500/10' },
  { border: 'border-purple-500/30', bg: 'bg-purple-500/5', text: 'text-purple-300', glow: 'hover:shadow-lg hover:shadow-purple-500/10' },
  { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-300', glow: 'hover:shadow-lg hover:shadow-emerald-500/10' },
];

export default function ArchitectureSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50 mb-4">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Module Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Type Hierarchy & Boundaries
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Four core abstractions enforce strict separation between encoding, decoding, and the opaque artifact layer.
          </p>
        </motion.div>

        {/* Architecture cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {architectureItems.map((item, i) => {
            const colors = cardStyles[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-6 rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm ${colors.glow} transition-shadow duration-300`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <div className="space-y-1.5">
                      {item.details.map((detail, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                          <code className="text-gray-400">{detail}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-6 rounded-xl border border-gray-800 bg-gray-900/50"
        >
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-6 text-center">Encoding Pipeline</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {['Struct', '→', 'encode_canonical()', '→', 'CanonicalArtifact', '→', 'as_bytes()', '→', '&[u8]'].map((step, i) => (
              <span
                key={i}
                className={
                  step === '→'
                    ? 'text-gray-600'
                    : step.includes('()')
                    ? 'px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300'
                    : step === '&[u8]'
                    ? 'px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-gray-300'
                }
              >
                {step}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
