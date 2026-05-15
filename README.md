# FearSignal

FearSignal은 미국 주식시장 분위기를 한눈에 보기 위한 시장 심리 대시보드입니다.

CNN Fear & Greed 값을 그대로 가져오지 않고, 공개적으로 접근 가능한 시장 데이터로 자체 공포와 탐욕 점수를 계산합니다. 이 서비스는 투자 참고용 정보 도구이며, 매수 또는 매도를 권유하는 금융 투자 조언이 아닙니다.

## 주요 기능

- 0-100 범위의 종합 시장 심리 점수 표시
- `극단적 공포`, `공포`, `중립`, `탐욕`, `극단적 탐욕` 구간 표시
- 영어/한국어 화면 전환
- 각 지표의 원본값, 정규화 점수, 출처, 기준 시각, 신뢰도 표시
- 데이터 제공자가 실패하거나 오래된 경우 값을 임의로 만들지 않고 상태와 신뢰도에 반영
- Vercel 배포에 적합한 Next.js 앱 구조

## 사용하는 지표

### 1. Market Momentum

S&P 500 현재값이 최근 125거래일 평균보다 얼마나 위 또는 아래에 있는지 계산합니다.

- 데이터 출처: FRED S&P 500
- 해석: 지수가 125일 평균보다 높을수록 탐욕 쪽 점수가 높아지고, 낮을수록 공포 쪽 점수가 낮아집니다.

### 2. Stock Price Strength

무료 데이터만으로는 전체 시장의 52주 신고가/신저가 데이터를 안정적으로 가져오기 어렵습니다. 현재 구현은 대체 지표로 SPY, QQQ, IWM, RSP가 각자의 52주 가격 범위에서 어디에 있는지 평균냅니다.

- 데이터 출처: Yahoo Finance ETF 일별 차트 데이터
- 해석: 주요 ETF들이 52주 고점에 가까울수록 강한 시장으로 봅니다.
- 추후 개선: 유료 또는 안정적인 52주 신고가/신저가 API를 확인하면 이 지표를 실제 신고가/신저가 기반으로 교체할 수 있습니다.

### 3. Stock Price Breadth

무료 데이터만으로 상승/하락 거래량 원자료를 안정적으로 가져오기 어렵기 때문에 현재는 동일가중 S&P 500 ETF인 RSP와 시가총액가중 S&P 500 ETF인 SPY의 상대 성과를 대체 지표로 사용합니다.

- 데이터 출처: Yahoo Finance SPY/RSP 일별 차트 데이터
- 해석: RSP가 SPY보다 강하면 시장 상승이 일부 대형주에만 몰리지 않고 더 넓게 퍼져 있다고 봅니다.
- 추후 개선: 상승/하락 거래량 데이터를 안정적으로 제공하는 유료 데이터 소스를 붙이면 실제 breadth 지표로 교체할 수 있습니다.

### 4. Put/Call Options

Cboe Daily Market Statistics에서 Total Put/Call Ratio를 가져옵니다.

- 데이터 출처: Cboe Daily Market Statistics
- 해석: 풋 옵션 비중이 높으면 방어적 심리가 강하다고 보고 공포 쪽 점수로 반영합니다.

### 5. Market Volatility

Cboe VIX 과거 데이터를 사용합니다.

- 데이터 출처: Cboe VIX Historical Data
- 해석: VIX가 최근 범위에서 높을수록 시장 불안이 크다고 보고 공포 쪽 점수로 반영합니다.

### 6. Safe Haven Demand

주식 ETF(SPY)와 중기 미국 국채 ETF(IEF)의 20거래일 성과를 비교합니다.

- 데이터 출처: Yahoo Finance SPY/IEF 일별 차트 데이터
- 해석: 주식이 채권보다 강하면 위험 선호가 강한 것으로 보고 탐욕 쪽 점수로 반영합니다.

### 7. Junk Bond Demand

FRED의 ICE BofA US High Yield Option-Adjusted Spread 데이터를 사용합니다.

