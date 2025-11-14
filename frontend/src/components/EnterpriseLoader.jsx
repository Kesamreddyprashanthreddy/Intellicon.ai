import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Zap, FileText } from "lucide-react";
import IntelliconLogo from "./IntelliconLogo";

export default function EnterpriseLoader({
  stage = "processing",
  fileName = "",
  progress = 0,
}) {
  const stages = {
    uploading: {
      icon: FileText,
      title: "Uploading Document",
      subtitle: "Securely transferring your file...",
      color: "blue",
    },
    processing: {
      icon: Brain,
      title: "Intellicon Processing",
      subtitle: "Extracting and analyzing content...",
      color: "purple",
    },
    analyzing: {
      icon: Sparkles,
      title: "Deep Analysis",
      subtitle: "Generating intelligent insights...",
      color: "cyan",
    },
    summarizing: {
      icon: Zap,
      title: "Creating Summary",
      subtitle: "Distilling key information...",
      color: "green",
    },
  };

  const currentStage = stages[stage] || stages.processing;
  const IconComponent = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-white/90 to-cyan-50/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:via-blue-900/60 dark:to-slate-900/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 lg:p-12 max-w-md w-full mx-4 border border-blue-100/30 dark:border-slate-700/50 shadow-2xl"
      >
        {}
        <div className="relative flex flex-col items-center">
          {}
          <div className="relative mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl"
            >
              <IntelliconLogo
                iconOnly={true}
                className="w-10 h-10 text-white"
              />
            </motion.div>

            {}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2.5],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full border-2 border-cyan-400"
              />
            ))}
          </div>

          {}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-${currentStage.color}-500/20 to-${currentStage.color}-600/20 border border-${currentStage.color}-500/30 mb-4`}
            >
              <IconComponent
                className={`w-4 h-4 text-${currentStage.color}-600`}
              />
              <span
                className={`text-sm font-medium text-${currentStage.color}-700 dark:text-${currentStage.color}-300`}
              >
                {currentStage.title}
              </span>
            </motion.div>

            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStage.subtitle}
            </h3>

            {fileName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Processing: <span className="font-medium">{fileName}</span>
              </p>
            )}
          </div>

          {}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full relative overflow-hidden"
              >
                {}
                <motion.div
                  animate={{
                    x: [-100, 100],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {}
          <div className="mt-6 space-y-2">
            {[
              { label: "Document Upload", completed: progress > 20 },
              { label: "Text Extraction", completed: progress > 40 },
              { label: "AI Analysis", completed: progress > 70 },
              { label: "Summary Generation", completed: progress > 90 },
            ].map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{
                    scale: step.completed ? [1, 1.2, 1] : 1,
                    backgroundColor: step.completed
                      ? ["#10b981", "#34d399", "#10b981"]
                      : "#e5e7eb",
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-2 h-2 rounded-full"
                />
                <span
                  className={`text-xs ${
                    step.completed
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>

          {}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
