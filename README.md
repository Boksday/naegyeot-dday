# 내곁의 디데이

기다리는 날과 기념일을 세어 주는 디데이 앱. React Native(Expo) 기반, Android 우선 출시, 서버 없이 기기 안에서 동작한다.

- 제품 범위: [docs/product.md](docs/product.md)
- 결정 기록: [docs/decisions.md](docs/decisions.md)
- 진행 상황: [docs/progress.md](docs/progress.md)
- 출시 빌드·서명: [docs/release.md](docs/release.md)

## 환경

- Node 22, npm
- Android: Android Studio(내장 JDK 21), Android SDK
- iOS: Xcode (아직 빌드 미검증)

Android Studio 내장 JDK를 쓰려면 셸에 다음을 설정한다.

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

## 명령

```sh
npm install
npm run verify        # 타입 검사 → 린트 → 포맷 검사 → 테스트
npm run android       # 네이티브 프로젝트 생성 후 에뮬레이터/기기에 설치·실행
npm start             # 이미 설치한 개발 빌드에 붙을 Metro 서버
npm run prebuild      # android/ios 디렉터리 재생성
npm run build:android:release  # 운영용 APK (JAVA_HOME 필요, 서명 키 필요, docs/release.md)
```

로컬 Android 빌드만 확인하려면:

```sh
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```

네이티브 의존성 버전을 바꾼 뒤 C++ 빌드가 `libworklets.so ... missing` 같은 오류로 실패하면 `rm -rf node_modules/expo-modules-core/android/.cxx node_modules/expo-modules-core/android/build` 후 다시 빌드하고, 개발 서버는 `npx expo start --dev-client --clear`로 캐시를 지워 띄운다.

`android/`, `ios/`는 생성물이라 커밋하지 않는다. 네이티브 설정은 `app.json`의 플러그인으로 바꾼다.
Expo Go에서는 알림·위젯이 동작하지 않으므로 개발 빌드(`npm run android`)로 확인한다.

## Git

- 원격: `https://github.com/Boksday/naegyeot-dday`
- 개발 브랜치: `develop` (main은 병합 요청 시에만 갱신)
