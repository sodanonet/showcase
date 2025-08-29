import './components/ShowcaseApp';
import './components/InteractiveCounter';
import './components/DataGrid';
import './components/ChartVisualization';
import './components/FormValidator';
import './components/WebAPIDemo';

console.log('🚀 TypeScript Remote with Web Components loaded!');

// Set up global styles for the body when components are loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.style.background) {
    document.body.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  }
});