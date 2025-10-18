const { getAllTossArticles } = require('./toss_initial_crawler');
const { saveUrls } = require('../db'); // DB 저장 함수

const initializeDatabase = async () => {
    console.log("초기 데이터 적재를 시작합니다.");
    
    // 1. 모든 게시글 URL 가져오기
    const allArticleUrls = await getAllTossArticles();

    // 2. DB에 저장하기
    if (allArticleUrls && allArticleUrls.length > 0) {
        await saveUrls(allArticleUrls);
        console.log("모든 URL을 DB에 성공적으로 저장했습니다.");
    } else {
        console.log("저장할 URL을 수집하지 못했습니다.");
    }
};

initializeDatabase();