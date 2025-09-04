import { useEffect, useRef, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';

export default function MapPage() {
  const { isDark } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('scrollbar-dark');
    } else {
      document.body.classList.remove('scrollbar-dark');
    }
    return () => {
      document.body.classList.remove('scrollbar-dark');
    };
  }, [isDark]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleMouseDown = () => setIsGrabbing(true);
    const handleMouseUp = () => setIsGrabbing(false);
    const handleMouseLeave = () => setIsGrabbing(false);
    iframe.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    iframe.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      iframe.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      iframe.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <MainLayout fullHeight>
      <div className="fixed inset-0 top-[64px] md:top-[72px] z-0" style={{height: 'calc(100vh - 64px)'}}>
        <iframe
          ref={iframeRef}
          src="https://bluecolored.de/bluemap/#overworld:-807:0:417:667:0.36:0.67:0:0:perspective"
          className="w-full h-full border-0"
          style={{
            cursor: isGrabbing ? 'grabbing' : 'grab',
            background: isDark ? '#181818' : '#F8F8F8',
            transition: 'cursor 0.1s',
            zIndex: 1
          }}
          allow="fullscreen"
          title="Carte interactive du monde"
        />
      </div>
    </MainLayout>
  );
} 