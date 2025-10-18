// crawler.js
const puppeteer = require('puppeteer');

/**
 * 메인 페이지에 접속하여 특정 패턴을 가진 모든 링크 주소를 추출하는 함수
 * @param {string} mainUrl - 크롤링할 대상 페이지의 전체 주소
 * @returns {Promise<string[]>} - 추출된 URL들의 배열
 */
const getListItemUrls = async (mainUrl) => {
  try {
    console.log(`크롤링을 시작합니다: ${mainUrl}`);

    // 1. Puppeteer로 브라우저를 실행합니다.
    // { headless: true }는 화면 없이 백그라운드에서 실행한다는 의미입니다.
    // '--no-sandbox'는 Docker나 Linux 서버 환경에서 권한 문제 없이 실행하기 위한 옵션입니다.
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    
    // 2. 브라우저에서 새 페이지(탭)를 엽니다.
    const page = await browser.newPage();
    
    // 3. 대상 URL로 이동합니다. 
    // waitUntil: 'networkidle2' 옵션은 페이지의 JavaScript 로딩이나 데이터 통신이 거의 끝날 때까지 기다려줍니다.
    await page.goto(mainUrl, { waitUntil: 'networkidle2' });

    // 4. 페이지의 DOM에 직접 접근해서 원하는 데이터를 추출합니다.
    const urls = await page.evaluate(() => {
      const links = [];
      
      // ❗️ 가장 중요한 부분: 가져오고 싶은 링크들의 CSS Selector를 여기에 입력해야 합니다.
      // 예: gemini.com 사이트에서 '/list/'로 시작하는 모든 링크(<a> 태그)를 선택합니다.
      const anchors = document.querySelectorAll('a[href^="/list/"]');
      
      anchors.forEach(anchor => {
        // anchor.href는 'https://gemini.com/list/1'과 같은 전체 주소를 반환합니다.
        links.push(anchor.href); 
      });
      
      return links;
    });

    console.log(`${urls.length}개의 아이템 URL을 찾았습니다.`);
    
    // 5. 작업이 끝나면 반드시 브라우저를 닫아줍니다. (메모리 누수 방지)
    await browser.close();
    
    // 6. 중복된 URL이 있을 수 있으므로 Set으로 중복을 제거한 후 배열로 반환합니다.
    return [...new Set(urls)];

  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    return []; // 오류가 발생하면 빈 배열을 반환합니다.
  }
};

// 다른 파일(index.js)에서 이 함수를 가져다 쓸 수 있도록 내보냅니다.
module.exports = { getListItemUrls };