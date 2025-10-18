// db.js
const { Pool } = require('pg');
const { database } = require('./config');
require('dotenv').config({ path: '.env' });

// DB 접속 정보 설정
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/**
 * 게시글 객체 배열을 받아와 데이터베이스에 저장하는 함수
 * @param {object[]} articles - 저장할 게시글 객체들이 담긴 배열
 * @param {string} sourceFrom - 게시글 출처 (예: 'Toss Tech')
 */
// ❗️ 1. 함수 이름과 받는 인자 변경
const saveArticles = async (articles, sourceFrom) => {
  // 저장할 게시글이 없으면 함수를 바로 종료
  if (!articles || articles.length === 0) {
    console.log('저장할 게시글이 없습니다.');
    return;
  }

  const client = await pool.connect();
  
  try {
    console.log(`DB에 ${articles.length}개의 게시글 저장을 시도합니다...`);
    let newArticlesCount = 0;

    // ❗️ 2. URL 대신 게시글 객체로 반복 실행
    for (const article of articles) {
      // ❗️ 3. source_url을 기준으로 중복 확인
      const res = await client.query('SELECT id FROM pages WHERE source_url = $1', [article.sourceUrl]);
      
      if (res.rowCount === 0) {
        // ❗️ 4. 새 테이블 구조에 맞게 INSERT 쿼리 수정
        const queryText = 'INSERT INTO pages (title, thumbnail_image_url, source_url, source_from) VALUES ($1, $2, $3, $4)';
        const values = [
            article.title, 
            article.thumbnailImageUrl, 
            article.sourceUrl, 
            sourceFrom
        ];
        
        await client.query(queryText, values);
        newArticlesCount++;
      }
    }

    console.log(`총 ${newArticlesCount}개의 새로운 게시글을 DB에 저장했습니다.`);

  } catch (error) {
    console.error('DB 저장 중 오류 발생:', error);
  } finally {
    client.release(); 
  }
};

// ❗️ 5. 내보내는 함수 이름 변경
module.exports = { saveArticles };