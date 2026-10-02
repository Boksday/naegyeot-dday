// app.json을 기본으로 하고, 광고 앱 ID처럼 계정마다 다른 값은 .env에서 덮어쓴다.
// .env는 커밋하지 않는다(.env.example 참고). 값이 없으면 app.json의 구글 공식 테스트 ID를 쓴다.
module.exports = ({ config }) => ({
  ...config,
  plugins: config.plugins.map((plugin) => {
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
  }),
});
