import fs from 'fs';
import path from  'path';
// const path = require('path');

const cmsInfos = [
    {
        '#appname#':'速博资源',
        '#jsname#':'subo',
        '#siteUrl#':'https://subocaiji.com/api.php/provide/vod/',
    },
    {
        '#appname#':'火狐资源',
        '#jsname#':'huohu',
        '#siteUrl#':'https://hhzyapi.com/api.php/provide/vod',
    },
    {
        '#appname#':'极速资源',
        '#jsname#':'jisu',
        '#siteUrl#':'https://jszyapi.com/api.php/provide/vod/at/json',
    },
    {
        '#appname#':'暴风资源',
        '#jsname#':'baofeng',
        '#siteUrl#':'https://bfzyapi.com/api.php/provide/vod/',
    },
    {
        '#appname#':'爱坤资源',
        '#jsname#':'aikun',
        '#siteUrl#':'https://ikunzyapi.com/api.php/provide/vod/',
    },
    {
        '#appname#':'天空资源',
        '#jsname#':'tiankong',
        '#siteUrl#':'https://m3u8.tiankongapi.com/api.php/provide/vod/from/tkm3u8/',
    },
    {
        '#appname#':'无尽资源',
        '#jsname#':'wujin',
        '#siteUrl#':'https://api.wujinapi.me/api.php/provide/vod/',
    },
    {
        '#appname#':'闪电资源',
        '#jsname#':'shandian',
        '#siteUrl#':'https://sdzyapi.com/api.php/provide/vod/',
    },
    {
        '#appname#':'ck资源',
        '#jsname#':'ck',
        '#siteUrl#':'https://ckzy.me/api.php/provide/vod/',
    },
    {
        '#appname#':'最大资源',
        '#jsname#':'zuida',
        '#siteUrl#':'http://zuidazy.me/api.php/provide/vod/',
    },
    {
        '#appname#':'金鹰资源',
        '#jsname#':'jinying',
        '#siteUrl#':'https://jyzyapi.com/provide/vod/',
    },
    {
        '#appname#':'飘零资源',
        '#jsname#':'piaoling',
        '#siteUrl#':'https://p2100.net/api.php/provide/vod/',
    },
    {
        '#appname#':'1080资源',
        '#jsname#':'yilingbaling',
        '#siteUrl#':'https://api.1080zyku.com/inc/api_mac10.php',
    },
    {
        '#appname#':'番号资源🔞',
        '#jsname#':'fanhao',
        '#siteUrl#':'http://fhapi9.com/api.php/provide/vod/',
    },
    {
        '#appname#':'奶香香🔞',
        '#jsname#':'naixiang',
        '#siteUrl#':'https://naixxzy.com/api.php/provide/vod/',
    },
    {
        '#appname#':'滴滴资源🔞',
        '#jsname#':'didi',
        '#siteUrl#':'https://api.ddapi.cc/api.php/provide/vod/',
    },
    {
        '#appname#':'玉兔资源🔞',
        '#jsname#':'yutu',
        '#siteUrl#':'https://apiyutu.com/api.php/provide/vod/',
    },
    {
        '#appname#':'鸡坤资源🔞',
        '#jsname#':'jikun',
        '#siteUrl#':'https://jkunzyapi.com/api.php/provide/vod/',
    },
    {
        '#appname#':'橘猫资源(丝袜)🔞',
        '#jsname#':'jumao',
        '#siteUrl#':'https://to.to-long.com/api.php/provide/vod/',
    },
    {
        '#appname#':'色猫资源🔞',
        '#jsname#':'semao',
        '#siteUrl#':'https://caiji.semaozy.net/inc/apijson_vod.php',
    },
    {
        '#appname#':'91av🔞',
        '#jsname#':'jiuyi',
        '#siteUrl#':'https://91av.cyou/api.php/provide/vod/',
    },
    {
        '#appname#':'湿乐园🔞',
        '#jsname#':'shileyuan',
        '#siteUrl#':'https://xxavs.com/api.php/provide/vod/',
    },
    {
        '#appname#':'优异资源🔞',
        '#jsname#':'youyi',
        '#siteUrl#':'https://a.uezy.pw/api.php/provide/vod/',
    },
    {
        '#appname#':'花都资源🔞',
        '#jsname#':'huadu',
        '#siteUrl#':'https://hd.hdys2.com/api.php/provide/vod/',
    },
    {
        '#appname#':'易看资源🔞',
        '#jsname#':'yikan',
        '#siteUrl#':'http://api.yikanapi.com/api.php/provide/vod/',
    },
    {
        '#appname#':'乐播资源🔞',
        '#jsname#':'lebo',
        '#siteUrl#':'https://lbapi9.com/api.php/provide/vod/',
    },
    {
        '#appname#':'黑木耳资源',
        '#jsname#':'heimuer',
        '#siteUrl#':'https://www.heimuer.tv/api.php/provide/vod',
    },
    {
        '#appname#':'森林资源🔞',
        '#jsname#':'senlin',
        '#siteUrl#':'https://slapibf.com/api.php/provide/vod/',
    },
    {
        '#appname#':'麻豆🔞',
        '#jsname#':'madou',
        '#siteUrl#':'https://91md.me/api.php/provide/vod/',
    },
    {
        '#appname#':'辣椒资源🔞',
        '#jsname#':'lajiao',
        '#siteUrl#':'https://apilj.com/api.php/provide/vod/',
    },
    {
        '#appname#':'老色逼资源🔞',
        '#jsname#':'laosebi',
        '#siteUrl#':'https://apilsbzy1.com/api.php/provide/vod/',
    }
];
function cpTmplFile(opt){
    // 定义模板文件路径和输出文件路径
    const root = '/Users/gagaprince/work/TVSpider';
    const templateFilePath = path.join(root, 'tpl','cmstmp.txt');
    const outputFilePath = path.join(root, 'js',`cms${opt['#jsname#']}.js`);
    // 定义需要替换的关键字及其对应的值
    // 读取模板文件内容
    fs.readFile(templateFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('读取模板文件失败:', err);
        return;
    }
    // 替换关键字
    let modifiedContent = data;
    for (const [key, value] of Object.entries(opt)) {
        const regex = new RegExp(key, 'g'); // 全局替换
        modifiedContent = modifiedContent.replace(regex, value);
    }
    // 将修改后的内容写入新的文件
    fs.writeFile(outputFilePath, modifiedContent, 'utf8', (err) => {
        if (err) {
        console.error('写入文件失败:', err);
        return;
        }
        console.log('文件已成功生成:', outputFilePath);
    });
    });
}

function main(){
    cmsInfos.forEach(opt=>{
        cpTmplFile(opt);
    })
}

main();
