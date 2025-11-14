import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function UploadArea({
  onFile,
  loading,
  progress = 0,
  fileName,
}) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log("UploadArea loading state:", { loading, progress, fileName });
  }, [loading, progress, fileName]);

  function handlePick() {
    fileRef.current.click();
  }

  function handleChange(e) {
    const f = e.target.files[0];
    if (f) handleFileSelected(f);
  }

  function handleFileSelected(file) {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      return alert("Only PDF, PNG or JPG files are accepted");
    }
    console.log("File selected, calling onFile:", file.name);
    onFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelected(f);
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragOver
            ? "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-102"
            : "border-gray-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500"
        } ${loading ? "pointer-events-none" : "cursor-pointer"}`}
      >
        <input
          ref={fileRef}
          type="file"
          onChange={handleChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
        />

        <div className="p-6 sm:p-8 lg:p-12 text-center">
          {loading ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-slate-200">
                  Processing Document
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 px-2">
                  {fileName &&
                    `Processing ${
                      fileName.length > 30
                        ? fileName.substring(0, 30) + "..."
                        : fileName
                    }`}
                </p>
              </div>

              {progress > 0 && (
                <div className="w-full max-w-xs mx-auto px-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-3 sm:space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              <div className="px-4">
                <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  Drop your document here
                </p>
                <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mb-3 sm:mb-4">
                  Support for PDF, PNG, and JPG files up to 10MB
                </p>

                <motion.button
                  onClick={handlePick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-sm sm:text-base"
                >
                  Choose File
                </motion.button>
              </div>

              <div className="flex items-center justify-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-400 dark:text-slate-500">
                <div className="flex items-center space-x-1">
                  <File className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-1">
                  <File className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>PNG</span>
                </div>
                <div className="flex items-center space-x-1">
                  <File className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>JPG</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {fileName && !loading && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800"
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 truncate">
            <span className="hidden sm:inline">{fileName}</span>
            <span className="sm:hidden">
              {fileName.length > 20
                ? fileName.substring(0, 20) + "..."
                : fileName}
            </span>
            <span className="ml-1">uploaded successfully</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
