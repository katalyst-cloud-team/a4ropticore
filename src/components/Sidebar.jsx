"use client";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  Home,
  Boxes,
  HardDrive,
  FileChartPie,
  HelpCircle,
  Info,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import logo from "../assets/logo.png";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "machines", icon: Boxes, label: "Resource Events", path: "/search" },
    { id: "storage", icon: HardDrive, label: "Storage Events", path: "/storagesearch" },
    { id: "report", icon: FileChartPie, label: "Report", path: "/report" },
    { id: "help", icon: HelpCircle, label: "Help", path: "/help" },
    { id: "about", icon: Info, label: "About", path: "/about" },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const fullText = "A4R OpticoreAI DashBoard";

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setDisplayText("");
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) setDisplayText(fullText.slice(0, i++));
      else clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [isModalOpen]);

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const itemRectsRef = useRef([]);

  const y = useMotionValue(0);
  const left = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  const [tooltip, setTooltip] = useState(null);
  const [displayIndex, setDisplayIndex] = useState(() => {
    const i = navItems.findIndex((n) => n.path === location.pathname);
    return i === -1 ? 0 : i;
  });

  const [passingIndex, setPassingIndex] = useState(displayIndex);
  const [currentIndex, setCurrentIndex] = useState(displayIndex);

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const rects = navItems.map((_, idx) => {
      const el = itemRefs.current[idx];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        top: r.top - cRect.top,
        left: r.left - cRect.left,
        width: r.width,
        height: r.height,
      };
    });
    itemRectsRef.current = rects;
  };

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      measure();
      const idx = navItems.findIndex((n) => n.path === location.pathname);
      const safeIdx = idx === -1 ? 0 : idx;
      const rect = itemRectsRef.current[safeIdx];
      if (rect) {
        y.set(rect.top);
        left.set(rect.left);
        width.set(rect.width);
        height.set(rect.height);
      }
      setDisplayIndex(safeIdx);
      setCurrentIndex(safeIdx);

      const ro = new ResizeObserver(measure);
      if (containerRef.current) ro.observe(containerRef.current);
      itemRefs.current.forEach((el) => el && ro.observe(el));
      return () => ro.disconnect();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const idx = navItems.findIndex((n) => n.path === location.pathname);
    if (idx !== -1 && idx !== currentIndex) moveToIndex(idx);
  }, [location.pathname]);

  const moveToIndex = (targetIndex) => {
    measure();
    const rects = itemRectsRef.current;
    const targetRect = rects[targetIndex];
    if (!targetRect) return;

    const duration = 0.35;
    const transition = {
      type: "spring",
      stiffness: 600,
      damping: 38,
      duration,
    };

    animate(y, targetRect.top, { ...transition });
    animate(left, targetRect.left, { ...transition });
    animate(width, targetRect.width, { ...transition });
    animate(height, targetRect.height, { ...transition });

    setCurrentIndex(targetIndex);
    setDisplayIndex(targetIndex);
  };

  const handleClick = (idx, path) => {
    if (idx !== currentIndex) moveToIndex(idx);
    navigate(path);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {!isMobile && (
        <aside className="fixed left-0 top-10 bottom-0 z-40 w-16 bg-gradient-to-b from-slate-900 to-blue-700 select-none">
          <nav ref={containerRef} className="flex flex-col items-center py-5 space-y-6 relative">
            <motion.div
              style={{ top: y, left: left, width, height }}
              className="absolute bg-blue-500 rounded-lg z-10 pointer-events-none shadow-lg"
            />
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = displayIndex === idx;
              return (
                <div key={item.id} className="relative">
                  <button
                    ref={(el) => (itemRefs.current[idx] = el)}
                    onClick={() => handleClick(idx, item.path)}
                    onMouseEnter={() => setTooltip(item.label)}
                    onMouseLeave={() => setTooltip(null)}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                      }`}
                    aria-label={item.label}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur rounded-lg border border-white/20"></div>
                    )}
                    <Icon className="w-6 h-6 relative z-20" />
                  </button>

                  {tooltip === item.label && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-medium py-1.5 px-2.5 rounded-md whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>
      )}

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-slate-700 bg-gradient-to-t from-slate-900 to-slate-800">
          <div ref={containerRef} className="flex items-center justify-around h-full px-2 relative">
            <motion.div
              style={{ left, width, bottom: 0, height: 4 }}
              className="absolute bg-blue-500 rounded-t-lg z-10 pointer-events-none"
            />
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = displayIndex === idx;
              return (
                <button
                  key={item.id}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  onClick={() => handleClick(idx, item.path)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors ${isActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  aria-label={item.label}
                >
                  {isActive && <div className="h-0.5 w-8 bg-blue-400 rounded-full mb-1"></div>}
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5 flex justify-center">
                <img src={logo} alt="Logo" className="h-28 md:h-32 object-contain" />
              </div>

              <motion.h2
                key={displayText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl md:text-2xl font-bold text-blue-700 text-center tracking-wide mb-3"
                style={{ fontFamily: "'Noto Sans Mono', monospace" }}
              >
                {displayText}
              </motion.h2>

              <p className="text-center text-gray-600 text-sm px-2">
                Advanced analytics for real-time insights and decision intelligence.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};