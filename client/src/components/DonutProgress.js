const DonutProgress = ({ size = 112, percentage = 0, label = "", count = 0 }) => {
  // Determine color based on label text to match the actual status
  const getColorFromLabel = (labelText) => {
    const lowerLabel = labelText.toLowerCase();
    if (lowerLabel.includes("at-risk") || lowerLabel.includes("dropping")) {
      return "#FF4D4D"; // Red
    }
    if (lowerLabel.includes("verge")) {
      return "#FFC107"; // Yellow
    }
    return "#4CAF50"; // Green (normal)
  };

  const color = getColorFromLabel(label);

  // SVG circle calculations
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Donut Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        {/* Center text - percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Label and count below */}
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-1 text-sm font-bold">
          <span style={{ color }}>
            {label.toLowerCase().includes("at-risk") ? "↓" : "↑"}
          </span>
          <span className="text-gray-900">{count.toLocaleString()}</span>
        </div>
        <div
          className="text-xs font-medium mt-1"
          style={{ color }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

export default DonutProgress;
