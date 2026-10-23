import { motion } from 'framer-motion';
import { Terminal, ChevronRight } from 'lucide-react';

export default function DemoTransition() {
  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Terminal-style intro */}
          <div className="inline-block p-6 rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-gray-500">terminal</span>
            </div>
            <div className="text-left font-mono text-sm space-y-1">
              <div className="text-gray-500">
                <span className="text-emerald-400">$</span> git clone https://github.com/your-org/sail-demo-client.git
              </div>
              <div className="text-gray-500">
                <span className="text-gray-600">Cloning into 'sail-demo-client'...</span>
              </div>
              <div className="text-gray-500">
                <span className="text-emerald-400">$</span> cd sail-demo-client
              </div>
              <div className="text-gray-500">
                <span className="text-emerald-400">$</span> cargo run --release
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-emerald-400">$</span>
                <span className="text-gray-300">Starting S.A.I.L. demo client</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-emerald-400 ml-0.5"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Interactive demo below — try submitting blocks</span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
