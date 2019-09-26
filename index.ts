const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

(async() => {
  const tagName = process.argv[2] || process.env.DEFAULT_TAG;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(getQiitaUrl(tagName, 1));

  // login
  await page.type('#identity', process.env.USERNAME);
  await page.type('#password', process.env.PASSWORD);
  await page.click('input[type="submit"]');

  // page数の取得
  const postCountSelector = 'span.teamRecordList_heading_title > span.teamRecordList_heading_inactiveContent';
  await page.waitForSelector(postCountSelector);
  const postCountElementHandler = await page.$(postCountSelector);
  const postCountText = await getTextContent(postCountElementHandler);
  const postCount = Number(postCountText.replace(/[^0-9]/g, ''));
  const pageCount = Math.floor(postCount / 20) + (postCount % 20 > 0 ? 1 : 0);
  console.log('post総数 :', postCount);
  console.log('page総数 :', pageCount);

  let allPostText = 'タイトル, URL, タグ \n';

  // 各記事のタイトルとリンク取得
  allPostText += await getItems(page);

  // 2ページ目以降も取得
  for (let i = 2; i <= pageCount; i++) {
    await page.goto(getQiitaUrl(tagName, i));
    allPostText += await getItems(page);
  }
  try {
    fs.writeFileSync("post.csv", allPostText);
    console.log('write done');
  } catch(e) {
    console.log(e);
  }

  await browser.close();
})();

const getTextContent = async ElementHandler => {
  return await (await ElementHandler.getProperty('textContent')).jsonValue();
}

const getLink = async ElementHandler => {
  return await (await ElementHandler.getProperty('href')).jsonValue();
}

// このpageはpuppetterのpage
const getItems = async page => {
  const resultsSelector = 'ul.list-group > li.teamRecordList_listElement';
  await page.waitForSelector(resultsSelector);

  const lists = await page.$$(resultsSelector);
  let text = '';

  for (const list of lists) {
    const selector = 'div.teamRecordList_listElement_body > a.teamRecordList_listElement_title';
    await page.waitForSelector(selector);
    const titleElementHandler = await list.$(selector);
    const title = await getTextContent(titleElementHandler);
    const link = await getLink(titleElementHandler);

    const tagSelector = 'a.teamRecordList_listElement_tag';
    await page.waitForSelector(tagSelector);
    const tags = await list.$$(tagSelector);
    const tagsText = await getTagsText(tags);

    text += `${title} , ${ link } , ${ tagsText } \n`;
  }
  return text;
}

const getTagsText = async tags => {
  const tagsArray = [];
  for (const tag of tags) {
    const tagData = await getTextContent(tag);
    tagsArray.push(tagData);
  }
  return tagsArray.join(',');
}

const getQiitaUrl = (tagName, index) => {
  return `https://${process.env.TEAMNAME}.qiita.com/articles?page=${index}&q=tag%3A${tagName}`;
}