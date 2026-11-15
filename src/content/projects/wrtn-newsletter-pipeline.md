## 나만을 위한 맞춤형 뉴스레터

“나만을 위한 맞춤형 뉴스레터”는 사용자의 메모리를 기반으로 목표와 관심사에 최적화된 콘텐츠를 자동으로 큐레이션하여 전달합니다.

사용자는 자신이 설정한 목표와 연관된 유익한 정보를 매일 받아볼 수 있으며, 단순히 정보 제공을 넘어 개인화된 인사이트를 얻을 수 있습니다.

<figure>
  <a href="/projects/wrtn-newsletter/newsletter-screen.png"><img src="/projects/wrtn-newsletter/newsletter-screen.png" alt="뤼튼 서비스에서 개인 맞춤형 뉴스레터 목록을 열어 본 화면" width="2048" height="990" loading="lazy" /></a>
  <figcaption>뤼튼의 맞춤형 뉴스레터 목록</figcaption>
</figure>

## 업무 내용

- 콘텐츠 수집 데이터 파이프라인 개발
  - YouTube 영상, 댓글, 채널, 자막 정보 수집 파이프라인 개발
  - LLM 기반 필터링 로직 및 재가공 파이프라인 개발
- 데일리 뉴스레터 배치 파이프라인 개발
- LLM 토큰 사용량과 Latency, UseCase별 지연시간 측정을 위한 Datadog 모니터링 대시보드 구축
- GitLab CI/CD 배포 워크플로우 구축

## 사용한 기술

- **Python, LiteLLM**
  - Python은 `asyncio`를 활용한 비동기 I/O 작업에 사용
  - LiteLLM으로 다양한 LLM 모델을 통합 관리
- **Airflow, AWS Batch, AWS ECR**
  - Airflow DAG로 작업 의존성을 분리하고 실행 상태를 모니터링
  - AWS Batch로 병렬 처리에 필요한 컨테이너 작업 관리
  - AWS ECR을 활용해 Docker 이미지 배포 및 버전 관리
- **GCP BigQuery, Elasticsearch**
  - GCP BigQuery에서 사내 데이터 웨어하우스의 사용자 프로파일링 정보와 대화 내역을 조회
  - Elasticsearch를 벡터 검색 기반 개인화 콘텐츠 매칭 엔진으로 사용
- **Datadog, Grafana**
  - 실시간 성능 지표 모니터링

## 목표. 나만을 위한 맞춤형 뉴스레터 파이프라인 개발

### 배경

PoC 단계에서 ‘나만의 AI’ 서비스를 통해 사용자의 목표를 기반으로 개인화된 콘텐츠를 LLM으로 생성하여 제공했습니다. 2주간 나만의 AI 사용자를 대상으로 한 실험에서 열람률 44%, 스크랩률 45%를 기록했습니다.

이러한 성과를 바탕으로 뤼튼 3.0 리뉴얼 시 전체 사용자를 대상으로 뉴스레터 서비스를 확대하기로 결정했습니다. 사용자의 이전 대화 내역, 코어메모리, 페르소나 데이터를 활용하여 개인화된 뉴스레터 콘텐츠를 전달하는 파이프라인을 구축했습니다.

### 목표

- **사용자에게 양질의 뉴스레터 콘텐츠를 제공합니다.**
- **사용자 개인에게 맞춤형 뉴스레터 콘텐츠를 매칭합니다.**

### 문제

나만의 AI에서 사용자 정보 기반으로 LLM 콘텐츠를 제공할 때, 10만 명 기준 월 7,500만 원의 운영 비용이 발생했습니다. 3~4일이 지나면 콘텐츠가 반복되어 사용자 경험이 저하됐습니다.

### 해결 방법

콘텐츠 풀 기반 재사용 모델을 도입했습니다. 사용자 정보를 바탕으로 콘텐츠 풀에서 적합한 콘텐츠를 검색하여 개인화된 뉴스레터를 구성하는 방식입니다.

### Action

<figure>
  <a href="/projects/wrtn-newsletter/content-pipeline.webp"><img src="/projects/wrtn-newsletter/content-pipeline.webp" alt="Airflow에서 YouTube 데이터를 수집하고 LLM 평가 및 가공을 거쳐 Elasticsearch에 적재하는 흐름" width="982" height="340" loading="lazy" /></a>
  <figcaption>데이터 수집·가공 및 콘텐츠 풀 구축 파이프라인</figcaption>
</figure>

- **Airflow 기반 데이터 수집 자동화로 중복 콘텐츠 방지 및 다양성 확보**
  - Airflow 기반 YouTube 채널 데이터 일일 수집 (영상, 자막, 댓글)
  - 구독자·조회수 기반 점수 산정과 임계값 필터링으로 품질 관리 및 반복 노출 방지
- **LLM 기반 콘텐츠 평가 및 뉴스레터 콘텐츠 풀 구축**
  - 시의성, 자막 품질, 신뢰성 등 6가지 기준으로 LLM 필터링을 적용해 **고품질 콘텐츠 35% 선별**
  - 제목과 요약을 재가공한 후 청킹 및 임베딩
  - Elasticsearch에 적재해 검색 가능한 콘텐츠 풀 구축

#### 개인화 매칭

<figure>
  <a href="/projects/wrtn-newsletter/personalized-matching.webp"><img src="/projects/wrtn-newsletter/personalized-matching.webp" alt="BigQuery 사용자 정보를 바탕으로 LLM 쿼리 확장, 임베딩, 벡터 검색, 3단계 재정렬을 거쳐 뉴스레터를 매칭하는 흐름" width="2048" height="298" loading="lazy" /></a>
  <figcaption>사용자 데이터를 가공해 뉴스레터를 매칭하는 과정</figcaption>
