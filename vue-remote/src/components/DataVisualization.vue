<template>
  <div class="data-visualization">
    <h3>Data Visualization Demo</h3>
    
    <!-- Simple Bar Chart -->
    <div class="chart-container">
      <h4>Sales Performance (Pure CSS Chart)</h4>
      <div class="bar-chart">
        <div 
          v-for="(item, index) in chartData" 
          :key="index" 
          class="bar"
          :style="{ height: `${item.value}%` }"
          :title="`${item.label}: ${item.actual}`"
        >
          <span class="bar-label">{{ item.label }}</span>
          <span class="bar-value">{{ item.actual }}</span>
        </div>
      </div>
    </div>

    <!-- Progress Indicators -->
    <div class="progress-section">
      <h4>Project Progress</h4>
      <div class="progress-list">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="progress-item"
        >
          <div class="progress-header">
            <span>{{ project.name }}</span>
            <span class="progress-percentage">{{ project.progress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ 
                width: `${project.progress}%`,
                backgroundColor: project.color 
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <h4>Real-time Statistics</h4>
      <div class="stats-grid">
        <div 
          v-for="stat in stats" 
          :key="stat.id"
          class="stat-card"
          :class="stat.trend"
        >
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-content">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ formatNumber(stat.value) }}</div>
            <div class="stat-change">
              {{ stat.trend === 'up' ? '↗' : '↘' }} {{ stat.change }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'DataVisualization',
  setup() {
    // Chart data
    const chartData = ref([
      { label: 'Q1', value: 65, actual: 85000 },
      { label: 'Q2', value: 80, actual: 92000 },
      { label: 'Q3', value: 45, actual: 67000 },
      { label: 'Q4', value: 90, actual: 110000 }
    ]);

    // Project progress data
    const projects = ref([
      { id: 1, name: 'Website Redesign', progress: 85, color: '#00b894' },
      { id: 2, name: 'Mobile App', progress: 60, color: '#fdcb6e' },
      { id: 3, name: 'API Integration', progress: 40, color: '#fd79a8' },
      { id: 4, name: 'Testing Phase', progress: 95, color: '#74b9ff' }
    ]);

    // Statistics with real-time updates
    const stats = ref([
      { id: 1, label: 'Users', value: 12547, change: 12.5, trend: 'up', icon: '👥' },
      { id: 2, label: 'Revenue', value: 98750, change: 8.2, trend: 'up', icon: '💰' },
      { id: 3, label: 'Orders', value: 3421, change: -2.1, trend: 'down', icon: '📦' },
      { id: 4, label: 'Growth', value: 15.8, change: 5.7, trend: 'up', icon: '📈' }
    ]);

    // Format numbers for display
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    };

    // Simulate real-time data updates
    let interval;
    
    const updateStats = () => {
      stats.value.forEach(stat => {
        // Random small changes to simulate real-time updates
        const change = (Math.random() - 0.5) * 100;
        stat.value = Math.max(0, stat.value + change);
        stat.change = Math.round((Math.random() - 0.3) * 20 * 10) / 10;
        stat.trend = stat.change > 0 ? 'up' : 'down';
      });
    };

    onMounted(() => {
      // Update stats every 3 seconds
      interval = setInterval(updateStats, 3000);
    });

    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });

    return {
      chartData,
      projects,
      stats,
      formatNumber
    };
  }
};
</script>

<style scoped>
.data-visualization {
  margin-top: 20px;
}

.data-visualization h3 {
  margin: 0 0 20px 0;
  color: #fdcb6e;
  font-size: 1.5em;
}

.data-visualization h4 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 1.1em;
}

.chart-container {
  margin-bottom: 30px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  height: 200px;
  gap: 20px;
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #00b894, #00cec9);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.bar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 11px;
  color: #fdcb6e;
  font-weight: 600;
}

.progress-section {
  margin-bottom: 30px;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #fff;
}

.progress-percentage {
  font-weight: 600;
  color: #fdcb6e;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stats-section {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.stat-card.up {
  border-left-color: #00b894;
}

.stat-card.down {
  border-left-color: #e17055;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2em;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: 700;
  color: #fff;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
}

.stat-card.up .stat-change {
  color: #00b894;
}

.stat-card.down .stat-change {
  color: #e17055;
}

@media (max-width: 768px) {
  .bar-chart {
    height: 150px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 1.5em;
  }
}
</style>