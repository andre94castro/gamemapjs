import neostandard from 'neostandard'

export default neostandard({
  ignores: [
    'dist/**',
    'demo/**/*.js',
    'node_modules/**'
  ],
  ts: true
})