import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import uglify from 'rollup-plugin-uglify'
import string from 'rollup-plugin-string'

const dist = 'dist'
const bundle = 'bundle'

export default {
  input: 'src/PrintButton.js',
  external: ['react'],
  output: [
    {
      file: `${dist}/${bundle}.cjs.js`,
      format: 'cjs'
    },
    {
      file: `${dist}/${bundle}.es.js`,
      format: 'es'
    },
    {
      name: 'ReactCssSpinners',
      file: `${dist}/${bundle}.umd.js`,
      globals: {
        react: 'React'
      },
      format: 'umd'
    }
  ],
  plugins: [
    resolve(),
    // commonjs({
    //   include: 'node_modules/**',
    //   namedExports: {
    //     '/react-dom/index.js': ['findDOMNode']
    //   }
    // }),
    babel({
      exclude: 'node_modules/**'
    }),
    string({
      include: '**/*.css'
    }),
    // production & terser()
    terser()
    // uglify({
    //   compress: {
    //     warnings: false,
    //     conditionals: true,
    //     unused: true,
    //     comparisons: true,
    //     sequences: true,
    //     dead_code: true,
    //     evaluate: true,
    //     if_return: true,
    //     join_vars: true
    //   },
    //   output: {
    //     comments: false
    //   }
    // })
  ]
}
