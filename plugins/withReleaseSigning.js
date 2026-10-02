// 출시 빌드 서명 설정을 android/app/build.gradle에 넣는다.
// android/는 prebuild로 다시 만들어지므로 손으로 고치지 않고 이 플러그인으로 반영한다.
// 키와 비밀번호는 저장소 밖 ~/.naegyeot-keys/keystore.properties에 둔다(docs/release.md).
const { withAppBuildGradle } = require('expo/config-plugins');

const SIGNING_BLOCK = `
        release {
            def signingProps = new Properties()
            def signingFile = new File(System.getProperty("user.home"), ".naegyeot-keys/keystore.properties")
            if (signingFile.exists()) {
                signingFile.withInputStream { signingProps.load(it) }
                storeFile new File(signingProps.getProperty("storeFile"))
                storePassword signingProps.getProperty("storePassword")
                keyAlias signingProps.getProperty("keyAlias")
                keyPassword signingProps.getProperty("keyPassword")
            }
        }`;

const RELEASE_SIGNING_LINE = `            signingConfig new File(System.getProperty("user.home"), ".naegyeot-keys/keystore.properties").exists() ? signingConfigs.release : null`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;
    if (contents.includes('.naegyeot-keys/keystore.properties')) return gradleConfig;

    const debugSigning = /(signingConfigs \{\n\s+debug \{[\s\S]*?\n\s{8}\})/;
    if (!debugSigning.test(contents))
      throw new Error('withReleaseSigning: signingConfigs.debug를 찾지 못했어요.');
    contents = contents.replace(debugSigning, `$1${SIGNING_BLOCK}`);

    const releaseDebugSigning =
      /(release \{\n(?:\s*\/\/[^\n]*\n)*)\s+signingConfig signingConfigs\.debug/;
    if (!releaseDebugSigning.test(contents))
      throw new Error('withReleaseSigning: release 서명 줄을 찾지 못했어요.');
    // 키가 없으면 디버그 키로 몰래 서명하지 않고 서명 없는 빌드가 나온다.
    contents = contents.replace(releaseDebugSigning, `$1${RELEASE_SIGNING_LINE}`);

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
};
