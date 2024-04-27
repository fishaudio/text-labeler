# Fish Audio Labeler
[![Build](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml/badge.svg)](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml)

[Cloudflare Pages Pages](https://text-labeler.pages.dev/)

## Run locally / 本地运行
在 [Actions](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml) 中可以找到最新的构建产物, 下载并解压后, 直接运行会自动打开浏览器.  

You can find the latest build artifacts in [Actions](https://github.com/fishaudio/text-labeler/actions/workflows/ci.yml). After downloading and extracting them, running it directly will automatically open the browser.

## Dev locally / 本地开发

```bash
git clone https://github.com/fishaudio/text-labeler
cd text-labeler
yarn install --frozen-lockfile

yarn dev

yarn build && yarn export
```
