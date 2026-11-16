## 프로젝트 소개

시간 단위로 과금되는 Azure OpenAI Service의 PTU 용량을 활용하기 위해 사내 LLM 배치 처리 시스템을 개발했습니다. 실험, 모델 평가, 데이터 가공처럼 즉시 응답이 필요 없는 작업을 큐에 넣고, 실서비스 사용량이 낮을 때 실행하는 구조입니다.

<figure>
  <a href="/projects/llm-batch-queue/batch-overview.webp"><img src="/projects/llm-batch-queue/batch-overview.webp" alt="LLM Batch Queue 프로젝트 소개 이미지" width="2048" height="1116" loading="lazy" /></a>
</figure>

## 업무 내용

- **LLM Batch API 개발**
  - CSV·JSONL 업로드로 대량의 LLM 요청을 접수하는 API를 구현했습니다.
  - 배치 메타데이터는 MongoDB에 저장하고, 개별 요청의 실시간 상태는 Redis에 캐싱했습니다.
- **Azure PTU 리소스 모니터링**
  - Azure Monitor SDK로 PTU 사용률, 요청 차단 오류, 토큰 사용량을 수집했습니다.
  - 현재 사용량을 바탕으로 배치 작업을 시작하거나 대기시키는 로직을 구현했습니다.
- **AWS 기반 큐잉 및 배치 처리**
  - AWS SQS FIFO 큐로 요청을 관리하고 DLQ를 연동해 실패한 메시지를 다시 처리할 수 있도록 했습니다.
  - AWS Batch에서 LLM 요청을 수행하는 컨테이너 워커를 구현했습니다.
- **운영 대시보드 구축**
  - Datadog으로 LLM 토큰 사용량과 배치 요청량을 모니터링했습니다.

## 사용한 기술

- **FastAPI, MongoDB, Docker**
  - FastAPI와 `asyncio`로 I/O 작업을 비동기 처리하고, Pydantic으로 입력 검증과 API 문서화를 구성했습니다.
  - 페이로드 구조가 달라질 수 있는 배치 메타데이터는 MongoDB에 저장하고, Docker로 개발·테스트·운영 환경을 맞췄습니다.
- **AWS SQS, AWS Batch, AWS ElastiCache, AWS S3**
  - SQS로 작업을 큐잉하고 AWS Batch에서 컨테이너를 실행했습니다. ElastiCache는 빈번한 상태 조회에, S3는 결과 파일 저장에 사용했습니다.
- **Datadog, Loki, Grafana**
  - 배치 처리 지표와 운영 상태를 모니터링했습니다.

## 문제 정의

Azure OpenAI PTU는 시간 단위로 비용이 발생하지만, 새벽 2시부터 7시까지는 서비스 트래픽이 줄면서 예약한 용량의 일부가 비었습니다. 동시에 연구·실험 팀에서는 모델 평가나 데이터셋 분류를 위해 OpenAI API를 대량으로 호출해야 했습니다.

실서비스와 사내 작업이 PTU를 동시에 쓰면 응답 지연과 호출 한도 문제가 서비스에 영향을 줄 수 있었습니다. 당시에는 사내 작업을 OpenAI API나 OpenAI Batch API로 별도 처리했습니다. 사내 사용자가 쉽게 요청을 등록하고, PTU 사용량이 낮을 때만 배치를 처리할 수 있는 시스템을 목표로 삼았습니다.

## 구현 과정

### LLM Batch 백엔드 API

모델 평가나 데이터셋 분류 요청을 하나의 파일로 묶어 제출하면 비동기 실행되는 API를 개발했습니다. 입력 형식은 CSV와 JSONL이며 최대 1GB를 지원합니다. 작업마다 고유한 `batch_id`를 발급하고, 상태를 나눠 진행 상황을 확인할 수 있게 했습니다.

| 상태 | 의미 |
| --- | --- |
| `standby` | 입력 파일 업로드 완료 |
| `validate` | 파일에 포함된 개별 요청을 Pydantic 모델로 검증 중 |
| `queued` | 메시지 큐 등록 완료 |
| `in_progress` | Batch Worker에서 처리 중 |
| `finalizing` | 요청 처리를 마치고 결과를 정리 중 |
| `completed` | 결과 파일 업로드 완료 |
| `cancelled` | 사용자가 작업을 중단함 |
| `failed` | Batch API 오류로 작업이 실패함 |

메타데이터는 MongoDB에, 개별 요청의 상태는 AWS ElastiCache의 Redis에 저장했습니다. Consumer는 SQS FIFO 큐를 롱 폴링하고, PTU 사용량이 실행 기준을 충족할 때만 AWS Batch Job을 시작합니다.

컨테이너 워커는 한 배치의 요청을 순차 처리하면서 PTU 사용량을 지속적으로 확인하고 Redis에 진행 상태를 갱신합니다. 최종 결과는 S3에 저장되며, 사용자는 사전 서명 URL로 결과 파일을 내려받을 수 있습니다.

<figure>
  <a href="/projects/llm-batch-queue/batch-api.webp"><img src="/projects/llm-batch-queue/batch-api.webp" alt="파일 업로드부터 큐 등록, Batch Worker 실행, S3 결과 저장까지의 LLM Batch API 처리 구조" width="2048" height="1028" loading="lazy" /></a>
  <figcaption>LLM Batch API 처리 구조</figcaption>
</figure>

### Azure PTU 리소스 모니터링

Azure Monitor SDK로 다음 지표를 1분마다 수집해 Redis에 저장했습니다. Consumer의 배치 시작 여부와 워커의 개별 요청 실행 여부를 판단하는 데 사용했습니다.

- `AzureOpenAIProvisionedManagedUtilizationV2`는 할당한 처리량 대비 실제 사용 비율입니다.
- `BlockedCalls`는 Azure에서 차단한 요청 수입니다.
- `TokenTransaction`은 전체 토큰 트랜잭션 횟수입니다.

## 결과

- Azure OpenAI PTU의 유휴 시간을 활용해 OpenAI API를 직접 호출하는 방식 대비 **월 600달러 이상**을 절감했습니다.
- 비개발팀도 배치 작업을 제출할 수 있도록 Retool 화면을 제공했습니다.
- 클린 아키텍처로 백엔드를 구성해 이후 기능을 확장할 수 있도록 했습니다.
