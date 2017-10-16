// Rollup plugins
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
var pkg = require('./package.json');

export default {
  input: 'index.js',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      moduleName: 'graphHops',
      sourceMap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourceMap: true
    }
  ],
  acorn: {
    allowReserved: true
  },
  // sourceMap: 'inline',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: true  // Default: true
    }),
    commonjs(),
    babel({
      presets: [
        ['es2015', { modules: false }],
      ],
      plugins: [
        'external-helpers',
      ],
      exclude: 'node_modules/babel-runtime/**',
    //   externalHelpers: true,
    }),
  ],
};
