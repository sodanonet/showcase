const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: 'development',
  
  plugins: [
    new ModuleFederationPlugin({
      name: "angular_remote",
      filename: "remoteEntry.js",
      exposes: {
        "./Component": "./src/app/remote-component/remote-component.component.ts",
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: "^17.0.0" },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: "^17.0.0" },
        "@angular/platform-browser": { singleton: true, strictVersion: true, requiredVersion: "^17.0.0" },
        "@angular/platform-browser-dynamic": { singleton: true, strictVersion: true, requiredVersion: "^17.0.0" },
        "rxjs": { singleton: true, strictVersion: true, requiredVersion: "^7.0.0" },
        "zone.js": { singleton: true, strictVersion: true, requiredVersion: "^0.14.0" },
      },
    }),
  ],
  
  optimization: {
    runtimeChunk: false,
  },
};