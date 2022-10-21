import axios from 'axios';

export default async page => {
    // 救援队各个页面对应fid及说明
    const fidsList = [
        { label: '活动', fid: 45 },
        { label: '公告', fid: 2 },
        { label: '救援知识', fid: 98 },
        { label: '公益故事', fid: 62 },
        { label: '媒体报道', fid: 36 },
        { label: '捐助公示', fid: 37 },
        { label: '招新公告', fid: 39 },
    ];

    // 依次读取各个页面数据
    for (let i = 0; i < fidsList.length; i++) {
        await pagesTraverse(page, fidsList[i]);
    }

}

// 读取页面数据并更新数据库
const pagesTraverse = async (page, { label, fid }) => {

    // 打开救援队页面
    console.log(`准备打开救援队${label}页面`);
    await page.goto(`http://www.srvf.cn/forum.php?mod=forumdisplay&fid=${fid}`);

    // 救援队活动加载完毕
    console.log(`救援队${label}页面加载完毕`);

    const newList = await page.evaluate(async fid => {
        const list = [];
        document.querySelectorAll(`table[summary="forum_${fid}"] a.s`).forEach(el => list.push({ title: el.text, url: el.href }))
        return list;
    }, fid);

    // 获取服务器中存储的数据列表, json格式字符串
    const { data: oldList } = await axios.get(`https://zhouwankai.com/weixin/wxid_drm2upjugdzm21/srvf/getActivityByFid.php?fid=${fid}`);

    // 判断是否需要更新列表
    if (JSON.stringify(newList) !== JSON.stringify(oldList)) {

        console.log(`有新${label}`);

        // 新增加的列表
        const addList = newList.filter(obj => !oldList.some(item => item.title === obj.title));
        console.log(`新${label}列表`, addList);

        for (let i = 0; i < addList.length; i++) {
            const obj = addList[i];
            // 调用推送信息接口
            await axios.post('https://zhouwankai.com/weixin/wxid_drm2upjugdzm21/sendMessage.php', {
                template_id: 'JhaXX6QrDholfmeT-M-joOltnjuKDFy_Q8qQ_l463pA',
                data: obj,
            }).catch(error => {
                console.error(error)
            })
        }

        // 更新列表
        await axios.post('https://zhouwankai.com/weixin/wxid_drm2upjugdzm21/srvf/updateActivity.php', { fid: fid, value: JSON.stringify(newList) }).catch(error => {
            console.error(error)
        })

        console.log(`${label}更新完成`);
    } else {
        console.log(`没有新${label}`);
    }
}