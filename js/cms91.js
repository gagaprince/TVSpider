import {CLCmsSpider} from "./caoliu.js";

class Cms91Spider extends CLCmsSpider {
    constructor() {
        super();
        // this.siteUrl = "https://91md.me/api.php/provide/vod"
        this.siteUrl='https://naixxzy.com/api.php/provide/vod/';
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
    }

    getName() {
        return "91成人18+"
    }

    getAppName() {
        return "成人18+"
    }

    getJSName() {
        return "cms91"
    }

    getType() {
        return 3
    }
}



let spider = new Cms91Spider()

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

export {spider, Cms91Spider}