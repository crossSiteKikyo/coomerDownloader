const axios = require('axios').default;
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio');
const fs = require('node:fs');
const { exec } = require('child_process');

let argObject = {
    limit: 50,
    url: 'https://coomer.su/onlyfans/user/npxvip?o=0'
};

function sleep(num) {
    return new Promise(function (resolve) {
        setTimeout(() => { resolve(); }, num);
    })
}

function analyseArguments() {
    let argL = process.argv.length;
    for (let i = 2; i < argL; i++) {
        if (process.argv[i] == '-url') {
            if ((i + 1) < argL) {
                argObject.url = process.argv[i + 1];
                i++;
            }
        }
        else if (process.argv[i] == '-limit') {
            if ((i + 1) < argL) {
                argObject.limit = process.argv[i + 1];
                i++;
            }
        }
    }
}

function downCoomerVideo(url, date, fileName) {
    return new Promise(function (resolve, reject) {
        console.log(`start download: ${fileName}`);
        axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            }
        }).then(function (response) {
            if (!fs.existsSync(`./data/${date}`)) {
                fs.mkdirSync(`./data/${date}`, { recursive: true });
            }
            let writer = fs.createWriteStream(`./data/${date}/${fileName}`);
            response.data.pipe(writer);
            writer.on('error', (err) => {
                console.log('\x1b[100m', `${fileName}다운로드 실패`, '\x1b[0m');
                resolve();
            });
            // writer.on('close', (err) => {
            //     console.log('\x1b[100m', `${fileName}이 close되었습니다`, '\x1b[0m');
            //     resolve();
            // });
            writer.on('finish', () => {
                console.log(`${fileName}다운 성공`);
                resolve();
            });
        }).catch(function (error) {
            console.log('\x1b[41m', error, '\x1b[0m');
            resolve();
        })
    })
}


async function main() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.manage().window().setSize(0, 0);
        await driver.get(argObject.url);
        await driver.wait(until.titleContains('Coomer'), 100000);
        const card_list__items = await driver.findElement(By.className('card-list__items'));
        const image_links = await card_list__items.findElements(By.className('image-link'));
        let postLinks = [];
        //포스트들을 가져옴.
        for (let image_link of image_links) {
            let link = await image_link.getAttribute('href');
            postLinks.push(link);
        }
        //해당 포스트들을 방문한다.
        for (let i in postLinks) {
            //지정 개수만큼만 방문
            if ((parseInt(i) + 1) > argObject.limit)
                break;

            console.log(`${parseInt(i) + 1}/${Math.min(argObject.limit, postLinks.length)}번째 postUrl: ${postLinks[i]}`);
            await driver.get(postLinks[i]);
            const post__body = await driver.findElement(By.className('post__body'));
            const post__published = await driver.findElement(By.className('post__published'));
            const date = (await post__published.getText()).match(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/)[0].replaceAll(':', '-');
            // Videos가 있는지 확인
            if ((await post__body.getAttribute('innerHTML')).includes("<h2>Videos</h2>")) {
                // 비디오 src들을 가져옴
                let post__videos = await post__body.findElements(By.className('post__video'));
                for (let j in post__videos) {
                    let sourceTag = await post__videos[j].findElement(By.css('source'));
                    let src = await sourceTag.getAttribute('src');
                    let extension = src.substring(src.lastIndexOf('.'));
                    // 이미 파일이 있다면 다운하지 않음.
                    const fileName = `${date} (${j})${extension}`;
                    if (fs.existsSync(`./data/${date}/${fileName}`)) {
                        console.log(`${fileName}이 이미 있습니다.`);
                        continue;
                    }
                    await downCoomerVideo(src, date, fileName);
                }
            }
            // Files가 있는지 확인 (이미지들)
            if ((await post__body.getAttribute('innerHTML')).includes("<h2>Files</h2>")) {
                // 이미지 src들을 가져옴
                let post__thumbnails = await post__body.findElements(By.className('post__thumbnail'));
                for (let j in post__thumbnails) {
                    let aTag = await post__thumbnails[j].findElement(By.css('a'));
                    let src = await aTag.getAttribute('href');
                    let extension = src.substring(src.lastIndexOf('.'));
                    // 이미 파일이 있다면 다운하지 않음.
                    const fileName = `img (${j})${extension}`;
                    if (fs.existsSync(`./data/${date}/${fileName}`)) {
                        console.log(`${fileName}이 이미 있습니다.`);
                        continue;
                    }
                    await downCoomerVideo(src, date, fileName);
                }
            }
            await sleep(1500);
            console.log();
        }
        console.log('모든 작업 끝\n');
        // 비프음
        // exec("[console]::beep(1000, 500)", { 'shell': 'powershell.exe' });
    } catch (error) {
        console.log(error);
        await driver.quit();
    } finally {
        await driver.quit();
    }
}

analyseArguments();
main();