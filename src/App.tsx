import HeroSection from './components/HeroSection';
import ArchitectureSection from './components/ArchitectureSection';
import DemoTransition from './components/DemoTransition';
import SailDemoClient from './components/SailDemoClient';
import CodecPlayground from './components/CodecPlayground';
import ErrorReference from './components/ErrorReference';
import VerificationSection from './components/VerificationSection';
import CodeViewer from './components/CodeViewer';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 font-mono">
      <HeroSection />
      <ArchitectureSection />
      <DemoTransition />
      <SailDemoClient />
      <CodecPlayground />
      <ErrorReference />
      <VerificationSection />
      <CodeViewer />
      <Footer />
    </div>
  );
}
