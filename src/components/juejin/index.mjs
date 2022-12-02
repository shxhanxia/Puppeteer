import axios from 'axios';
import { sleep } from '../../utils.mjs';

export default async (page, browser) => {
    // 打开掘金页面
    console.log('准备打开掘金页面');
    await page.goto('https://juejin.cn');

    // 掘金页面加载完毕
    console.log('掘金页面加载完毕');

    // 等待登录完成
    await login(page, browser);

    // 等待签到完成
    await signin(page);

    // 等待抽奖完成
    await lottery(page);

    // 等待沾一沾完成
    await dip(page);

    // 任务完成, 发送模板消息
    await axios.post('https://zhouwankai.com/weixin/wxid_drm2upjugdzm21/sendMessage.php', {
        template_id: 'FWztbQIUI3NRMKuB2A26MHkklZGWMvf_vPtfYBjDLz4',
    }).catch(error => {
        console.error(error)
    })

}

// 登录
const login = async (page, browser) => {
    // 判断是否有活动有弹窗
    const dialog = await page.$('.dialog');
    if (dialog) {
        // 如果有弹窗
        console.log('有活动弹窗');

        // 点击弹窗关闭按钮
        await page.click('.dialog .icon-close');
        console.log('点击弹窗关闭按钮');
    }

    // 点击登录按钮
    await page.waitForSelector('.login-button');
    await page.click('.login-button');
    console.log('点击登录按钮');

    // 点击其它登录方式
    await page.waitForSelector('.clickable');
    await page.click('.clickable');
    console.log('点击其它登录方式');

    // 设置账户名
    await page.waitForSelector('input[name=loginPhoneOrEmail]');
    const loginPhoneOrEmail = await page.$('input[name=loginPhoneOrEmail]');
    await loginPhoneOrEmail.type('18203693634');
    console.log('设置账户名');

    // 设置密码
    await page.waitForSelector('input[name=loginPassword]');
    const loginPassword = await page.$('input[name=loginPassword]');
    await loginPassword.type('shx18203693634');
    console.log('设置密码');

    // 点击登录
    await page.waitForSelector('.panel .btn');
    await page.click('.panel .btn');
    console.log('点击登录');

    // 滑块儿验证
    await Promise.all([
        page.waitForNavigation(),
        captchaPass(page, browser),
    ]);
    console.log('页面刷新完成');
}

// 滑块儿验证
const captchaPass = async (page, browser) => new Promise(async resolve => {
    // 是否验证成功
    let passed = false;

    // 获取src
    await page.waitForSelector('#captcha-verify-image');
    let src = await page.$eval('#captcha-verify-image', (img) => img.src);
    console.log('获取src');

    do {

        // 获取distance
        let distance = await getDistance(browser, src);
        console.log(`获取distance${distance ? `成功: ${distance}` : '失败'}`);

        while (!distance) {
            console.log('重新获取distance');

            // 点击刷新按钮
            await page.waitForSelector('.secsdk_captcha_refresh');
            await page.click('.secsdk_captcha_refresh');
            console.log('点击刷新按钮');

            // 获取新的图片src
            let newSrc = await page.$eval('#captcha-verify-image', (img) => img.src);
            while (newSrc === src) {
                newSrc = await page.$eval('#captcha-verify-image', (img) => img.src);
            }

            // 新图片地址赋值给src
            src = newSrc;
            console.log('获取新的图片src: ', newSrc);

            // 重新获取distance
            distance = await getDistance(browser, newSrc);
            console.log(`重新获取distance${distance ? `成功: ${distance}` : '失败'}`);
        }

        await page.waitForSelector('#captcha-verify-image');
        const resultDistance = await page.$eval('#captcha-verify-image', (img, distance) => distance / img.naturalWidth * img.width - 5, distance);
        console.log('最终的distance: ', distance, resultDistance);

        // 获取滑块儿坐标
        await page.waitForSelector('.secsdk-captcha-drag-icon');
        const dragEle = await page.$eval('.secsdk-captcha-drag-icon', (el) => {
            const DOMRect = el.getBoundingClientRect();
            return {
                x: DOMRect.left + DOMRect.width / 2,
                y: DOMRect.top + DOMRect.height / 2,
            }
        });
        console.log('滑块儿坐标: ', dragEle);

        // 滑动滑块儿
        await page.mouse.move(dragEle.x, dragEle.y);
        await page.mouse.down();
        await page.mouse.move(dragEle.x + resultDistance, dragEle.y, { steps: 30 });
        await page.mouse.up();
        console.log('滑动滑块儿结束');

        // 获取是否成功
        await page.waitForSelector('.captcha_verify_message .msg');
        let resultMsg = await page.$eval('.captcha_verify_message .msg', (el) => el.innerText);
        while (!resultMsg) {
            resultMsg = await page.$eval('.captcha_verify_message .msg', (el) => el.innerText);
        }
        console.log(resultMsg);

        passed = /通过/.test(resultMsg);
        console.log(passed);

        if (!passed) {

            // 获取新的图片src
            let newSrc = await page.$eval('#captcha-verify-image', (img) => img.src);
            while (newSrc === src) {
                newSrc = await page.$eval('#captcha-verify-image', (img) => img.src);
            }

            // 新图片地址赋值给src
            src = newSrc;
            console.log('获取新的图片src: ', newSrc);
        }
    } while (!passed)
    resolve(passed);
    console.log('滑块儿验证通过, 等待页面刷新');
})

