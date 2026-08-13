// ============================================
// api/data-go.js
//
// [역할] 공공데이터포털(data.go.kr) 요청을 대신 보내주는 서버리스 함수.
//
// [왜 필요한가]
//   data.go.kr 은 CORS 헤더를 보내지 않아 브라우저 직접 호출이 차단된다.
//   개발 중에는 vite.config.js 의 proxy 로 우회했지만,
//   그것은 개발 서버 기능이라 빌드 결과물에는 포함되지 않는다.
//
//   Vercel 은 루트의 api/ 폴더에 있는 파일을 서버리스 함수로 자동 인식한다.
//   서버 간 통신에는 CORS 제약이 없으므로 이 함수가 대신 요청하고
//   응답만 브라우저에 돌려준다.
//
// [위치] src/ 안이 아니라 프로젝트 루트의 api/ 폴더여야 한다.
//
// [호출 형태]
//   /api/data-go?path=/1360000/LivingWthrIdxServiceV5/getUVIdxV5&areaNo=1100000000&time=...
// ============================================

const TARGET_ORIGIN = 'https://apis.data.go.kr'

// --------------------------------------------
// [주의] Vercel 무료 플랜의 함수 실행 제한은 기본 10초다.
//        공공데이터포털은 그보다 오래 걸리는 경우가 있어 늘려둔다.
// --------------------------------------------
export const config = {
  maxDuration: 30,
}

export default async function handler(request, response) {
  // --------------------------------------------
  // 1. 요청 경로와 쿼리 분리
  //
  // path 파라미터로 실제 엔드포인트를 받고, 나머지는 그대로 전달한다.
  // --------------------------------------------
  const { path, ...restQuery } = request.query

  if (!path) {
    return response.status(400).json({ error: 'path 파라미터가 필요합니다.' })
  }

  // [보안] 임의의 주소로 요청을 보내는 통로가 되지 않도록
  //        경로가 / 로 시작하는지만 확인한다.
  if (!path.startsWith('/')) {
    return response.status(400).json({ error: '잘못된 path 형식입니다.' })
  }

  // --------------------------------------------
  // 2. 서비스 키 주입
  //
  // [핵심] 키를 클라이언트에서 넘기지 않고 서버에서 붙인다.
  //        VITE_ 접두사가 없는 환경변수는 브라우저로 전달되지 않으므로
  //        키가 노출되지 않는다. 프록시를 쓰는 부수적인 이점이다.
  // --------------------------------------------
  const serviceKey = process.env.DATA_GO_KR_API_KEY

  if (!serviceKey) {
    return response.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' })
  }

  // --------------------------------------------
  // 3. 쿼리스트링 조립
  // --------------------------------------------
  const params = new URLSearchParams(restQuery)
  params.set('serviceKey', serviceKey)

  const targetUrl = `${TARGET_ORIGIN}${path}?${params.toString()}`

  // --------------------------------------------
  // 4. 대신 요청하고 응답을 그대로 돌려준다
  // --------------------------------------------
  try {
    const upstream = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
    })

    const text = await upstream.text()

    // [주의] 공공데이터포털은 오류 시에도 200 과 함께 XML 을 돌려주는 경우가 있다.
    //        JSON 파싱에 실패하면 원문을 그대로 전달해 호출부가 판단하게 한다.
    try {
      const json = JSON.parse(text)
      // 브라우저가 결과를 잠깐 캐싱하도록 한다 (5분)
      response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
      return response.status(upstream.status).json(json)
    } catch {
      return response.status(upstream.status).send(text)
    }
  } catch (error) {
    console.error('[api/data-go]', error.message)
    return response.status(502).json({ error: '공공데이터포털 요청에 실패했습니다.' })
  }
}
