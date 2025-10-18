const puppeteer = require('puppeteer');
const TOSS_TECH_URL = 'https://toss.tech/';

const getAllTossArticles = async () => {
  let browser;
  try {
    console.log('Puppeteer 브라우저를 실행합니다...');
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(TOSS_TECH_URL, { waitUntil: 'networkidle2' });

    const allArticles = [];
    const seenUrls = new Set();
    let pageNum = 1;

    while (true) {
      console.log(`${pageNum} 페이지의 게시글 정보를 수집합니다...`);
      const articlesOnPage = await page.evaluate(() => {
        const articles = [];
        const anchors = document.querySelectorAll('a[href^="/article/"]');
        
        anchors.forEach(anchor => {
          const titleElement = anchor.querySelector('span.typography--h6');
          const imageElement = anchor.querySelector('img[alt="thumbnail"]');
          articles.push({
            title: titleElement ? titleElement.innerText.trim() : '제목 없음',
            thumbnailImageUrl: imageElement ? imageElement.src : null,
            sourceUrl: anchor.href,
          });
        });
        return articles;
      });

      articlesOnPage.forEach(article => {
        if (!seenUrls.has(article.sourceUrl)) {
          seenUrls.add(article.sourceUrl);
          allArticles.push(article);
        }
      });

      console.log(`현재까지 ${allArticles.length}개의 고유 게시글을 찾았습니다.`);
      const isNextButtonDisabled = await page.evaluate(() => {
        const nextButton = document.querySelector('button[aria-label="next"]');
        return nextButton && nextButton.hasAttribute('disabled');
      });

      if (isNextButtonDisabled) {
        console.log('마지막 페이지에 도달했습니다. 크롤링을 종료합니다.');
        break;
      }

      await page.click('button[aria-label="next"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      pageNum++;
    }
    return allArticles;
  } catch (error) {
    console.error('크롤링 중 오류가 발생했습니다:', error);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { getAllTossArticles };