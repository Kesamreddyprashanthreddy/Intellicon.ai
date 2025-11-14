import React from "react";

const IntelliconLogo = ({
  className = "w-10 h-10",
  showText = false,
  textSize = "text-2xl",
  iconOnly = false,
}) => {
  if (iconOnly) {
    return (
      <div className={`${className} relative`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="intelliconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#00f5ff"
              />
              <stop
                offset="30%"
                stopColor="#0ea5e9"
              />
              <stop
                offset="70%"
                stopColor="#8b5cf6"
              />
              <stop
                offset="100%"
                stopColor="#a855f7"
              />
            </linearGradient>
          </defs>

          {/* Brain outline - more detailed shape */}
          <path
            d="M35 45c0-12 8-20 18-20 4 0 8 1 11 4 3-3 7-4 11-4 10 0 18 8 18 20 0 3-1 6-3 8 5 3 8 8 8 14 0 12-8 20-18 20-3 0-6-1-8-2-2 4-6 7-11 7s-9-3-11-7c-2 1-5 2-8 2-10 0-18-8-18-20 0-6 3-11 8-14-2-2-3-5-3-8z"
            stroke="url(#intelliconGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit pattern */}
          <g
            stroke="url(#intelliconGradient)"
            strokeWidth="2"
            fill="none"
          >
            {/* Central processing unit */}
            <circle
              cx="60"
              cy="60"
              r="4"
              fill="url(#intelliconGradient)"
            />

            {/* Main circuit paths */}
            <path
              d="M45 45 L56 56"
              strokeLinecap="round"
            />
            <path
              d="M75 45 L64 56"
              strokeLinecap="round"
            />
            <path
              d="M45 75 L56 64"
              strokeLinecap="round"
            />
            <path
              d="M75 75 L64 64"
              strokeLinecap="round"
            />
            <path
              d="M40 60 L56 60"
              strokeLinecap="round"
            />
            <path
              d="M80 60 L64 60"
              strokeLinecap="round"
            />

            {/* Neural nodes */}
            <circle
              cx="45"
              cy="45"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="75"
              cy="45"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="45"
              cy="75"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="75"
              cy="75"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="40"
              cy="60"
              r="2.5"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="80"
              cy="60"
              r="2.5"
              fill="url(#intelliconGradient)"
            />

            {/* Secondary connections */}
            <path
              d="M50 35 L45 40"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              d="M70 35 L75 40"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              d="M35 55 L40 60"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              d="M85 55 L80 60"
              strokeLinecap="round"
              strokeWidth="1.5"
            />

            {/* Secondary nodes */}
            <circle
              cx="50"
              cy="35"
              r="2"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="70"
              cy="35"
              r="2"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="35"
              cy="55"
              r="2"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="85"
              cy="55"
              r="2"
              fill="url(#intelliconGradient)"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brain Icon */}
      <div className="w-12 h-12 relative">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="intelliconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#00f5ff"
              />
              <stop
                offset="30%"
                stopColor="#0ea5e9"
              />
              <stop
                offset="70%"
                stopColor="#8b5cf6"
              />
              <stop
                offset="100%"
                stopColor="#a855f7"
              />
            </linearGradient>
          </defs>

          {/* Brain outline */}
          <path
            d="M35 45c0-12 8-20 18-20 4 0 8 1 11 4 3-3 7-4 11-4 10 0 18 8 18 20 0 3-1 6-3 8 5 3 8 8 8 14 0 12-8 20-18 20-3 0-6-1-8-2-2 4-6 7-11 7s-9-3-11-7c-2 1-5 2-8 2-10 0-18-8-18-20 0-6 3-11 8-14-2-2-3-5-3-8z"
            stroke="url(#intelliconGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circuit pattern */}
          <g
            stroke="url(#intelliconGradient)"
            strokeWidth="2"
            fill="none"
          >
            <circle
              cx="60"
              cy="60"
              r="4"
              fill="url(#intelliconGradient)"
            />
            <path
              d="M45 45 L56 56"
              strokeLinecap="round"
            />
            <path
              d="M75 45 L64 56"
              strokeLinecap="round"
            />
            <path
              d="M45 75 L56 64"
              strokeLinecap="round"
            />
            <path
              d="M75 75 L64 64"
              strokeLinecap="round"
            />
            <path
              d="M40 60 L56 60"
              strokeLinecap="round"
            />
            <path
              d="M80 60 L64 60"
              strokeLinecap="round"
            />

            <circle
              cx="45"
              cy="45"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="75"
              cy="45"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="45"
              cy="75"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="75"
              cy="75"
              r="3"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="40"
              cy="60"
              r="2.5"
              fill="url(#intelliconGradient)"
            />
            <circle
              cx="80"
              cy="60"
              r="2.5"
              fill="url(#intelliconGradient)"
            />
          </g>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent ${textSize}`}
        >
          Intellicon
        </span>
      )}
    </div>
  );
};

export default IntelliconLogo;
