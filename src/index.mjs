import { launch } from 'puppeteer';
import juejin from './components/juejin/index.mjs';
import srvfSignIn from './components/srvf/sign-in/index.mjs';
import srvfForumdisplay from './components/srvf/forumdisplay/index.mjs';

// 创建浏览器上下文
launch({ defaultViewport: { width: 1920, height: 1080 }, headless: false, }).then(async browser => {
    const page = await browser.newPage();

    // 设置页面各种等待时间, 不限时
    page.setDefaultNavigationTimeout(0);

    // 掘金签到打卡
    await juejin(page, browser);

    // 救援队签到打卡
    await srvfSignIn(page, browser);

    // 救援队收集活动信息
    await srvfForumdisplay(page, browser);

    // 关闭当前browser
    await browser.close();
    console.log('关闭浏览器');

});