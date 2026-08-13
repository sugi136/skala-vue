import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // [문법] loadEnv — vite.config.js 는 Node 환경에서 실행되므로
  //        import.meta.env 를 쓸 수 없다. 직접 .env 를 읽어야 한다.
  //        세 번째 인자를 ''(빈 문자열)로 주면 VITE_ 접두사가 없는 변수도 읽는다.
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
    // [경로 통일] 배포 환경의 서버리스 함수(api/data-go.js)와 같은
    //        /api/data-go 경로를 쓴다. 덕분에 애플리케이션 코드는
    //        개발과 배포를 구분하지 않아도 된다.
    //
    // [동작] 브라우저가 /api/data-go?path=/1360000/... 로 요청하면
    //        이 프록시가 https://apis.data.go.kr/1360000/... 로 전달한다.
    // --------------------------------------------
    server: {
      proxy: {
        '/api/data-go': {
          target: 'https://apis.data.go.kr',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost')
            const params = url.searchParams

            // path 파라미터를 실제 엔드포인트로 사용하고 쿼리에서 제거한다
            const realPath = params.get('path') ?? ''
            params.delete('path')

            // 서버리스 함수와 마찬가지로 키는 여기서 주입한다
            params.set('serviceKey', env.DATA_GO_KR_API_KEY ?? '')

            return `${realPath}?${params.toString()}`
          },
        },
      },
    },
  }
})
