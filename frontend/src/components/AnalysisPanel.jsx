import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Clock,
  Eye,
  TrendingUp,
  BookOpen,
  Hash,
  Zap,
  Target,
  ChevronUp,
} from "lucide-react";
import BrainIcon from "./BrainIcon";

const AnalysisPanel = ({ analysis, isVisible, onClose }) => {
  if (!analysis || !isVisible) return null;

  const { statistics, readability, keywords, sentiment, topics } = analysis;

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400";
      case "negative":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😟";
      default:
        return "😐";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-slate-800 border border-slate-600 rounded-xl p-6 space-y-6 shadow-xl"
        >
          {}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900/90 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-400/20 rounded-lg">
                <BrainIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Document Analysis
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <span>Close</span>
              <ChevronUp className="w-4 h-4" />
            </motion.button>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm font-medium text-white">
                  Statistics
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-white font-medium">
                  {statistics?.word_count?.toLocaleString()} words
                </div>
                <div className="text-slate-300">
                  {statistics?.sentence_count} sentences
                </div>
                <div className="text-slate-400">
                  {statistics?.paragraph_count} paragraphs
                </div>
              </div>
            </div>

            {}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm font-medium text-white">
                  Reading Time
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-white font-medium">
                  {statistics?.reading_time_minutes} min
                </div>
                <div className="text-slate-300">
                  {statistics?.average_words_per_sentence} avg words
                </div>
              </div>
            </div>

            {}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-sm font-medium text-white">
                  Readability
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-white font-medium">
                  {readability?.reading_level}
                </div>
                <div className="text-slate-300">
                  Score: {readability?.flesch_reading_ease}
                </div>
              </div>
            </div>

            {}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span className="text-sm font-medium text-white">
                  Sentiment
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-white font-medium flex items-center gap-2">
                  <span className={getSentimentColor(sentiment?.sentiment)}>
                    {sentiment?.sentiment?.charAt(0).toUpperCase() +
                      sentiment?.sentiment?.slice(1)}
                  </span>
                  <span>{getSentimentEmoji(sentiment?.sentiment)}</span>
                </div>
                <div className="text-slate-300">
                  {Math.round(sentiment?.confidence * 100)}% confidence
                </div>
              </div>
            </div>
          </div>

          {}
          {keywords && keywords.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                Top Keywords
              </label>
              <div className="flex flex-wrap gap-2">
                {keywords.slice(0, 8).map((keyword, index) => (
                  <motion.span
                    key={keyword.word}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg text-sm transition-colors"
                  >
                    {keyword.word} ({keyword.frequency})
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {}
          {topics && topics.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                Main Topics
              </label>
              <div className="space-y-2">
                {topics.slice(0, 5).map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                  >
                    <span className="text-white text-sm font-medium flex-1">
                      {topic.topic}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.relevance_percentage}%` }}
                          transition={{
                            delay: 0.3 + index * 0.1,
                            duration: 0.3,
                          }}
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                        />
                      </div>
                      <span className="text-rose-400 text-sm font-medium min-w-[35px] text-right">
                        {topic.relevance_percentage}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisPanel;
