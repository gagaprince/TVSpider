/**
 * @Desc 非凡 cms
 */
// import {Spider} from "./spider.js";
import { CmsSpider } from '../jsbase/cmsbase/cms.js'


class CmsfeifanSpider extends CmsSpider {
    constructor() {
        super();
        this.siteUrl = "http://cj.ffzyapi.com/api.php/provide/vod/at/json/"
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
    }

    // async request(url, method='get', data){
    //     console.log('baidu request --------');
    //     const headers = {
    //         'User-Agent': 'PostmanRuntime/7.43.0',
    //         'Accept':'*/*'
    //     };
    //     const res = await req(url, {
    //         method,
    //         headers,
    //         data,
    //     })
    //     return res.content;
    // }

    getName() {
        return "非凡"
    }

    getAppName() {
        return "非凡"
    }

    getJSName() {
        return "cmsfeifan"
    }

    getType() {
        return 3
    }
}


let spider = new CmsfeifanSpider()

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

export {spider, CmsfeifanSpider}