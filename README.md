# Mental-Health-Tracker

## 📌 Mental-Health-Tracker
하루의 기분, 기력, 수면, 복약 여부 등을 기록하고 변화를 시각화하는 프론트엔드 모듈입니다.

##
팀 프로젝트의 일부입니다.
저는 UIUX 디자인과 기획을 제외한 전반적인 프론트엔드 개발을 담당하였습니다.

## ✨ 기여한 점

### ✅ 구현
- 기분, 기력, 수면, 복약여부 기록 input form
- user input에 따른 State 변경
- 통계페이지에서 기분과 기력의 변화를 시각화

## 🛠 기술 스택
- React Native
- TypeScript

## Run Locally
- npm install
- npx expo start

## 설계
- 미리 정의된 UI를 기반으로 사용자 흐름 구성
- 하루 기록을 위한 State 구조화 및 관리
- 사용자 데이터 차트를 통해 명확하고 읽기 쉬운 방식으로 표현

## 🚧 한계점
- 백엔드 부재
- 영구 storage 부재(클라이언트 stoarge에서만 처리)

## 🔗 백엔드 통합 계획
- POST /logs → save daily records
- GET /logs → retrieve user history

## 📁 프로젝트 구조
frontend
┣app
┣ components/
┗ hooks/

## 📫 Contact
- doyoon.dev@gmail.com
