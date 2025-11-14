import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FileText,
  Clock,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

export default function Stats({ extractedText, summary }) {
  const textStats = {
    originalWords: extractedText
      ? extractedText.split(/\s+/).filter((word) => word.length > 0).length
      : 0,
    originalChars: extractedText ? extractedText.length : 0,
    summaryWords: summary
      ? summary.split(/\s+/).filter((word) => word.length > 0).length
      : 0,
    summaryChars: summary ? summary.length : 0,
  };

  const compressionRatio =
    textStats.originalWords > 0
      ? (
          ((textStats.originalWords - textStats.summaryWords) /
            textStats.originalWords) *
          100
        ).toFixed(1)
      : 0;

  const readingTime = Math.ceil(textStats.originalWords / 200);
  const summaryTime = Math.ceil(textStats.summaryWords / 200);

  const statCards = [
    {
      icon: FileText,
      label: "Original Words",
      value: textStats.originalWords.toLocaleString(),
      color: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      icon: Target,
      label: "Summary Words",
      value: textStats.summaryWords.toLocaleString(),
      color: "from-blue-600 to-indigo-600",
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      label: "Compression",
      value: `${compressionRatio}%`,
      color: "from-emerald-500 to-teal-500",
      delay: 0.3,
    },
    {
      icon: Clock,
      label: "Time Saved",
      value: `${Math.max(0, readingTime - summaryTime)} min`,
      color: "from-orange-500 to-red-500",
      delay: 0.4,
    },
  ];

  return (
    <div className="space-y-6">
      {}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-md bg-white/30 dark:bg-slate-800/40 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-slate-700/50"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-100">
            <span className="hidden sm:inline">Document Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: stat.delay }}
              className="group"
            >
              <div className="backdrop-blur-sm bg-white/50 dark:bg-slate-700/50 rounded-lg lg:rounded-xl p-3 sm:p-4 border border-white/20 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-all duration-300">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0`}
                  >
                    <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-slate-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {}
      {extractedText && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-md bg-white/30 dark:bg-slate-800/40 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-slate-700/50"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3 sm:mb-4 flex items-center">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="hidden sm:inline">Reading Time Analysis</span>
            <span className="sm:hidden">Reading Time</span>
          </h4>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                <span className="hidden sm:inline">Original Document</span>
                <span className="sm:hidden">Original</span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200">
                {readingTime} min
              </span>
            </div>

            {summary && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                  Summary
                </span>
                <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                  {summaryTime} min
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Time Saved
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.max(0, readingTime - summaryTime)} min
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {}
      {summary && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-md bg-white/30 dark:bg-slate-800/40 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-slate-700/50"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3 sm:mb-4 flex items-center">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-yellow-500 flex-shrink-0" />
            <span className="hidden sm:inline">Quality Metrics</span>
            <span className="sm:hidden">Quality</span>
          </h4>

          <div className="space-y-3 sm:space-y-4">
            {}
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                <span className="hidden sm:inline">Compression Ratio</span>
                <span className="sm:hidden">Compression</span>
                <span>{compressionRatio}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${compressionRatio}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="text-center p-2 sm:p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Efficiency
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 dark:text-blue-400">
                  {compressionRatio > 70
                    ? "High"
                    : compressionRatio > 40
                    ? "Medium"
                    : "Low"}
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Clarity
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {textStats.summaryWords > 50
                    ? "High"
                    : textStats.summaryWords > 20
                    ? "Medium"
                    : "Low"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
