import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const errors = [
  {
    name: 'Truncated',
    description: 'Input slice is truncated',
    detail: 'The input byte slice ended before all required data could be read. For example, a Digest variant requires exactly 32 bytes after the discriminant tag.',
    trigger: 'decode_canonical(&[0x01, 0xa1, 0xb2]) // Only 2 bytes of digest',
  },
  {
    name: 'InvalidLength',
    description: 'Declared or actual length is invalid',
    detail: 'A length prefix or field size does not match the expected or available data. This catches structural mismatches early in the parsing pipeline.',
    trigger: 'Length-prefixed field declares 100 bytes but only 50 remain',
  },
  {
    name: 'InvalidDiscriminant',
    description: 'Unknown or unsupported discriminant tag',
    detail: 'The first byte (discriminant) does not correspond to any known variant. Only 0x00 (Genesis) and 0x01 (Digest) are valid for TaggedPredecessor.',
    trigger: 'decode_canonical(&[0x02]) // Unknown tag',
  },
  {
    name: 'NonCanonicalEncoding',
    description: 'Encoding violates canonical rules',
    detail: 'The input represents a valid value but was not produced by the canonical encoder. This prevents malleability attacks and ensures byte-level identity.',
    trigger: 'Padding bytes, redundant length encodings, etc.',
  },
  {
    name: 'TrailingBytes',
    description: 'Unexpected trailing bytes remain after parsing',
    detail: 'After successfully parsing the expected structure, additional bytes remain unconsumed. Canonical decoding requires exact consumption of the input.',
    trigger: 'decode_canonical(&[0x00, 0xff]) // Extra byte after Genesis',
  },
];

const cardColors = [
  { border: 'border-amber-500/20', bg: 'bg-amber-500/5', text: 'text-amber-300', dot: 'bg-amber-400' },
  { border: 'border-orange-500/20', bg: 'bg-orange-500/5', text: 'text-orange-300', dot: 'bg-orange-400' },
  { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-red-300', dot: 'bg-red-400' },
  { border: 'border-pink-500/20', bg: 'bg-pink-500/5', text: 'text-pink-300', dot: 'bg-pink-400' },
  { border: 'border-rose-500/20', bg: 'bg-rose-500/5', text: 'text-rose-300', dot: 'bg-rose-400' },
];

export default function ErrorReference() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Error Taxonomy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Strict Error Categories
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Every failure at the codec boundary is classified into one of five distinct error variants, enabling precise error handling and debugging.
          </p>
        </motion.div>

        {/* Error cards */}
        <div className="space-y-4">
          {errors.map((error, i) => {
            const colors = cardColors[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`p-5 rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full ${colors.dot} mt-2 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-base font-semibold ${colors.text}`}>
                        CodecError::{error.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{error.description}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{error.detail}</p>
                    <div className="px-3 py-2 rounded bg-gray-950/50 border border-gray-800/50">
                      <code className="text-xs text-gray-400">{error.trigger}</code>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
