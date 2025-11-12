import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="text-green-400 w-5 h-5" />,
    error: <XCircle className="text-red-400 w-5 h-5" />,
    warning: <AlertTriangle className="text-yellow-400 w-5 h-5" />,
    info: <Info className="text-blue-400 w-5 h-5" />,
  };

  const bgColors = {
    success: "bg-green-950/90 border-green-500/40",
    error: "bg-red-950/90 border-red-500/40",
    warning: "bg-yellow-950/90 border-yellow-500/40",
    info: "bg-blue-950/90 border-blue-500/40",
  };

  return (
    <AnimatePresence>
      <motion.div
        key={toast.message}
        initial={{ opacity: 0, x: 80, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeIn" }}
        className={`fixed top-20 right-3 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${bgColors[toast.type] || "bg-gray-800/90 border-gray-600/40"} backdrop-blur-md`}
      >
        <div className="flex items-center justify-center rounded-full bg-white/5 p-2">
          {icons[toast.type] || icons.info}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-100 font-semibold capitalize tracking-wide">
            {toast.title || toast.type}
          </span>
          <span className="text-gray-300 text-sm">{toast.message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
