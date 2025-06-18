const axios = require("axios");

const ipInfoUrl = 'https://api.vore.top/api/IPdata'

/**获取IP地址信息 */
const getInfo = async () => {
    const res = await axios.request({
        method: 'GET',
        url: ipInfoUrl,
    })

    const { adcode, ipinfo } = res.data;

    console.log("调用IPinfo 查询start");
    console.log('当前Action的IP地址信息:', ipinfo?.text);
    console.log('当前Action的位置信息:', adcode?.o);
    console.log("调用IPinfo 查询end");

    return `当前Action服务器的IP地址是: ${ipinfo?.text}, 位置在: ${adcode?.o}`;
}

/**
 * 获取 GitHub 用户的公开仓库
 * @param {String} username
 * @returns {Promise<Object[]>}
 */
const getGithubRepos = async (username) => {
    try {
        const perPage = 100;
        let page = 1;
        let allRepos = [];

        while (true) {
            const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
            const response = await axios.request({
                method: 'GET',
                url: url,
            });

            if (response.data.length === 0) break; // 没有更多仓库了

            allRepos = allRepos.concat(response.data);
            page++;
        }

        return allRepos;
    } catch (error) {
        throw new Error('GitHub API 获取用户仓库失败');
    }
};

/**
 * 获取 GitHub 用户关注的仓库（Starred）
 * @param {String} username
 * @returns {Promise<Object[]>}
 */
const getGithubStarredRepos = async (username) => {
    try {
        const perPage = 100;
        let page = 1;
        let allStarred = [];

        while (true) {
            const url = `https://api.github.com/users/${username}/starred?per_page=${perPage}&page=${page}`;
            const response = await axios.get(url);

            const repos = response.data;
            if (repos.length === 0) break; // 没有更多数据了

            allStarred = allStarred.concat(repos);
            page++;
        }

        return allStarred;
    } catch (error) {
        throw new Error('GitHub API 获取用户关注的仓库失败');
    }
};

/**
 * 获取仓库的提交记录
 * @param {String} repoName 格式如 "username/repo"
 * @returns {Promise<Object[]>}
 */
const commitReponse = async (repoName) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repoName}/commits`);
        return response.data;
    } catch (error) {
        throw new Error('GitHub API 获取提交记录失败');
    }
};

/**
 * 获取仓库的问题（Issues）
 * @param {String} repoName 格式如 "username/repo"
 * @returns {Promise<Object[]>}
 */
const issuesReponse = async (repoName) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repoName}/issues`);
        return response.data;
    } catch (error) {
        throw new Error('GitHub API 获取 Issues 失败');
    }
};

/**
 * 获取仓库的拉取请求（Pull Requests）
 * @param {String} repoName 格式如 "username/repo"
 * @returns {Promise<Object[]>}
 */
const pullRequestsReponse = async (username,repoNameArray) => {
    try {
        if (!repoNameArray || repoNameArray.length === 0) {
            return [];
        }
        let data = [];
        for (const repoName of repoNameArray) {
            const response = await axios.request({
                method: 'GET',
                url: `https://api.github.com/repos/${username}/${repoName}/pulls`,
            })
            data = data.concat(response.data);
        }
        console.log("获取Pull Requests:", data);
        return data;
    } catch (error) {
        throw new Error('GitHub API 获取 Pull Requests 失败');
    }
};

/**
 * 获取仓库的事件（Events）
 * @param {String} repoName 格式如 "username/repo"
 * @returns {Promise<Object[]>}
 */
const eventsReponse = async (repoName) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repoName}/events`);
        return response.data;
    } catch (error) {
        throw new Error('GitHub API 获取 Events 失败');
    }
};

module.exports = {
    getInfo,
    getGithubRepos,
    getGithubStarredRepos,
    commitReponse,
    issuesReponse,
    pullRequestsReponse,
    eventsReponse
};