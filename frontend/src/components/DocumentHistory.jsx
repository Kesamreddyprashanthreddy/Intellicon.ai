import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  FileText,
  Clock,
  Eye,
  Trash2,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Sparkles,
} from "lucide-react";
import axios from "axios";

const DocumentHistory = ({
  isOpen,
  onClose,
  apiBase,
  sidebarMode = false,
  refreshTrigger = 0,
  onDocumentSelect = null,
}) => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    if (isOpen || sidebarMode) {
      fetchDocuments();
      fetchStats();
    }
  }, [isOpen, sidebarMode, refreshTrigger]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchDocuments(searchQuery);
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiBase}/documents`);
      setDocuments(response.data.documents || []);
      setFilteredDocs(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/documents/stats/overview`);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const searchDocuments = async (query) => {
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `${apiBase}/documents/search/${encodeURIComponent(query)}`
      );
      setFilteredDocs(response.data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setFilteredDocs([]);
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await axios.delete(`${apiBase}/documents/${docId}`);
      setDocuments((docs) => docs.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const viewDocument = async (docId) => {
    try {
      console.log("Viewing document:", docId, "sidebar mode:", sidebarMode);
      const response = await axios.get(`${apiBase}/documents/${docId}`);
      const document = response.data.document;
      console.log("Document fetched:", document);
      setSelectedDoc(document);
      
      // If in sidebar mode and onDocumentSelect callback is provided, use it
      if (sidebarMode && onDocumentSelect) {
        console.log("Calling onDocumentSelect with document:", document.filename);
        onDocumentSelect(document);
      } else {
        // Otherwise show the modal
        console.log("Showing document modal");
        setShowDocumentModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
    }
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDoc(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSummaryTypeColor = (type) => {
    const colors = {
      standard:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      bullet_points:
        "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      executive:
        "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      qa: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
      topics:
        "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
    };
    return colors[type] || colors["standard"];
  };

  // Sidebar mode rendering
  if (sidebarMode) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Document History
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {stats.total_documents || 0}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Words
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {(stats.total_words_processed || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
              Loading...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
              {searchQuery ? "No documents found" : "No documents yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => viewDocument(doc.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all group ${
                    selectedDoc?.id === doc.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 flex-1 mr-2">
                      {doc.filename}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getSummaryTypeColor(
                        doc.summary_type
                      )}`}
                    >
                      {doc.summary_type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.word_count} words
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Document Modal Popup */}
        <AnimatePresence>
          {showDocumentModal && selectedDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={closeDocumentModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {selectedDoc.filename}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{selectedDoc.word_count} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(selectedDoc.created_at)}</span>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getSummaryTypeColor(
                            selectedDoc.summary_type
                          )}`}
                        >
                          {selectedDoc.summary_type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeDocumentModal}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="space-y-6">
                    {/* Summary Section */}
                    {selectedDoc.summary && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          Summary
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {selectedDoc.summary}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comprehensive Analytics Section */}
                    {selectedDoc.analysis_data && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Document Intelligence Analytics
                        </h4>
                        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-700/60 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Comprehensive analysis of your document's content,
                            structure, and readability
                          </p>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  WORDS
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {selectedDoc.analysis_data.basic_statistics?.word_count?.toLocaleString() ||
                                  0}
                              </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  READ TIME
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {selectedDoc.analysis_data.readability
                                  ?.reading_time_minutes || 0}
                                min
                              </div>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                              <div className="flex items-center gap-2 mb-1">
                                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                  READABILITY
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {Math.round(
                                  selectedDoc.analysis_data.readability
                                    ?.flesch_reading_ease || 0
                                )}
                              </div>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center gap-2 mb-1">
                                <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                  QUALITY
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {Math.round(
                                  selectedDoc.analysis_data.quality_metrics
                                    ?.quality_score || 0
                                )}
                                %
                              </div>
                            </div>
                          </div>

                          {/* Detailed Analysis Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Content Analysis */}
                            <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Content Analysis
                              </h5>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Sentiment
                                  </span>
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400 capitalize">
                                    {selectedDoc.analysis_data.content_analysis
                                      ?.sentiment?.polarity || "Neutral"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Vocabulary Richness
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {Math.round(
                                      (selectedDoc.analysis_data.quality_metrics
                                        ?.vocabulary_richness || 0) * 100
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Information Density
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {Math.round(
                                      (selectedDoc.analysis_data.quality_metrics
                                        ?.information_density || 0) * 100
                                    )}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Document Structure */}
                            <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                Document Structure
                              </h5>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Paragraphs
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedDoc.analysis_data.basic_statistics
                                      ?.paragraph_count || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Sentences
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {selectedDoc.analysis_data.basic_statistics
                                      ?.sentence_count || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Avg Words/Sentence
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {Math.round(
                                      selectedDoc.analysis_data.basic_statistics
                                        ?.average_sentence_length || 0
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Key Topics */}
                          {selectedDoc.analysis_data.content_analysis
                            ?.keywords && (
                            <div className="mt-4">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-cyan-500" />
                                Key Topics
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {selectedDoc.analysis_data.content_analysis.keywords
                                  .slice(0, 6)
                                  .map((keyword, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm rounded-full border border-cyan-200 dark:border-cyan-700"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Original Text Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        Original Document
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                          {selectedDoc.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl lg:rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col max-h-[40vh] lg:max-h-none">
          {}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
                <span className="hidden sm:inline">Document History</span>
                <span className="sm:hidden">History</span>
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400">
                    <span className="hidden sm:inline">Total Docs</span>
                    <span className="sm:hidden">Docs</span>
                  </span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-white">
                  {stats.total_documents || 0}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400">
                    <span className="hidden sm:inline">Words Processed</span>
                    <span className="sm:hidden">Words</span>
                  </span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-white">
                  {(stats.total_words_processed || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm sm:text-base text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
            {isLoading ? (
              <div className="text-center text-slate-400 py-4 sm:py-8 text-sm">
                Loading...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center text-slate-400 py-4 sm:py-8 text-sm">
                {searchQuery ? "No documents found" : "No documents yet"}
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => viewDocument(doc.id)}
                  className={`p-3 sm:p-4 bg-slate-800/30 border rounded-lg cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-medium text-white text-sm sm:text-base truncate flex-1">
                      {doc.filename}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${getSummaryTypeColor(
                        doc.summary_type
                      )}`}
                    >
                      {doc.summary_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {doc.word_count} words
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedDoc ? (
            <>
              {}
              <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-700">
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate flex-1">
                    {selectedDoc.filename}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border ${getSummaryTypeColor(
                        selectedDoc.summary_type
                      )}`}
                    >
                      {selectedDoc.summary_type}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{selectedDoc.word_count} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">
                      {formatDate(selectedDoc.created_at)}
                    </span>
                    <span className="sm:hidden">
                      {new Date(selectedDoc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedDoc.file_size && (
                    <div>{Math.round(selectedDoc.file_size / 1024)} KB</div>
                  )}
                </div>
              </div>

              {}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                {}
                {selectedDoc.summary && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Summary
                    </h4>
                    <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 text-slate-200 whitespace-pre-wrap text-sm sm:text-base">
                      {selectedDoc.summary}
                    </div>
                  </div>
                )}

                {}
                {selectedDoc.analysis_data && (
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Analysis
                    </h4>
                    <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-slate-400">Sentiment:</span>
                          <span className="ml-2 text-white">
                            {selectedDoc.analysis_data.sentiment?.sentiment ||
                              "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Reading Level:</span>
                          <span className="ml-2 text-white">
                            {selectedDoc.analysis_data.readability
                              ?.reading_level || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Original Text
                  </h4>
                  <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 text-slate-300 max-h-48 sm:max-h-64 overflow-y-auto text-xs sm:text-sm">
                    {selectedDoc.text}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-4">
              <div className="text-center">
                <Eye className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  <span className="hidden sm:inline">
                    Select a document to view details
                  </span>
                  <span className="sm:hidden">Select document</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocumentHistory;
