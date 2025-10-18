// index.js
const express = require('express');
const cron = require('node-cron');
const { getListItemUrls } = require('./crawler'); // 이전에 만든 크롤러 함수 가져오기

const app = express();
const PORT = 3000;

// =================================================================
// ❗️ 1. 여기에 크롤링할 주소들을 직접 입력하세요.
// =================================================================
const TARGET_URLS = [
  // 필요한 만큼 주소를 계속 추가할 수 있습니다.
  "https://toss.tech/"
];
// =================================================================


/**
 * 전체 크롤링 프로세스를 실행하는 메인 함수
 */
const runProcess = async () => {
  console.log('====================================');
  console.log('전체 크롤링 프로세스를 시작합니다...');
  
  // TARGET_URLS 배열에 있는 모든 주소에 대해 크롤링을 실행합니다.
  for (const url of TARGET_URLS) {
    // 1. 크롤러를 실행해서 세부 페이지 URL 목록을 가져옵니다.
    const collectedUrls = await getListItemUrls(url);

    if (collectedUrls.length > 0) {
      console.log(`[${url}] 에서 수집된 URL 목록:`);
      console.log(collectedUrls);

      // ❗️ 2. (나중에 DB에 저장할 때) 이 위치에 DB 저장 함수를 호출하면 됩니다.
      // await saveUrls(collectedUrls); 
    }
  }
  
  console.log('모든 작업이 완료되었습니다.');
  console.log('====================================\n');
};


// 서버를 실행하고 스케줄러를 시작합니다.
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
  
  // 서버가 시작되면, 일단 한 번 즉시 실행해서 잘 동작하는지 확인합니다.
  runProcess(); 

  // =================================================================
  // ❗️ 3. 스케줄 설정: cron 표현식으로 실행 주기를 설정합니다.
  // =================================================================
  // 예시: 매 시간 정각에 실행 ('0 * * * *')
  // 테스트용: 매 1분마다 실행 ('*/1 * * * *')
  cron.schedule('0 * * * *', () => {
    console.log('정해진 시간이 되어 스케줄링된 작업을 실행합니다.');
    runProcess();
  }, {
    scheduled: true,
    timezone: "Asia/Seoul" // 타임존을 한국 시간으로 설정
  });

  console.log("스케줄러가 설정되었습니다. 다음 실행은 정해진 시간에 맞춰 진행됩니다.");
});

// 서버가 계속 실행 중인지 간단히 확인하는 용도
app.get('/health', (req, res) => {
    res.send('Crawler server is alive!');
});