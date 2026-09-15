import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './CipherScreen.css';

const visited = new Set();
const CYBER_GLYPHS = '0123456789ABCDEFXYZ$#&%<>*+=~_';

export const CipherScreen = ({ children }) => {
  const root = useRef(null);
  const { pathname } = useLocation();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const key = `labx:screen-reveal:${pathname}`;
    let seen = visited.has(key);
    try {
      seen ||= sessionStorage.getItem(key) === '1';
    } catch {
      /* storage fallback */
    }

    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animId = null;
    let started = false;
    const trackedElements = [];

    const restore = () => {
      trackedElements.forEach(({ element, originalText }) => {
        if (element && element.isConnected) {
          element.textContent = originalText;
          element.classList.remove('cipher-active');
        }
      });
      setIsScanning(false);
    };

    const begin = () => {
      if (started || !root.current) return;

      // Find top-level page headings (exclude buttons, sidebar, floating widgets, inputs)
      const candidateNodes = root.current.querySelectorAll('h1, h2, .labx-navbar h1, .dashboard-title, .page-title');
      if (!candidateNodes.length) return;

      const validEntries = [];
      candidateNodes.forEach((node) => {
        // Only target pure text headings or headings without interactive children
        if (
          !node.closest('.labx-sidebar') &&
          !node.closest('.floating-xp') &&
          !node.closest('button') &&
          !node.closest('a') &&
          node.children.length <= 1
        ) {
          const raw = node.textContent.trim();
          if (raw.length > 1 && raw.length < 100) {
            validEntries.push({
              element: node,
              originalText: raw,
              length: raw.length,
            });
            node.classList.add('cipher-active');
          }
        }
      });

      if (!validEntries.length) return;

      started = true;
      observer.disconnect();
      trackedElements.push(...validEntries);
      setIsScanning(true);

      const startTime = performance.now();
      const DURATION = 950; // Smooth, relaxed 950ms decrypt
      let lastGlyphUpdate = 0;

      const runFrame = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / DURATION);
        
        // Smooth ease-in-out curve for natural pacing
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Update glyphs on ~36ms cadence for smooth, pleasant cyber flicker
        if (now - lastGlyphUpdate > 36 || progress >= 1) {
          lastGlyphUpdate = now;

          validEntries.forEach(({ element, originalText, length }) => {
            if (!element.isConnected) return;
            const resolvedCount = Math.floor(ease * length);

            const decoded = [...originalText]
              .map((char, i) => {
                if (i < resolvedCount || /\s/.test(char)) {
                  return char;
                }
                return CYBER_GLYPHS[Math.floor(Math.random() * CYBER_GLYPHS.length)];
              })
              .join('');

            element.textContent = decoded;
          });
        }

        if (progress < 1) {
          animId = requestAnimationFrame(runFrame);
        } else {
          restore();
          visited.add(key);
          try {
            sessionStorage.setItem(key, '1');
          } catch {}
        }
      };

      animId = requestAnimationFrame(runFrame);
    };

    const observer = new MutationObserver(begin);
    observer.observe(root.current, { childList: true, subtree: true });
    begin();

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      restore();
    };
  }, [pathname]);

  return (
    <div ref={root} className="cipher-screen-container">
      {isScanning && <div className="cipher-laser-sweep" aria-hidden="true" />}
      {children}
    </div>
  );
};
