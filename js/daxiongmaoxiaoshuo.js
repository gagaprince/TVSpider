import { Spider } from "./spider.js";
import { BookDetail, BookShort } from "../lib/book.js";
import { Crypto, load } from "../lib/cat.js";

class DaxiongmaoXiaoshuoSpider extends Spider {
    constructor() {
        super();
        this.siteUrl = 'https://www.dxmwx.org';
    }

    getName() {
        return "大熊猫小说"
    }

    getAppName() {
        return "大熊猫"
    }

    getJSName() {
        return "daxiongmaoxiaoshuo"
    }

    getType() {
        return 10
    }

    async request(url, method = 'get', data) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        };
        const res = await req(url, {
            method,
            headers,
            data,
            timeout: 30000
        })
        // console.log('request ret:', res);
        return res.content;
    }


    async setClasses() {
        const url = this.siteUrl;
        console.log('分类请求:', url);
        let content = await this.request(url)
        let retry = 0;
        while (!content && retry < 3) {
            retry++;
            content = await this.request(url)
        }

        const $ = load(content);
        const categoryRoot = $('.onlypc');
        const aList = $(categoryRoot[1]).find('a');
        console.log(aList.length);
        const categoryList = [];
        for (let i = 1; i < aList.length; i++) {
            const ele = aList[i];
            const name = $(ele).text();
            const url = $(ele).attr('href');
            if (name === 'APP') {
                continue;
            }
            categoryList.push({ name, url });
        }
        this.classes = categoryList.map(item => (this.getTypeDic(item.name, item.url)));
        console.log('分类:', this.classes);
    }

    parseVodShortFromJson(obj) {
        let bookShort = new BookShort()
        bookShort.book_id = obj["url"]
        bookShort.book_name = obj["name"]
        bookShort.book_pic = obj["imgUrl"]
        bookShort.book_remarks = obj['updateTime'];
        return bookShort
    }

    async parseVodShortListFromDocByCategory(bookList) {
        let books = [];
        for (const book of bookList) {
            let bookShort = this.parseVodShortFromJson(book)
            books.push(bookShort)
        }
        return books
    }


    async parseVodDetailFromDoc(bookInfo, id) {
        let bookDetail = new BookDetail()
        bookDetail.book_pic = bookInfo.imgUrl
        bookDetail.book_name = bookInfo.name;
        bookDetail.book_director = bookInfo.author;
        bookDetail.book_content = bookInfo.intro;
        const chapterList = bookInfo.chapterList;
        let urls = chapterList.map((chapter) => {
            return chapter.name + '$' + chapter.url;
        }).join('#');
        bookDetail.volumes = '默認';
        bookDetail.urls = urls;
        bookDetail.book_id = id
        return bookDetail
    }

    async parseVodShortListFromJson(obj) {
        const books = [];
        for (const book of obj) {
            books.push(this.parseVodShortFromJson(book))
        }
        return books
    }

    getCateStr(url) {
        // 使用正则表达式提取数字
        const match = url.match(/\/list\/(.+?)\.html/);
        if (match) {
            const cate = match[1]; // 提取到的数字部分
            return cate;
        } else {
            return 0;
        }
    }

    async setCategory(tid, pg, filter, extend) {
        let page = pg || 1;
        if (page === 0) page = 1;
        let link = `${this.siteUrl}/list/topall_${this.getCateStr(tid)}_${page}.html`;
        console.log('获取分类结果list的url：', link);
        const html = await this.request(link)
        // console.log('分类列表内容：',html);
        const $ = load(html);
        const xiaoshuoList = $('#ListContents').children();
        console.log(xiaoshuoList.length);
        const result = [];
        for (let i = 0; i < xiaoshuoList.length; i++) {
            const ele = xiaoshuoList[i];
            if ($(ele).children().length === 0) {
                continue;
            }
            const name = $(ele).find('.imgwidth').find('a').attr('title');
            const url = $(ele).find('.imgwidth').find('a').attr('href');
            const imgUrl = $(ele).find('.imgwidth').find('img').attr('src');
            const desc = $(ele).find('.neirongh5').find('a').text();
            const updateTime = $(ele).find('.lefth5').text();
            result.push({ name, url, imgUrl, desc, updateTime });
        }
        this.vodList = await this.parseVodShortListFromDocByCategory(result)
    }

    parseChapterList(chapterHtml) {
        const result = [];
        const regex = /<a\s+href="([^"]+)">([^<]+)<\/a>/g;
        let match;
        while ((match = regex.exec(chapterHtml)) !== null) {
            const href = match[1]; // 提取 href
            const text = match[2]; // 提取 a 标签内容
            if (href.startsWith('/read')) {
                result.push({ url: href, name: text });
            }
        }
        return result;
    }

    getBookId(url) {
        // 使用正则表达式提取数字
        const match = url.match(/\/book\/(\d+)\.html/);

        if (match) {
            const number = match[1]; // 提取到的数字部分
            return number;
        } else {
            return 0;
        }
    }

    async setDetail(id) {
        const url = this.siteUrl + id;
        console.log(url);
        const content = await this.request(url);
        let $ = load(content);
        const name = $('meta[property="og:novel:book_name"]').attr('content');
        const intro = $('meta[property="og:description"]').attr('content');
        const imgUrl = $('meta[property="og:image"]').attr('content');
        const author = $('meta[property="og:novel:author"]').attr('content');
        const updateTime = $('meta[property="og:novel:update_time"]').attr('content');

        const chapterUrl = `https://www.dxmwx.org/chapter/${this.getBookId(url)}.html`;
        const chapterRet = await this.request(chapterUrl);
        const chapterHtml = chapterRet.data;
        const chapterList = this.parseChapterList(chapterHtml);
        // console.log('chapterList:', chapterList);
        const bookDetailInfo = {
            name,
            imgUrl,
            intro,
            updateTime,
            chapterList,
            author,
        }
        this.vodDetail = await this.parseVodDetailFromDoc(bookDetailInfo, id);
    }

    async setPlay(flag, id, flags) {
        const url = this.siteUrl + id;
        const content = await this.request(url);
        let $ = load(content);
        const contentEle = $('#Lab_Contents');
        const result = [];
        contentEle.find('p').each((index, ele) => {
            if ($(ele).text().trim()) {
                result.push($(ele).text());
            }
        });

        this.playUrl = {
            "content": result.join('\n'),
        }
    }

    async _search(wd, page) {
        const url = `${this.siteUrl}/list/topall_${wd}_${page}.html`;
        let content = await this.request(url);
        while (!content && retry < 3) {
            retry++;
            content = await this.request(url)
        }
        const $ = load(content);
        const xiaoshuoList = $('#ListContents').children();
        const result = [];
        for (let i = 0; i < xiaoshuoList.length; i++) {
            const ele = xiaoshuoList[i];
            if ($(ele).children().length === 0) {
                continue;
            }
            const name = $(ele).find('.imgwidth').find('a').attr('title');
            const url = $(ele).find('.imgwidth').find('a').attr('href');
            const imgUrl = $(ele).find('.imgwidth').find('img').attr('src');
            const desc = $(ele).find('.neirongh5').find('a').text();
            const updateTime = $(ele).find('.lefth5').text();
            result.push({ name, url, imgUrl, desc, updateTime });
        }
        return result;
    }

    async setSearch(wd, quick) {
        const ret1 = await this._search(wd, 1);
        const ret2 = await this._search(wd, 2);
        const ret3 = await this._search(wd, 3);
        this.vodList = await this.parseVodShortListFromJson([...ret1, ...ret2, ...ret3])
    }
}

let spider = new DaxiongmaoXiaoshuoSpider()

async function init(cfg) {
    await spider.init(cfg)
}

async function home(filter) {
    return await spider.home(filter)
}

async function homeVod() {
    return await spider.homeVod()
}

async function category(tid, pg, filter, extend) {
    return await spider.category(tid, pg, filter, extend)
}

async function detail(id) {
    return await spider.detail(id)
}

async function play(flag, id, flags) {
    return await spider.play(flag, id, flags)
}

async function search(wd, quick) {
    return await spider.search(wd, quick)
}

export function __jsEvalReturn() {
    return {
        init: init, home: home, homeVod: homeVod, category: category, detail: detail, play: play, search: search,
    };
}

export { spider }
