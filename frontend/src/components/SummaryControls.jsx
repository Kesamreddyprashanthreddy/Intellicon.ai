import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  List,
  Briefcase,
  HelpCircle,
  Target,
  ChevronDown,
  Sparkles,
  Clock,
  Download,
  Save,
  Settings,
  X,
} from "lucide-react";

const SummaryControls = ({
  onGenerateSummary,
  onAnalyze,
  onExport,
  onSave,
  isLoading,
  hasText,
  currentSummary,
}) => {
  const [summaryType, setSummaryType] = useState("standard");
  const [summaryLength, setSummaryLength] = useState("medium");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const summaryTypes = [
    {
      id: "standard",
      label: "Standard",
      description: "Balanced summary with key points",
      icon: FileText,
    },
    {
      id: "bullet",
      label: "Bullet Points",
      description: "Concise bullet-point format",
      icon: List,
    },
    {
      id: "executive",
      label: "Executive",
      description: "Brief executive summary",
      icon: Briefcase,
    },
    {
      id: "detailed",
      label: "Detailed",
      description: "Comprehensive analysis",
      icon: HelpCircle,
    },
  ];

  const summaryLengths = [
    { id: "short", label: "Short", description: "2-3 sentences" },
    { id: "medium", label: "Medium", description: "1-2 paragraphs" },
    { id: "long", label: "Long", description: "Detailed overview" },
  ];

  const handleGenerateSummary = () => {
    onGenerateSummary(summaryType, summaryLength);
  };

  const handleExport = (format) => {
    onExport(format, currentSummary);
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-white/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-4 backdrop-blur-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-100/80 dark:bg-blue-900/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick Actions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
          {/* Fast Summary Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGenerateSummary("fast", summaryLength)}
            disabled={!hasText || isLoading}
            className="relative group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-700/50 rounded-full backdrop-blur-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            <Clock className="w-3.5 h-3.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Fast</span>
          </motion.button>

          {/* AI Summary Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateSummary}
            disabled={!hasText || isLoading}
            className="relative group flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 hover:from-blue-700 hover:via-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            <Sparkles className="w-3.5 h-3.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">
              {isLoading ? "Processing..." : "AI Summary"}
            </span>
          </motion.button>

          {/* Analyze Button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAnalyze}
            disabled={!hasText || isLoading}
            className="relative group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/20 border border-indigo-200/80 dark:border-indigo-700/50 rounded-full backdrop-blur-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
            <Target className="w-3.5 h-3.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10">Analyze</span>
          </motion.button>
        </div>
      </div>

      {/* More Options Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`relative group flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
            showAdvanced
              ? "bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-500 hover:from-teal-700 hover:via-teal-700 hover:to-cyan-600 text-white"
              : "text-slate-700 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 backdrop-blur-lg hover:shadow-slate-500/10"
          }`}
        >
          {showAdvanced ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-600 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          )}
          <Settings className="w-3.5 h-3.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative z-10">More Options</span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <ChevronDown className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
          </motion.div>
        </motion.button>
      </div>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-slate-800 border border-slate-600 rounded-xl p-6 space-y-6 shadow-xl"
          >
            {/* Summary Style */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Summary Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {summaryTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSummaryType(type.id)}
                      className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                        summaryType === type.id
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {type.label}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Summary Length */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Summary Length
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {summaryLengths.map((length) => (
                  <motion.button
                    key={length.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSummaryLength(length.id)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                      summaryLength === length.id
                        ? "bg-green-600/20 border-green-500 text-green-300"
                        : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <div className="font-medium text-sm">{length.label}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {length.description}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Generate with Custom Options Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateSummary}
                disabled={!hasText || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 hover:from-blue-700 hover:via-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isLoading ? "Generating..." : "Generate Custom Summary"}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport("pdf")}
                disabled={!currentSummary}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500 rounded-lg text-red-300 text-sm hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport("docx")}
                disabled={!currentSummary}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-300 text-sm hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                DOCX
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                disabled={!currentSummary}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500 rounded-lg text-purple-300 text-sm hover:bg-purple-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SummaryControls;
