// db.js
const { Pool } = require('pg');
const { database } = require('./config');

const pool = new Pool({
  host: database.host,
  port: database.port,
  user: database.user,
  password: database.password,
  database: database.database
});

/**
 * URL 배열을 받아와 데이터베이스에 저장하는 함수
 * @param {string[]} urls - 저장할 URL들이 담긴 배열
 */
const saveUrls = async (urls) => {
  // 저장할 URL이 없으면 함수를 바로 종료
  if (!urls || urls.length === 0) {
    console.log('저장할 URL이 없습니다.');
    return;
  }

  // 2. 커넥션 풀에서 클라이언트(연결 객체)를 하나 빌려옵니다.
  const client = await pool.connect();
  
  try {
    console.log(`DB에 ${urls.length}개의 URL 저장을 시도합니다...`);
    let newUrlsCount = 0;

    // 3. 받아온 모든 URL에 대해 반복 실행
    for (const url of urls) {
      // 3-1. 먼저 해당 URL이 DB에 이미 있는지 확인 (SELECT 쿼리)
      const res = await client.query('SELECT url FROM pages WHERE url = $1', [url]);
      
      // 3-2. 조회 결과가 0건일 경우 (새로운 URL일 경우)
      if (res.rowCount === 0) {
        // INSERT 쿼리로 새로운 URL을 저장
        await client.query('INSERT INTO pages (url) VALUES ($1)', [url]);
        newUrlsCount++;
      }
    }

    console.log(`총 ${newUrlsCount}개의 새로운 URL을 DB에 저장했습니다.`);

  } catch (error) {
    console.error('DB 저장 중 오류 발생:', error);
  } finally {
    // 4. 작업이 끝나면 반드시 클라이언트를 풀에 반납합니다.
    client.release(); 
  }
};

// 다른 파일에서 saveUrls 함수를 사용할 수 있도록 내보냅니다.
module.exports = { saveUrls };