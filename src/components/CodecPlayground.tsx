import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, ArrowRight, CheckCircle2, XCircle, Copy, Check, RefreshCw } from 'lucide-react';

type TaggedPredecessor =
  | { type: 'Genesis' }
  | { type: 'Digest'; bytes: number[] };

type CodecError =
  | 'Truncated'
  | 'InvalidLength'
  | 'InvalidDiscriminant'
  | 'NonCanonicalEncoding'
  | 'TrailingBytes';

const errorMessages: Record<CodecError, string> = {
  Truncated: 'Input slice is truncated',
  InvalidLength: 'Declared or actual length is invalid',
  InvalidDiscriminant: 'Unknown or unsupported discriminant tag',
  NonCanonicalEncoding: 'Encoding violates canonical rules',
  TrailingBytes: 'Unexpected trailing bytes remain after parsing',
};

function encode(value: TaggedPredecessor): number[] {
  if (value.type === 'Genesis') {
    return [0x00];
  } else {
    return [0x01, ...value.bytes];
  }
}

function decode(input: number[]): { ok: true; value: TaggedPredecessor } | { ok: false; error: CodecError } {
  if (input.length === 0) {
    return { ok: false, error: 'Truncated' };
  }

  const discriminant = input[0];
  const rest = input.slice(1);

  if (discriminant === 0x00) {
    if (rest.length > 0) {
      return { ok: false, error: 'TrailingBytes' };
    }
    return { ok: true, value: { type: 'Genesis' } };
  } else if (discriminant === 0x01) {
    if (rest.length < 32) {
      return { ok: false, error: 'Truncated' };
    }
    if (rest.length > 32) {
      return { ok: false, error: 'TrailingBytes' };
    }
    return { ok: true, value: { type: 'Digest', bytes: rest } };
  } else {
    return { ok: false, error: 'InvalidDiscriminant' };
  }
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): number[] | null {
  const clean = hex.replace(/\s/g, '');
  if (clean.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]*$/.test(clean)) return null;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.substring(i, i + 2), 16));
  }
  return bytes;
}

function generateRandomDigest(): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < 32; i++) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return bytes;
}

