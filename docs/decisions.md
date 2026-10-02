# 결정 기록

되돌리기 어려운 기술·제품 선택만 기록한다.

## 2026-10-01 브랜드와 식별자

- 브랜드: 내곁의. 첫 앱 이름: 내곁의 디데이.
- 식별자: `com.naegyeot.dday` (Android applicationId / iOS bundleIdentifier 공통)
- 근거: 사용자 확정. 스토어 출시 후에는 바꿀 수 없다.

## 2026-10-02 브랜치 운영

- 개발은 `develop`, `main`은 병합 요청이 있을 때만 갱신한다.
- 첫 커밋(c3e912e)은 `develop` 도입 전에 `main`에 직접 올라갔다.

## 2026-10-02 기술 구성

- Expo SDK 57 + development build, Expo Router(`src/app/`). Expo Go로는 알림·위젯을 검증하지 않는다.
- `android/`, `ios/`는 커밋하지 않고 `npx expo prebuild`로 생성한다(CNG). 네이티브 변경은 `app.json` 플러그인 설정으로만 한다.
- 저장소: AsyncStorage에 `{ version, items }` JSON 한 덩어리. 스키마 버전보다 새 데이터나 손상 데이터는 덮어쓰지 않는다.
- 알림: 저장할 때마다 이 앱의 예약을 모두 취소하고 다시 예약한다. 반복 디데이는 2년치, 전체 최대 60개(iOS 64개 제한).
- 위젯: `react-native-android-widget`. iOS 위젯은 별도 구현 대상이다.
- 일수 표기: 표시 라벨은 D-n / D-Day / D+n, 지난 일수는 기준일을 1일째로 센다(한국식). 100일째 = 기준일 + 99일.

## 2026-10-02 분류와 날짜 선택

- 분류 연인(`couple`)·개인(`personal`)·업무(`work`) 추가. 저장 스키마 버전 2, 버전 1 기록은 개인으로 마이그레이션한다.
- 날짜 선택은 OS 기본 달력 대신 직접 만든 년·월·일 휠 시트를 쓴다. 기본 달력은 연도·월 이동이 불편하다는 사용자 피드백. `@react-native-community/datetimepicker` 제거.
