require('dotenv').config();
const username = process.env.USERNAME ;

const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const prettify = require('html-prettify');
const dayjs = require("dayjs");

const { getInfo, getGithubRepos, getGithubStarredRepos, pullRequestsReponse } = require('./api/request');

const tplPath = path.join(__dirname, './template.ejs');
const outputPath = path.join(__dirname, '../README.md');

const email = require('./utils/emailApi');

const main = async () => {
    const updatedAt = dayjs().format('YYYY年MM月DD日 HH时mm分')

    const tplStr = fs.readFileSync(tplPath, 'utf8');

    const ipinfo = await getInfo();

    const now = new Date();
    console.log("Action运行时时间:", now.toLocaleString());

    // Github接口
    const githubRepos = await getGithubRepos(username);
    const recentRepos = githubRepos.filter(repo => {
        const updatedAt = new Date(repo.updated_at);
        const diffDays = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    });
    let threeDaysUpdatedReposName = [];
    recentRepos.forEach((item) => {
        threeDaysUpdatedReposName.push(item.name)
    })
    console.log("获取GitHub仓库信息:", githubRepos);
    const githubStarRepos = await getGithubStarredRepos(username);
    console.log("获取GitHub Starred 仓库信息:", githubStarRepos);
    console.log("获取GitHub近三天更新的仓库:", threeDaysUpdatedReposName);
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
