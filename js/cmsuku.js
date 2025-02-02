/**
 * @Desc U酷 cms
 */
// import {Spider} from "./spider.js";
import { CmsSpider } from '../jsbase/cmsbase/cms.js'


class CmsukuSpider extends CmsSpider {
    constructor() {
        super();
        this.siteUrl = "https://api.ukuapi.com/api.php/provide/vod/"
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
    }


    getName() {
        return "u酷"
    }

    getAppName() {
        return "u酷"
    }

    getJSName() {
        return "cmsuku"
    }

    getType() {
        return 3
    }
}


let spider = new CmsukuSpider()

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

export {spider, CmsukuSpider}