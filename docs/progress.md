# 진행 상황

## 완료

- Expo SDK 57 + Expo Router 기본 구성, TypeScript strict, ESLint·Prettier·Jest, `npm run verify`
- 디데이 추가·수정·삭제, 목록(다가오는 순 → 지난 순), 상세 화면
- D-n / D-Day / D+n, 지난 일수(기준일 1일째), 매년 반복(2월 29일 처리)
- 100일 단위 기념일 (상세 화면)
- 로컬 저장(AsyncStorage, 스키마 버전 1), 손상·신규 버전 데이터 보호
- 로컬 알림 예약(당일, 1·3·7일 전, 오전 9시), 저장 시 전체 재예약
- Android 홈 위젯(가까운 디데이 3개), 저장 시 즉시 갱신 + 1시간 주기 갱신
- 분류(연인·개인·업무)와 목록 필터, 저장 스키마 v2 마이그레이션
- 사용자 분류 추가·삭제(분류 관리 화면), 저장 스키마 v3
- 광고 배너 자리 표시(목록 하단, 상세 끝)
- 카드형 화면 디자인, 년·월·일 휠 날짜 선택
- GitHub Actions CI (develop push, PR에서 verify)

## 최근 검증 (2026-10-02)

- 실제 기기(Galaxy Z Flip6, Android 16) 개발 빌드: 목록·입력 화면 표시, 휠 날짜 선택 스크롤·탭, v1 기록 마이그레이션 확인

- `npm run verify` 통과: 타입 검사, 린트, 포맷, 테스트 33개
- `npx expo prebuild --platform android` + `./gradlew assembleDebug` 성공 (debug APK 생성)
- 미검증: 분류 관리 화면·광고 자리 실제 화면(폰이 접혀 있어 미확인), v2→v3 마이그레이션 실기기 확인, 알림 수신, 위젯 표시, iOS 빌드

## 다음 작업

1. 디자인 자산 준비 후 자리 표시 교체 ([assets.md](assets.md))
2. 실제 기기 확인 항목
   - 알림 권한 허용/거부, 예약한 날 오전 9시 수신, 수정·삭제 시 이전 알림 취소
   - 재부팅 후 알림 유지
   - 위젯 추가, 저장 후 즉시 갱신, 자정 이후 갱신
   - 앱 재실행 후 기록 유지
3. 광고(AdMob 후보) 호환성 확인 후 연결
4. 출시 전: 불필요한 권한 정리(`READ/WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` 등 템플릿·디버그 기본값 확인 후 `android.blockedPermissions`), 스플래시 실기기 확인

## 알려진 제약

- iOS 홈 위젯 없음 (WidgetKit 별도 구현 필요)
- 날짜가 바뀐 뒤 위젯 갱신은 최대 1시간 늦을 수 있음
- 앱 아이콘·로고 적용. 빈 화면 일러스트·달력 아이콘은 X 상자 자리 표시, 스플래시는 '내곁의' 로고
