import { Spider } from "./spider.js";
import { BookDetail, BookShort } from "../lib/book.js";
import { Crypto, load } from "../lib/cat.js";

class ManhuaSpider extends Spider {
    constructor() {
        super();
        this.siteUrl = 'https://mimihanman.net';
    }

    getName() {
        return "爱漫画🔞"
    }

    getAppName() {
        return "爱漫画"
    }

    getJSName() {
        return "aimanhua"
    }

    getType() {
        return 20
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
        return res.content;
    }


    async setClasses() {
        const url = this.siteUrl + '/index.php/category/'
        const content = await this.request(url)
        const $ = load(content);
        const urCategoryList = $('ul[type="category"]');
        console.log(urCategoryList.length);
        const aList = $(urCategoryList[0]).find('a');
        console.log(aList.length);
        const categoryList = [];
        for (let i = 0; i < aList.length; i++) {
            const ele = aList[i];
            const name = $(ele).text();
            const url = $(ele).attr('href');
            categoryList.push({ name, url });
        }
        this.classes = categoryList.map(item => (this.getTypeDic(item.name, item.url)));
    }

    parseVodShortFromJson(obj) {
        let bookShort = new BookShort()
        bookShort.book_id = obj["url"]
        bookShort.book_name = obj["name"]
        bookShort.book_pic = obj["imgUrl"]
        bookShort.book_remarks = '';
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

    async parseVodShortListFromDoc($) {
        let vodElements = $("[class=\"container edit\"]").find("[class=\"col-auto\"]")
        let books = []
        for (const vodElement of vodElements) {
            let bookShort = new BookShort()
            bookShort.book_id = $(vodElement).find("a")[0].attribs.href.split("/comic/")[1]
            bookShort.book_pic = $(vodElement).find("img")[0].attribs["data-src"]
            bookShort.book_name = $($(vodElement).find("p")).text()
            books.push(bookShort)
        }
        return books
    }


    async parseVodDetailFromDoc(bookInfo, id) {
        let bookDetail = new BookDetail()
        bookDetail.book_pic = bookInfo.imgUrl
        bookDetail.book_name = bookInfo.name;
        bookDetail.book_director = '';
        bookDetail.book_content = bookInfo.intro;
        const chapterList = bookInfo.chapterList;
        let urls = chapterList.map((chapter) => {
            return chapter.name + '$' + id + '|' + chapter.url;
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

    async setCategory(tid, pg, filter, extend) {
        let page = pg || 1;
        if (page === 0) page = 1;
        let link = `${this.siteUrl}${tid}/page/${page}`;
        console.log('获取分类结果list的url：', link);
        const html = await this.request(link)
        const $ = load(html);
        const manhuaList = $('.item-cover');
        const bookList = [];
        for (let i = 0; i < manhuaList.length; i++) {
            const ele = manhuaList[i];
            const name = $(ele).find('h3').text();
            const url = $(ele).find('a').attr('href');
            const imgUrl = $(ele).find('img').attr('src');
            bookList.push({ name, url, imgUrl });
        }
        this.vodList = await this.parseVodShortListFromDocByCategory(bookList)
    }

    async setDetail(id) {
        const url = this.siteUrl + id;
        const content = await this.request(url);
        let $ = load(content);
        const mainInfoEle = $('#maininfo');
        const name = mainInfoEle.find('h1').text();
        const intro = mainInfoEle.find('#intro').text();
        const imgUrl = $('#fmimg').find('img').attr('src');
        const chapterListEle = $('#list').find('dl').find('a'); //all 
        const chapterNewListEle = $('#newchapter').find('a'); //new
        const chapterAllList = this.parseChapterList(chapterListEle, $);
        const chapterList = chapterAllList.splice(chapterNewListEle.length);
        const bookDetailInfo = {
            name,
            imgUrl,
            intro,
            chapterList,
        }
        this.vodDetail = await this.parseVodDetailFromDoc(bookDetailInfo, id);
    }

    async setPlay(flag, id, flags) {
        let info = id.split('|');
        let $ = await this.getHtml(this.siteUrl + `/comic/${info[0]}/chapter/${info[1]}`);
        const data = $('div.imageData')[0].attribs["contentkey"];
        let key = Crypto.enc.Utf8.parse('xxxmanga.woo.key');
        let iv = Crypto.enc.Utf8.parse(data.substr(0, 16));
        let src = Crypto.enc.Hex.parse(data.substr(16));
        let dst = Crypto.AES.decrypt({ ciphertext: src }, key, { iv: iv, padding: Crypto.pad.Pkcs7 });
        dst = Crypto.enc.Utf8.stringify(dst);
        const list = JSON.parse(dst);
        let content = [];
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            content[index] = element.url;
        }
        this.playUrl = {
            "content": content,
        }
    }
    async setSearch(wd, quick) {
        let page = 1
        const link = `${this.siteUrl}/api/kb/web/searcha/comics?offset=${page > 1 ? ((page - 1) * 12).toString() : ''}&platform=2&limit=12&q=${wd}&q_type=`;
        let list = JSON.parse(await this.fetch(link, null, this.getHeader()))["results"]["list"]
        this.vodList = await this.parseVodShortListFromJson(list)
    }
}

let spider = new ManhuaSpider()

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
