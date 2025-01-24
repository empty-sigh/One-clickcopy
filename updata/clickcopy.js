// ==UserScript==
// @name         一键复制
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  复制文本，点击文本自动复制到剪切板，并提供启用/禁用功能。
// @author       WuJiu
// @match        *://purse.enlargemagic.com/admin/*
// @icon         https://img.icons8.com/?size=100&id=guQiTl74cP2t&format=png&color=000000
// @updateURL    https://github.com/empty-sigh/One-clickcopy/blob/main/updata/clickcopy.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 插件初始状态：复制功能禁用
    let copyEnabled = false;
    const currentVersion = '0.6'; // 当前版本号

    // GitHub 版本信息 URL
    const versionFileUrl = 'https://github.com/empty-sigh/One-clickcopy/blob/main/updata/version.json';

    // 检查更新的函数
    function checkForUpdates() {
        const checkInterval = 6 * 60 * 60 * 1000; // 每6小时检查一次更新（防止频繁请求）

        // 先判断是否需要进行更新检查
        const lastChecked = localStorage.getItem('lastChecked');
        const now = Date.now();

        // 如果距离上次检查时间超过了6小时，则进行更新检查
        if (!lastChecked || (now - lastChecked) > checkInterval) {
            localStorage.setItem('lastChecked', now);

            // 请求版本信息文件
            GM_xmlhttpRequest({
                method: 'GET',
                url: versionFileUrl,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.version !== currentVersion) {
                            showUpdateNotification();
                            downloadAndUpdateScript(data.scriptUrl);
                        }
                    } catch (e) {
                        console.error('更新检查失败:', e);
                    }
                },
                onerror: function() {
                    console.error('无法检查更新');
                }
            });
        }
    }

    // 显示更新通知
    function showUpdateNotification() {
        const tooltip = document.createElement('div');
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.color = '#4CAF50';  // 绿色文字
        tooltip.style.fontSize = '16px';
        tooltip.style.padding = '10px';
        tooltip.style.zIndex = '1001';
        tooltip.style.display = 'none';  // 初始不显示
        tooltip.innerText = '有新版本可用，请更新插件';
        document.body.appendChild(tooltip);

        // 使用动画显示提示框
        tooltip.style.animation = 'fadeInOut 2s forwards';
        tooltip.style.display = 'block';  // 显示提示框
    }

    // 下载并更新脚本
    function downloadAndUpdateScript(scriptUrl) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: scriptUrl,
            onload: function(response) {
                // 执行新的脚本
                try {
                    const newScript = response.responseText;
                    eval(newScript); // 动态加载新的脚本
                } catch (e) {
                    console.error('更新失败:', e);
                }
            },
            onerror: function() {
                console.error('无法下载更新的脚本');
            }
        });
    }

    // CSS 动画：从顶部显示，慢慢淡出
    GM_addStyle(`
        @keyframes fadeInOut {
            0% {
                top: 50px;
                opacity: 0;
            }
            20% {
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                top: 10px;
                opacity: 0;
            }
        }
    `);

    // 缓存控制：在请求时附加时间戳，避免缓存问题
    function appendTimestampToUrl(url) {
        const timestamp = new Date().getTime();
        return url.includes('?') ? `${url}&_=${timestamp}` : `${url}?_=${timestamp}`;
    }

    // 添加滑动开关
    const toggleSwitch = document.createElement('label');
    toggleSwitch.innerHTML = `
        <input type="checkbox" id="copy-toggle">
        <span>复制</span>
    `;
    toggleSwitch.style.position = 'fixed';
    toggleSwitch.style.top = '10px';
    toggleSwitch.style.right = '10px';
    toggleSwitch.style.zIndex = 1000;
    toggleSwitch.style.backgroundColor = '#fff';
    toggleSwitch.style.padding = '10px';
    toggleSwitch.style.border = '1px solid #ddd';
    toggleSwitch.style.borderRadius = '5px';
    document.body.appendChild(toggleSwitch);

    // 监听开关事件
    const copyToggle = document.getElementById('copy-toggle');
    copyToggle.addEventListener('change', (event) => {
        copyEnabled = event.target.checked;
    });

    // 正则表达式：检测 IP 地址（IPv4 和 IPv6）
    const ipv4Regex = /(\b(?:\d{1,3}\.){3}\d{1,3}\b)/;
    const ipv6Regex = /(\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b)/;

    // 功能：点击数字、日期或IP地址文本自动复制
    document.addEventListener('click', (event) => {
        if (copyEnabled && event.target && event.target.innerText) {
            const text = event.target.innerText.trim();

            // 检查是否为数字文本
            if (/^\d+(\.\d+)?$/.test(text)) {
                copyToClipboard(text);
            }

            // 检查是否为日期文本（格式：YYYY-MM-DD HH:MM:SS）
            else if (/^\d{4}[-\/]\d{2}[-\/]\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
                const dateParts = text.split(' ')[0];  // 获取日期部分 YYYY-MM-DD
                copyToClipboard(dateParts);
            }

            // 检查是否为IPv4地址
            else if (ipv4Regex.test(text)) {
                copyToClipboard(text.match(ipv4Regex)[0]);  // 提取IPv4地址并复制
            }

            // 检查是否为IPv6地址
            else if (ipv6Regex.test(text)) {
                copyToClipboard(text.match(ipv6Regex)[0]);  // 提取IPv6地址并复制
            }
        }
    });

    // 复制到剪切板的函数
    function copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // 显示复制成功提示
        showUpdateNotification();
    }

    // 页面加载后稍等一段时间进行更新检测
    setTimeout(() => {
        checkForUpdates();
    }, 3000);  // 页面加载后3秒钟进行检查

})();
