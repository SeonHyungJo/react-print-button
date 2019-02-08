import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
// import resolve from 'rollup-plugin-node-resolve'
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
    // resolve(),
    commonjs({
      include: [
        'node_modules/**'
      ]
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    string({
      include: '**/*.css'
    }),
    // uglify(),
    terser({
      compress: true,
      sourcemap: true
    })
  ]
}
