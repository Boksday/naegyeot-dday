# 출시 빌드

## 서명 키

- 업로드 키: `~/.naegyeot-keys/upload.keystore` (별칭 `upload`, RSA 4096, 유효 10000일, 2026-10-02 생성)
- 비밀번호: `~/.naegyeot-keys/keystore.properties` (권한 600). 저장소·문서·로그에 적지 않는다.
- 인증서 SHA-256: `9C:E4:DB:09:EB:AF:07:01:73:A0:F6:08:0F:AF:65:0A:A8:AB:58:61:0D:DD:E5:20:29:3A:D4:4D:38:8C:00:CB`
- **두 파일을 함께 안전한 곳(비밀번호 관리자, 암호화한 외장 저장소 등)에 따로 백업한다.** Play 앱 서명을 쓰면 업로드 키를 잃어도 Play Console에서 재설정을 요청할 수 있지만 며칠 걸린다.
- 서명 설정은 `plugins/withReleaseSigning.js`가 prebuild 때 `android/app/build.gradle`에 넣는다. 키 파일이 없으면 디버그 키로 대신 서명하지 않고 서명 없는 결과물이 나온다.

## 빌드

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
npm run build:android:release   # 직접 설치용 APK: android/app/build/outputs/apk/release/app-release.apk
npm run build:android:bundle    # Play 업로드용 AAB: android/app/build/outputs/bundle/release/app-release.aab
```

- Gradle 메모리 한도는 `plugins/withGradleProperties.js`가 설정한다(기본값으로는 Kotlin 컴파일이 Metaspace 부족으로 실패했다).
- 서명 확인: `apksigner verify --print-certs <apk>`의 SHA-256이 위 지문과 같아야 한다.

## 버전

- `app.json`의 `expo.version`(표시 버전)과 `expo.android.versionCode`(업로드마다 1씩 증가)를 함께 관리한다.
- 현재: 1.0.2 (versionCode 3, 내부 테스트용 Pro 무료 빌드). versionCode 1은 내부 테스트에 올라갔다.
- 내부 테스트에서 설치한 앱은 Play 앱 서명 키로 서명돼 있어, 로컬 빌드(업로드 키)로 덮어 설치할 수 없다. 새 버전은 내부 테스트로 올려 Play에서 업데이트한다.

## 출시 빌드에서 달라지는 점

- 개발 도구(설정 화면의 개발용 항목, 위젯 미리보기 화면)와 Expo 개발 메뉴가 없다.
- 광고 자리 표시와 X 상자 자리 표시는 그리지 않는다. 광고 SDK를 연결하면 `AdBannerSlot`이 실제 배너를 그린다.
- 차단한 권한: 저장소 읽기·쓰기, 다른 앱 위에 그리기(`app.json`의 `android.blockedPermissions`).

## 개발 빌드와 바꿔 설치할 때

- 개발 빌드(디버그 키)와 출시 빌드(업로드 키)는 서명이 달라 덮어 설치할 수 없다. 지우고 설치하면 기기 데이터가 지워진다.
- 개발 빌드는 디버그 가능해서 `adb exec-out run-as com.naegyeot.dday cat databases/RKStorage > RKStorage`로 저장 데이터를 꺼낼 수 있다.

## 스토어·광고 관련 주소

- 사이트: https://boksday.github.io (저장소 `Boksday/boksday.github.io`, GitHub Pages)
- 개인정보처리방침: https://boksday.github.io/dday/privacy/
- app-ads.txt: https://boksday.github.io/app-ads.txt (`google.com, pub-8663707140300350, DIRECT, f08c47fec0942fa0`)
- 문의 메일: ekqlszzzz@naver.com
- Play 스토어 등록정보의 "웹사이트"에 https://boksday.github.io 를 넣어야 AdMob이 app-ads.txt를 확인한다.
- 앱 동작(수집 항목, 광고 SDK)이 바뀌면 개인정보처리방침도 함께 고친다.

## 개발용 앱 (기기에서 바로 확인)

```sh
npm run build:android:dev-app   # APP_VARIANT=dev, 패키지 com.naegyeot.dday.dev
adb install android/app/build/outputs/apk/release/app-release.apk
```

- 이름 "내곁의 디데이 개발", 스킴 `naegyeotdday-dev`. 스토어 앱과 나란히 설치되고 데이터도 따로 쓴다.
- Pro가 항상 켜져 있고 테스트 광고만 쓴다. 패키지가 달라 스토어에 올라갈 수 없다.
- `APP_VARIANT`는 prebuild뿐 아니라 gradle 단계(JS 번들, 앱 설정 내장)까지 전달돼야 한다. 스크립트가 `export`로 넘긴다.
- 이 빌드 뒤에 스토어용을 만들 때는 `npm run build:android:release`/`bundle`이 `prebuild --clean`으로 android/를 다시 만든다.

## 내부 테스트용 Pro 무료 빌드

```sh
EXPO_PUBLIC_UNLOCK_PRO=1 npm run build:android:bundle
```

- 결제 없이 Pro(광고 제거, 위젯)가 열린다. **이 AAB를 프로덕션으로 승격하지 않는다.** 정식 출시는 이 값 없이 새로 빌드한다.
