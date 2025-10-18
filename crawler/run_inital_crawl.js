// ❗️ 1. DB 저장 함수를 `saveUrls`에서 `saveArticles`로 변경하여 가져옵니다.
const { getAllTossArticles } = require('./toss_initial_crawler');
const { saveArticles } = require('../db'); // DB 저장 함수 경로 확인

const initializeDatabase = async () => {
    console.log("초기 데이터 적재를 시작합니다.");
    
    // ❗️ 2. 크롤러가 이제 URL 배열이 아닌 '게시글 객체 배열'을 반환합니다.
    const allArticles = await getAllTossArticles();

    // ❗️ 3. DB 저장 로직을 호출합니다.
    if (allArticles && allArticles.length > 0) {
        // saveArticles 함수에 게시글 객체 배열과 출처('Toss Tech')를 함께 전달합니다.
        await saveArticles(allArticles, 'Toss Tech');
        console.log("모든 게시글을 DB에 성공적으로 저장했습니다.");
    } else {
        console.log("저장할 게시글을 수집하지 못했습니다.");
    }
};

// 스크립트 실행
initializeDatabase();