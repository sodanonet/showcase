import React, { useRef, useEffect } from 'react';

export interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 400,
  height = 200,
  strokeColor = '#667eea',
  fillColor = 'rgba(102, 126, 234, 0.1)',
  strokeWidth = 2,
  showDots = true,
  showGrid = true,
  animated = true,
  className = '',
  style,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div 
        className={`line-chart-empty ${className}`}
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280',
          fontSize: '0.875rem',
          ...style 
        }}
      >
        No data available
      </div>
    );
  }

  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Calculate data bounds
  const yValues = data.map(d => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yRange = maxY - minY || 1;

  // Create path string for the line
  const createPath = (data: DataPoint[]) => {
    return data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
      
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Create area path for fill
  const createAreaPath = (data: DataPoint[]) => {
    const linePath = createPath(data);
    const lastPoint = data[data.length - 1];
    const firstPoint = data[0];
    
    const lastX = padding + ((data.length - 1) / (data.length - 1)) * chartWidth;
    const firstX = padding;
    const bottomY = padding + chartHeight;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Generate grid lines
  const gridLines = [];
  if (showGrid) {
    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * chartWidth;
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={padding + chartHeight}
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
        />
      );
    }

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight;
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={padding + chartWidth}
          y2={y}
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
        />
      );
    }
  }

  // Generate dots for data points
  const dots = showDots ? data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
    
    return (
      <circle
        key={index}
        cx={x}
        cy={y}
        r="4"
        fill={strokeColor}
        stroke="white"
        strokeWidth="2"
        className={animated ? 'chart-dot' : ''}
      >
        {point.label && (
          <title>{point.label}: {point.y}</title>
        )}
      </circle>
    );
  }) : [];

  const pathString = createPath(data);
  const areaPathString = createAreaPath(data);

  useEffect(() => {
    if (animated && svgRef.current) {
      const path = svgRef.current.querySelector('.chart-line') as SVGPathElement;
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length.toString();
        path.style.strokeDashoffset = length.toString();
        path.style.animation = 'dash 1.5s ease-in-out forwards';
      }
    }
  }, [animated, data]);

  return (
    <div className={`line-chart-container ${className}`} style={style}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart"
      >
        {/* Grid */}
        {gridLines}
        
        {/* Area fill */}
        <path
          d={areaPathString}
          fill={fillColor}
          className={animated ? 'chart-area' : ''}
        />
        
        {/* Line */}
        <path
          d={pathString}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'chart-line' : ''}
        />
        
        {/* Dots */}
        {dots}
        
        {/* Y-axis labels */}
        <text x={padding - 10} y={padding + 5} textAnchor="end" fontSize="12" fill="#6b7280">
          {maxY}
        </text>
        <text x={padding - 10} y={padding + chartHeight + 5} textAnchor="end" fontSize="12" fill="#6b7280">
          {minY}
        </text>
      </svg>
      
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .chart-area {
          animation: fadeIn 1s ease-in-out;
        }
        
        .chart-dot {
          animation: fadeIn 1.5s ease-in-out;
        }
        
        .line-chart-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LineChart;