# dsh-todo-panel

一个基于 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 的 **TODO 任务清单**侧边栏插件：卡片式布局、优先级颜色标记、中文界面、按会话持久化。

> A task-list (TODO) sidebar panel for dsh-better-sidebar: card layout, priority colors, Chinese UI, per-session persistence.

## 功能

- 📋 **TODO 任务列表**：在 better-sidebar 侧边栏「+」菜单中打开「TODO」面板
- 🎨 **优先级颜色标记**：高（红）/ 中（橙）/ 低（绿）；添加时选择，点击标签循环切换
- 🃏 **卡片式布局**：每项任务独立卡片，左侧优先级色带，悬停上浮
- 🌐 **中文界面**：界面文案跟随中文，输入框 / 按钮 / 计数 / 清除全部中文化
- 💾 **按会话持久化**：任务保存到浏览器 localStorage（`dsh-todo-panel:<sessionId>`），刷新不丢失、会话互不干扰

## 安装

```sh
# npm（发布后）
dsh plugin --profile web add dsh-todo-panel

# 或 GitHub 源
dsh plugin --profile web add github:zhangkkkai/dsh-todo-panel
```

前置依赖：DeepSeek Harness web（≥ 0.1.0-rc.5）+ [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)（≥ 0.12.0）。

安装后**重启 dsh web**，在 better-sidebar 侧边栏「+」菜单打开「TODO」即可。

## 开发

```sh
pnpm install
pnpm run build     # tsc 类型 + tsdown 打包
pnpm run typecheck # 仅类型检查
```

## License

[MIT](./LICENSE)
