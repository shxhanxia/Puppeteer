import { launch } from 'puppeteer';
import juejin from './index.mjs';

// 创建浏览器上下文
launch({ headless: false, defaultViewport: { width: 1920, height: 1080 } }).then(async browser => {
    const page = await browser.newPage();

    // 设置页面各种等待时间, 不限时
    page.setDefaultNavigationTimeout(0);

    // 掘金签到打卡
    await juejin(page, browser);

    // // 关闭掘金页面
    // await page.close();
    // console.log('关闭掘金页面');

    // // 关闭浏览器
    // await browser.close();
    // console.log('关闭浏览器');

});