const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/module.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'module.js',
    library: { type: 'amd' },
    publicPath: 'public/plugins/neutron-devicemanager-app/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: ['react', '@grafana/data'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              target: 'es2018',
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
      },
    ],
  },
};
