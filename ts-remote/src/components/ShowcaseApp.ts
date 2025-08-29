import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

@Component('ts-showcase-app')
@ObservedAttributes(['theme'])
export class ShowcaseApp extends BaseWebComponent {
  
  protected getTemplate(): string {
    return `
      <div class="showcase-container">
        <header class="showcase-header">
          <h1>TypeScript Remote Micro-Frontend</h1>
          <p>Built with Web Components, Modern TypeScript, and Browser APIs</p>
          <div class="tech-badges">
            <span class="badge">TypeScript 5.3</span>
            <span class="badge">Web Components</span>
            <span class="badge">Shadow DOM</span>
            <span class="badge">Module Federation</span>
          </div>
        </header>

        <main class="showcase-content">
          <!-- Interactive Counter Component -->
          <section class="component-section">
            <h2>Interactive Counter Component</h2>
            <ts-interactive-counter initial-value="0" step="1"></ts-interactive-counter>
          </section>

          <!-- Data Grid Component -->
          <section class="component-section">
            <h2>Data Grid with TypeScript Interfaces</h2>
            <ts-data-grid></ts-data-grid>
          </section>

          <!-- Chart Visualization Component -->
          <section class="component-section">
            <h2>Chart Visualization</h2>
            <ts-chart-visualization chart-type="bar"></ts-chart-visualization>
          </section>

          <!-- Form Validator Component -->
          <section class="component-section">
            <h2>Advanced Form Validation</h2>
            <ts-form-validator></ts-form-validator>
          </section>

          <!-- Web API Demo Component -->
          <section class="component-section">
            <h2>Modern Web APIs Demo</h2>
            <ts-web-api-demo></ts-web-api-demo>
          </section>

          <!-- TypeScript Features Info -->
          <section class="component-section">
            <h2>TypeScript Features Demonstrated</h2>
            <div class="features-grid">
              <div class="feature-card">
                <h3>🏗️ Decorators</h3>
                <p>Custom decorators for component registration and attribute observation</p>
              </div>
              <div class="feature-card">
                <h3>🎯 Generics</h3>
                <p>Type-safe generic functions and classes with constraint types</p>
              </div>
              <div class="feature-card">
                <h3>🔧 Interfaces</h3>
                <p>Strong typing with interfaces, union types, and mapped types</p>
              </div>
              <div class="feature-card">
                <h3>⚡ Modern ES2022</h3>
                <p>Latest JavaScript features with TypeScript compilation</p>
              </div>
              <div class="feature-card">
                <h3>🌐 Web Components</h3>
                <p>Custom elements with Shadow DOM and lifecycle management</p>
              </div>
              <div class="feature-card">
                <h3>🎨 CSS-in-JS</h3>
                <p>Scoped styling with template literals and dynamic styles</p>
              </div>
            </div>
          </section>
        </main>

        <footer class="showcase-footer">
          <p>TypeScript Remote • Port 3005 • Web Components Architecture</p>
        </footer>
      </div>
    `;
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      .showcase-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .showcase-header {
        text-align: center;
        margin-bottom: 40px;
        background: rgba(255, 255, 255, 0.1);
        padding: 40px;
        border-radius: 16px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .showcase-header h1 {
        font-size: 3rem;
        margin: 0 0 16px 0;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 800;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .showcase-header p {
        font-size: 1.2rem;
        margin: 0 0 24px 0;
        opacity: 0.9;
        color: #fff;
      }

      .tech-badges {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .badge {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(5px);
      }

      .showcase-content {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      .component-section {
        background: rgba(255, 255, 255, 0.1);
        padding: 30px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .component-section h2 {
        color: #fff;
        margin: 0 0 20px 0;
        font-size: 1.8rem;
        border-bottom: 3px solid #667eea;
        padding-bottom: 12px;
        display: inline-block;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .feature-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 24px;
        border-radius: 12px;
        border-left: 4px solid #667eea;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .feature-card h3 {
        color: #fff;
        margin: 0 0 12px 0;
        font-size: 1.2rem;
      }

      .feature-card p {
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
        line-height: 1.5;
      }

      .showcase-footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.7);
      }

      @media (max-width: 768px) {
        .showcase-header {
          padding: 30px 20px;
        }
        
        .showcase-header h1 {
          font-size: 2.5rem;
        }
        
        .component-section {
          padding: 20px;
        }
        
        .features-grid {
          grid-template-columns: 1fr;
        }
        
        .tech-badges {
          justify-content: center;
        }
      }

      /* Animation for component entrance */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .component-section {
        animation: fadeInUp 0.6s ease forwards;
        animation-delay: calc(var(--animation-order, 0) * 0.1s);
      }
    `;
  }

  protected setupEventListeners(): void {
    // Add staggered animation delays
    const sections = this.$$('.component-section');
    sections.forEach((section, index) => {
      (section as HTMLElement).style.setProperty('--animation-order', index.toString());
    });

    // Add theme toggle functionality (if needed in the future)
    this.addEventListener('themeChange', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Theme changed to:', customEvent.detail);
    });
  }

  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    if (name === 'theme') {
      // Handle theme changes if needed
      this.emit('themeChange', { theme: newValue });
    }
  }
}