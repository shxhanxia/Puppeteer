import { launch } from 'puppeteer';
import srvfForumdisplay from './index.mjs';

// 创建浏览器上下文
launch({
    devtools: true,
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-zygote',
        '--no-sandbox'
    ]
}).then(async browser => {
    const page = await browser.newPage();

    // 设置页面各种等待时间, 不限时
    page.setDefaultNavigationTimeout(0);

    // 救援队收集活动信息
    await srvfForumdisplay(page);

    // // 关闭救援队页面
    // await page.close();
    // console.log('关闭救援队页面');

    // // 关闭浏览器
    // await browser.close();
    // console.log('关闭浏览器');

});