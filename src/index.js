require('dotenv').config();
const username = process.env.USERNAME ;

const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const prettify = require('html-prettify');
const dayjs = require("dayjs");

const { getInfo, getGithubRepos, getGithubStarredRepos, pullRequestsReponse } = require('./api/request');
const generateEchartsImage = require('./utils/echarts');

const tplPath = path.join(__dirname, './template.ejs');
const outputPath = path.join(__dirname, '../README.md');

const email = require('./utils/emailApi');

const main = async () => {
    const updatedAt = dayjs().format('YYYY年MM月DD日 HH时mm分')

    const tplStr = fs.readFileSync(tplPath, 'utf8');

    const cacheDir = path.resolve(__dirname, '../src/cache');
    const todayStr = dayjs().format('YYYY-MM-DD');
    const cacheFilePath = path.join(cacheDir, `${todayStr}.json`);

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    const ipinfo = await getInfo();

    const now = new Date();
    console.log("Action运行时时间:", now.toLocaleString());

    // Github接口
    // 查找自己所有仓库
    let githubRepos = [];

    if (fs.existsSync(cacheFilePath)) {
        githubRepos = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    } else {
        console.log('查找自己所有仓库缓存未命中');
        githubRepos = await getGithubRepos(username);
        fs.writeFileSync(cacheFilePath, JSON.stringify(githubRepos, null, 2), 'utf8');
    }

    // 所有仓库的技术栈
    let allReposTechStack = [];
    for (const item of githubRepos) {
        if (item.language) {
            const existingLanguage = allReposTechStack.find(lang => lang.name === item.language);
            if (existingLanguage) {
                existingLanguage.value += 1;
            } else {
                allReposTechStack.push({ name: item.language, value: 1 });
            }
        }
    }

    // 此时 allReposTechStack 已经处理完毕
    console.log("技术栈统计完成:", allReposTechStack);

    // 生成南丁格尔图
    generateEchartsImage(allReposTechStack).then(() => {
        console.log("生成南丁格尔图成功");
    }).catch((err) => {
        console.error("生成南丁格尔图失败:", err);
    });

    // 过滤最近三天
    const recentRepos = githubRepos.filter(repo => {
        const updatedAt = new Date(repo.updated_at);
        const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    });
    let threeDaysUpdatedReposName = [];
    recentRepos.forEach((item) => {
        threeDaysUpdatedReposName.push(item.name)
    })
    // console.log("获取GitHub仓库信息:", githubRepos);
    // 获取GitHub Starred 仓库信息
    const githubStarRepos = await getGithubStarredRepos(username);
    // console.log("获取GitHub Starred 仓库信息:", githubStarRepos);
    // console.log("获取GitHub近三天更新的仓库:", threeDaysUpdatedReposName);
    // 获取最近三天更新的仓库的Pull Requests
    const pullRequests = await pullRequestsReponse(username,threeDaysUpdatedReposName);

    const html = ejs.render(tplStr, {
        ipinfo,
        updatedAt,
        githubRepos,
        githubStarRepos,
        pullRequests
    });

    const prettyHtml = prettify(html);

    // 发送邮件
    try {
        await email.sendqqEmail(process.env.GO_EMAIL, prettyHtml);
    }catch (err) {
        console.error('发送邮件失败:', err);
    }

    fs.writeFileSync(outputPath, prettyHtml);
}

main().then();
