// ==UserScript==
// @name         一键复制
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  复制文本，点击文本自动复制到剪切板，并提供启用/禁用功能。
// @author       WuJiu
// @match        *://purse.enlargemagic.com/admin/*
// @icon         https://img.icons8.com/?size=100&id=guQiTl74cP2t&format=png&color=000000
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 插件初始状态：复制功能禁用
    let copyEnabled = false;
    const currentVersion = '0.4'; // 当前版本号

    // 检查更新的函数
    function checkForUpdates() {
        const checkInterval = 6 * 60 * 60 * 1000; // 每6小时检查一次更新（防止频繁请求）

        // 先判断是否需要进行更新检查
        const lastChecked = localStorage.getItem('lastChecked');
        const now = Date.now();

        // 如果距离上次检查时间超过了6小时，则进行更新检查
        if (!lastChecked || (now - lastChecked) > checkInterval) {
            localStorage.setItem('lastChecked', now);

            // 请求最新版本的脚本文件或版本号
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://example.com/latest-version.json', // 这里填写您的版本信息的URL
                onload: function(response) {
                    const data = JSON.parse(response.responseText);
                    if (data.version !== currentVersion) {
                        showUpdateNotification();
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
        tooltip.style.backgroundColor = '#FF9800';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.zIndex = '1001';
        tooltip.innerText = '有新版本可用，请更新插件';
        document.body.appendChild(tooltip);

        // 5000ms后自动关闭提示
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 5000);
    }

    // 缓存控制：在请求时附加时间戳，避免缓存问题
    function appendTimestampToUrl(url) {
        const timestamp = new Date().getTime();
        return url.includes('?') ? `${url}&_=${timestamp}` : `${url}?_=${timestamp}`;
    }

    // 添加滑动开关
    const toggleSwitch = document.createElement('label');
    toggleSwitch.innerHTML = `
        <input type="checkbox" id="copy-toggle">
        <span>启用复制</span>
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

    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.style.position = 'fixed';
    tooltip.style.top = '50px';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = '#4CAF50';
    tooltip.style.color = '#fff';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.zIndex = '1001';
    tooltip.style.display = 'none';
    tooltip.innerText = '复制成功';
    document.body.appendChild(tooltip);

    // 功能：点击数字或日期文本自动复制
    document.addEventListener('click', (event) => {
        if (copyEnabled && event.target && event.target.innerText) {
            const text = event.target.innerText.trim();

            // 检查是否为数字文本
            if (/^\d+(\.\d+)?$/.test(text)) {
                copyToClipboard(text);
            }

            // 检查是否为日期文本（格式：YYYY-MM-DD HH:MM:SS）
            else if (/^\d{4}[-\/]\d{2}[-\/]\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
                const dateParts = text.split(' ')[0]; // 获取日期部分 YYYY-MM-DD
                copyToClipboard(dateParts);
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
        tooltip.style.display = 'block';
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 500);
    }

    // 页面加载后稍等一段时间进行更新检测
    setTimeout(() => {
        checkForUpdates();
    }, 3000); // 页面加载后3秒钟进行检查

})();