- 데이터 출처: FRED `BAMLH0A0HYM2`
- 해석: 하이일드 스프레드가 낮을수록 위험 선호가 강하고, 높을수록 시장이 불안하다고 봅니다.

## 자체 Fear & Greed 점수

FearSignal은 CNN Fear & Greed endpoint에 요청하지 않습니다.

CNN 데이터 endpoint는 공식 문서화된 공개 API가 아니며, 자동 요청이 거절될 수 있습니다. 그래서 이 프로젝트는 처음부터 직접 계산한 Fear & Greed 점수를 사용합니다.

현재 자체 점수는 위 7개 구성요소 중 사용 가능한 지표만 평균합니다. 일부 데이터가 실패하면 해당 구성요소를 제외하고 신뢰도를 낮춥니다. 데이터를 임의로 생성해서 정상 데이터처럼 보여주지 않습니다.

## 점수 해석

- `0-24`: 극단적 공포, 분할 매수 관심 구간
- `25-44`: 공포, 매수 관심 구간
- `45-55`: 중립, 관망 구간
- `56-74`: 탐욕, 추격 매수 주의
- `75-100`: 극단적 탐욕, 분할 매도 또는 리스크 축소 관심 구간

점수가 낮을수록 시장 공포가 강하고, 점수가 높을수록 시장 탐욕이 강하다는 뜻입니다.

## 기술 스택

- Next.js 16
- React
- TypeScript
- Vitest
- ESLint
- Vercel 배포 기준

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

## 검증 명령어

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## API

### `/api/snapshot`

현재 시장 심리 스냅샷을 반환합니다.

응답에는 생성 시각, 캐시 상태, 종합 판단, 종합 점수, 신뢰도, 각 지표의 원본값과 출처가 포함됩니다.

### `/api/history`

현재 MVP에서는 실제로 저장된 히스토리가 없기 때문에 과거 데이터를 반환하지 않습니다. 가짜 과거 차트가 실제 시장 기록처럼 보이는 것을 막기 위해 현재는 `501` 응답을 반환합니다.

## Vercel 배포

이 프로젝트는 Vercel 배포에 적합합니다.

1. GitHub 저장소에 코드를 push합니다.
2. Vercel에서 `jimin1012/FearSignal` 저장소를 import합니다.
3. Framework Preset은 Next.js를 선택합니다.
4. Build Command는 `npm run build`를 사용합니다.
5. Output Directory는 별도로 지정하지 않습니다.

현재 MVP는 별도의 API 키나 환경 변수가 없어도 동작하도록 구성되어 있습니다.

## 보안 및 키 관리

현재 프로젝트에는 외부에 노출되면 안 되는 API 키, 토큰, 비밀번호, 데이터베이스 URL이 필요하지 않습니다.

현재 사용하지 않는 항목:

- `.env`
- API Key
- GitHub Token
- Vercel Token
- Database URL
- OpenAI API Key

추후 유료 데이터 제공자나 데이터베이스를 연결할 경우 키 값은 반드시 `.env.local` 또는 Vercel Environment Variables에 저장해야 하며 GitHub에 커밋하면 안 됩니다.

## 현재 한계

- 실시간 매매 신호 서비스가 아닙니다.
- 데이터는 각 제공자의 갱신 주기와 접근 제한의 영향을 받습니다.
- Stock Price Strength와 Stock Price Breadth는 현재 무료 공개 데이터 기반 대체 지표입니다.
- 실제 히스토리 저장 기능은 아직 없습니다.
- 자체 Fear & Greed 점수는 CNN 공식 지표가 아니라 FearSignal 내부 계산값입니다.

## 향후 개선 방향

- 실제 52주 신고가/신저가 데이터 연동
- 실제 상승/하락 거래량 데이터 연동
- 일별 종합 점수 저장 및 히스토리 차트 추가
- Vercel Cron을 이용한 정기 수집
- Supabase, Neon, Vercel KV 같은 저장소 연동
- 지표별 가중치 조정 UI