export default function CodecPlayground() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'genesis' | 'digest'>('genesis');
  const [digestHex, setDigestHex] = useState('');
  const [decodeHex, setDecodeHex] = useState('');
  const [encodeResult, setEncodeResult] = useState<number[] | null>(null);
  const [decodeResult, setDecodeResult] = useState<{ ok: true; value: TaggedPredecessor } | { ok: false; error: CodecError } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEncode = useCallback(() => {
    if (encodeType === 'genesis') {
      const result = encode({ type: 'Genesis' });
      setEncodeResult(result);
    } else {
      const bytes = hexToBytes(digestHex);
      if (!bytes) return;
      if (bytes.length !== 32) return;
      const result = encode({ type: 'Digest', bytes });
      setEncodeResult(result);
    }
  }, [encodeType, digestHex]);

  const handleDecode = useCallback(() => {
    const bytes = hexToBytes(decodeHex);
    if (!bytes) {
      setDecodeResult({ ok: false, error: 'InvalidLength' });
      return;
    }
    const result = decode(bytes);
    setDecodeResult(result);
  }, [decodeHex]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleRandomDigest = () => {
    const bytes = generateRandomDigest();
    setDigestHex(bytesToHex(bytes));
  };

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-700 bg-gray-800/50 mb-4">
            <Binary className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Interactive Demo</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Codec Playground
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Experiment with the TaggedPredecessor encoding and decoding. See how canonical bytes are constructed and validated in real-time.
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex rounded-lg border border-gray-700 bg-gray-900/50 p-1">
            <button
              onClick={() => setMode('encode')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'encode'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                mode === 'decode'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Decode
            </button>
          </div>
        </motion.div>

        {/* Playground card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {mode === 'encode' ? (
              <motion.div
                key="encode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Encode TaggedPredecessor</h3>
                
                {/* Variant selector */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setEncodeType('genesis')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      encodeType === 'genesis'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    Genesis (0x00)
                  </button>
                  <button
                    onClick={() => setEncodeType('digest')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      encodeType === 'digest'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    Digest (0x01)
                  </button>
                </div>

                {/* Digest input */}
                {encodeType === 'digest' && (
                  <div className="mb-6">
                    <label className="block text-xs text-gray-500 mb-2">
                      32-byte digest (hex, 64 characters):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={digestHex}
                        onChange={(e) => setDigestHex(e.target.value)}
                        placeholder="e.g., a1b2c3d4e5f6..."
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                      <button
                        onClick={handleRandomDigest}
                        className="px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
                        title="Generate random 32-byte digest"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    {digestHex && hexToBytes(digestHex) && hexToBytes(digestHex)!.length !== 32 && (
                      <p className="text-xs text-amber-400 mt-2">
                        Expected 32 bytes (64 hex chars), got {hexToBytes(digestHex)!.length} bytes
                      </p>
                    )}
                  </div>
                )}

                {/* Encode button */}
                <button
                  onClick={handleEncode}
                  disabled={encodeType === 'digest' && (!digestHex || !hexToBytes(digestHex) || hexToBytes(digestHex)!.length !== 32)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:from-cyan-500/30 hover:to-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Encode Canonical →
                </button>

                {/* Result */}
                <AnimatePresence>
                  {encodeResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Output Bytes</span>
                        <button
                          onClick={() => handleCopy(bytesToHex(encodeResult))}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-950 border border-gray-800">
                        <code className="text-sm text-emerald-300 break-all">
                          {bytesToHex(encodeResult)}
                        </code>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {encodeResult.map((byte, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                              i === 0
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {byte.toString(16).padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {encodeResult.length} byte{encodeResult.length !== 1 ? 's' : ''} total
                        {encodeType === 'digest' && ' (1 tag + 32 digest)'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="decode"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Decode Byte Slice</h3>
                
                <div className="mb-6">
                  <label className="block text-xs text-gray-500 mb-2">
                    Input bytes (hex):
                  </label>
                  <input
                    type="text"
                    value={decodeHex}
                    onChange={(e) => setDecodeHex(e.target.value)}
                    placeholder="e.g., 00 or 01a1b2c3d4..."
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500/50 font-mono"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setDecodeHex('00')}
                      className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Try: Genesis (00)
                    </button>
                    <button
                      onClick={() => setDecodeHex('01' + bytesToHex(generateRandomDigest()))}
                      className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Try: Random Digest
                    </button>
                    <button
                      onClick={() => setDecodeHex('02')}
                      className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Try: Invalid (02)
                    </button>
                    <button
                      onClick={() => setDecodeHex('00ff')}
                      className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Try: Trailing
                    </button>
                  </div>
                </div>

                {/* Decode button */}
                <button
                  onClick={handleDecode}
                  disabled={!decodeHex}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Decode Canonical
                </button>

                {/* Result */}
                <AnimatePresence>
                  {decodeResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      {decodeResult.ok ? (
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">Decoded Successfully</span>
                          </div>
                          <div className="mt-2 p-3 rounded bg-gray-950 border border-gray-800">
                            <pre className="text-sm text-gray-300">
                              {decodeResult.value.type === 'Genesis' ? (
                                <span className="text-emerald-300">TaggedPredecessor::Genesis</span>
                              ) : (
                                <>
                                  <span className="text-blue-300">TaggedPredecessor::Digest</span>
                                  <span className="text-gray-500">{'(['}</span>
                                  <span className="text-purple-300 break-all">{bytesToHex(decodeResult.value.bytes)}</span>
                                  <span className="text-gray-500">{'])'}</span>
                                </>
                              )}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-300 font-medium">CodecError::{decodeResult.error}</span>
                          </div>
                          <p className="text-sm text-red-400/70 mt-1">
                            {errorMessages[decodeResult.error]}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
