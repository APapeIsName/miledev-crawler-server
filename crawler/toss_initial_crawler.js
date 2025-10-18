const puppeteer = require('puppeteer');

const TOSS_TECH_URL = 'https://toss.tech/';

/**
 * 토스 테크 블로그의 모든 페이지를 순회하며 모든 게시글의 URL을 수집하는 함수
 * @returns {Promise<string[]>} 수집된 모든 URL의 배열
 */
const getAllTossArticles = async () => {
  let browser;
  try {
    console.log('토스 테크 블로그 전체 크롤링을 시작합니다...');
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(TOSS_TECH_URL, { waitUntil: 'networkidle2' });

    const allUrls = new Set(); // 중복 URL을 자동으로 관리하기 위해 Set 사용
    let pageNum = 1;

    // 마지막 페이지에 도달할 때까지 무한 반복
    while (true) {
      console.log(`${pageNum} 페이지의 URL을 수집합니다...`);
      
      // 현재 페이지의 게시글 URL들을 수집
      const urlsOnPage = await page.evaluate(() => {
        const links = [];
        const anchors = document.querySelectorAll('a[href^="/article/"]');
        anchors.forEach(anchor => links.push(anchor.href));
        return links;
      });

      urlsOnPage.forEach(url => allUrls.add(url));
      console.log(`현재까지 ${allUrls.size}개의 고유 URL을 찾았습니다.`);

      // "다음" 버튼이 비활성화 상태인지 확인
      const isNextButtonDisabled = await page.evaluate(() => {
        // "다음" 버튼을 찾아서, 비활성화 클래스(.p-pagination__item--disabled)를 가지고 있는지 확인
        const nextButton = document.querySelector('button[aria-label="next"]');
        return nextButton && nextButton.hasAttribute('disabled');
      });

      // 만약 "다음" 버튼이 비활성화 상태라면, 마지막 페이지이므로 반복 종료
      if (isNextButtonDisabled) {
        console.log('마지막 페이지에 도달했습니다. 크롤링을 종료합니다.');
        break;
      }

      // "다음" 버튼 클릭
      await page.click('button[aria-label="next"]');
      
      // 페이지 내용이 로드될 때까지 잠시 대기
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      pageNum++;
    }

    return Array.from(allUrls); // Set을 배열로 변환하여 반환

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
        const urls = await getAllTossArticles();
        console.log(`\n\n최종 수집된 URL ${urls.length}개:`);
        console.log(urls);
    })();
}


module.exports = { getAllTossArticles };