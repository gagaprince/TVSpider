import { Spider } from "./spider.js";
import { BookDetail, BookShort } from "../lib/book.js";
import { Crypto, load } from "../lib/cat.js";

class Xiaoshuo66Spider extends Spider {
    constructor() {
        super();
        this.siteUrl = 'https://www.66story.com';
    }

    getName() {
        return "66成人🔞"
    }

    getAppName() {
        return "66成人"
    }

    getJSName() {
        return "xiaoshuo66"
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
        const url = this.siteUrl + '/index.php/book/category/'
        console.log('分类请求:',url);
        let content = await this.request(url)
        let retry = 0;
        while (!content && retry < 3) {
            retry++;
            content = await this.request(url)
        }
        
        const $ = load(content);
        console.log('content:', content);
        const ulCategoryList = $('.type-list');
        const aList = $(ulCategoryList[0]).find('a');
        console.log(aList.length);
        const categoryList = [];
        for (let i = 0; i < aList.length; i++) {
            const ele = aList[i];
            const name = $(ele).text();
            const url = $(ele).attr('href');
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

    async setCategory(tid, pg, filter, extend) {
        let page = pg || 1;
        if (page === 0) page = 1;
        let link = `${this.siteUrl}${tid}/page/${page}`;
        console.log('获取分类结果list的url：', link);
        const html = await this.request(link)
        // console.log('分类列表内容：',html);
        const $ = load(html);
        const xiaoshuoList = $('.list-wrapper').find('li');
        const bookList = [];
        for (let i = 0; i < xiaoshuoList.length; i++) {
            const ele = xiaoshuoList[i];
            const name = $(ele).find('.title').find('a').text();
            const url = $(ele).find('.title').find('a').attr('href');
            const imgUrl = $(ele)
                .find('.cover-wrapper')
                .find('img')
                .attr('data-src');
            const desc = $(ele).find('.desc').text();
            bookList.push({ name, url, imgUrl, desc });
        }
        this.vodList = await this.parseVodShortListFromDocByCategory(bookList)
    }

    parseChapterList(chapterListEle, $) {
        const result = [];
        for (let i = 0; i < chapterListEle.length; i++) {
          const ele = chapterListEle[i];
          const name = $(ele).text().replace(/\s+/g,'')
          const url = $(ele).attr('href');
          result.push({ name, url });
        }
        return result;
    }

    async setDetail(id) {
        const url = this.siteUrl + id;
        console.log(url);
        const content = await this.request(url);
        let $ = load(content);
        const mainInfoEle = $('.story-detail__info');
        const name = mainInfoEle.find('.title').find('h1').text();
        const intro = mainInfoEle.find('.j-info-desc').find('span').text();
        const imgUrl = mainInfoEle.find('.cover').find('img').attr('data-src');
        const author = mainInfoEle.find('.author').find('a').text();

        const chapterListEle = $('.j-catalog-list').find('a');
        const chapterList = this.parseChapterList(chapterListEle, $);
        // console.log('chapterList:', chapterList);
        const bookDetailInfo = {
            name,
            imgUrl,
            intro,
            chapterList,
            author,
        }
        this.vodDetail = await this.parseVodDetailFromDoc(bookDetailInfo, id);
    }

    async setPlay(flag, id, flags) {
        const url = this.siteUrl + id;
        const content = await this.request(url);
        let $ = load(content);
        const contentEle = $('.content');
        const result = [];
        contentEle.find('p').each((index, ele) => {
            result.push($(ele).text());
        });

        this.playUrl = {
            "content": result.join('\n'),
        }
    }

    async _search(wd, page){
        const url = `${this.siteUrl}/index.php/book/search/${wd}/${page}`;
        let content = await this.request(url);
        while (!content && retry < 3) {
            retry++;
            content = await this.request(url)
        }
        const $ = load(content);
        const xiaoshuoList = $('.story-search__container-main')
            .find('.list')
            .find('.j-item');
        console.log(xiaoshuoList.length);
        const result = [];
        for (let i = 0; i < xiaoshuoList.length; i++) {
            const ele = xiaoshuoList[i];
            const name = $(ele).find('.item-info__header').find('a').text();
            const url = $(ele)
                .find('.item-info__header')
                .find('a')
                .attr('href');
            const imgUrl = $(ele)
                .find('.item-cover')
                .find('img')
                .attr('data-src');
            const desc = $(ele).find('.item-info__desc').text();
            result.push({ name, url, imgUrl, desc });
        }
        return result;
    }

    async setSearch(wd, quick) {
        const ret1 = await this._search(wd, 1);
        const ret2 = await this._search(wd, 2);
        const ret3 = await this._search(wd, 3);
        this.vodList = await this.parseVodShortListFromJson([...ret1,...ret2,...ret3])
    }
}

let spider = new Xiaoshuo66Spider()

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
