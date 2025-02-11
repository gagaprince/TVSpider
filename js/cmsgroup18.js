import { Spider } from "./spider.js";
import { VodDetail, VodShort } from "../lib/vod.js";

class CmsGroup18Spider extends Spider {
    constructor() {
        super();
        this.siteUrl = "http://new.gagaprince.top:3000"
        this.extendObj = {}
        this.parseMap = {};
        this.catOpenStatus = false;
        this.allClass = [];
        this.is18 = 1;
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

    getName() {
        return "小路虎资源🔞"
    }
    getAppName() {
        return "小路虎资源18"
    }
    getType() {
        return 3
    }

    getJSName() {
        return "cmsgroup18"
    }

    async init(cfg) {
        await super.init(cfg);
    }

    parseCate(classes) {
        this.allClass = classes.map(item => ({
            type_id: item.main_type_id + '',
            type_name: item.main_type_name,
            type_pid: item.main_type_pid + '',
        }));
        return this.allClass.filter(item => item.type_pid == 0)
    }

    async setClasses() {
        try {
            const cateUrl = `${this.siteUrl}/cms/cate/list?is18=${this.is18}`
            let content = await this.request(cateUrl);
            let retry = 0;
            while (!content && retry < 3) {
                retry++;
                content = await this.request(cateUrl)
            }
            let resJson = JSON.parse(content);
            this.classes = this.parseCate(resJson.data.class);
        } catch (error) {
            this.classes = []
        }
    }

    parseSmallCate(type_pid) {
        const smallClass = this.allClass.filter(item => item.type_pid == type_pid)
        return smallClass.map(item => ({
            v: item.type_id + '',
            n: item.type_name
        }))
    }

    async getFilter(type_id) {
        const extend_list = [];
        // 分类
        let extend_dic = { "key": '分类', "name": '分类', "value": [] }
        extend_dic.value = this.parseSmallCate(type_id)
        extend_dic.value.unshift({ v: '', n: '全部' })
        extend_list.push(extend_dic)

        // 地区

        // 年份

        // 字母

        return extend_list;
    }

    async setFilterObj() {
        for (let item of this.classes) {
            this.filterObj[item.type_id] = await this.getFilter(item.type_id);
        }
    }

    async parseVodShortListFromJson(vodList) {
        let vod_list = []
        for (const vodData of vodList) {
            let vodShort = new VodShort()
            vodShort.load_data(vodData)
            vodShort['vod_id'] = vodData['id'];
            vodShort['vod_remarks'] = vodData['vod_remarks'] || vodData['vod_duration']
            vod_list.push(vodShort)
        }
        return vod_list
    }

    async setCategory(tid, pg, filter, extend) {
        const bigCateId = tid;
        const smallCateId = extend['分类'] || '';
        const videoFilterUrl = `${this.siteUrl}/cms/video/filter?pg=${pg}&bigCateId=${bigCateId}&smallCateId=${smallCateId}&is18=${this.is18}`
        let content = await this.request(videoFilterUrl)
        let retry = 0;
        while (!content && retry < 3) {
            retry++;
            content = await this.request(videoFilterUrl)
        }
        let resJson = JSON.parse(content)
        this.vodList = await this.parseVodShortListFromJson(resJson['data']["list"]);
    }

    async parseVodDetailfromJson(detailObj) {
        const vodDetail = new VodDetail();
        vodDetail.load_data(detailObj);
        return vodDetail;
    }

    async setDetail(id) {
        try {
            const url = `${this.siteUrl}/cms/video/detail?ids=${id}&is18=1`
            let content = await this.request(url)
            let retry = 0;
            while (!content && retry < 3) {
                retry++;
                content = await this.request(url)
            }
            let resJson = JSON.parse(content)
            this.vodDetail = await this.parseVodDetailfromJson(resJson['data']["list"][0])
        } catch (e) {
            this.vodDetail = {};
        }
    }

    async setSearch(wd, quick, pg) {
        try {
            const searchUrl = `${this.siteUrl}/cms/video/search?key=${wd}&pg=${pg}&psize=500&is18=${this.is18}`;
            let content = await this.request(searchUrl)
            let retry = 0;
            while (!content && retry < 3) {
                retry++;
                content = await this.request(searchUrl)
            }
            let resJson = JSON.parse(content)
            this.vodList = await this.parseVodShortListFromJson(resJson['data']["list"]);
        } catch (error) {
            this.vodList = [];
        }
    }

}


let spider = new CmsGroup18Spider()

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

export { spider, CmsGroup18Spider }