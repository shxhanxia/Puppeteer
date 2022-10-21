import axios from 'axios';

export default async page => {

    // 打开救援队页面
    console.log('准备打开救援队页面');
    await page.goto('http://www.srvf.cn');

    // 救援队页面加载完毕
    console.log('救援队页面加载完毕');

    // 等待登录完成
    await login(page);

    // 访问10个用户, 并删除访问记录
    for (let i = 1; i <= 10; i++) {
        await interview(page, i);
    }
    console.log('访问10个用户, 并删除访问记录');

    // 任务完成, 发送模板消息
    await axios.post('https://zhouwankai.com/weixin/wxid_drm2upjugdzm21/sendMessage.php', {
        template_id: 'FWztbQIUI3NRMKuB2A26MHkklZGWMvf_vPtfYBjDLz4',
    }).catch(error => {
        console.error(error)
    })
}

// 登录
const login = async page => {

    // 点击登录按钮
    await page.waitForSelector('.login_list:last-child .login_block');
    await page.click('.login_list:last-child .login_block');
    console.log('点击登录按钮');

    // 设置账户名
    await page.waitForSelector('input[name=username]', { visible: true });
    const username = await page.$('input[name=username]');
    await username.type('韩侠');
    console.log('设置账户名');

    // 设置密码
    await page.waitForSelector('input[name=password]');
    const password = await page.$('input[name=password]');
    await password.type('shx0471209905');
    console.log('设置密码');

    // 点击登录
    await page.waitForSelector('button[name=loginsubmit]');
    await page.click('button[name=loginsubmit]');
    console.log('点击登录');

    // 页面加载出来个人信息
    await page.waitForSelector('.avatarimg');
    console.log('页面加载出来个人信息');
}

// 访问用户并删除访问记录
const interview = async (page, i) => {
    await page.goto(`http://www.srvf.cn/home.php?mod=space&uid=${i}`);
    console.log(`访问第${i}个用户`);
    await page.waitForSelector('.god');
    await page.click('.god');
    console.log(`删除访问第${i}个用户的访问记录`);
}