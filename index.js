// index.js
const express = require('express');
const cron = require('node-cron');
// crawler.js에서 함수 이름을 getArticleUrls로 변경했으므로 맞춰줍니다.
const { getArticleUrls } = require('./crawler/toss_crawler'); 

const app = express();
const PORT = 3000;

// =================================================================
// ❗️ 1. 크롤링할 기술 블로그 목록 (여기에 계속 추가)
// =================================================================
const TECH_BLOGS = [
  {
    name: 'Toss Tech',
    url: 'https://toss.tech/',
    // 위 crawler.js에서 사용한 선택자와 동일하게 맞춰줍니다.
    // 현재는 crawler.js가 toss 전용이므로 이 selector는 사용되지 않지만,
    // 나중에 crawler.js를 범용으로 만들 경우를 대비한 구조입니다.
    selector: 'a[href^="/article/"]' 
  },
  // {
  //   name: 'Woowahan Tech',
  //   url: 'https://techblog.woowahan.com/',
  //   selector: '...' // 우아한형제들 블로그에 맞는 선택자
  // },
];
// =================================================================

const runProcess = async () => {
  console.log('====================================');
  console.log('전체 기술 블로그 크롤링을 시작합니다...');
  
  for (const blog of TECH_BLOGS) {
    console.log(`\n[${blog.name}] 블로그 크롤링 중...`);
    
    // 현재 crawler.js는 toss 전용이므로 blog.url만 넘겨줍니다.
    const collectedUrls = await getArticleUrls(blog.url);

    if (collectedUrls.length > 0) {
      console.log(`[${blog.name}] 에서 ${collectedUrls.length}개의 URL 수집 완료.`);
      
      // ❗️ 2. 여기에 DB 저장 로직을 연결하면 됩니다.
      // await saveUrlsToDatabase(blog.name, collectedUrls);
      console.log(collectedUrls); // 임시로 콘솔에 출력
    }
  }
  
  console.log('\n모든 크롤링 작업이 완료되었습니다.');
  console.log('====================================\n');
};


app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
  runProcess(); 

  // 매일 자정(0시 0분)에 실행
  cron.schedule('0 */3 * * *', () => {
    console.log('정해진 시간이 되어 스케줄링된 작업을 실행합니다.');
    runProcess();
  }, {
    scheduled: true,
    timezone: "Asia/Seoul"
  });
  console.log("스케줄러가 설정되었습니다. 다음 실행은 매일 자정입니다.");
});