// .env 파일의 환경 변수를 로드합니다.
require('dotenv').config(); 
const axios = require('axios');
const { getAllTossArticles } = require('./toss_initial_crawler');

// .env 파일에 메인 서버 API 주소를 설정해두는 것이 좋습니다.
// 예: MAIN_SERVER_API_URL=http://localhost:8080/article
const MAIN_SERVER_API_URL = process.env.MAIN_SERVER_API_URL + "/articles";
const SOURCE_NAME = '토스 기술 블로그'; // 게시글 출처

const sendCrawledData = async () => {
    console.log(`[${SOURCE_NAME}] 전체 게시글 크롤링을 시작합니다.`);
    
    // 1. 크롤러를 실행해 모든 게시글 정보를 가져옵니다.
    const articles = await getAllTossArticles();

    if (!articles || articles.length === 0) {
        console.log("전송할 게시글을 수집하지 못했습니다.");
        return;
    }

    // 2. API 명세에 맞는 Request Body 형태로 데이터를 가공합니다.
    const techBlogDtos = articles.map(article => ({
        title: article.title,
        thumbnailImageUrl: article.thumbnailImageUrl,
        sourceUrl: article.sourceUrl,
        sourceFrom: SOURCE_NAME // 출처 정보를 추가합니다.
    }));

    const requestBody = {
        techBlogDtos: techBlogDtos
    };

    // 3. Axios를 사용해 메인 서버에 POST 요청을 보냅니다.
    try {
        console.log(`수집된 ${requestBody.techBlogDtos.length}개의 게시글을 메인 서버로 전송합니다...`);
        
        const response = await axios.post(MAIN_SERVER_API_URL, requestBody);

        if (response.status === 200 || response.status === 201) {
            console.log("✅ 메인 서버에 데이터 전송 및 저장을 성공적으로 완료했습니다.");
        } else {
            console.warn(`⚠️ 메인 서버에서 예상치 못한 응답을 받았습니다: ${response.status}`);
        }
    } catch (error) {
        console.error("❌ 메인 서버로 데이터 전송 중 오류가 발생했습니다.");
        // 에러가 발생했을 때 더 상세한 정보를 출력합니다.
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

// 스크립트 실행
sendCrawledData();