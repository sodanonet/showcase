import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  width: number;
  height: number;
  animate: boolean;
}

@Component('ts-chart-visualization')
export class ChartVisualization extends BaseWebComponent {
  private chartData: ChartData[] = [
    { label: 'JavaScript', value: 35, color: '#f7df1e' },
    { label: 'TypeScript', value: 25, color: '#3178c6' },
    { label: 'React', value: 20, color: '#61dafb' },
    { label: 'Vue.js', value: 15, color: '#4fc08d' },
    { label: 'Angular', value: 5, color: '#dd0031' }
  ];

  private options: ChartOptions = {
    type: 'bar',
    width: 400,
    height: 300,
    animate: true
  };

  private animationFrameId: number | null = null;
  private animationProgress = 0;

  static get observedAttributes(): string[] {
    return ['chart-type', 'width', 'height', 'animate'];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeOptions();
    this.startDataAnimation();
  }

  private initializeOptions(): void {
    this.options = {
      type: (this.getAttribute('chart-type') as ChartOptions['type']) || 'bar',
      width: this.getNumberAttribute('width', 400),
      height: this.getNumberAttribute('height', 300),
      animate: this.getBooleanAttribute('animate') !== false
    };
  }

  private startDataAnimation(): void {
    if (!this.options.animate) return;

    const animate = () => {
      this.animationProgress = Math.min(this.animationProgress + 0.02, 1);
      this.render();

      if (this.animationProgress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  protected getTemplate(): string {
    const maxValue = Math.max(...this.chartData.map(d => d.value));
    
    return `
      <div class="chart-container">
        <h3>Chart Visualization</h3>
        <p class="chart-description">
          TypeScript-powered data visualization with SVG rendering and animations.
        </p>

        <div class="chart-controls">
          <button class="chart-type-btn" data-type="bar" ${this.options.type === 'bar' ? 'class="active"' : ''}>📊 Bar</button>
          <button class="chart-type-btn" data-type="line" ${this.options.type === 'line' ? 'class="active"' : ''}>📈 Line</button>
          <button class="chart-type-btn" data-type="pie" ${this.options.type === 'pie' ? 'class="active"' : ''}>🥧 Pie</button>
          <button class="chart-type-btn" data-type="doughnut" ${this.options.type === 'doughnut' ? 'class="active"' : ''}>🍩 Doughnut</button>
        </div>

        <div class="chart-wrapper">
          <svg 
            class="chart-svg" 
            width="${this.options.width}" 
            height="${this.options.height}"
            viewBox="0 0 ${this.options.width} ${this.options.height}"
          >
            ${this.renderChart(maxValue)}
          </svg>
        </div>

        <div class="chart-legend">
          ${this.chartData.map(data => `
            <div class="legend-item">
              <div class="legend-color" style="background-color: ${data.color}"></div>
              <span class="legend-label">${data.label}: ${data.value}%</span>
            </div>
          `).join('')}
        </div>

        <div class="chart-stats">
          <div class="stat-group">
            <h4>Chart Statistics</h4>
            <div class="stat-item">
              <span class="stat-label">Total Data Points:</span>
              <span class="stat-value">${this.chartData.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Highest Value:</span>
              <span class="stat-value">${maxValue}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Value:</span>
              <span class="stat-value">${Math.round(this.chartData.reduce((sum, d) => sum + d.value, 0) / this.chartData.length)}%</span>
            </div>
          </div>
        </div>

        <div class="data-controls">
          <button class="action-btn randomize-data" data-action="randomize">🎲 Randomize Data</button>
          <button class="action-btn add-data" data-action="add">➕ Add Data Point</button>
          <button class="action-btn reset-data" data-action="reset">🔄 Reset Data</button>
        </div>
      </div>
    `;
  }

  private renderChart(maxValue: number): string {
    const padding = 40;
    const chartWidth = this.options.width - padding * 2;
    const chartHeight = this.options.height - padding * 2;

    switch (this.options.type) {
      case 'bar':
        return this.renderBarChart(chartWidth, chartHeight, maxValue, padding);
      case 'line':
        return this.renderLineChart(chartWidth, chartHeight, maxValue, padding);
      case 'pie':
        return this.renderPieChart(chartWidth, chartHeight);
      case 'doughnut':
        return this.renderDoughnutChart(chartWidth, chartHeight);
      default:
        return '';
    }
  }

  private renderBarChart(width: number, height: number, maxValue: number, padding: number): string {
    const barWidth = width / this.chartData.length;
    const animatedProgress = this.options.animate ? this.animationProgress : 1;

    return `
      <g class="bar-chart">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(factor => `
          <line 
            x1="${padding}" 
            y1="${padding + height * factor}" 
            x2="${padding + width}" 
            y2="${padding + height * factor}" 
            stroke="rgba(255,255,255,0.1)" 
            stroke-width="1"
          />
        `).join('')}
        
        <!-- Bars -->
        ${this.chartData.map((data, index) => {
          const barHeight = (data.value / maxValue) * height * animatedProgress;
          const x = padding + index * barWidth + barWidth * 0.1;
          const y = padding + height - barHeight;
          const actualBarWidth = barWidth * 0.8;

          return `
            <rect
              x="${x}"
              y="${y}"
              width="${actualBarWidth}"
              height="${barHeight}"
              fill="${data.color}"
              rx="4"
              ry="4"
            >
              <animate attributeName="height" dur="1s" values="0;${barHeight}" begin="0s"/>
              <animate attributeName="y" dur="1s" values="${padding + height};${y}" begin="0s"/>
            </rect>
            <text
              x="${x + actualBarWidth / 2}"
              y="${y - 10}"
              text-anchor="middle"
              fill="white"
              font-size="12"
              opacity="${animatedProgress}"
            >${data.value}%</text>
            <text
              x="${x + actualBarWidth / 2}"
              y="${padding + height + 20}"
              text-anchor="middle"
              fill="rgba(255,255,255,0.8)"
              font-size="10"
              transform="rotate(-45, ${x + actualBarWidth / 2}, ${padding + height + 20})"
            >${data.label}</text>
          `;
        }).join('')}
      </g>
    `;
  }

  private renderLineChart(width: number, height: number, maxValue: number, padding: number): string {
    const pointSpacing = width / (this.chartData.length - 1);
    const animatedProgress = this.options.animate ? this.animationProgress : 1;

    const points = this.chartData.map((data, index) => ({
      x: padding + index * pointSpacing,
      y: padding + height - (data.value / maxValue) * height,
      data
    }));

    const pathData = points
      .slice(0, Math.floor(points.length * animatedProgress) || 1)
      .map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');

    return `
      <g class="line-chart">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(factor => `
          <line 
            x1="${padding}" 
            y1="${padding + height * factor}" 
            x2="${padding + width}" 
            y2="${padding + height * factor}" 
            stroke="rgba(255,255,255,0.1)" 
            stroke-width="1"
          />
        `).join('')}
        
        <!-- Line path -->
        <path
          d="${pathData}"
          fill="none"
          stroke="#667eea"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Data points -->
        ${points.map((point, index) => 
          index < Math.floor(points.length * animatedProgress) ? `
            <circle
              cx="${point.x}"
              cy="${point.y}"
              r="6"
              fill="${point.data.color}"
              stroke="white"
              stroke-width="2"
            >
              <animate attributeName="r" dur="0.3s" values="0;6" begin="${index * 0.1}s"/>
            </circle>
            <text
              x="${point.x}"
              y="${point.y - 15}"
              text-anchor="middle"
              fill="white"
              font-size="12"
            >${point.data.value}%</text>
          ` : ''
        ).join('')}
      </g>
    `;
  }

  private renderPieChart(width: number, height: number): string {
    const centerX = width / 2 + 40;
    const centerY = height / 2 + 40;
    const radius = Math.min(width, height) / 2 - 20;
    
    const total = this.chartData.reduce((sum, data) => sum + data.value, 0);
    let currentAngle = -90;
    const animatedProgress = this.options.animate ? this.animationProgress : 1;

    return `
      <g class="pie-chart">
        ${this.chartData.map((data, index) => {
          const angle = (data.value / total) * 360 * animatedProgress;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos(startAngle * Math.PI / 180);
          const y1 = centerY + radius * Math.sin(startAngle * Math.PI / 180);
          const x2 = centerX + radius * Math.cos(endAngle * Math.PI / 180);
          const y2 = centerY + radius * Math.sin(endAngle * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            'M', centerX, centerY,
            'L', x1, y1,
            'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return `
            <path
              d="${pathData}"
              fill="${data.color}"
              stroke="white"
              stroke-width="2"
            >
              <animateTransform
                attributeName="transform"
                type="scale"
                dur="1s"
                values="0,0;1,1"
                begin="${index * 0.1}s"
                transform-origin="${centerX} ${centerY}"
              />
            </path>
          `;
        }).join('')}
      </g>
    `;
  }

  private renderDoughnutChart(width: number, height: number): string {
    const centerX = width / 2 + 40;
    const centerY = height / 2 + 40;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.5;
    
    const total = this.chartData.reduce((sum, data) => sum + data.value, 0);
    let currentAngle = -90;
    const animatedProgress = this.options.animate ? this.animationProgress : 1;

    return `
      <g class="doughnut-chart">
        ${this.chartData.map((data, index) => {
          const angle = (data.value / total) * 360 * animatedProgress;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + outerRadius * Math.cos(startAngle * Math.PI / 180);
          const y1 = centerY + outerRadius * Math.sin(startAngle * Math.PI / 180);
          const x2 = centerX + outerRadius * Math.cos(endAngle * Math.PI / 180);
          const y2 = centerY + outerRadius * Math.sin(endAngle * Math.PI / 180);
          
          const x3 = centerX + innerRadius * Math.cos(endAngle * Math.PI / 180);
          const y3 = centerY + innerRadius * Math.sin(endAngle * Math.PI / 180);
          const x4 = centerX + innerRadius * Math.cos(startAngle * Math.PI / 180);
          const y4 = centerY + innerRadius * Math.sin(startAngle * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            'M', x1, y1,
            'A', outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
            'L', x3, y3,
            'A', innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
            'Z'
          ].join(' ');

          currentAngle += angle;

          return `
            <path
              d="${pathData}"
              fill="${data.color}"
              stroke="white"
              stroke-width="2"
            />
          `;
        }).join('')}
        
        <!-- Center text -->
        <text
          x="${centerX}"
          y="${centerY - 5}"
          text-anchor="middle"
          fill="white"
          font-size="14"
          font-weight="bold"
        >Total</text>
        <text
          x="${centerX}"
          y="${centerY + 15}"
          text-anchor="middle"
          fill="#667eea"
          font-size="20"
          font-weight="bold"
        >${total}%</text>
      </g>
    `;
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
      }

      .chart-container {
        background: rgba(255, 255, 255, 0.05);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      h3 {
        color: #667eea;
        margin: 0 0 8px 0;
        font-size: 1.4rem;
      }

      .chart-description {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 24px 0;
        line-height: 1.5;
      }

      .chart-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }

      .chart-type-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .chart-type-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .chart-type-btn.active {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-color: #667eea;
      }

      .chart-wrapper {
        display: flex;
        justify-content: center;
        margin: 24px 0;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 20px;
      }

      .chart-svg {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }

      .chart-legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin: 24px 0;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
      }

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .legend-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
      }

      .chart-stats {
        margin: 24px 0;
      }

      .stat-group h4 {
        color: #fff;
        margin: 0 0 12px 0;
        font-size: 1.1rem;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-item:last-child {
        border-bottom: none;
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.7);
      }

      .stat-value {
        color: #667eea;
        font-weight: 600;
      }

      .data-controls {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 24px;
      }

      .action-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      @media (max-width: 768px) {
        .chart-wrapper {
          padding: 10px;
        }
        
        .chart-svg {
          width: 100%;
          height: auto;
        }
        
        .chart-controls, .data-controls {
          gap: 6px;
        }
        
        .chart-type-btn, .action-btn {
          padding: 6px 10px;
          font-size: 0.8rem;
        }
        
        .chart-legend {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  protected setupEventListeners(): void {
    this.shadow.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (target.classList.contains('chart-type-btn')) {
      const chartType = target.getAttribute('data-type') as ChartOptions['type'];
      this.changeChartType(chartType);
    }

    const action = target.getAttribute('data-action');
    if (action) {
      event.preventDefault();
      this.handleDataAction(action);
    }
  }

  private changeChartType(type: ChartOptions['type']): void {
    this.options.type = type;
    this.setAttribute('chart-type', type);
    this.animationProgress = 0;
    
    if (this.options.animate) {
      this.startDataAnimation();
    } else {
      this.render();
    }

    this.emit('chartTypeChange', { type });
  }

  private handleDataAction(action: string): void {
    switch (action) {
      case 'randomize':
        this.randomizeData();
        break;
      case 'add':
        this.addDataPoint();
        break;
      case 'reset':
        this.resetData();
        break;
    }
  }

  private randomizeData(): void {
    this.chartData = this.chartData.map(data => ({
      ...data,
      value: Math.floor(Math.random() * 40) + 5
    }));
    
    this.animationProgress = 0;
    this.startDataAnimation();
    this.emit('dataChange', { data: this.chartData });
  }

  private addDataPoint(): void {
    const colors = ['#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#f39c12'];
    const labels = ['Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Swift'];
    
    const availableLabels = labels.filter(label => 
      !this.chartData.some(data => data.label === label)
    );
    
    if (availableLabels.length > 0) {
      const randomLabel = availableLabels[Math.floor(Math.random() * availableLabels.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      this.chartData.push({
        label: randomLabel,
        value: Math.floor(Math.random() * 30) + 5,
        color: randomColor
      });
      
      this.animationProgress = 0;
      this.startDataAnimation();
      this.emit('dataChange', { data: this.chartData });
    }
  }

  private resetData(): void {
    this.chartData = [
      { label: 'JavaScript', value: 35, color: '#f7df1e' },
      { label: 'TypeScript', value: 25, color: '#3178c6' },
      { label: 'React', value: 20, color: '#61dafb' },
      { label: 'Vue.js', value: 15, color: '#4fc08d' },
      { label: 'Angular', value: 5, color: '#dd0031' }
    ];
    
    this.animationProgress = 0;
    this.startDataAnimation();
    this.emit('dataChange', { data: this.chartData });
  }

  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    this.initializeOptions();
    this.animationProgress = 0;
    this.startDataAnimation();
  }

  protected cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Public API methods
  public getChartData(): Readonly<ChartData[]> {
    return [...this.chartData];
  }

  public setChartData(data: ChartData[]): void {
    this.chartData = [...data];
    this.animationProgress = 0;
    this.startDataAnimation();
  }

  public getChartType(): ChartOptions['type'] {
    return this.options.type;
  }
}