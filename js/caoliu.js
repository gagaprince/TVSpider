
/**
 * @Desc caoliu cms
 */
import {Spider} from "./spider.js";
import * as Utils from "../lib/utils.js";
import {VodDetail, VodShort} from "../lib/vod.js";


class CLCmsSpider extends Spider {
    constructor() {
        super();
        this.siteUrl = "https://www.caoliuzyw.com/api.php/provide/vod/at/json/"
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
    }

    async request(url, method='get', data){
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
            'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
        };
        const res = await req(url, {
            method,
            headers,
            data,
            proxy: true,
        })
        return res.content;
    }

    getName() {
        return "草榴"
    }

    getAppName() {
        return "草榴"
    }

    getJSName() {
        return "caoliu"
    }

    getType() {
        return 3
    }

    async init(cfg) {
        await super.init(cfg);
    }

    async setClasses() {
        try{
            let content = await this.request(this.siteUrl)
            let retry = 0;
            while(!content && retry<3){
                retry ++;
                content = await this.request(this.siteUrl)
            }
            let resJson= JSON.parse(content)
            console.log(resJson);
            const classes = resJson.class;
            this.classes = classes;
        }catch(e){
            this.classes = [];
        }
    }

    async parseVodShortListFromJson(vodList) {
        let vod_list = []
        for (const vodData of vodList) {
            let vodShort = new VodShort()
            vodShort.load_data(vodData)
            vodShort['vod_remarks'] = vodData['vod_duration']
            // vodShort['vod_pic'] = 'https://cctv123456.com/i/ar2kgjb0.jpg'
            vod_list.push(vodShort)
        }
        return vod_list
    }

    async setCategory(tid, pg, filter, extend) {
        try{
            const url = `${this.siteUrl}?ac=detail&t=${tid}&pg=${pg}`
            let content = await this.request(url)
            let retry = 0;
            while(!content && retry<3){
                retry ++;
                content = await this.request(url)
            }
            let resJson= JSON.parse(content)
            this.vodList = await this.parseVodShortListFromJson(resJson["list"])    
            this.count = resJson['pagecount']
            this.total = resJson['total']
        }catch(e){
            this.vodList = [];
        }
        // this.vodList = [];
    }

    async parseVodDetailfromJson(detailObj){
        const vodDetail = new VodDetail();
        vodDetail.load_data(detailObj);
        return vodDetail;
    }

    async setDetail(id) {
        try{
            const url = `${this.siteUrl}?ac=detail&ids=${id}`
            let content = await this.request(url)
            let retry = 0;
            while(!content && retry<3){
                retry ++;
                content = await this.request(url)
            }
            let resJson= JSON.parse(content)
            this.vodDetail = await this.parseVodDetailfromJson(resJson["list"][0])
        }catch(e){
            this.vodDetail = {};
        }
    }
}


let spider = new CLCmsSpider()

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

export {spider, CLCmsSpider}