import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Eye, Lock, Fingerprint } from 'lucide-react';

// --- Simulated types ---

type MonotonicTimeWitness = {
  hardware_counter: number;
  epoch_ns: number;
  source: string;
};

type VerifiedEvidence = {
  artifact_hash: string;
  policy_version: string;
  time_bound: { lower: number; upper: number };
  attestation: string;
};

type CAbiBoundaryError =
  | 'PolicyViolation'
  | 'TimeRegression'
  | 'ArtifactMismatch'
  | 'AttestationFailure'
  | 'StaleWitness';

const errorMessages: Record<CAbiBoundaryError, string> = {
  PolicyViolation: 'Artifact violates active constitutional policy constraints',
  TimeRegression: 'Monotonic time witness indicates clock regression — possible replay',
  ArtifactMismatch: 'Artifact hash does not match expected canonical identity',
  AttestationFailure: 'Hardware attestation could not be validated',
  StaleWitness: 'Time witness exceeds maximum allowed age for verification',
};

const errorColors: Record<CAbiBoundaryError, string> = {
  PolicyViolation: 'text-red-400',
  TimeRegression: 'text-amber-400',
  ArtifactMismatch: 'text-orange-400',
  AttestationFailure: 'text-pink-400',
  StaleWitness: 'text-rose-400',
};

// --- Verification simulation ---

function simulateVerification(
  artifactHex: string,
  policyVersion: string,
  timeCounter: number,
  epochNs: number
): { ok: true; evidence: VerifiedEvidence } | { ok: false; error: CAbiBoundaryError } {
  // Check for empty artifact
  if (!artifactHex || artifactHex.trim() === '') {
    return { ok: false, error: 'ArtifactMismatch' };
  }

  // Check for time regression (counter must be > 0 and monotonically increasing)
  if (timeCounter <= 0) {
    return { ok: false, error: 'TimeRegression' };
  }

  // Check for stale witness (epoch too old — simulate with threshold)
  const MAX_AGE_NS = 5_000_000_000; // 5 seconds
  if (epochNs > MAX_AGE_NS) {
    return { ok: false, error: 'StaleWitness' };
  }

  // Check policy version
  const validPolicies = ['v1.0', 'v1.1', 'v2.0', 'v2.1'];
  if (!validPolicies.includes(policyVersion)) {
    return { ok: false, error: 'PolicyViolation' };
  }

  // Simulate attestation failure for specific patterns
  if (artifactHex.includes('dead') || artifactHex.includes('beef')) {
    return { ok: false, error: 'AttestationFailure' };
  }

  // Success
  return {
    ok: true,
    evidence: {
      artifact_hash: artifactHex.substring(0, 16) + '...',
      policy_version: policyVersion,
      time_bound: { lower: timeCounter - 1, upper: timeCounter + 1 },
      attestation: `hw-attest:${timeCounter.toString(16).padStart(8, '0')}`,
    },
  };
}

