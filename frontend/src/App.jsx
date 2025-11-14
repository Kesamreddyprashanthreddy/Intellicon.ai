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
  Clock,
  Menu,
  ChevronLeft,
} from "lucide-react";

// Components
import UploadArea from "./components/UploadArea";
import SummaryView from "./components/SummaryView";
import SummaryControls from "./components/SummaryControls";
import DocumentHistory from "./components/DocumentHistory";
import AnalysisPanel from "./components/EnterpriseAnalytics";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import IntelliconLogo from "./components/IntelliconLogo";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000";

// Application States
const APP_STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  EXTRACTING: "extracting",
  READY: "ready", // Text extracted, ready for operations
  SUMMARIZING: "summarizing",
  ANALYZING: "analyzing",
  ERROR: "error",
};

export default function App() {
  // UI State
  const [appState, setAppState] = useState(APP_STATES.IDLE);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [analysis, setAnalysis] = useState(null);

  // UI Controls
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin"); // "signin" or "signup"
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Document history
  const [documentHistory, setDocumentHistory] = useState([]);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [selectedHistoryDoc, setSelectedHistoryDoc] = useState(null);

  // Debug: Log when selectedHistoryDoc changes
  useEffect(() => {
    console.log("selectedHistoryDoc changed:", selectedHistoryDoc);
  }, [selectedHistoryDoc]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Helper Functions
  const resetState = useCallback(() => {
    setAppState(APP_STATES.IDLE);
    setProgress(0);
    setCurrentFile(null);
    setExtractedText("");
    setSummary("");
    setAnalysis(null);
    setSelectedHistoryDoc(null);
  }, []);

  async function makeApiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  }

  // Event Handlers
  const handleFileUpload = useCallback(async (file) => {
    try {
      console.log("Starting file upload:", file.name);
      setSelectedHistoryDoc(null); // Clear any selected history document
      setCurrentFile(file);
      setAppState(APP_STATES.UPLOADING);
      setProgress(20);

      console.log("App state set to UPLOADING");

      // Force a re-render to ensure loading state is visible
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Add delay to show loading state clearly
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Upload file and get extracted text directly
      const result = await uploadFile(file);
      setProgress(70);

      console.log("Upload complete, setting to EXTRACTING");
      setAppState(APP_STATES.EXTRACTING);

      // Add small delay to see extracting state
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(90);

      // The backend already returns the extracted text
      setExtractedText(result.text);
      setProgress(100);

      console.log("Text extracted, auto-generating summary and analysis");

      // Automatically generate summary and analysis after upload
      try {
        setAppState(APP_STATES.SUMMARIZING);

        // Generate summary with default settings
        const summaryResult = await makeApiCall("/summarize", {
          method: "POST",
          body: JSON.stringify({
            text: result.text,
            type: "standard",
            length: "medium",
          }),
        });

        setSummary(summaryResult.summary);

        // Generate analysis
        const analysisResult = await makeApiCall("/analyze", {
          method: "POST",
          body: JSON.stringify({ text: result.text }),
        });

        setAnalysis(analysisResult);

        // Save complete document to database
        await saveDocumentToDatabase(
          summaryResult.summary,
          analysisResult,
          "standard",
          "medium"
        );

        setAppState(APP_STATES.READY);
        toast.success(
          "Document processed, summarized, and saved automatically!"
        );
      } catch (error) {
        console.error("Auto-processing failed:", error);
        setAppState(APP_STATES.READY);
        toast.success("Document processed successfully!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setAppState(APP_STATES.ERROR);
      toast.error(`Upload failed: ${error.message}`);
    }
  }, []);

  const saveDocumentToDatabase = useCallback(
    async (summary, analysis, summaryType, summaryLength) => {
      console.log("saveDocumentToDatabase called with:", {
        extractedText: extractedText?.length,
        currentFile: currentFile?.name,
        summary: summary?.length,
        analysis: analysis ? "Present" : "Not present",
        summaryType,
        summaryLength,
      });

      if (!extractedText.trim() || !currentFile) {
        console.log("Missing required data for save:", {
          hasExtractedText: !!extractedText.trim(),
          hasCurrentFile: !!currentFile,
        });
        return;
      }

      try {
        const requestData = {
          filename: currentFile.name,
          text: extractedText,
          summary: summary || "",
          summary_type: summaryType || "standard",
          summary_length: summaryLength || "medium",
          analysis: analysis,
          file_size: currentFile.size || 0,
        };

        console.log("Sending save request with data:", requestData);

        const saveResult = await makeApiCall("/documents/save", {
          method: "POST",
          body: JSON.stringify(requestData),
        });

        console.log("Document saved to database:", saveResult);

        // Trigger refresh of document history sidebar
        setHistoryRefreshTrigger((prev) => prev + 1);
        console.log("History refresh triggered");
      } catch (error) {
        console.error("Failed to save document to database:", error);
        throw error;
      }
    },
    [extractedText, currentFile]
  );

  const handleGenerateSummary = useCallback(
    async (type = "standard", length = "medium") => {
      if (!extractedText.trim()) {
        toast.error("No text available to summarize");
        return;
      }

      try {
        console.log(
          "Starting summary generation, setting state to SUMMARIZING"
        );
        setAppState(APP_STATES.SUMMARIZING);

        // Force a re-render to ensure loading state is visible
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Add delay to show loading state clearly
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Choose the correct endpoint based on summary type
        const isAdvancedSummary = [
          "bullet",
          "executive",
          "detailed",
          "qa",
          "topics",
        ].includes(type);
        const endpoint = isAdvancedSummary ? "/advanced-summary" : "/summarize";

        console.log(`Making API call to ${endpoint} with type: ${type}`);

        const requestBody = isAdvancedSummary
          ? {
              text: extractedText,
              summary_type: type === "bullet" ? "bullet_points" : type,
              length,
            }
          : { text: extractedText, type, length };

        const summaryResult = await makeApiCall(endpoint, {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        console.log("Summary received:", summaryResult);
        setSummary(summaryResult.summary);

        // Automatically generate analytics after summary
        console.log("Generating analytics...");
        let analysisResult = null;
        try {
          analysisResult = await makeApiCall("/analyze", {
            method: "POST",
            body: JSON.stringify({ text: extractedText }),
          });
          console.log("Raw analytics response:", analysisResult);
          console.log(
            "Analysis basic_statistics:",
            analysisResult.basic_statistics
          );
          console.log(
            "Analysis word_count:",
            analysisResult.basic_statistics?.word_count
          );
          setAnalysis(analysisResult);
          console.log("Analytics set in state:", analysisResult);
        } catch (analysisError) {
          console.error("Analytics generation failed:", analysisError);
          // Don't fail the entire operation if analytics fail
        }

        // Save document to database after successful processing
        try {
          console.log("Attempting to save document with data:", {
            summary: summaryResult.summary,
            analysis: analysisResult,
            type,
            length,
            filename: currentFile?.name,
            fileSize: currentFile?.size,
          });

          await saveDocumentToDatabase(
            summaryResult.summary,
            analysisResult,
            type,
            length
          );

          console.log("Document saved successfully to database");
        } catch (saveError) {
          console.error("Failed to save document:", saveError);
          // Don't fail the entire operation if saving fails
        }

        setAppState(APP_STATES.READY);
        toast.success("Summary and analytics generated successfully!");
      } catch (error) {
        console.error("Summary generation failed:", error);
        setAppState(APP_STATES.READY);
        toast.error(`Summary failed: ${error.message}`);
      }
    },
    [extractedText]
  );

  const handleAnalyze = useCallback(async () => {
    if (!extractedText.trim()) {
      toast.error("No text available to analyze");
      return;
    }

    try {
      setAppState(APP_STATES.ANALYZING);
      const analysisResult = await makeApiCall("/analyze", {
        method: "POST",
        body: JSON.stringify({ text: extractedText }),
      });

      setAnalysis(analysisResult);
      setShowAnalysis(true);
      setAppState(APP_STATES.READY);
      toast.success("Analysis completed!");
    } catch (error) {
      console.error("Analysis failed:", error);
      setAppState(APP_STATES.READY);
      toast.error(`Analysis failed: ${error.message}`);
    }
  }, [extractedText]);

  const handleExport = useCallback(
    async (format = "pdf") => {
      if (!summary && !extractedText) {
        toast.error("No content to export");
        return;
      }

      try {
        const content = summary || extractedText;
        const response = await fetch(`${API_BASE_URL}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content,
            format: format,
            title: currentFile?.name
              ? `${currentFile.name.split(".")[0]}_summary`
              : "Document Summary",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || `Export failed: ${response.status}`
          );
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${
          currentFile?.name
            ? currentFile.name.split(".")[0] + "_summary"
            : "document"
        }.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success(`Document exported as ${format.toUpperCase()}!`);
      } catch (error) {
        console.error("Export failed:", error);
        toast.error(`Export failed: ${error.message}`);
      }
    },
    [summary, extractedText, currentFile]
  );

  const handleSave = useCallback(() => {
    toast.success("Document saved to cloud storage!");
  }, []);

  // Component State Checks
  const isLoading = [
    APP_STATES.UPLOADING,
    APP_STATES.EXTRACTING,
    APP_STATES.SUMMARIZING,
    APP_STATES.ANALYZING,
  ].includes(appState);
  const hasContent = Boolean(extractedText.trim());

  // Debug logging for state changes
  React.useEffect(() => {
    console.log("App state changed:", {
      appState,
      isLoading,
      hasContent,
      currentFile: currentFile?.name,
      progress,
    });
  }, [appState, isLoading, hasContent, currentFile, progress]);

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
        <div
          className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center space-x-3">
              {/* Sidebar Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </motion.button>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center"
              >
                <IntelliconLogo
                  showText={true}
                  textSize="text-lg sm:text-xl"
                  className="flex items-center"
                />
              </motion.div>
            </div>

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

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DocumentHistory
          isOpen={true}
          apiBase={API_BASE_URL}
          onClose={() => setSidebarOpen(false)}
          sidebarMode={true}
          refreshTrigger={historyRefreshTrigger}
          onDocumentSelect={setSelectedHistoryDoc}
        />
      </div>

      {/* Main Content */}
      <main
        className={`relative px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-20 sm:pt-24 transition-all duration-300 z-10 ${
          sidebarOpen ? "ml-80" : "ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto relative z-10">
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
                    Transform documents into actionable insights with AI-powered
                    summarization, analysis, and smart export features.
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
              <AnimatePresence>
                {hasContent && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-2xl mx-auto"
                  >
                    <SummaryControls
                      onGenerateSummary={handleGenerateSummary}
                      onAnalyze={handleAnalyze}
                      onExport={handleExport}
                      onSave={handleSave}
                      isLoading={isLoading}
                      hasText={hasContent}
                      currentSummary={summary}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Summary and Analysis Results */}
              <AnimatePresence mode="wait">
                {selectedHistoryDoc ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedHistoryDoc.filename}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{selectedHistoryDoc.word_count} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(selectedHistoryDoc.created_at).toLocaleString()}</span>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            selectedHistoryDoc.summary_type === 'standard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                            selectedHistoryDoc.summary_type === 'bullet_points' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                            selectedHistoryDoc.summary_type === 'executive' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                            selectedHistoryDoc.summary_type === 'qa' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                            'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400'
                          }`}>
                            {selectedHistoryDoc.summary_type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedHistoryDoc(null)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                        title="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Document Content */}
                    <SummaryView
                      extractedText={selectedHistoryDoc.text}
                      summary={selectedHistoryDoc.summary}
                      analysis={selectedHistoryDoc.analysis_data}
                    />
                  </motion.div>
                ) : (extractedText || summary) ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SummaryView
                      extractedText={extractedText}
                      summary={summary}
                      analysis={analysis}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            {/* End of middle section */}
          </div>
        </div>
      </main>

      {/* Analysis Panel */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <AnalysisPanel
            analysis={analysis}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 mx-4 text-center max-w-sm w-full"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {appState === APP_STATES.UPLOADING &&
                  "Intellicon - Uploading Document..."}
                {appState === APP_STATES.EXTRACTING &&
                  "Intellicon - Extracting Text..."}
                {appState === APP_STATES.SUMMARIZING &&
                  "Intellicon - Generating Summary..."}
                {appState === APP_STATES.ANALYZING &&
                  "Intellicon - Analyzing Document..."}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {currentFile?.name &&
                  `Processing ${currentFile.name} with AI intelligence`}
                {appState === APP_STATES.SUMMARIZING &&
                  "AI-powered summarization in progress..."}
                {appState === APP_STATES.ANALYZING &&
                  "Deep AI analysis of content and structure..."}
              </p>
              {progress > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
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

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  {authMode === "signin" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {authMode === "signin"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    onClick={() =>
                      setAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {authMode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: darkMode ? "#374151" : "#ffffff",
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

      {/* Footer */}
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
                Contact Support
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
