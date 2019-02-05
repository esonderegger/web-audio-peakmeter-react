const rollupBabel = require('rollup-plugin-babel');
const rollupUglify = require('rollup-plugin-uglify');

const config = {
  input: 'src/Peakmeter.jsx',
  external: ['react'],
  plugins: [
    rollupBabel(),
    rollupUglify.uglify(),
  ],
  output: {
    format: 'umd',
    name: 'Peakmeter',
    globals: {
      react: 'React',
    },
  },
};

export default config;
