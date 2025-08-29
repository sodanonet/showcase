# Angular Remote Micro-Frontend

A comprehensive Angular 17 micro-frontend application built with Module Federation, showcasing modern Angular development practices, TypeScript expertise, and enterprise-level component architecture.

## 🚀 Features

- **Angular 17**: Latest Angular with standalone components and modern features
- **TypeScript 5.3**: Full type safety with advanced TypeScript patterns
- **Module Federation**: Micro-frontend architecture with webpack integration
- **RxJS Observables**: Reactive programming patterns and stream management
- **Advanced Components**: Interactive dashboards, data tables, and form handling
- **Enterprise UI**: Professional styling with responsive design
- **Real-time Updates**: Live data streams and dynamic content updates

## 🛠️ Tech Stack

- Angular 17.3+
- TypeScript 5.3
- RxJS 7.8+
- Zone.js 0.14+
- Webpack 5 with Module Federation
- Angular CLI 17
- CSS3 with modern features

## 📦 Installation

```bash
cd angular-remote
npm install
```

## 🚀 Development

Start the development server:

```bash
npm start
# or
ng serve
```

The application will be available at: http://localhost:3004

## 🏗️ Build

Build for production:

```bash
npm run build
# or
ng build
```

## 🔗 Module Federation

This application exposes the following modules:

- **Module Name**: `angular_remote`
- **Remote Entry**: `remoteEntry.js`
- **Port**: 3004
- **Exposed Components**:
  - `./Component` - Main Angular remote component

### Integration Example

To consume this micro-frontend in a shell application:

```javascript
// webpack.config.js in shell application
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    angular_remote: 'angular_remote@http://localhost:3004/remoteEntry.js',
  },
});

// In your shell component
const AngularRemoteComponent = React.lazy(() => import('angular_remote/Component'));

function ShellApp() {
  return (
    <Suspense fallback={<div>Loading Angular Remote...</div>}>
      <AngularRemoteComponent />
    </Suspense>
  );
}
```

## 📁 Project Structure

```
src/
├── app/
│   ├── remote-component/           # Main showcase component
│   │   ├── remote-component.component.ts
│   │   ├── remote-component.component.html
│   │   └── remote-component.component.css
│   ├── angular-features/           # Angular framework features demo
│   │   ├── angular-features.component.ts
│   │   ├── angular-features.component.html
│   │   └── angular-features.component.css
│   ├── data-table/                 # Enterprise data table component
│   │   ├── data-table.component.ts
│   │   ├── data-table.component.html
│   │   └── data-table.component.css
│   ├── app.component.ts            # Root component
│   └── app.module.ts               # App module with dependencies
├── main.ts                         # Application bootstrap
├── polyfills.ts                    # Browser polyfills
├── styles.css                      # Global styles
└── index.html                      # HTML template
```

## 🎯 Component Features

### Main Remote Component
- **Interactive Counter**: Increment, decrement, and reset functionality
- **Task Management System**: Full CRUD operations with filtering and search
- **Analytics Dashboard**: Data visualization with statistics
- **Real-time Clock**: Live timestamp updates
- **Form Validation**: Reactive forms with validation patterns

### Data Table Component
- **Employee Management**: Sortable, filterable data table
- **Advanced Filtering**: Search, department, and status filters
- **Column Sorting**: Click-to-sort with visual indicators
- **Statistics Panel**: Real-time calculations and summaries
- **Responsive Design**: Mobile-optimized table layout

### Angular Features Component
- **Data Binding**: Two-way binding, property binding, event binding
- **RxJS Observables**: Live data streams with proper subscription management
- **Lifecycle Hooks**: Demonstration of Angular lifecycle methods
- **Pipes**: Built-in Angular pipes showcase
- **Directives**: Structural and attribute directives examples

## 🧪 Angular Concepts Demonstrated

### Component Architecture
```typescript
@Component({
  selector: 'app-remote-component',
  templateUrl: './remote-component.component.html',
  styleUrls: ['./remote-component.component.css']
})
export class RemoteComponent implements OnInit, OnDestroy {
  // Component logic with lifecycle hooks
}
```

### Reactive Programming
```typescript
currentTimestamp$ = interval(1000).pipe(
  map(() => new Date().getTime()),
  takeUntil(this.destroy$)
);
```

### Form Management
```typescript
this.newTaskForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  priority: ['medium', Validators.required]
});
```

### Data Binding & Directives
```html
<input [(ngModel)]="searchTerm" (input)="applyFilters()" />
<div *ngFor="let task of filteredTasks; trackBy: trackByTaskId">
  <span [class.completed]="task.completed">{{ task.name }}</span>
</div>
```

## 📈 Performance Features

- **Change Detection**: OnPush strategy for optimized performance
- **TrackBy Functions**: Efficient list rendering with object tracking
- **Lazy Loading**: Module Federation enables dynamic loading
- **AOT Compilation**: Ahead-of-Time compilation for production builds
- **Tree Shaking**: Dead code elimination for smaller bundles

## 🎨 Styling Features

- **Modern Design**: Professional enterprise UI with gradients
- **Responsive Layout**: Mobile-first design with CSS Grid and Flexbox
- **Smooth Animations**: CSS transitions and keyframe animations
- **Component Isolation**: Scoped styling with ViewEncapsulation
- **Theme Consistency**: Consistent color palette and typography

## 🧪 Development Patterns

### Service Injection
- Dependency injection patterns
- Service providers and modules
- Singleton services

### State Management
- Component state management
- Form state with reactive forms
- Observable state patterns

### Error Handling
- Form validation and error display
- Runtime error handling
- Type safety with TypeScript

## 🔧 Configuration

### Angular Configuration
- **angular.json**: Project configuration with Module Federation
- **tsconfig.json**: TypeScript compiler options
- **webpack.config.js**: Module Federation setup

### Module Federation Setup
```javascript
new ModuleFederationPlugin({
  name: "angular_remote",
  filename: "remoteEntry.js",
  exposes: {
    "./Component": "./src/app/remote-component/remote-component.component.ts",
  },
  shared: {
    "@angular/core": { singleton: true, strictVersion: true },
    "@angular/common": { singleton: true, strictVersion: true },
    "rxjs": { singleton: true, strictVersion: true }
  }
})
```

## 🌟 Showcase Purpose

This project demonstrates:

**Angular Expertise:**
- Angular 17 framework mastery
- Component architecture and lifecycle
- Reactive forms and validation
- RxJS and observable patterns
- Directive usage and custom implementations

**TypeScript Proficiency:**
- Advanced type definitions and interfaces
- Generic types and utility types
- Decorators and metadata
- Async/await patterns and Promise handling

**Enterprise Development:**
- Data table components with sorting/filtering
- Form validation and user input handling
- Real-time data updates and streaming
- Performance optimization techniques

**Micro-Frontend Architecture:**
- Module Federation implementation
- Cross-framework integration capabilities
- Shared dependency management
- Independent deployment readiness

## 🚀 Integration Ready

This Angular Remote is designed to integrate with:
- React shell applications
- Vue.js host applications
- Angular shell applications
- Vanilla JavaScript containers
- Any Module Federation compatible host

The component is fully self-contained with its own styling, state management, and Angular runtime, making it perfect for demonstrating micro-frontend architecture and Angular development expertise.