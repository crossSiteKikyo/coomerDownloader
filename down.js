const axios = require('axios').default;
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const fs = require('node:fs');

let argObject = {
    limit: 50,
    url: '',
    startIndex: 0,
    site: 'Coomer',
    platform: '',
    user: '',   // url user
    name: '',   // real nickname
    //'https://coomer.su/onlyfans/user/npxvip?o=0'
};

function sleep(num) {
    return new Promise(function (resolve) {
        setTimeout(() => { resolve(); }, num);
    })
}

function consoleRed(val) {
    console.log(`\x1b[41m${val}\x1b[0m`);
}
function consoleGrey(val) {
    console.log(`\x1b[100m${val}\x1b[0m`);
}
function help() {
    console.log(`usage: node down -url "URL" [-limit LIMIT] [-start STARTINDEX]`);
    process.exit();
}

function analyseArguments() {
    let argL = process.argv.length;
    if (argL == 2) {
        help();
    }
    for (let i = 2; i < argL; i++) {
        if (process.argv[i] == '-url') {
            if ((i + 1) < argL) {
                argObject.url = process.argv[i + 1];
                i++;
            }
        }
        else if (process.argv[i] == '-limit') {
            if ((i + 1) < argL) {
                argObject.limit = parseInt(process.argv[i + 1]);
                i++;
            }
        }
        else if (process.argv[i] == '-start') {
            if ((i + 1) < argL) {
                argObject.startIndex = parseInt(process.argv[i + 1]);
                argObject.limit += argObject.startIndex;
                i++;
            }
        }
        else if (process.argv[i] == '-h' || process.argv[i] == '-help') {
            help();
        }
    }
    if (!argObject.url) {
        consoleGrey('you have to specify url');
        process.exit();
    }
    // check url
    // coomer - OnlyFans
    if (argObject.url.match(/^https:\/\/coomer.su\/onlyfans\/user\/[^/\s]+$/)) {
        argObject.site = 'Coomer'; argObject.platform = 'OnlyFans';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // coomer - Fansly
    else if (argObject.url.match(/^https:\/\/coomer.su\/fansly\/user\/[^/\s]+$/)) {
        argObject.site = 'Coomer'; argObject.platform = 'Fansly';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // coomer - CandFans
    else if (argObject.url.match(/^https:\/\/coomer.su\/candfans\/user\/[^/\s]+$/)) {
        argObject.site = 'Coomer'; argObject.platform = 'CandFans';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - Patreon
    else if (argObject.url.match(/^https:\/\/kemono.su\/patreon\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Patreon';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - Pixiv Fanbox
    else if (argObject.url.match(/^https:\/\/kemono.su\/fanbox\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Fanbox';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - Discord         have to fix
    else if (argObject.url.match(/^https:\/\/kemono.su\/discord\/server\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Discord';
        argObject.user = argObject.url.match(/(?<=server\/)[^/?\s]+/)[0];
        consoleGrey('discord download is not support yet');
        process.exit();
    }
    // kemono - Fantia
    else if (argObject.url.match(/^https:\/\/kemono.su\/fantia\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Fantia';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - Afdian      no found
    // else if (argObject.url.match(/^https:\/\/kemono.su\/patreon\/user\/[^/\s]+$/)) {
    //     argObject.site = 'Kemono'; argObject.platform = 'Patreon';
    //     argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    // }
    // kemono - Boosty
    else if (argObject.url.match(/^https:\/\/kemono.su\/boosty\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Boosty';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - Gumroad
    else if (argObject.url.match(/^https:\/\/kemono.su\/gumroad\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'Gumroad';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    // kemono - SubscribeStar
    else if (argObject.url.match(/^https:\/\/kemono.su\/subscribestar\/user\/[^/\s]+$/)) {
        argObject.site = 'Kemono'; argObject.platform = 'SubscribeStar';
        argObject.user = argObject.url.match(/(?<=user\/)[^/?\s]+/)[0];
    }
    else {
        consoleGrey('incorrect url');
        process.exit();
    }
}

function downCoomerData(url, postId, fileName) {
    return new Promise(function (resolve, reject) {
        console.log(`start download: ${fileName}`);
        axios.get(url, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            }
        }).then(function (response) {
            response.data.on('error', (error)=>{
                consoleGrey(`${fileName} download on error`);
                resolve();
            })
            if (!fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}`)) {
                fs.mkdirSync(`./data/${argObject.name}-${argObject.platform}/${postId}`, { recursive: true });
            }
            let writer = fs.createWriteStream(`./data/${argObject.name}-${argObject.platform}/${postId}/${fileName}`);
            response.data.pipe(writer);
            writer.on('error', (err) => {
                consoleGrey(`${fileName} download on error`);
                resolve();
            });
            writer.on('finish', () => {
                console.log(`${fileName} download success`);
                resolve();
            });
        }).catch(function (error) {
            consoleRed(`download error: ./data/${argObject.name}-${argObject.platform}/${postId}/${fileName}`);
            resolve();
        })
    })
}


async function main() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.manage().setTimeouts({implicit: 5000});
    try {
        //await driver.manage().window().setSize(0, 0);
        let postLinks = [];
        while (true) {
            // check url redirect
            await driver.get(argObject.url);
            await driver.wait(until.titleContains(argObject.site), 300000);
            if ((await driver.getCurrentUrl()) != argObject.url) {
                break;  //redirect
            }
            // get user name
            argObject.name = await (await driver.findElement(By.id('user-header__info-top'))).getText();
            // 포스트들을 가져옴. limit개수만큼 가져오거나 더이상 가져올 수 없을때까지 가져온다.
            const card_list__items = await driver.findElement(By.className('card-list__items'));
            const image_links = await card_list__items.findElements(By.className('image-link'));
            for (let image_link of image_links) {
                let link = await image_link.getAttribute('href');
                postLinks.push(link);
            }
            // limit만큼 가져왔다면 break
            if (postLinks.length >= argObject.limit)
                break;
            const paginator_bottom = await driver.findElement(By.id('paginator-bottom'));
            // limit만큼 가져오지 못했고 다음페이지가 있다면 다음 url으로 간다.
            if ((await paginator_bottom.getAttribute('innerHTML')).includes(`class="next"`)) {
                argObject.url = await (await driver.findElement(By.css('a.next'))).getAttribute('href');
            }
            // 다음 페이지가 없다면 break
            else {
                break;
            }
        }
        // resize postLinks
        if (postLinks.length > argObject.limit) {
            postLinks = postLinks.slice(0, argObject.limit);
        }
        // visit post links
        for (let i in postLinks) {
            if (i < argObject.startIndex)
                continue;
            console.log(`${parseInt(i) + 1}/${postLinks.length} postUrl: ${postLinks[i]}`);
            await driver.get(postLinks[i]);
            await driver.wait(until.elementsLocated(By.css('.post__info')), 10000);
            const postId = postLinks[i].split('/').at(-1);
            const post__info = await driver.findElement(By.className('post__info'));
            const post__body = await driver.findElement(By.className('post__body'));
            // info
            if (!fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}/info.txt`)) {
                if (!fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}`))
                    fs.mkdirSync(`./data/${argObject.name}-${argObject.platform}/${postId}`, { recursive: true });
                let info = 'Title: ';
                info += await (await post__info.findElement(By.className('post__title'))).getText();
                info += '\n';
                info += await (await post__info.findElement(By.className('post__published'))).getText();
                fs.writeFileSync(`./data/${argObject.name}-${argObject.platform}/${postId}/info.txt`, info);
            }
            // Content
            if ((await post__body.getAttribute('innerHTML')).includes("<h2>Content</h2>")) {
                if (!fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}/content.txt`)) {
                    let content = await (await post__body.findElement(By.className('post__content'))).getText();
                    fs.writeFileSync(`./data/${argObject.name}-${argObject.platform}/${postId}/content.txt`, content);
                }
            }
            // Files (images)
            if ((await post__body.getAttribute('innerHTML')).includes("<h2>Files</h2>")) {
                // 이미지 src들을 가져옴
                let post__thumbnails = await post__body.findElements(By.className('post__thumbnail'));
                let filePromiseList = [];
                for (let j in post__thumbnails) {
                    let aTag = await post__thumbnails[j].findElement(By.css('a'));
                    let src = await aTag.getAttribute('href');
                    let extension = src.substring(src.lastIndexOf('.'));
                    // 이미 파일이 있다면 다운하지 않음.
                    const fileName = `img (${j})${extension}`;
                    if (fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}/${fileName}`)) {
                        continue;
                    }
                    filePromiseList.push(downCoomerData(src, postId, fileName));
                }
                await Promise.all(filePromiseList);
            }
            // Downloads
            if ((await post__body.getAttribute('innerHTML')).includes("<h2>Downloads</h2>")) {
                // downloads videos, zip
                let post__attachment_link = await post__body.findElements(By.className('post__attachment-link'));
                let downloadPromiseList = [];
                for (let j in post__attachment_link) {
                    const url = await post__attachment_link[j].getAttribute('href');
                    const fileName = decodeURI(await post__attachment_link[j].getAttribute('download'));
                    if (fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}/${fileName}`)) {
                        continue;
                    }
                    downloadPromiseList.push(downCoomerData(url, postId, fileName));
                }
                await Promise.all(downloadPromiseList);
            }
            // Videos
            // if ((await post__body.getAttribute('innerHTML')).includes("<h2>Videos</h2>")) {
            //     // 비디오 src들을 가져옴
            //     let post__videos = await post__body.findElements(By.className('post__video'));
            //     for (let j in post__videos) {
            //         let sourceTag = await post__videos[j].findElement(By.css('source'));
            //         let src = await sourceTag.getAttribute('src');
            //         let extension = src.substring(src.lastIndexOf('.'));
            //         // 이미 파일이 있다면 다운하지 않음.
            //         const fileName = `Video (${j})${extension}`;
            //         if (fs.existsSync(`./data/${argObject.name}-${argObject.platform}/${postId}/${fileName}`)) {
            //             console.log(`${fileName}이 이미 있습니다.`);
            //             continue;
            //         }
            //         await downCoomerData(src, postId, fileName);
            //     }
            // }
            await sleep(1000);
            console.log();
        }
        console.log('finished\n');
    } catch (error) {
        console.log(error);
        await driver.quit();
    } finally {
        await driver.quit();
    }
}

analyseArguments();
main();