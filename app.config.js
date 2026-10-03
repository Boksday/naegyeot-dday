// app.json을 기본으로 하고, 계정·빌드마다 다른 값을 여기서 덮어쓴다.
// - 광고 앱 ID: .env에서 읽는다(.env는 커밋하지 않는다, .env.example 참고). 없으면 구글 공식 테스트 ID.
// - APP_VARIANT=dev: 스토어 앱과 나란히 설치되는 개발용 앱(패키지·이름·스킴이 다르다). docs/release.md
const IS_DEV_VARIANT = process.env.APP_VARIANT === 'dev';

function withAdMobAppIds(plugins) {
  return plugins.map((plugin) => {
    if (!Array.isArray(plugin) || plugin[0] !== 'react-native-google-mobile-ads') return plugin;
    const [name, options] = plugin;
    return [
      name,
      {
        ...options,
        androidAppId: process.env.ADMOB_ANDROID_APP_ID || options.androidAppId,
        iosAppId: process.env.ADMOB_IOS_APP_ID || options.iosAppId,
      },
    ];
  });
}

module.exports = ({ config }) => {
  const base = { ...config, plugins: withAdMobAppIds(config.plugins) };
  if (!IS_DEV_VARIANT) return { ...base, extra: { ...base.extra, variant: 'store' } };
  return {
    ...base,
    name: `${config.name} 개발`,
    scheme: `${config.scheme}-dev`,
    android: { ...config.android, package: `${config.android.package}.dev` },
    ios: { ...config.ios, bundleIdentifier: `${config.ios.bundleIdentifier}.dev` },
    extra: { ...base.extra, variant: 'dev' },
  };
};
