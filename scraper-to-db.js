// ******** ------- Scrap Data from Art World News Sites and send to database ------- ********
var firebase = require("firebase/app");
require("firebase/database");

//Web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyCf9Fw3d5Uxag7MNb9t_8nUB77nkRi4oMg",
    authDomain: "art-resources-data.firebaseapp.com",
    databaseURL: "https://art-resources-data-default-rtdb.firebaseio.com",
    projectId: "art-resources-data",
    storageBucket: "art-resources-data.appspot.com",
    messagingSenderId: "248145457185",
    appId: "1:248145457185:web:27c5b43b2eabcefe2ef360",
    measurementId: "G-ES7CNTWLBC"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.database();
//*** ---------- URL links to art news resources ----------- *  
const puppeteer = require('puppeteer');
const artNpapUrl = 'https://www.theartnewspaper.com/news';
const artNUrl = 'https://www.artnews.com/c/art-news/news/';
const artNetUrl = 'https://news.artnet.com/';
const hyperAlr = 'https://hyperallergic.com/category/art/';
const artsy = 'https://www.artsy.net/articles';
const artFor ='https://www.artforum.com/news';
//*** ----------------- Main News Scraper -------------------- *
function run () {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            // *** --------- The Art Newspaper ------- *
            await page.goto(artNpapUrl);
            let urls = await page.evaluate(() => {
                let results = [];
                let items = document.querySelectorAll('.cp-comp');
                
                items.forEach((item) => {
                    articleUrl = item.querySelector('.cp-link').getAttribute('href');//<-- fix relative url --
                    results.push({
                        linkUrl:  `https://www.theartnewspaper.com${articleUrl}`,
                        imgUrl:item.querySelector('.cp-thumbnail-cont .cp-thumbnail').getAttribute('data-bg'),
                        title: item.querySelector('.cp-details .cp-preview-headline').innerText,
                        descript: item.querySelector('.cp-details .cp-excerpt').innerText,
                    });
                });
                return results.slice(0, 6);
            });
            // *** --------- Art News ------- *
            await page.goto(artNUrl);
            let urls2 = await page.evaluate(() => {
                let results2 = [];
                let items2 = document.querySelectorAll('article.story');
                
                items2.forEach((item) => {
                    results2.push({
                        linkUrl:  item.querySelector('.lrv-a-grid .a-span2 h3 a').getAttribute('href'),
                        imgUrl:item.querySelector('.lrv-a-grid img.c-lazy-image__img').getAttribute('src'),
                        title: item.querySelector('.lrv-a-grid .a-span2 h3 a').innerText,
                        descript: item.querySelector('.lrv-a-grid .a-span2 p').innerText,
                    });
                });
                return results2.slice(0, 6);
            });
            // *** --------- ArtNet ------- *
            await page.goto(artNetUrl);
            let urls3 = await page.evaluate(() => {
                let results3 = [];
                let items3 = document.querySelectorAll('.media .teaser');
                
                items3.forEach((item) => {
                    results3.push({
                        linkUrl:  item.querySelector('.teaser-info a').getAttribute('href'),
                        imgUrl:item.querySelector('.teaser-image .image-wrapper img').getAttribute('src'),
                        title: item.querySelector('.teaser-info a .teaser-title').innerText,
                        descript: item.querySelector('.teaser-info a .teaser-blurb').innerText,
                    });
                });
                return results3.slice(0, 6);
            });
            // *** --------- Hyperallergic ------- *
            await page.goto(hyperAlr);
            let urls4 = await page.evaluate(() => {
                let results4 = [];
                let items4 = document.querySelectorAll('article.post');
                
                items4.forEach((item) => {
                    results4.push({
                        linkUrl:  item.querySelector('.entry-container .entry-header .entry-title a').getAttribute('href'),
                        imgUrl:item.querySelector('.post figure a amp-img').getAttribute('src'),
                        title: item.querySelector('.entry-container .entry-header .entry-title').innerText,
                        descript: item.querySelector('.entry-container .entry-content p').innerText,
                    });
                });
                return results4.slice(0, 6);
            });
            // *** ---------  Artsy  ------- *
            await page.goto(artsy);
            let urls5 = await page.evaluate(() => {
                let results5 = [];
                let items5 = document.querySelectorAll('.article-figure-container');
                
                items5.forEach((item) => {
                    articleUrl = item.querySelector('a').getAttribute('href');//<-- fix relative url --
                    results5.push({
                        linkUrl:  `https://www.artsy.net/${articleUrl}`,
                        imgUrl:item.querySelector('a.article-figure-img-container .article-figure-img').getAttribute('style'),
                        title: item.querySelector('.article-figure-figcaption .article-figure-title').innerText,
                        descript: "Artsy does not provide a description"
                    });
                });
                return results5.slice(0, 6);
            });
            // *** ---------  Art Forum  ------- *
            await page.goto(artFor);
            let urls6 = await page.evaluate(() => {
                let results6 = [];
                let items6 = document.querySelectorAll('.news-list__main');
                
                items6.forEach((item) => {
                    results6.push({
                        linkUrl:  item.querySelector('a').getAttribute('href'),
                        imgUrl:item.querySelector('.news-list__main .image-container img').getAttribute('src'),
                        title: item.querySelector('.news-list__main .news-list__words .news__title a').innerText,
                        descript: item.querySelector('.news-list__main .news-list__words .news-list__content p').innerText
                    });
                });
                return results6.slice(0, 6);
            });
            //*** -------------------- Array of news link URL's ---------------------- *
            data = [urls, urls2, urls3, urls4, urls5, urls6]; // ----->   [ [ {},{} ],[ {},{} ] ]
            // browser.close();
            return resolve(data);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(function(value) {
    let artColArray = value;
    //convert the array [[],[]] into an object {[],[]}
    const  artCol = {};
    for (let i = 0; i < artColArray.length; i++) {
        artCol[i] = artColArray[i];
    }
    console.log(artCol); 
    writeData(artCol);
  }).catch(console.error);
  //*** ----------- Send Data to firebase Database --------------- *
  function writeData(data) {
    firebase.database().ref().set({
        ArtNewsSources: data
    });
  }
  