import HeroSection from './components/HeroSection';
import ArchitectureSection from './components/ArchitectureSection';
import CodecPlayground from './components/CodecPlayground';
import ErrorReference from './components/ErrorReference';
import CodeViewer from './components/CodeViewer';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-mono">
      <HeroSection />
      <ArchitectureSection />
      <CodecPlayground />
      <ErrorReference />
      <CodeViewer />
      <Footer />
    </div>
  );
}