// 获取distance
const getDistance = async (browser, src) => new Promise(async resolve => {
    // 新打开一个页面, 用来操作背景图, 计算滑块儿滑动的距离
    const bgImgPage = await browser.newPage();

    // 设置页面各种等待时间, 不限时
    bgImgPage.setDefaultNavigationTimeout(0);

    bgImgPage.once('load', async () => {

        // 图片页面加载完毕
        console.log('图片页面加载完毕');

        // 等待图片出现
        await bgImgPage.waitForSelector('img');
        const distance = await bgImgPage.evaluate(async () => {

            // 背景图转canvas
            const bgImg = document.querySelector('img');
            const canvas = document.createElement('canvas');
            canvas.width = bgImg.naturalWidth;
            canvas.height = bgImg.naturalHeight;
            const context = canvas.getContext('2d');
            context.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // 保存横坐标和重复颜色出现次数
            const xAxis = {};

            // 允许存在误差
            allowDeviation = (num1, num2) => {
                const offset = 25;
                return -offset <= num1 - num2 && num1 - num2 <= offset;
            }

            // 对比rgb数值, 滑块儿的宽度是不需要滑动的
            for (let i = 1; i < bgImg.naturalWidth - 55; i++) {

                // 记录当前i的满足界限的点的个数
                let times = 0;

                // 竖着排查点
                for (let j = 45; j < bgImg.naturalHeight - 55; j++) {
                    const imgDataLeft = context.getImageData(i - 1, j - 1, 1, 1).data;
                    const imgData = context.getImageData(i, j, 1, 1).data;
                    const [rl, gl, bl] = imgDataLeft;
                    const [r, g, b] = imgData;
                    // 当前点的左边的点, rbg均在205以上, 当前点的rgb均在5-55
                    if (allowDeviation(rl, 230) && allowDeviation(gl, 230) && allowDeviation(bl, 230) && allowDeviation(r, 30) && allowDeviation(g, 30) && allowDeviation(b, 30)) {
                        // 记录符合条件出现的次数
                        times++;
                        xAxis[i] = times;
                    }
                }
                // 去掉重复像素出现小于20的
                if (xAxis[i] < 20) {
                    delete xAxis[i];
                }
            }

            // 排序, 取符合点最多的i
            return (Object.entries(xAxis).sort((a, b) => b[1] - a[1])[0] ?? [])[0];
        });

        // 返回计算的distance的值
        resolve(distance);

        // 计算完毕, 关掉tab页
        console.log('计算完毕, 准备关掉背景图页面')
        bgImgPage.close();
    });

    bgImgPage.once('close', () => {
        console.log('背景图页面已经关闭');
    });

    // 打开背景图页面
    console.log('准备打开背景图页面');
    await bgImgPage.goto(src);
})

// 签到
const signin = async page => {
    // 点击去签到
    await page.waitForSelector('.signin .btn');
    await sleep();
    await page.click('.signin .btn');
    console.log('点击去签到');

    // 点击签到
    await page.waitForSelector('.signin-container .signin .btn');
    await sleep();
    await page.click('.signin-container .signin .btn');
    console.log('点击签到');

    console.log('签到完成');
}

// 抽奖
const lottery = async page => {
    // 点击去抽奖
    await page.waitForSelector('.btn-area .btn', { visible: true });
    await page.click('.btn-area .btn');
    console.log('点击去抽奖');

    // 点击抽奖
    await page.waitForSelector('#turntable-item-0');
    await sleep();
    const text = await page.$eval('#turntable-item-0', (el) => el.innerText);

    if (text.includes('1次')) {
        await page.click('#turntable-item-0');
        console.log('点击抽奖');

        // 点击收下奖励
        await page.waitForSelector('.submit');
        await page.click('.submit');
        console.log('点击收下奖励');
    } else {
        console.log('已经抽过奖了');
    }
    console.log('抽奖完成');
}

// 沾一沾
const dip = async page => {
    // 点击沾一沾
    await page.waitForSelector('#stick-txt-0');
    await page.click('#stick-txt-0');
    console.log('点击沾一沾');
    await sleep();

    // 点击收下祝福
    await page.waitForSelector('.btn-submit', { visible: true });
    await page.click('.btn-submit');
    console.log('点击收下祝福');

    console.log('沾一沾完成');
}

