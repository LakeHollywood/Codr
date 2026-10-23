import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check } from 'lucide-react';

const rustCode = `//! S.A.I.L. Codec Module - Version 1
//! Canonical serialization establishment for byte identity (not authority).

use std::fmt;

/// Opaque canonical artifact representation.
/// Immutable from outside the codec module; bytes can be read but not mutated.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CanonicalArtifact {
    bytes: Vec<u8>,
}

impl CanonicalArtifact {
    /// Internal constructor restricted to successful codec routines.
    pub(crate) fn new(bytes: Vec<u8>) -> Self {
        Self { bytes }
    }

    /// Exposes an immutable view of the underlying canonical bytes.
    pub fn as_bytes(&self) -> &[u8] {
        &self.bytes
    }
}

/// Strict error categories for the decoding and encoding boundary.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CodecError {
    Truncated,
    InvalidLength,
    InvalidDiscriminant,
    NonCanonicalEncoding,
    TrailingBytes,
}

impl std::error::Error for CodecError {}

impl fmt::Display for CodecError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CodecError::Truncated => write!(f, "Input slice is truncated"),
            CodecError::InvalidLength => write!(f, "Declared or actual length is invalid"),
            CodecError::InvalidDiscriminant => write!(f, "Unknown or unsupported discriminant tag"),
            CodecError::NonCanonicalEncoding => write!(f, "Encoding violates canonical rules"),
            CodecError::TrailingBytes => write!(f, "Unexpected trailing bytes remain after parsing"),
        }
    }
}

/// Trait implemented by structures capable of deterministic canonical encoding.
pub trait CanonicalEncode {
    fn encode_canonical(&self) -> Result<CanonicalArtifact, CodecError>;
}

/// Trait implemented by structures capable of strict canonical decoding.
pub trait CanonicalDecode: Sized {
    fn decode_canonical(input: &[u8]) -> Result<Self, CodecError>;
}

/// Tagged Predecessor structure eliminating zero-byte ambiguity.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum TaggedPredecessor {
    Genesis,
    Digest([u8; 32]),
}

impl CanonicalEncode for TaggedPredecessor {
    fn encode_canonical(&self) -> Result<CanonicalArtifact, CodecError> {
        let mut bytes = Vec::new();
        match self {
            TaggedPredecessor::Genesis => {
                bytes.push(0x00);
            }
            TaggedPredecessor::Digest(digest) => {
                bytes.push(0x01);
                bytes.extend_from_slice(digest);
            }
        }
        Ok(CanonicalArtifact::new(bytes))
    }
}

impl CanonicalDecode for TaggedPredecessor {
    fn decode_canonical(input: &[u8]) -> Result<Self, CodecError> {
        if input.is_empty() {
            return Err(CodecError::Truncated);
        }

        let discriminant = input[0];
        let rest = &input[1..];

        let result = match discriminant {
            0x00 => {
                if !rest.is_empty() {
                    return Err(CodecError::TrailingBytes);
                }
                TaggedPredecessor::Genesis
            }
            0x01 => {
                if rest.len() < 32 {
                    return Err(CodecError::Truncated);
                }
                if rest.len() > 32 {
                    return Err(CodecError::TrailingBytes);
                }
                let mut digest = [0u8; 32];
                digest.copy_from_slice(&rest[..32]);
                TaggedPredecessor::Digest(digest)
            }
            _ => return Err(CodecError::InvalidDiscriminant),
        };

        Ok(result)
    }
}

// ─────────────────────────────────────────────────────────────
// Verification Layer
// ─────────────────────────────────────────────────────────────

/// Monotonic hardware time witness for replay protection.
#[derive(Clone, Debug)]
pub struct MonotonicTimeWitness {
    hardware_counter: u64,
    epoch_ns: u64,
    source: AttestationSource,
}

/// Cryptographically bound verification result.
#[derive(Clone, Debug)]
pub struct VerifiedEvidence {
    artifact_hash: [u8; 32],
    policy_version: PolicyId,
    time_bound: TimeRange,
    attestation: AttestationToken,
}

/// Error variants at the constitutional ABI boundary.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CAbiBoundaryError {
    PolicyViolation,
    TimeRegression,
    ArtifactMismatch,
    AttestationFailure,
    StaleWitness,
}

/// Evaluates raw canonical state evidence against active constitutional
/// policy and monotonic hardware time context prior to actuation execution.
pub trait CAbiBoundaryVerifier {
    fn verify_actuation(
        &self,
        artifact: &CanonicalArtifact,
        time_witness: &MonotonicTimeWitness,
    ) -> Result<VerifiedEvidence, CAbiBoundaryError>;
}`;

function highlightRust(code: string): string {
  return code
    // Comments
    .replace(/(\/\/!.*$|\/\/\/.*$|\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
    // Strings
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-emerald-300">$1</span>')
    // Keywords
    .replace(/\b(pub|crate|use|struct|enum|impl|fn|let|mut|match|self|Self|if|else|return|for|in|where|trait|type|as|const|static|ref|move|async|await)\b/g, '<span class="text-purple-400 font-medium">$1</span>')
    // Types
    .replace(/\b(Vec|Result|Option|Box|Arc|Rc|str|u8|u16|u32|u64|u128|i8|i16|i32|i64|i128|usize|isize|bool|f32|f64|String)\b/g, '<span class="text-cyan-300">$1</span>')
    // Derive macros
    .replace(/(#\[[^\]]*\])/g, '<span class="text-yellow-300">$1</span>')
    // Numbers
    .replace(/\b(0x[0-9a-fA-F]+|\d+)\b/g, '<span class="text-orange-300">$1</span>')
    // Function calls
    .replace(/(\w+)(\()/g, '<span class="text-blue-300">$1</span>$2');
}

export default function CodeViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rustCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = rustCode.split('\n');

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
            <Code2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider">Source Code</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Module Implementation
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            The complete S.A.I.L. Codec Module source — canonical serialization for byte identity establishment.
          </p>
        </motion.div>

        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-gray-500">codec.rs</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Code content */}
          <div className="overflow-x-auto">
            <div className="flex min-w-0">
              {/* Line numbers */}
              <div className="flex-shrink-0 py-4 px-3 text-right select-none border-r border-gray-800/50">
                {lines.map((_, i) => (
                  <div key={i} className="text-xs text-gray-700 leading-5 h-5">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Code */}
              <pre className="flex-1 py-4 px-4 overflow-x-auto">
                <code
                  className="text-xs leading-5"
                  dangerouslySetInnerHTML={{ __html: highlightRust(rustCode) }}
                />
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
