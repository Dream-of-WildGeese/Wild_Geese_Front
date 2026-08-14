import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 서버 CORS 허용 목록이 localhost:5173, localhost:3000으로 고정이라
  // 포트가 밀리면 API 요청이 전부 403으로 막힌다. 밀리는 대신 에러를 내게 한다.
  server: {
    port: 5173,
    strictPort: true,
  },
})
