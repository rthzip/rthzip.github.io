## 프로젝트 소개

뤼튼의 AI 검색 품질을 높이기 위해 검색용 지식 베이스를 구축하고, 질의 의도 분류와 최종 답변 생성에 사용하는 프롬프트를 개선했습니다. FastAPI로 백엔드 모듈을 개발하고, Airflow로 외부 출처의 데이터를 주기적으로 수집해 벡터화하는 파이프라인을 구축했습니다.

<figure>
  <a href="/projects/ai-search-system/search-overview.webp"><img src="/projects/ai-search-system/search-overview.webp" alt="뤼튼 AI 검색 기능 소개 화면" width="1615" height="818" loading="lazy" /></a>
</figure>

## 업무 내용

- 재테크와 사건·사고에 관한 외부 데이터 수집 파이프라인을 개발해 RAG 지식 베이스 구축에 기여했습니다.
- AI 검색 답변에 표시되는 참고자료의 시의성을 개선했습니다.
- 질의 의도 분류와 최종 답변의 품질을 평가하고 프롬프트를 개선했습니다.
- `new-collection` 통합 파이프라인을 설계했습니다.

## 사용한 기술

- **Python, FastAPI, LiteLLM**
  - `asyncio`로 I/O 작업을 비동기 처리하고, FastAPI로 백엔드 모듈을 구현했습니다. LiteLLM으로 여러 LLM을 통합 관리했습니다.
- **Airflow, AWS ECR**
  - Airflow로 RAG 지식 베이스용 ETL을 구성하고 AWS ECR로 Docker 이미지의 배포와 버전을 관리했습니다.
- **Elasticsearch, Unleash**
  - Elasticsearch로 벡터 검색을 구현하고, Unleash의 기능 플래그로 개발·운영 환경을 분리해 기능을 테스트했습니다.

## 과제 1. Trending AI 통합 검색 고도화

### 문제 정의

기존 통합 검색은 사회·정치 이슈에 대해 한 번의 웹 검색 결과로 답변을 생성했습니다. 여러 사건이 이어지는 이슈에서는 배경이나 흐름이 빠지고, 충분한 근거 없이 답변이 생성되는 문제가 있었습니다.

### 구현 과정

- **뉴스 데이터 수집 및 전처리**
  - 2010년부터 2025년까지의 뉴스 기사 약 300만 건을 수집했습니다.
  - Airflow로 수집을 자동화하고 S3, BigQuery, Elasticsearch 순서로 데이터를 처리했습니다.
- **사건·사고 클러스터링 및 요약**
  - GPT-4o-mini로 기사에서 핵심 키워드를 추출하고, Apriori 알고리즘으로 키워드 사이의 연관 규칙을 분석해 초기 사건 클러스터를 만들었습니다.
  - 자카드 유사도로 유사한 클러스터를 합친 뒤, LLM으로 기사를 요약하고 사건의 타임라인을 구조화했습니다.
- **멀티소스 검색**
  - 웹 검색과 사건·사고 지식 베이스 검색을 병렬 실행했습니다. Elasticsearch에서 문서 청크와 임베딩을 사용해 벡터 검색을 수행했습니다.
  - LLM으로 질의 의도를 분석해 검색 도구를 선택하고 쿼리를 확장했습니다. Unleash 기능 플래그로 검색 품질과 응답 속도의 균형을 실험했습니다.
- **운영 안정성과 최신성 확보**
  - 과거 데이터를 채우는 백필과 신규 데이터의 일일 증분 업데이트를 설계하고, 프롬프트 A/B 실험으로 답변 품질을 개선했습니다.

### 결과

- 이슈의 배경, 원인, 전개를 종합한 답변을 제공할 수 있게 됐습니다.
- 사용자 평가에서 정보의 신뢰도와 이해도가 개선됐습니다.
- 운영 환경에서 응답 지연을 안정화하고 할루시네이션을 줄였습니다.

아래 비교 이미지에서 왼쪽은 개선 전, 오른쪽은 개선 후입니다. 답변의 말투에는 사용자의 페르소나 설정이 반영됐습니다.

<figure>
  <a href="/projects/ai-search-system/search-timeline-example.webp"><img src="/projects/ai-search-system/search-timeline-example.webp" alt="사건 타임라인 질문에 대한 개선 전후 응답 비교" width="2048" height="1038" loading="lazy" /></a>
  <figcaption>사건 타임라인 검색 응답 비교</figcaption>
</figure>

<figure>
  <a href="/projects/ai-search-system/search-impeachment-example.webp"><img src="/projects/ai-search-system/search-impeachment-example.webp" alt="윤석열 탄핵 타임라인 질문에 대한 개선 전후 응답 비교" width="2048" height="1036" loading="lazy" /></a>
  <figcaption>윤석열 탄핵 타임라인 검색 응답 비교</figcaption>
</figure>

<figure>
  <a href="/projects/ai-search-system/search-tariffs-example.webp"><img src="/projects/ai-search-system/search-tariffs-example.webp" alt="트럼프 관세 정책 질문에 대한 개선 전후 응답 비교" width="2048" height="1035" loading="lazy" /></a>
  <figcaption>트럼프 관세 정책 검색 응답 비교</figcaption>
</figure>

## 과제 2. 참고자료 시의성 개선

### 문제 정의

답변 출처에 오래됐거나 유효하지 않은 자료가 섞여, 사용자가 출처를 열었을 때 관련 정보를 확인하기 어려운 경우가 있었습니다.

### 구현 과정

- **Elasticsearch 슬로우 쿼리 개선**
  - 관련도 점수가 필요 없는 조건에서 `match` 대신 `filter`를 사용했습니다. 점수 계산이 줄고 쿼리 캐시를 활용할 수 있게 되면서 누적 쿼리 시간이 평균 3분의 1 수준으로 줄었습니다.
- **최신 문서에 가중치 적용**
  - 기존 BM25 점수에 `function_score`를 적용해 문서 생성 시점을 순위에 반영했습니다.
  - 상대 날짜값으로 저장된 문서 1,300만 건을 일관된 `datetime` 형식으로 백필했습니다. 이후 `gauss` 감쇠 함수로 최신 문서에 더 높은 가중치를 부여했습니다.

### 결과

- 검색 결과에 최신 참고자료가 더 잘 노출되도록 개선했습니다.
- `filter`와 `function_score` 적용으로 쿼리 비용을 낮추고 **검색 성능을 33% 개선**했습니다.

<figure>
  <a href="/projects/ai-search-system/search-sources.webp"><img src="/projects/ai-search-system/search-sources.webp" alt="개선 후 검색 답변의 출처 목록 화면" width="998" height="570" loading="lazy" /></a>
  <figcaption>시의성을 반영한 답변 출처 목록</figcaption>
</figure>
