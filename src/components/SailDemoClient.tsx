import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Play,
  Square,
  Activity,
  Link2,
  Shield,
  Clock,
  Hash,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Database,
  ArrowDown,
  RotateCw,
  Cpu,
  Eye,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────

type Predecessor =
  | { kind: 'Genesis' }
  | { kind: 'Digest'; hash: string };

type Block = {
  index: number;
  predecessor: Predecessor;
  payload: string;
  timestamp: number;
  hash: string;
  verified: boolean;
};

type LogEntry = {
  id: number;
  timestamp: number;
  phase: 'encode' | 'verify' | 'commit' | 'error' | 'info';
  message: string;
  detail?: string;
};

type SystemState = 'idle' | 'encoding' | 'verifying' | 'committing' | 'error';

// ─── Helpers ─────────────────────────────────────────────────────

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    h = ((h << 5) - h + char) | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex).substring(0, 64);
}

function encodeBlock(index: number, predecessor: Predecessor, payload: string, timestamp: number): string {
  const predBytes = predecessor.kind === 'Genesis'
    ? '00'
    : '01' + (predecessor as { kind: 'Digest'; hash: string }).hash;
  const payloadHex = Array.from(payload).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  const indexHex = index.toString(16).padStart(8, '0');
  const tsHex = timestamp.toString(16).padStart(16, '0');
  const raw = indexHex + predBytes + tsHex + payloadHex;
  return simpleHash(raw);
}

const samplePayloads = [
  'STATE_TRANSITION:validator_set_update',
  'CONSENSUS:round_commit(epoch=42)',
  'GOVERNANCE:parameter_change(max_block_size=4096)',
  'STATE_TRANSITION:balance_transfer(from=A,to=B,amt=100)',
  'CONSENSUS:finality_proof(round=43)',
  'GOVERNANCE:emergency_halt(reason=anomaly_detected)',
  'STATE_TRANSITION:contract_deploy(id=0x7f3a)',
  'CONSENSUS:notarization(slot=1024)',
];

// ─── Main Component ──────────────────────────────────────────────

