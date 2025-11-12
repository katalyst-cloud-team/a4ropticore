"use client";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const getPageTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return 'A4R OptiCoreAI Dashboard';
    case '/search':
      return 'Resource Events';
    case '/storagesearch':
      return 'Storage Events';
    case '/report':
      return 'Data Report';
    case '/help':
      return 'Help Section';
    case '/about':
      return 'About';
    default:
      return 'Dashboard';
  }
};

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const Header = () => {
  const location = useLocation();
  const currentPageTitle = getPageTitle(location.pathname);

  const [currentDateTime, setCurrentDateTime] = useState(() => formatDateTime(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const fullText = "A4R OptiCoreAI Dashboard";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setDisplayText("");
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isModalOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 md:h-[4.25rem]"
        style={{
          background: 'linear-gradient(90deg, rgb(9, 29, 59) 0%, rgb(0, 116, 224) 100%)',
        }}
      >
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          {/* Left: Logo + Page Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center rounded-full border-2 border-transparent hover:border-white/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Open dashboard info"
            >
              <img
                src={logo}
                alt="A4R OptiCoreAI Logo"
                className="w-8 h-8 md:w-9 md:h-9 object-contain"
              />
            </button>

            <h1 className="text-base md:text-lg font-bold text-white truncate max-w-[180px] md:max-w-none">
              {currentPageTitle}
            </h1>
          </div>

          {/* Right: Date & Time */}
          <div className="text-right">
            <p className="text-blue-100 text-xs md:text-sm font-medium tracking-wide leading-tight">
              {currentDateTime}
            </p>
          </div>
        </div>
      </header>

      {/* Modal */}
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
              className="relative bg-white rounded-2xl p-6 md:p-8 max-w-md w-full flex flex-col items-center shadow-xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <img
                  src={logo}
                  alt="A4R OptiCoreAI Logo"
                  className="h-28 md:h-32 w-auto object-contain"
                />
              </div>

              <motion.h2
                key={displayText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-lg md:text-xl font-bold text-blue-700 text-center tracking-wide mb-3 px-2"
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