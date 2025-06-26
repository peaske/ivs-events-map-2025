export default defineConfig({
  plugins: [react()],
  // base: '/ivs-events-map-2025/', // この行をコメントアウト
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})