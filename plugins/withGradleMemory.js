// 출시 빌드(Kotlin 컴파일)가 기본 Metaspace 512MB에서 메모리 부족으로 실패해 한도를 늘린다.
const { withGradleProperties } = require('expo/config-plugins');

const JVM_ARGS = '-Xmx4g -XX:MaxMetaspaceSize=1536m -Dfile.encoding=UTF-8';

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (gradleConfig) => {
    const properties = gradleConfig.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'org.gradle.jvmargs'),
    );
    properties.push({ type: 'property', key: 'org.gradle.jvmargs', value: JVM_ARGS });
    gradleConfig.modResults = properties;
    return gradleConfig;
  });
};