export default function VerificationSection() {
  const [artifactHex, setArtifactHex] = useState('01a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0');
  const [policyVersion, setPolicyVersion] = useState('v2.0');
  const [timeCounter, setTimeCounter] = useState(1042);
  const [epochNs, setEpochNs] = useState(500_000);
  const [result, setResult] = useState<{ ok: true; evidence: VerifiedEvidence } | { ok: false; error: CAbiBoundaryError } | null>(null);
  const [showCode, setShowCode] = useState(false);

  const handleVerify = () => {
    const r = simulateVerification(artifactHex, policyVersion, timeCounter, epochNs);
    setResult(r);
  };

  const handleScenario = (scenario: string) => {
    switch (scenario) {
      case 'success':
        setArtifactHex('01a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0');
        setPolicyVersion('v2.0');
        setTimeCounter(1042);
        setEpochNs(500_000);
        break;
      case 'policy_violation':
        setArtifactHex('01a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0');
        setPolicyVersion('v0.9');
        setTimeCounter(1042);
        setEpochNs(500_000);
        break;
      case 'time_regression':
        setArtifactHex('01a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0');
        setPolicyVersion('v2.0');
        setTimeCounter(0);
        setEpochNs(500_000);
        break;
      case 'stale_witness':
        setArtifactHex('01a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0');
        setPolicyVersion('v2.0');
        setTimeCounter(1042);
        setEpochNs(9_000_000_000);
        break;
      case 'attestation_failure':
        setArtifactHex('deadbeef01020304050607080910111213141516171819202122232425262728');
        setPolicyVersion('v2.0');
        setTimeCounter(1042);
        setEpochNs(500_000);
        break;
    }
    setResult(null);
  };

  return (
    <section className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 mb-4">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-indigo-300 uppercase tracking-wider">Verification Layer</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            CAbiBoundaryVerifier
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Evaluates raw canonical state evidence against active constitutional policy
            and monotonic hardware time context prior to actuation execution.
          </p>
        </motion.div>

        {/* Trait signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/10 bg-indigo-500/5">
              <span className="text-xs text-indigo-300 font-medium">trait CAbiBoundaryVerifier</span>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCode ? 'Collapse' : 'Expand'}
              </button>
            </div>
            <div className="p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>
                  <span className="text-purple-400">pub trait</span>{' '}
                  <span className="text-cyan-300">CAbiBoundaryVerifier</span>{' {\n'}
                  <span className="text-gray-500">    /// Evaluates raw canonical state evidence against active</span>{'\n'}
                  <span className="text-gray-500">    /// constitutional policy and monotonic hardware time context</span>{'\n'}
                  <span className="text-gray-500">    /// prior to actuation execution.</span>{'\n'}
                  {'    '}<span className="text-purple-400">fn</span>{' '}
                  <span className="text-blue-300">verify_actuation</span>
                  <span className="text-gray-400">(</span>{'\n'}
                  {'        '}<span className="text-orange-300">&amp;self</span>,{'\n'}
                  {'        '}<span className="text-gray-400">artifact: </span>
                  <span className="text-orange-300">&amp;CanonicalArtifact</span>,{'\n'}
                  {'        '}<span className="text-gray-400">time_witness: </span>
                  <span className="text-orange-300">&amp;MonotonicTimeWitness</span>{'\n'}
                  {'    '}<span className="text-gray-400">) → </span>
                  <span className="text-cyan-300">Result</span>
                  <span className="text-gray-400">{'<'}</span>
                  <span className="text-cyan-300">VerifiedEvidence</span>,{' '}
                  <span className="text-cyan-300">CAbiBoundaryError</span>
                  <span className="text-gray-400">{'>'}</span>;{'\n'}
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Related types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {[
            {
              icon: Clock,
              name: 'MonotonicTimeWitness',
              desc: 'Hardware-backed monotonic time source. Guarantees non-decreasing counter values for replay protection.',
              fields: ['hardware_counter: u64', 'epoch_ns: u64', 'source: AttestationSource'],
              color: 'amber',
            },
            {
              icon: Fingerprint,
              name: 'VerifiedEvidence',
              desc: 'Cryptographically bound proof that an artifact was validated against current policy within a time window.',
              fields: ['artifact_hash: [u8; 32]', 'policy_version: PolicyId', 'time_bound: TimeRange', 'attestation: AttestationToken'],
              color: 'emerald',
            },
            {
              icon: AlertTriangle,
              name: 'CAbiBoundaryError',
              desc: 'Five distinct failure modes at the constitutional ABI boundary — each maps to a specific security invariant.',
              fields: ['PolicyViolation', 'TimeRegression', 'ArtifactMismatch', 'AttestationFailure', 'StaleWitness'],
              color: 'red',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className={`p-5 rounded-xl border ${
                item.color === 'amber' ? 'border-amber-500/20 bg-amber-500/5' :
                item.color === 'emerald' ? 'border-emerald-500/20 bg-emerald-500/5' :
                'border-red-500/20 bg-red-500/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <item.icon className={`w-4 h-4 ${
                  item.color === 'amber' ? 'text-amber-400' :
                  item.color === 'emerald' ? 'text-emerald-400' :
                  'text-red-400'
                }`} />
                <h3 className={`text-sm font-semibold ${
                  item.color === 'amber' ? 'text-amber-300' :
                  item.color === 'emerald' ? 'text-emerald-300' :
                  'text-red-300'
                }`}>
                  {item.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.desc}</p>
              <div className="space-y-1">
                {item.fields.map((field, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs">
                    <ArrowRight className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" />
                    <code className="text-gray-400">{field}</code>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive verification demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-300 font-medium">Verification Playground</span>
            </div>
            <div className="flex gap-2">
              {[
                { label: '✓ Success', id: 'success' },
                { label: '⚠ Policy', id: 'policy_violation' },
                { label: '⏱ Regression', id: 'time_regression' },
                { label: '⌛ Stale', id: 'stale_witness' },
                { label: '✗ Attest', id: 'attestation_failure' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleScenario(s.id)}
                  className="px-2 py-1 rounded text-xs bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  CanonicalArtifact (hex)
                </label>
                <input
                  type="text"
                  value={artifactHex}
                  onChange={(e) => setArtifactHex(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                  placeholder="01a1b2c3..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Policy Version
                </label>
                <select
                  value={policyVersion}
                  onChange={(e) => setPolicyVersion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                >
                  <option value="v0.9">v0.9 (deprecated)</option>
                  <option value="v1.0">v1.0</option>
                  <option value="v1.1">v1.1</option>
                  <option value="v2.0">v2.0 (active)</option>
                  <option value="v2.1">v2.1 (active)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Hardware Counter (monotonic)
                </label>
                <input
                  type="number"
                  value={timeCounter}
                  onChange={(e) => setTimeCounter(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Epoch Age (ns) — must be {'< 5×10⁹'}
                </label>
                <input
                  type="number"
                  value={epochNs}
                  onChange={(e) => setEpochNs(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                verify_actuation(artifact, time_witness)
              </span>
            </button>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  {result.ok ? (
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-300 font-medium">
                          Ok(VerifiedEvidence)
                        </span>
                      </div>
                      <div className="p-3 rounded bg-gray-950 border border-gray-800 font-mono text-xs space-y-1">
                        <div>
                          <span className="text-gray-500">artifact_hash: </span>
                          <span className="text-emerald-300">{result.evidence.artifact_hash}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">policy_version: </span>
                          <span className="text-blue-300">"{result.evidence.policy_version}"</span>
                        </div>
                        <div>
                          <span className="text-gray-500">time_bound: </span>
                          <span className="text-amber-300">
                            [{result.evidence.time_bound.lower}, {result.evidence.time_bound.upper}]
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">attestation: </span>
                          <span className="text-purple-300">{result.evidence.attestation}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className={`text-sm font-medium ${errorColors[result.error]}`}>
                          Err(CAbiBoundaryError::{result.error})
                        </span>
                      </div>
                      <p className="text-xs text-red-400/70 mt-1">
                        {errorMessages[result.error]}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Verification flow diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 p-6 rounded-xl border border-gray-800 bg-gray-900/50"
        >
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-6 text-center">
            Verification Pipeline
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {[
              { label: 'CanonicalArtifact', style: 'bg-gray-800 border-gray-700 text-gray-300' },
              { label: '+', style: 'text-gray-600' },
              { label: 'MonotonicTimeWitness', style: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
              { label: '→', style: 'text-gray-600' },
              { label: 'verify_actuation()', style: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' },
              { label: '→', style: 'text-gray-600' },
              { label: 'Policy Check', style: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
              { label: '→', style: 'text-gray-600' },
              { label: 'Time Validation', style: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' },
              { label: '→', style: 'text-gray-600' },
              { label: 'Attestation', style: 'bg-pink-500/10 border-pink-500/20 text-pink-300' },
              { label: '→', style: 'text-gray-600' },
              { label: 'VerifiedEvidence', style: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
            ].map((step, i) => (
              <span
                key={i}
                className={
                  step.style.includes('bg-')
                    ? `px-2.5 py-1.5 rounded border ${step.style}`
                    : step.style
                }
              >
                {step.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
