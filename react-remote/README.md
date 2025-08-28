# React Remote Micro-Frontend

A React micro-frontend application built with Webpack Module Federation that can be consumed by other applications.

## 🚀 Features

- **Module Federation**: Exposes React components as micro-frontend modules
- **Standalone Mode**: Can run independently for development and testing
- **Modern React**: Built with React 19 and modern JavaScript features
- **Interactive Components**: Counter and Todo list demonstrations
- **Responsive Design**: Mobile-friendly UI with gradient styling
- **Hot Reloading**: Development server with fast refresh

## 🛠️ Tech Stack

- React 19
- Webpack 5 with Module Federation
- JavaScript ES6+
- CSS3 with modern features
- Create React App (ejected for custom webpack config)

## 📦 Installation

```bash
cd react-remote
npm install
```

## 🚀 Development

Start the development server:

```bash
npm start
```

The application will be available at: http://localhost:3001

## 🏗️ Build

Build for production:

```bash
npm run build
```

## 🔗 Module Federation

This application exposes the following modules:

- **Module Name**: `react_remote`
- **Remote Entry**: `remoteEntry.js`
- **Exposed Components**:
  - `./App` - Main React application component

### Integration Example

To consume this micro-frontend in a shell application:

```javascript
// webpack.config.js in shell application
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    react_remote: 'react_remote@http://localhost:3001/remoteEntry.js',
  },
});

// In your shell component
const ReactRemoteApp = React.lazy(() => import('react_remote/App'));

function ShellApp() {
  return (
    <Suspense fallback={<div>Loading React Remote...</div>}>
      <ReactRemoteApp />
    </Suspense>
  );
}
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ReactRemoteApp.jsx    # Main component with demos
│   └── ReactRemoteApp.css    # Styling for the component
├── App.js                    # App wrapper
├── bootstrap.js              # Application bootstrap
├── index.js                  # Entry point with dynamic import
└── ...
```

## 🎯 Component Features

### Counter Demo
- Increment/decrement counter
- Smooth animations and transitions
- Visual feedback on interactions

### Todo List Demo
- Add new todos
- Toggle completion status
- Interactive checkboxes
- Responsive list design

## 🎨 Styling

- Modern gradient backgrounds
- Glass-morphism effects with backdrop blur
- Smooth animations and hover effects
- Mobile-responsive design
- CSS custom properties for theming

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📈 Performance

- Code splitting with dynamic imports
- Shared dependencies (React, ReactDOM) for optimal bundle size
- Webpack optimizations for production builds

## 🔧 Configuration

The webpack configuration includes:
- Module Federation plugin setup
- Shared dependencies configuration
- Development server with hot module replacement
- Production optimizations

## 🌟 Showcase Purpose

This project demonstrates:
- Micro-frontend architecture implementation
- Module Federation expertise
- Modern React development practices
- Component design and styling skills
- Build tool configuration and optimization