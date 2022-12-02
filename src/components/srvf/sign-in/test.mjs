import { launch } from 'puppeteer';
import srvfSignIn from './index.mjs';

// 创建浏览器上下文
launch({ defaultViewport: { width: 1920, height: 1080 }, headless: false, }).then(async browser => {
    const page = await browser.newPage();

    // 设置页面各种等待时间, 不限时
    page.setDefaultNavigationTimeout(0);

    // 救援队签到打卡
    await srvfSignIn(page);

    // // 关闭救援队页面
    // await page.close();
    // console.log('关闭救援队页面');

    // // 关闭浏览器
    // await browser.close();
    // console.log('关闭浏览器');

});