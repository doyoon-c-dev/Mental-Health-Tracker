# Mental Health Tracker

하루의 기분과 기력, 수면 시간, 복약 내역을 기록하고 주간·월간 통계로 변화를 확인하는 모바일 앱입니다. 사용자가 날짜별 기록을 남기고 자신의 생활 패턴을 돌아볼 수 있도록 돕습니다.

> 팀 프로젝트입니다. UI/UX 디자인과 기획을 제외한 프론트엔드 개발을 담당했습니다.

## 주요 기능

### 하루 기록

- 날짜를 선택해 과거 기록을 조회하고 수정
- 5단계 기분 선택 및 1~5점 기력 기록
- 기상 시간, 취침 시간, 일기 메모 입력
- 아침·점심·저녁·취침 전 정기 복약 여부 기록
- 필요시 복용 약(PRN) 종류와 복용 시간 기록
- PRN 약 종류 추가, 이름 수정, 삭제

### 통계

- 주간 기분 및 기력 변화 차트
- 월간 기분 및 기력 변화 차트
- 기간별 평균 점수와 기록 횟수 표시
- 날짜별 기분 기록을 이모지와 색상으로 확인

## 사용 기술

| 구분 | 기술 |
| --- | --- |
| 앱 | React Native, TypeScript, Expo SDK 54 |
| 화면 및 내비게이션 | Expo Router, React Navigation |
| 로컬 데이터베이스 | Expo SQLite |
| 차트 | react-native-chart-kit |
| 날짜 및 시간 | date-fns, dayjs |

## 데이터 저장 구조

앱은 `mindRecord.db` SQLite 데이터베이스를 사용합니다. 데이터베이스 초기화 시 스키마 버전을 확인하고 필요한 테이블을 생성합니다.

- `dayRecord`: 날짜별 기분, 기력, 복약, 기상·취침 시간, 메모
- `regularMedicineSetting`: 정기 복약 항목 및 알람 시간 설정
- `prn`: 사용자가 관리하는 필요시 약 목록
- `prnTaking`: 날짜별 필요시 약 복용 시각

네이티브 앱에서는 데이터가 기기 내 SQLite에 저장되며 별도 백엔드 서버는 사용하지 않습니다. 현재 웹용 DB 구현은 SQLite 미지원 안내 후 `null`을 반환하므로, 웹에서는 기록 저장 기능을 사용할 수 없습니다.

## 실행 방법

### 요구 사항

- Node.js 및 npm
- Expo Go 또는 Android/iOS 개발 환경

### 설치 및 시작

```bash
npm install
npx expo start
```

Expo 개발 서버에서 QR 코드를 스캔하거나 실행할 플랫폼을 선택하세요.

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

웹 실행은 화면 확인용입니다. SQLite 기반 기록 저장은 네이티브 앱에서 이용할 수 있습니다.

정적 검사는 다음 명령으로 실행할 수 있습니다.

```bash
npm run lint
```

## 프로젝트 구조

```text
.
├── app/
│   └── (tabs)/             # 기록 및 통계 화면
├── components/             # 기록 입력, PRN 관리, 차트 및 공통 UI
├── constants/              # 테마 설정
├── hooks/                  # 색상 모드 등 공통 훅
└── src/
    ├── db/                 # SQLite 연결, 스키마, 마이그레이션 및 초기 데이터
    └── repositories/       # 일일 기록 및 복약 데이터 접근
```

## 현재 범위

- 계정, 서버 동기화 및 백엔드 API는 구현되어 있지 않습니다.
- 정기 복약 알람의 사용 여부와 시간을 설정할 수 있지만, 실제 OS 알림을 예약하는 기능은 포함되어 있지 않습니다.
- 기록 및 통계는 현재 구현된 모바일 화면과 로컬 데이터베이스를 기준으로 동작합니다.

## License

[MIT License](LICENSE)
