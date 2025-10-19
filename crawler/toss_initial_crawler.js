const puppeteer = require('puppeteer');
const TOSS_TECH_URL = 'https://toss.tech/';

// ✨ 1. 페이지를 맨 아래까지 자동으로 스크롤하는 함수 추가
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // 한 번에 스크롤할 크기
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // 0.1초 간격으로 스크롤
    });
  });
}

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
      // ✨ 2. 데이터 추출 전에 스크롤 함수를 호출합니다.
      console.log(`${pageNum} 페이지 스크롤을 시작합니다...`);
      await autoScroll(page);
      console.log('스크롤 완료. 데이터 수집을 시작합니다.');

      console.log(`${pageNum} 페이지의 게시글 정보를 수집합니다...`);
      const articlesOnPage = await page.evaluate(() => {
        const articles = [];
        const anchors = document.querySelectorAll('a[href^="/article/"]');
        
        anchors.forEach(anchor => {
          const titleElement = anchor.querySelector('span.typography--h6');
          const imageElement = anchor.querySelector('img[alt="thumbnail"]');

          // 📌 1. 날짜와 작성자 정보가 담긴 span 태그를 찾습니다.
          const dateElement = anchor.querySelector('span.typography--small');

          let publishedAt = null;
          if (dateElement) {
            const fullText = dateElement.innerText;        // "2025년 10월 1일 · 하태호"
            const datePart = fullText.split('·')[0].trim(); // "2025년 10월 1일"

            // 📌 1. "2025", "10", "1" 처럼 숫자 부분만 추출합니다.
            const parts = datePart.match(/\d+/g);
            
            if (parts && parts.length === 3) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2];

                // 📌 2. padStart(2, '0')를 사용해 한 자릿수 월/일에 '0'을 채웁니다.
                // '10'.padStart(2, '0') -> "10"
                // '1'.padStart(2, '0')  -> "01"
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.padStart(2, '0');
                
                // 📌 3. YYYY-MM-DD 형식으로 조합합니다.
                publishedAt = `${year}-${paddedMonth}-${paddedDay}`;
            }
        }

          articles.push({
              title: titleElement ? titleElement.innerText.trim() : '제목 없음',
              thumbnailImageUrl: imageElement ? imageElement.src : null,
              sourceUrl: anchor.href,
              publishedAt: publishedAt
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