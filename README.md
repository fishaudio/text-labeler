# Fish Audio Labeler
[![Build](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml/badge.svg)](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml)

简单易用的拼音数据标注工具, [Cloudflare Pages 体验地址](https://text-labeler.pages.dev/)

## 本地运行
在 [Actions](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml) 中可以找到最新的构建产物, 下载并解压后, 直接运行会自动打开浏览器.

## 本地开发

```bash
git clone https://github.com/fishaudio/text-labeler
cd text-labeler
yarn install --frozen-lockfile

# 直接以开发模式运行
yarn dev

# 或者打包静态文件, 生成到 out 目录
yarn build && yarn export
```
