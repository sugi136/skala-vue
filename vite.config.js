import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // --------------------------------------------
  // 개발 서버 프록시
  //
  // [배경] 공공데이터포털(data.go.kr)은 CORS 헤더를 보내지 않는다.
  //        브라우저에서 직접 호출하면 차단되므로,
  //        Vite 개발 서버가 대신 요청하도록 중계한다.
  //
  // [동작] 브라우저가 /api/data-go/... 로 요청
  //        -> Vite 가 https://apis.data.go.kr/... 로 전달
  //        -> 응답을 브라우저에 그대로 반환
  //        서버 간 통신에는 CORS 제약이 없으므로 문제없이 동작한다.
  //
  // [주의] 이 설정은 개발 중에만 유효하다.
  //        배포 시에는 Vercel Serverless Function 등 별도 프록시가 필요하다.
  // --------------------------------------------
  server: {
    proxy: {
      '/api/data-go': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        // /api/data-go/1360000/... -> /1360000/...
        rewrite: (path) => path.replace(/^\/api\/data-go/, ''),
        secure: true,
      },
    },
  },
})
