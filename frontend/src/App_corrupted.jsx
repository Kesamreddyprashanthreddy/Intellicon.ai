import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  Moon,
  Sun,
  FileText,
  Sparkles,
  Settings,
  History,
  HelpCircle,
  Upload,
  ShieldCheck,
  Download,
  User,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";

// Import components
import UploadArea from "./components/UploadArea";
import SummaryView from "./components/SummaryView";
import SummaryControls from "./components/SummaryControls";
import Stats from "./components/Stats";
import IntelliconLogo from "./components/IntelliconLogo";
import DocumentHistory from "./components/DocumentHistory";
import AnalysisPanel from "./components/AnalysisPanel";
import EnterpriseLoader from "./components/EnterpriseLoader";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Application states
const APP_STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  EXTRACTING: "extracting",
  SUMMARIZING: "summarizing",
  ANALYZING: "analyzing",
  ERROR: "error",
};

export default function App() {
  // Core state
  const [appState, setAppState] = useState(APP_STATES.IDLE);
  const [currentFile, setCurrentFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);

  // UI state
  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // "signin" or "signup"

  // Document history
  const [documentHistory, setDocumentHistory] = useState([]);
  const [savedDocuments, setSavedDocuments] = useState([]);

  // Error handling
  const [error, setError] = useState(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Theme handling
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const initializeApp = async () => {
    try {
      const saved = localStorage.getItem("savedDocuments");
      if (saved) {
        setSavedDocuments(JSON.parse(saved));
      }
      await fetch(`${API_BASE_URL}/health`);
    } catch (error) {
      console.error("Failed to initialize app:", error);
      toast.error("Backend connection failed. Some features may not work.");
    }
  };

  // API utility functions
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  };

  // File upload handler
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    setCurrentFile(file);
    setAppState(APP_STATES.UPLOADING);
    setProgress(0);
    setError(null);
    setSummary("");
    setAnalysis(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 80));
      }, 200);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Upload failed");
      }

      const result = await response.json();
      setProgress(100);

      setTimeout(() => {
        setExtractedText(result.text || "");
        setAppState(APP_STATES.IDLE);
        setProgress(0);

        const newDocument = {
          id: Date.now(),
          filename: file.name,
          uploadDate: new Date().toISOString(),
          text: result.text || "",
          fileSize: file.size,
          summary: "",
          analysis: null,
        };

        setDocumentHistory((prev) => [newDocument, ...prev.slice(0, 9)]);
        toast.success("Document processed successfully!");
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message);
      setAppState(APP_STATES.ERROR);
      setProgress(0);
      toast.error(error.message || "Failed to process document");
    }
  }, []);

  // Summary generation
  const handleGenerateSummary = useCallback(
    async (summaryType = "standard", length = "medium") => {
      if (!extractedText.trim()) {
        toast.error("No text to summarize");
        return;
      }

      setAppState(APP_STATES.SUMMARIZING);
      setError(null);

      try {
        let result;

        if (summaryType === "fast") {
          result = await apiRequest("/summarize-fast", {
            method: "POST",
            body: JSON.stringify({
              text: extractedText,
              length: length,
            }),
          });
        } else if (summaryType === "standard") {
          result = await apiRequest("/summarize", {
            method: "POST",
            body: JSON.stringify({
              text: extractedText,
              length: length,
            }),
          });
        } else {
          result = await apiRequest("/advanced-summary", {
            method: "POST",
            body: JSON.stringify({
              text: extractedText,
              summary_type: summaryType,
              length: length,
            }),
          });
        }

        setSummary(result.summary || "");
        setAppState(APP_STATES.IDLE);

        if (documentHistory[0]) {
          const updatedHistory = [...documentHistory];
          updatedHistory[0] = {
            ...updatedHistory[0],
            summary: result.summary || "",
            summaryType: summaryType,
            summaryLength: length,
          };
          setDocumentHistory(updatedHistory);
        }

        toast.success("Summary generated successfully!");
      } catch (error) {
        console.error("Summarization error:", error);
        setError(error.message);
        setAppState(APP_STATES.ERROR);
        toast.error(error.message || "Failed to generate summary");
      }
    },
    [extractedText, documentHistory]
  );

  // Document analysis
  const handleAnalyzeDocument = useCallback(async () => {
    if (!extractedText.trim()) {
      toast.error("No text to analyze");
      return;
    }

    setAppState(APP_STATES.ANALYZING);
    setError(null);

    try {
      const result = await apiRequest("/analyze", {
        method: "POST",
        body: JSON.stringify({
          text: extractedText,
        }),
      });

      setAnalysis(result.analysis || {});
      setShowAnalysis(true);
      setAppState(APP_STATES.IDLE);

      if (documentHistory[0]) {
        const updatedHistory = [...documentHistory];
        updatedHistory[0] = {
          ...updatedHistory[0],
          analysis: result.analysis || {},
        };
        setDocumentHistory(updatedHistory);
      }

      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      setError(error.message);
      setAppState(APP_STATES.ERROR);
      toast.error(error.message || "Failed to analyze document");
    }
  }, [extractedText, documentHistory]);

  // Export functionality
  const handleExport = useCallback(
    async (format, content) => {
      if (!content) {
        toast.error("No content to export");
        return;
      }

      try {
        const filename = currentFile?.name || "document";
        const title = filename.split(".")[0];

        const response = await fetch(`${API_BASE_URL}/export`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content,
            format: format,
            title: title,
          }),
        });

        if (!response.ok) {
          throw new Error("Export failed");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success(`Document exported as ${format.toUpperCase()}`);
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export document");
      }
    },
    [currentFile]
  );

  // Save document
  const handleSaveDocument = useCallback(async () => {
    if (!currentFile || !extractedText) {
      toast.error("No document to save");
      return;
    }

    try {
      const documentData = {
        filename: currentFile.name,
        text: extractedText,
        summary: summary,
        summary_type: "standard",
        summary_length: "medium",
        analysis: analysis,
        file_size: currentFile.size,
        tags: [],
      };

      const saved = [
        ...savedDocuments,
        { ...documentData, id: Date.now(), savedAt: new Date().toISOString() },
      ];
      setSavedDocuments(saved);
      localStorage.setItem("savedDocuments", JSON.stringify(saved));

      try {
        await apiRequest("/documents/save", {
          method: "POST",
          body: JSON.stringify(documentData),
        });
        toast.success("Document saved successfully!");
      } catch (backendError) {
        console.error("Backend save failed:", backendError);
        toast.success("Document saved locally!");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    }
  }, [currentFile, extractedText, summary, analysis, savedDocuments]);

  // Load document from history
  const handleLoadDocument = useCallback((document) => {
    setCurrentFile({ name: document.filename, size: document.fileSize });
    setExtractedText(document.text);
    setSummary(document.summary || "");
    setAnalysis(document.analysis || null);
    setAppState(APP_STATES.IDLE);
    setShowHistory(false);
    toast.success("Document loaded!");
  }, []);

  // Reset application
  const handleReset = useCallback(() => {
    setCurrentFile(null);
    setExtractedText("");
    setSummary("");
    setAnalysis(null);
    setAppState(APP_STATES.IDLE);
    setProgress(0);
    setError(null);
    setShowAnalysis(false);
    toast.success("Application reset!");
  }, []);

  // Compute derived state
  const isLoading = [
    APP_STATES.UPLOADING,
    APP_STATES.EXTRACTING,
    APP_STATES.SUMMARIZING,
    APP_STATES.ANALYZING,
  ].includes(appState);
  const hasContent = Boolean(extractedText.trim());

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30"
      }`}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <IntelliconLogo className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Intellicon
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">
                  AI Document Intelligence
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile theme toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors sm:hidden"
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>
              {/* Desktop history button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(!showHistory)}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                title="Document History"
              >
                <History className="w-4 h-4" />
              </motion.button>
              {/* Desktop theme toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDarkMode(!darkMode)}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>
              {/* Auth buttons */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAuthMode("signin");
                    setShowAuthModal(true);
                  }}
                  className="relative group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white/80 dark:bg-gray-700/80 border border-gray-200/80 dark:border-gray-600/80 rounded-full backdrop-blur-lg hover:bg-white dark:hover:bg-gray-600 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10 hidden sm:inline">
                    Sign In
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthModal(true);
                  }}
                  className="relative group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 hover:from-blue-700 hover:via-blue-700 hover:to-cyan-600 text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 overflow-hidden"
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>

                  {/* Glow effects */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/20 rounded-full blur-md group-hover:animate-ping"></div>

                  <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative z-10 hidden sm:inline">
                    Get Started
                  </span>
                  <span className="relative z-10 sm:hidden">Sign Up</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Middle section with different background */}
          <div
            className={`rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${
              darkMode
                ? "bg-gray-800/90"
                : "bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-blue-50/80"
            } border border-blue-100/20 dark:border-gray-700/50 backdrop-blur-sm`}
          >
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Hero Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-4xl mx-auto"
              >
                {/* Main Hero Content */}
                <div className="relative">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-400/5 dark:to-cyan-400/5 blur-3xl rounded-full"></div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Documents Processed
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        12,543
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        AI Summaries Generated
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        8,921
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Users Active Today
                      </span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        2,114
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Features Panel */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`rounded-2xl p-6 ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700/50"
                      : "bg-white/70 border-white/50"
                  } border backdrop-blur-sm`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Key Features
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          OCR Technology
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Extract text from any document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          AI Summarization
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Intelligent content analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Multiple Formats
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Export in various formats
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-6">
              {/* Middle section with different background */}
              <div
                className={`rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${
                  darkMode
                    ? "bg-gray-800/90"
                    : "bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-blue-50/80"
                } border border-blue-100/20 dark:border-gray-700/50 backdrop-blur-sm`}
              >
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Hero Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-8 lg:py-12 max-w-4xl mx-auto"
                  >
                    {/* Main Hero Content */}
                    <div className="relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-400/5 dark:to-cyan-400/5 blur-3xl rounded-full"></div>

                      {/* Hero badge */}
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 bg-white/20 dark:bg-gray-700/40 border border-white/30 dark:border-gray-600/50 rounded-full backdrop-blur-md"
                      >
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          AI-Powered Document Intelligence
                        </span>
                      </motion.div>

                      {/* Main heading */}
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6"
                      >
                        <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                          Intellicon
                        </span>
                      </motion.h1>

                      {/* Subtitle */}
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0"
                      >
                        Transform documents into actionable insights with
                        AI-powered summarization, analysis, and smart export
                        features.
                      </motion.p>

                      {/* Feature highlights */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/30 dark:bg-gray-700/40 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-600/40">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            PDF & Images
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/30 dark:bg-gray-700/40 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-600/40">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Smart Summaries
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/30 dark:bg-gray-700/40 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-600/40">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-cyan-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            Export Anywhere
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  {/* Upload Area */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-3xl mx-auto px-2 sm:px-0"
                  >
                    <UploadArea
                      onFile={handleFileUpload}
                      loading={isLoading}
                      progress={progress}
                      fileName={currentFile?.name}
                    />
                  </motion.div>

                  {/* Buttons below upload */}
                  <div className="max-w-3xl mx-auto">
                    <SummaryControls
                      onGenerateSummary={handleGenerateSummary}
                      onAnalyze={handleAnalyzeDocument}
                      onExport={handleExport}
                      onSave={handleSaveDocument}
                      isLoading={isLoading}
                      hasText={hasContent}
                      currentSummary={summary}
                    />
                  </div>

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="backdrop-blur-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-700 dark:text-red-300"
                      >
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">{error}</p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Loading State */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <EnterpriseLoader
                          message={
                            appState === APP_STATES.UPLOADING
                              ? "Processing document..."
                              : appState === APP_STATES.SUMMARIZING
                              ? "Generating AI summary..."
                              : appState === APP_STATES.ANALYZING
                              ? "Analyzing content..."
                              : "Processing..."
                          }
                          progress={progress}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content Display */}
                  <AnimatePresence mode="wait">
                    {(hasContent || summary) && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key="content"
                      >
                        <SummaryView
                          extractedText={extractedText}
                          summary={summary}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Empty State */}
                  {!hasContent && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 lg:py-16"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-gray-300 dark:text-slate-600"
                      >
                        <FileText className="w-full h-full" />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-slate-300 mb-2">
                        Ready to Summarize
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400">
                        Upload a document to get started with AI-powered
                        summarization and analysis.
                      </p>
                    </motion.div>
                  )}
                </div>
                {/* End of middle section */}
              </div>

              {/* Right Sidebar - Hidden on mobile, visible on xl screens */}
              <div className="hidden xl:block xl:col-span-3">
                <div className="sticky top-24 space-y-6">
                  {/* Recent Activity Panel */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`rounded-2xl p-6 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700/50"
                        : "bg-white/70 border-white/50"
                    } border backdrop-blur-sm`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Document processed
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Summary generated
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            5 minutes ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Report exported
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            12 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Tips Panel */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`rounded-2xl p-6 ${
                      darkMode
                        ? "bg-gray-800/50 border-gray-700/50"
                        : "bg-white/70 border-white/50"
                    } border backdrop-blur-sm`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      💡 Pro Tips
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          For best OCR results, ensure your documents are
                          high-resolution and well-lit.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Try different summary types to get the format that
                          works best for your needs.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Document History Modal/Drawer */}
      <AnimatePresence>
        {showHistory && (
          <DocumentHistory
            isOpen={showHistory}
            apiBase={API_BASE_URL}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <AnalysisPanel
            analysis={analysis}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {authMode === "signin" ? "Welcome back" : "Create account"}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                </div>

                {authMode === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}

                {authMode === "signin" && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  {authMode === "signin" ? "Sign In" : "Create Account"}
                </motion.button>

                <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
                  {authMode === "signin"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() =>
                      setAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors"
                  >
                    {authMode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? "#1e293b" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#1e293b",
            border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      {/* Professional Footer */}
      <footer className="relative mt-20 border-t border-white/20 dark:border-gray-700/50 bg-white/10 dark:bg-gray-800/40 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Terms & Conditions
              </a>
              <span className="text-gray-400 dark:text-slate-500">|</span>
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-gray-400 dark:text-slate-500">|</span>
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Policies
              </a>
              <span className="text-gray-400 dark:text-slate-500">|</span>
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Uninstall Instruction
              </a>
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-500">
              ©2025 Intellicon All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
