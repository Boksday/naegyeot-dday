// android/gradle.properties에 필요한 값을 넣는다. android/는 prebuild로 다시 만들어지므로 이 플러그인으로 관리한다.
const { withGradleProperties: withExpoGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  // 출시 빌드(Kotlin 컴파일)가 기본 Metaspace 512MB에서 메모리 부족으로 실패해 한도를 늘린다.
  'org.gradle.jvmargs': '-Xmx4g -XX:MaxMetaspaceSize=1536m -Dfile.encoding=UTF-8',
  // react-native-google-mobile-ads 17.2.0의 build.gradle은 app.json에 라이브러리 전용 키가 없으면
  // 정의되지 않은 값을 읽다가 실패한다. 이 속성을 주면 그 분기를 건너뛴다.
  RNGMA_ANDROID_BACKEND: 'classic',
};

module.exports = function withGradleProperties(config) {
  return withExpoGradleProperties(config, (gradleConfig) => {
    const keys = Object.keys(PROPERTIES);
    const properties = gradleConfig.modResults.filter(
      (item) => !(item.type === 'property' && keys.includes(item.key)),
    );
    for (const [key, value] of Object.entries(PROPERTIES)) {
      properties.push({ type: 'property', key, value });
    }
    gradleConfig.modResults = properties;
    return gradleConfig;
  });
};