</figure>

- 온보딩에서 받은 사용자 목표와 관심사를 LLM으로 가공해 코어메모리에 저장
- 벡터 검색과 LLM 기반 3단계 재정렬을 통해 적합도를 추천, 적합, 부적합으로 분류
- 부적합 콘텐츠를 필터링해 추천 품질을 지속적으로 개선

### 문제 해결 1. 비동기 Producer–Consumer 패턴을 활용한 데이터 처리

- **고민했던 부분**
  - BigQuery에서 대용량 사용자 데이터를 일괄 조회할 때 메모리 오버헤드 발생
  - LLM 콘텐츠 생성 지연으로 전체 처리 성능이 떨어져 새벽 시간 내 40만 명 대상 콘텐츠 추천 미완료
- **해결한 부분**
  - Producer는 BigQuery AsyncIterator와 Generator로 데이터를 스트리밍하고 `asyncio.Queue`의 `maxsize`를 제한해 백프레셔를 관리
  - Consumer는 `asyncio.Semaphore`로 LLM 호출의 동시성을 제어하고, 배치 단위로 DB에 일괄 삽입하여 I/O를 최적화
- **노력했던 부분**
  - `_feed_queue`, `_producer`, `_consumer` 모듈에 단일 책임 원칙 적용
  - 의존성 주입으로 UseCase별 재사용성 개선
  - Repository 패턴으로 비즈니스 로직과 데이터 레이어 분리
  - 독립적인 컴포넌트 설계로 테스트 용이성 확보

### 문제 해결 2. LLM 콘텐츠 생성 파이프라인의 성능 최적화 및 안정성 확보

- **문제 상황**
  - 목표는 최대 40만 명에게 제공할 개인화 뉴스레터를 새벽 9시간 이내에 처리하는 것이었습니다.
  - 동일 프롬프트 100개를 사용한 테스트에서는 40만 건에 6시간이 걸렸고, 개인화 프롬프트를 적용한 E2E 테스트에서는 6만 건에 8시간이 걸렸습니다.
  - 초기 테스트에서는 LLM 내부 캐시 효과로 처리량이 높게 측정됐습니다. 개인화 프롬프트에서는 캐시 효과가 사라져 병렬 처리가 필요했습니다.
- **제약 조건**
  - 공용 인프라 자원 충돌로 Airflow 워커 노드를 확장할 수 없었습니다.
  - LLM API 호출 한도를 고려해 실제 처리량을 실험해야 했습니다.
  - EKS 공유 환경에서 AWS Batch에 전용 vCPU를 할당할 수 없었습니다.
- **해결 전략**
  - 전용 Batch Manager Task를 개발해 AWS Batch Job을 중앙에서 제어했습니다.
  - 동시 실행 작업 수를 실시간으로 모니터링하며 API 호출 한도 내에서 작업을 실행했습니다.
- **결과**
  - 분당 1,000건의 콘텐츠를 생성했습니다.
  - 일일 40만 명을 처리할 수 있게 되었고 리뉴얼 이후 안정적으로 운영했습니다.

## 결과

- **LLM 기반 파이프라인 자동화**
  - 6가지 기준으로 전체 콘텐츠 중 35%의 고품질 콘텐츠를 선별했습니다.
  - LLM으로 콘텐츠를 가공해 사용자 친화적인 뉴스레터를 자동 생성했습니다.
- **고정 구독자 35만 명 확보** (전체 사용자의 13.4%)
- **리뉴얼 이후 핵심 지표 개선**
  - 뉴스레터 열람률 **44% → 52%** (8%p 상승)
  - 뉴스레터 스크랩률 **45% → 61%** (16%p 상승)
  - 열람 사용자의 60% 이상이 15초 이상 60초 미만 체류
- 개별 LLM 생성 방식의 월 비용은 10만 명 기준 약 7,500만 원이었고, 콘텐츠 풀 기반 추천 방식에서는 100만 명 기준 약 500만 원으로 줄었습니다.

<figure>
  <a href="/projects/wrtn-newsletter/result-newsletter-feature.webp"><img src="/projects/wrtn-newsletter/result-newsletter-feature.webp" alt="뉴스레터 기능을 추가한 뤼튼 3.0 서비스 화면" width="1686" height="1020" loading="lazy" /></a>
  <figcaption>뤼튼 3.0 뉴스레터 기능</figcaption>
</figure>

<figure>
  <a href="/projects/wrtn-newsletter/result-personalized-recommendations.webp"><img src="/projects/wrtn-newsletter/result-personalized-recommendations.webp" alt="사용자의 대화와 온보딩 정보를 바탕으로 추천한 뉴스레터 목록" width="1919" height="1074" loading="lazy" /></a>
  <figcaption>대화와 온보딩 정보를 반영한 콘텐츠 추천</figcaption>
</figure>

<figure>
  <a href="/projects/wrtn-newsletter/result-mobile-screens.webp"><img src="/projects/wrtn-newsletter/result-mobile-screens.webp" alt="모바일 맞춤형 뉴스레터의 콘텐츠 상세 화면(왼쪽)과 추천 목록(오른쪽)" width="1586" height="1492" loading="lazy" /></a>
  <figcaption>모바일 뉴스레터 상세 화면과 추천 목록</figcaption>
</figure>

<figure>
  <a href="/projects/wrtn-newsletter/result-user-feedback.webp"><img src="/projects/wrtn-newsletter/result-user-feedback.webp" alt="맞춤형 뉴스레터에 대한 사용자 피드백 일부" width="1108" height="1186" loading="lazy" /></a>
  <figcaption>뉴스레터 사용자 피드백</figcaption>
</figure>
