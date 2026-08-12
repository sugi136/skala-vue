// ============================================
// 5장 Hands on : src/router/index.js
//
// [요구사항 1] 라우터 지연 로딩(Lazy Loading) 적용, Catch-all Route 적용
// ============================================
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // [핵심] createWebHistory — 슬래시(/) 방식의 깔끔한 URL 사용
  //        import.meta.env.BASE_URL 은 Vite 가 주입하는 배포 기준 경로
  //        (10장 배포 시 서브 경로에 올려도 정상 동작하도록)
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'weather-home',
      // [요구사항 1] Lazy Loading — 화살표 함수로 감싸면
      //   앱 시작 시가 아니라 해당 경로에 처음 진입할 때 파일을 내려받는다.
      //   -> 초기 로딩 속도 개선 (10장 build 시 파일이 청크로 분리되는 것을 확인 가능)
      component: () => import('@/views/WeatherHomeView.vue'),
    },
    {
      // [핵심] 동적 경로 매칭 — :cityId 자리에 들어온 값을
      //        컴포넌트에서 route.params.cityId 로 꺼내 쓸 수 있다.
      path: '/weather/:cityId',
      name: 'weather-detail',
      component: () => import('@/views/WeatherDetailView.vue'),
    },
    {
      path: '/about',
      name: 'weather-about',
      component: () => import('@/views/WeatherAboutView.vue'),
    },
    {
      // [요구사항 6] 본인 추가 view — 즐겨찾기 도시 목록
      path: '/favorites',
      name: 'weather-favorites',
      component: () => import('@/views/FavoriteView.vue'),
    },
    {
      // [요구사항 1] Catch-all Route — 위의 어떤 경로에도 걸리지 않은 주소를 모두 수신
      // [주의] 반드시 배열의 "맨 마지막"에 두어야 한다.
      //        위에 있으면 모든 경로를 이 규칙이 먼저 낚아채 버린다.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],

  // [Customization] 페이지 이동 시 스크롤을 항상 맨 위로
  //   SPA 는 페이지를 갈아끼울 뿐 새로고침이 아니므로
  //   스크롤 위치가 그대로 남는다. 이를 보정한다.
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
