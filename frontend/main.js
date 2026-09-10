/**
 * OtoLuuDiary 前端主进程
 * 使用 Electron 把网页包装成桌面窗口
 */

const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

// 后端 API 地址（和 Spring Boot 配置保持一致）
const API_BASE = 'http://localhost:8080/api';

function createWindow() {
    // 创建浏览器窗口
    const win = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 800,
        minHeight: 550,
        title: '欧托留日记',
        webPreferences: {
            // 允许渲染进程（页面）使用 Node API
            nodeIntegration: true,
            contextIsolation: false,
            // 允许加载本地文件
            webSecurity: false
        }
    });

    // 设置窗口图标（以后可以放个自定义图标，这里先不用）
    // win.setIcon(path.join(__dirname, 'src/assets/icon.png'));

    // 加载主页面（日记列表页）
    win.loadFile(path.join(__dirname, 'src', 'index.html'));

    // 页面跳转后重新聚焦窗口，解决导航后输入框无法打字的问题
    win.webContents.on('did-finish-load', () => {
        win.focus();
        win.webContents.focus();
    });

    // 开发阶段打开开发者工具，方便调试（上线前可注释掉）
    // win.webContents.openDevTools();

    // 简化菜单栏（去掉 Electron 默认的一堆菜单）
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '刷新列表',
                    accelerator: 'F5',
                    click: () => win.webContents.reload()
                },
                { type: 'separator' },
                { role: 'quit', label: '退出' }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' },
                { role: 'selectAll', label: '全选' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于 欧托留日记',
                    click: () => {
                        dialog.showMessageBox(win, {
                            type: 'info',
                            title: '关于',
                            message: '欧托留日记 (OtoLuuDiary)',
                            detail: '版本：0.1.0\n一款跨平台的私人日记软件。\n\n请确保先启动后端服务后再使用本软件。\n后端地址：' + API_BASE
                        });
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Electron 准备完成后创建窗口
app.whenReady().then(() => {
    createWindow();

    // macOS 特有：所有窗口关闭时也不退出，点击 dock 图标重新创建窗口
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Windows/Linux：所有窗口关闭后直接退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
