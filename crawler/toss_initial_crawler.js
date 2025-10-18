// toss_initial_crawler.js

const puppeteer = require('puppeteer');

const TOSS_TECH_URL = 'https://toss.tech/';

/**
 * 토스 테크 블로그의 모든 페이지를 순회하며 모든 게시글의 정보를 수집하는 함수
 * @returns {Promise<object[]>} 수집된 게시글 객체들의 배열
 */
const getAllTossArticles = async () => {
  let browser;
  try {
    console.log('토스 테크 블로그 전체 크롤링을 시작합니다...');
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(TOSS_TECH_URL, { waitUntil: 'networkidle2' });

    // ❗️ 1. 최종 결과를 담을 배열과 중복 확인을 위한 Set을 준비합니다.
    const allArticles = [];
    const seenUrls = new Set();
    let pageNum = 1;

    // 마지막 페이지에 도달할 때까지 무한 반복
    while (true) {
      console.log(`${pageNum} 페이지의 게시글 정보를 수집합니다...`);
      
      // ❗️ 2. evaluate 함수가 URL 문자열 대신 "게시글 객체" 배열을 반환하도록 수정합니다.
      const articlesOnPage = await page.evaluate(() => {
        const articles = [];
        // 각 게시글을 감싸는 <a> 태그를 모두 선택합니다.
        const anchors = document.querySelectorAll('a[href^="/article/"]');
        
        anchors.forEach(anchor => {
          // 각 <a> 태그 안에서 제목과 썸네일 이미지를 찾습니다.
          const titleElement = anchor.querySelector('span.typography--h6');
          const imageElement = anchor.querySelector('img[alt="thumbnail"]');

          // 찾은 정보를 객체 형태로 만듭니다. 요소가 없을 경우 null 처리합니다.
          const articleData = {
            title: titleElement ? titleElement.innerText.trim() : '제목 없음',
            thumbnailImageUrl: imageElement ? imageElement.src : null,
            sourceUrl: anchor.href, // a 태그의 href 속성이 게시글 URL입니다.
          };
          articles.push(articleData);
        });
        return articles; // 객체 배열을 반환합니다.
      });

      // ❗️ 3. 수집한 데이터를 최종 결과 배열에 추가합니다. (중복 체크)
      articlesOnPage.forEach(article => {
        if (!seenUrls.has(article.sourceUrl)) {
          seenUrls.add(article.sourceUrl);
          allArticles.push(article);
        }
      });

      console.log(`현재까지 ${allArticles.length}개의 고유 게시글을 찾았습니다.`);

      // "다음" 버튼이 비활성화 상태인지 확인 (이전과 동일)
      const isNextButtonDisabled = await page.evaluate(() => {
        const nextButton = document.querySelector('button[aria-label="next"]');
        return nextButton && nextButton.hasAttribute('disabled');
      });

      if (isNextButtonDisabled) {
        console.log('마지막 페이지에 도달했습니다. 크롤링을 종료합니다.');
        break;
      }

      // 페이지 넘기기 (이전과 동일)
      await page.click('button[aria-label="next"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      pageNum++;
    }

    return allArticles; // 최종적으로 객체 배열을 반환합니다.

  } catch (error) {
    console.error('전체 크롤링 중 오류가 발생했습니다:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// 이 파일이 직접 실행될 경우, 테스트를 위해 함수를 호출하고 결과를 출력
if (require.main === module) {
    (async () => {
        const articles = await getAllTossArticles();
        console.log(`\n\n최종 수집된 게시글 ${articles.length}개:`);
        // 결과가 객체 배열이므로 더 보기 좋게 출력
        console.dir(articles, { depth: null });
    })();
}


module.exports = { getAllTossArticles };