// crawler.js
const puppeteer = require('puppeteer');

const getArticleUrls = async (mainUrl) => {
  try {
    console.log(`크롤링을 시작합니다: ${mainUrl}`);

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(mainUrl, { waitUntil: 'networkidle2' });

    const urls = await page.evaluate(() => {
      const links = new Set(); // 중복 저장을 방지하기 위해 Set 사용

      // ❗️ 토스 테크 블로그의 게시글 링크를 찾는 맞춤 선택자
      const anchors = document.querySelectorAll('a[href^="/article/"]');
      
      anchors.forEach(anchor => {
        // anchor.href는 'https://toss.tech/article/...' 와 같은 전체 주소를 반환합니다.
        links.add(anchor.href); 
      });
      
      return Array.from(links); // Set을 배열로 변환하여 반환
    });

    console.log(`${urls.length}개의 게시글 URL을 찾았습니다.`);
    await browser.close();
    return urls;

  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    return [];
  }
};

module.exports = { getArticleUrls };