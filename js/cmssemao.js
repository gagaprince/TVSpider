/**
 * @Desc 色猫资源🔞 cms
 */
// import {Spider} from "./spider.js";
import { CmsSpider } from '../jsbase/cmsbase/cms.js'


class CmssemaoSpider extends CmsSpider {
    constructor() {
        super();
        this.siteUrl = "https://caiji.semaozy.net/inc/apijson_vod.php"
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
    }


    getName() {
        return "色猫资源🔞"
    }

    getAppName() {
        return "色猫资源🔞"
    }

    getJSName() {
        return "cmssemao"
    }

    getType() {
        return 3
    }
}


let spider = new CmssemaoSpider()

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

export {spider, CmssemaoSpider}