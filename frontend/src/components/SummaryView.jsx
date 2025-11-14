import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Sparkles,
  Copy,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
  Brain,
  Target,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function SummaryView({ extractedText, summary, analysis }) {
  console.log("SummaryView received analysis prop:", analysis);
  console.log("Analysis basic_statistics:", analysis?.basic_statistics);
  console.log("Analysis word_count:", analysis?.basic_statistics?.word_count);

  const [copied, setCopied] = React.useState({ text: false, summary: false });

  function downloadSummary() {
    const blob = new Blob([summary || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  }

  function downloadExtractedText() {
    const blob = new Blob([extractedText || ""], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Text downloaded!");
  }

  function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true });
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-0">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          {/* Extracted Text Panel */}
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 sm:p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-gray-100">
                        Extracted Text
                      </h3>
                    </div>
                  </div>

                  {extractedText && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => copyToClipboard(extractedText, "text")}
                        className="p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                        title="Copy text"
                      >
                        {copied.text ? (
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={downloadExtractedText}
                        className="p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                        title="Download text"
                      >
                        <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                {extractedText ? (
                  <div className="text-xs sm:text-sm leading-6 text-slate-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 sm:max-h-80 overflow-auto">
                    {extractedText}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No document uploaded
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Upload a PDF or image to extract text
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* AI Summary Panel */}
          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-4"
          >
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-750">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 sm:p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-gray-100">
                        AI Summary
                      </h3>
                    </div>
                  </div>

                  {summary && (
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => copyToClipboard(summary, "summary")}
                        className="p-1 sm:p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                        title="Copy summary"
                      >
                        {copied.summary ? (
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 dark:text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={downloadSummary}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                {summary ? (
                  <div className="text-xs sm:text-sm leading-6 text-slate-700 dark:text-gray-300 whitespace-pre-wrap max-h-80 sm:max-h-96 overflow-auto">
                    {/* Clean text formatting without excessive styling */}
                    {summary.split("\n\n").map((paragraph, index) => (
                      <div
                        key={index}
                        className={index > 0 ? "mt-4" : ""}
                      >
                        {paragraph.split("\n").map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className={lineIndex > 0 ? "mt-2" : ""}
                          >
                            {line.trim().startsWith("•") ||
                            line.trim().startsWith("-") ||
                            line.trim().startsWith("*") ? (
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400 mt-1">•</span>
                                <span>{line.trim().substring(1).trim()}</span>
                              </div>
                            ) : line.trim().match(/^\d+\./) ? (
                              <div className="flex items-start gap-2">
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {line.trim().match(/^\d+\./)[0]}
                                </span>
                                <span>
                                  {line
                                    .trim()
                                    .replace(/^\d+\./, "")
                                    .trim()}
                                </span>
                              </div>
                            ) : (
                              <div>{line}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No summary generated yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Generate a summary to see AI insights
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Section - Full Width Below Main Grid */}
        <AnimatePresence>
          {analysis && summary && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full relative z-0"
            >
              <div className="bg-white/70 dark:bg-slate-800/70 border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-6 backdrop-blur-lg shadow-sm relative z-0 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Document Analytics
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        AI-powered insights by Intellicon
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <FileText className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        WORDS
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.basic_statistics?.word_count?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {analysis.basic_statistics?.average_word_length || 0} avg
                      length
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        READ TIME
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {analysis.readability?.reading_time_minutes || 0}min
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Average speed
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Eye className="w-3 sm:w-4 h-3 sm:h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        READABILITY
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {Math.round(
                        analysis.readability?.flesch_reading_ease || 0
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {analysis.readability?.readability_level}
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Target className="w-3 sm:w-4 h-3 sm:h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        QUALITY
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {Math.round(analysis.quality_metrics?.quality_score || 0)}
                      %
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {analysis.quality_metrics?.quality_level}
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Keywords */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-500" />
                      Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {analysis.content_analysis?.keywords
                        ?.slice(0, 6)
                        .map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-full font-medium truncate max-w-[120px] sm:max-w-none"
                          >
                            {keyword}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Content Tone
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize ${
                          analysis.content_analysis?.sentiment?.polarity ===
                          "positive"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : analysis.content_analysis?.sentiment?.polarity ===
                              "negative"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                        }`}
                      >
                        {analysis.content_analysis?.sentiment?.polarity ||
                          "Neutral"}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {Math.round(
                          (analysis.content_analysis?.sentiment?.confidence ||
                            0) * 100
                        )}
                        % confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 block truncate">
                        Vocabulary Richness
                      </span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analysis.content_analysis?.vocabulary_richness || 0}%
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 block truncate">
                        Information Density
                      </span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {analysis.content_analysis?.information_density || 0}%
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 block truncate">
                        Document Structure
                      </span>
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {analysis.document_structure?.organization || "N/A"}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-gray-500 dark:text-gray-400 block truncate">
                        Grade Level
                      </span>
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {analysis.readability?.grade_level || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
