import { launch } from 'puppeteer';
import juejin from './components/juejin';
import srvfSignIn from './components/srvf/sign-in';
import srvfForumdisplay from './components/srvf/forumdisplay';

// 创建浏览器上下文
launch({ devtools: true }).then(async browser => {
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