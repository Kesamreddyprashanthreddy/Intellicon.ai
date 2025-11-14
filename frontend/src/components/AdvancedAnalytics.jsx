import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  TrendingUp,
  Brain,
  Eye,
  Target,
  BookOpen,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  Users,
  Star,
  Award,
  Gauge,
  Globe,
  Hash,
  Type,
  AlertCircle,
  Info,
  Bookmark,
} from "lucide-react";

export default function AdvancedAnalytics({ analysis, onClose }) {
  if (!analysis) return null;

  const {
    basic_statistics,
    readability,
    content_analysis,
    document_structure,
    quality_metrics,
    linguistic_features,
  } = analysis;

  // Color coding for scores
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend,
  }) => (
    <motion.div
      variants={cardVariants}
      className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}
            >
              <Icon
                className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </div>
            {subtitle && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0
                ? "text-green-600 bg-green-50"
                : trend < 0
                ? "text-red-600 bg-red-50"
                : "text-gray-600 bg-gray-50"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );

  const ScoreCard = ({
    title,
    score,
    maxScore = 100,
    icon: Icon,
    description,
    level,
  }) => (
    <motion.div
      variants={cardVariants}
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getScoreColor(score)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {level && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {level}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {score}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/{maxScore}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / maxScore) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-2 rounded-full ${getScoreBadgeColor(score)}`}
        />
      </div>

      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Document Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive analysis powered by Intellicon AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 space-y-8"
        >
          {/* Quick Stats Overview */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Document Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Words"
                value={basic_statistics?.word_count?.toLocaleString() || 0}
                subtitle="Total word count"
                icon={FileText}
                color="blue"
              />
              <StatCard
                title="Reading Time"
                value={`${readability?.reading_time_minutes || 0}min`}
                subtitle="Average reading speed"
                icon={Clock}
                color="green"
              />
              <StatCard
                title="Sentences"
                value={basic_statistics?.sentence_count || 0}
                subtitle={`${
                  basic_statistics?.average_sentence_length || 0
                } words avg`}
                icon={Hash}
                color="purple"
              />
              <StatCard
                title="Paragraphs"
                value={basic_statistics?.paragraph_count || 0}
                subtitle={`${
                  basic_statistics?.average_paragraph_length || 0
                } sentences avg`}
                icon={Bookmark}
                color="orange"
              />
            </div>
          </section>

          {/* Readability & Quality Scores */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-500" />
              Readability & Quality Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScoreCard
                title="Readability Score"
                score={Math.round(readability?.flesch_reading_ease || 0)}
                icon={Eye}
                level={readability?.readability_level}
                description={`${
                  readability?.grade_level || "Unknown"
                } reading level`}
              />
              <ScoreCard
                title="Content Quality"
                score={Math.round(quality_metrics?.quality_score || 0)}
                icon={Star}
                level={quality_metrics?.quality_level}
                description="Overall content sophistication and structure"
              />
              <ScoreCard
                title="Document Structure"
                score={Math.round(document_structure?.structure_score || 0)}
                icon={Target}
                level={document_structure?.organization}
                description="Organization and formatting quality"
              />
            </div>
          </section>

          {/* Content Analysis */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-500" />
              Content Intelligence
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Keywords & Topics */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Key Topics & Keywords
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {content_analysis?.keywords
                      ?.slice(0, 8)
                      .map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Topic Diversity
                      </span>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Math.round(content_analysis?.topic_diversity || 0)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Vocabulary Richness
                      </span>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content_analysis?.vocabulary_richness || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sentiment Analysis */}
              <motion.div
                variants={cardVariants}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Sentiment Analysis
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Overall Tone
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        content_analysis?.sentiment?.polarity === "positive"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                          : content_analysis?.sentiment?.polarity === "negative"
                          ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
                      }`}
                    >
                      {content_analysis?.sentiment?.polarity || "Neutral"}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Confidence
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {Math.round(
                          (content_analysis?.sentiment?.confidence || 0) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            (content_analysis?.sentiment?.confidence || 0) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Positive Words
                      </span>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content_analysis?.sentiment?.positive_words || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Negative Words
                      </span>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {content_analysis?.sentiment?.negative_words || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Detailed Metrics */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              Linguistic Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Information Density"
                value={`${content_analysis?.information_density || 0}%`}
                subtitle="Unique content ratio"
                icon={Zap}
                color="yellow"
              />
              <StatCard
                title="Punctuation Density"
                value={`${linguistic_features?.punctuation_density || 0}%`}
                subtitle="Writing style indicator"
                icon={Type}
                color="indigo"
              />
              <StatCard
                title="Numeric Content"
                value={`${linguistic_features?.numeric_content_ratio || 0}%`}
                subtitle="Data and figures"
                icon={Hash}
                color="green"
              />
              <StatCard
                title="Question Ratio"
                value={`${linguistic_features?.question_ratio || 0}%`}
                subtitle="Interactive elements"
                icon={Users}
                color="red"
              />
            </div>
          </section>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