export default function SailDemoClient() {
  const [chain, setChain] = useState<Block[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [systemState, setSystemState] = useState<SystemState>('idle');
  const [hwCounter, setHwCounter] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const logEndRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((phase: LogEntry['phase'], message: string, detail?: string) => {
    logIdRef.current += 1;
    setLog(prev => [...prev.slice(-80), {
      id: logIdRef.current,
      timestamp: Date.now(),
      phase,
      message,
      detail,
    }]);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  const submitBlock = useCallback(async (payload: string) => {
    if (systemState !== 'idle') return;

    const index = chain.length;
    const predecessor: Predecessor = index === 0
      ? { kind: 'Genesis' }
      : { kind: 'Digest', hash: chain[chain.length - 1].hash };
    const timestamp = Date.now();

    // Phase 1: Encode
    setSystemState('encoding');
    setCurrentPhase('encode_canonical()');
    addLog('info', `▸ Preparing block #${index}`);
    await delay(300);
    const predDisplay = predecessor.kind === 'Genesis' ? '0x00' : `0x01..${predecessor.hash.slice(0, 8)}`;
    addLog('encode', `CanonicalArtifact::new(${predDisplay})`);
    await delay(400);
    const hash = encodeBlock(index, predecessor, payload, timestamp);
    addLog('encode', `→ artifact_hash: ${hash.slice(0, 16)}...`, `${hash}`);
    await delay(300);

    // Phase 2: Verify
    setSystemState('verifying');
    setCurrentPhase('verify_actuation()');
    addLog('verify', `MonotonicTimeWitness { counter: ${hwCounter}, epoch: ${timestamp} }`);
    await delay(400);
    addLog('verify', `Policy check: version=v2.0 ✓`);
    await delay(200);
    addLog('verify', `Time bound: [${hwCounter - 1}, ${hwCounter + 1}] ✓`);
    await delay(200);
    addLog('verify', `Attestation: hw-attest:${hwCounter.toString(16).padStart(8, '0')} ✓`);
    await delay(300);
    addLog('verify', `→ Ok(VerifiedEvidence)`);
    await delay(200);

    // Phase 3: Commit
    setSystemState('committing');
    setCurrentPhase('commit_state()');
    const block: Block = {
      index,
      predecessor,
      payload,
      timestamp,
      hash,
      verified: true,
    };
    await delay(400);
    setChain(prev => [...prev, block]);
    setHwCounter(prev => prev + 1);
    addLog('commit', `Block #${index} committed → chain_height=${index + 1}`);
    await delay(200);
    addLog('info', `✓ State transition complete`);

    setSystemState('idle');
    setCurrentPhase('');
  }, [chain, hwCounter, systemState, addLog]);

  const startAutoRun = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopAutoRun = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && systemState === 'idle') {
      const payload = samplePayloads[Math.floor(Math.random() * samplePayloads.length)];
      submitBlock(payload);
    }
  }, [isRunning, systemState, submitBlock]);

  const resetSystem = useCallback(() => {
    stopAutoRun();
    setChain([]);
    setLog([]);
    setSystemState('idle');
    setHwCounter(1000);
    setCurrentPhase('');
    addLog('info', 'System reset — chain cleared');
  }, [stopAutoRun, addLog]);

  // Initialize with genesis log
  useEffect(() => {
    addLog('info', 'S.A.I.L. Demo Client initialized');
    addLog('info', 'Codec module: v1 | Policy: v2.0');
    addLog('info', 'Awaiting first state transition...');
  }, []);

  return (
    <section className="py-16 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Terminal-style header */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden mb-6">
            <div className="flex items-center px-4 py-2 border-b border-gray-800 bg-gray-900/50">
              <div className="flex gap-1.5 mr-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-gray-500 font-mono">sail-demo-client — bash</span>
              <div className={`ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                systemState === 'idle'
                  ? 'bg-gray-800 text-gray-400 border border-gray-700'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  systemState === 'idle' ? 'bg-gray-500' : 'bg-emerald-400 animate-pulse'
                }`} />
                {systemState === 'idle' ? 'idle' : currentPhase}
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-100">
                  sail-demo-client
                </h2>
                <span className="text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-800 border border-gray-700">v0.1.0</span>
              </div>
              <p className="text-gray-500 text-sm">
                Interactive state machine — encode → verify → commit pipeline demonstration.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Control bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-gray-800 bg-gray-900/60"
        >
          {chain.length === 0 ? (
            <button
              onClick={() => submitBlock('GENESIS:initial_state_bootstrap')}
              disabled={systemState !== 'idle'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 text-sm hover:from-amber-500/20 hover:to-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5" />
              Initialize Genesis
            </button>
          ) : (
            <button
              onClick={() => {
                const payload = samplePayloads[Math.floor(Math.random() * samplePayloads.length)];
                submitBlock(payload);
              }}
              disabled={systemState !== 'idle'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5" />
              Submit Block
            </button>
          )}

          {chain.length > 0 && (
            <>
              {isRunning ? (
                <button
                  onClick={stopAutoRun}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/20 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  Stop Auto
                </button>
              ) : (
                <button
                  onClick={startAutoRun}
                  disabled={systemState !== 'idle'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Auto-Run
                </button>
              )}
            </>
          )}

          <button
            onClick={resetSystem}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-sm hover:text-gray-200 hover:border-gray-600 transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              Height: <span className="text-cyan-300 font-mono">{chain.length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Counter: <span className="text-amber-300 font-mono">{hwCounter}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Policy: <span className="text-purple-300 font-mono">v2.0</span>
            </span>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chain visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Chain</span>
              <span className="ml-auto text-xs text-gray-600">{chain.length} blocks</span>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {chain.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-sm">
                  <div className="mb-2 text-2xl">⛓️</div>
                  <div>No blocks yet.</div>
                  <div className="text-xs text-gray-700 mt-1">Initialize Genesis to begin</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {chain.map((block, i) => {
                    const isGenesis = i === 0;
                    const isLatest = i === chain.length - 1;
                    return (
                      <div key={block.hash}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-3 rounded-lg border transition-all ${
                            isGenesis
                              ? 'border-amber-500/30 bg-amber-500/5'
                              : isLatest
                              ? 'border-cyan-500/30 bg-cyan-500/5'
                              : 'border-gray-800 bg-gray-950/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-mono ${
                                isGenesis ? 'text-amber-300' : 'text-cyan-300'
                              }`}>
                                #{block.index}
                              </span>
                              {isGenesis && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  GENESIS
                                </span>
                              )}
                            </div>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate mb-1">
                            {block.hash.slice(0, 24)}...
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {block.payload}
                          </div>
                        </motion.div>
                        {i < chain.length - 1 && (
                          <div className="flex justify-center py-0.5">
                            <div className="w-px h-3 bg-gray-800" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Pipeline visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Pipeline</span>
            </div>
            <div className="p-4">
              <PipelineView state={systemState} />
            </div>
          </motion.div>

          {/* Event log */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Event Log</span>
              <span className="ml-auto text-xs text-gray-600">{log.length} entries</span>
            </div>
            <div className="p-2 max-h-[500px] overflow-y-auto font-mono text-xs">
              {log.map((entry) => (
                <div key={entry.id} className="px-2 py-1 hover:bg-gray-800/30 rounded">
                  <span className="text-gray-600 mr-2">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <span className={
                    entry.phase === 'encode' ? 'text-blue-300' :
                    entry.phase === 'verify' ? 'text-purple-300' :
                    entry.phase === 'commit' ? 'text-emerald-300' :
                    entry.phase === 'error' ? 'text-red-300' :
                    'text-gray-400'
                  }>
                    {entry.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </motion.div>
        </div>

        {/* Bottom: Block details */}
        {chain.length > 0 && (() => {
          const latest = chain[chain.length - 1];
          const predDisplay = latest.predecessor.kind === 'Genesis'
            ? 'Genesis (0x00)'
            : `Digest(${latest.predecessor.hash.slice(0, 16)}...)`;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">Latest Block Inspector</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-gray-600 mb-1">Index</div>
                  <div className="text-cyan-300">{latest.index}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Predecessor</div>
                  <div className="text-gray-300 truncate">{predDisplay}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Hash</div>
                  <div className="text-emerald-300 truncate">{latest.hash}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Payload</div>
                  <div className="text-amber-300 truncate">{latest.payload}</div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </section>
  );
}

// ─── Pipeline View Sub-component ─────────────────────────────────

function PipelineView({ state }: { state: SystemState }) {
  const phases = [
    { key: 'encoding', label: 'Encode', icon: Hash, color: 'blue' },
    { key: 'verifying', label: 'Verify', icon: Shield, color: 'purple' },
    { key: 'committing', label: 'Commit', icon: CheckCircle2, color: 'emerald' },
  ];

  const phaseIndex = phases.findIndex(p => p.key === state);

  return (
    <div className="space-y-4">
      {phases.map((phase, i) => {
        const isActive = phase.key === state;
        const isComplete = phaseIndex > i || state === 'idle';
        const isPending = phaseIndex < i && state !== 'idle';

        const colorClasses = {
          blue: {
            active: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
            complete: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
            pending: 'border-gray-800 bg-gray-950 text-gray-600',
            icon: 'text-blue-400',
          },
          purple: {
            active: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
            complete: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
            pending: 'border-gray-800 bg-gray-950 text-gray-600',
            icon: 'text-purple-400',
          },
          emerald: {
            active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
            complete: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
            pending: 'border-gray-800 bg-gray-950 text-gray-600',
            icon: 'text-emerald-400',
          },
        };

        const colors = colorClasses[phase.color as keyof typeof colorClasses];
        const stateClass = isActive ? colors.active : isComplete && state !== 'idle' ? colors.complete : isPending ? colors.pending : colors.pending;

        return (
          <div key={phase.key}>
            <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${stateClass}`}>
              <phase.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{phase.label}</span>
              <div className="ml-auto">
                {isActive && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </motion.div>
                )}
                {isComplete && state !== 'idle' && i <= phaseIndex && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
            </div>
            {i < phases.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronRight className="w-3 h-3 text-gray-700 rotate-90" />
              </div>
            )}
          </div>
        );
      })}

      {/* Status message */}
      <div className="mt-4 p-3 rounded-lg bg-gray-950 border border-gray-800">
        <div className="text-xs text-gray-500">
          {state === 'idle' && 'System idle — awaiting next state transition'}
          {state === 'encoding' && 'Constructing canonical byte representation...'}
          {state === 'verifying' && 'Evaluating against policy & time witness...'}
          {state === 'committing' && 'Committing verified state to chain...'}
        </div>
      </div>
    </div>
  );
}

// ─── Utility ─────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
