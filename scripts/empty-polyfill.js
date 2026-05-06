// Next.js 가 ES-modular 브라우저용으로도 항상 main.js 에 인라인하는 폴리필을
// 비우기 위한 alias 타깃. browserslist 가 Chrome 93+ / Safari 15.4+ / Firefox 92+
// 등 baseline-modern 으로 설정되어 있어 Array.at / Object.hasOwn / Object.fromEntries
// 등이 모두 네이티브 지원되므로 폴리필이 불필요. PageSpeed 의 'Legacy JavaScript
// 13KiB' 경고를 해소.
export {};
