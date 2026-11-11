# jp-website-carousel

日本官網的輪播。以 iframe 嵌在 Super.app 的頁面裡，內容來自一個 Notion 資料庫。

```
Super.app 頁面（貼著 iframe.html 那段嵌入碼）
  └─ iframe → https://capsule-taiwan.github.io/jp-website-carousel/   GitHub Pages，直接提供 main 分支的根目錄
                └─ POST → Cloudflare Worker jp-website-slider-notionapi  原始碼在 worker/
                              └─ Notion API：查詢 NOTION_DATABASE 這個資料庫
```

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | 輪播本體。Worker 的網址寫在 `WORKER_URL` |
| `iframe.html` | 貼到 Super.app 的嵌入碼，含依寬度調整 iframe 高度的 script |
| `worker/` | Cloudflare Worker 的原始碼和部署設定 |
| `.github/workflows/deploy.yml` | 舊的部署流程，已經沒有作用（見最下方） |

## 怎麼改

- **輪播的圖片和文字：** 直接改 Notion 資料庫，不用動程式。
- **樣式：** 改 `index.html` 後 push 到 `main`，GitHub Pages 大約一分鐘內更新。

## Worker

Worker 很單純：收到請求就用 `NOTION_API_KEY` 去查 `NOTION_DATABASE`，把 Notion 的回傳原樣轉回去（CORS 開放所有網域）。

| 變數 | 內容 |
|---|---|
| `NOTION_API_KEY` | Notion integration 的 token，這個 integration 要在資料庫的「連線」裡有權限 |
| `NOTION_DATABASE` | 輪播資料庫的 ID（Notion 資料庫網址中的那串） |

**目前部署在哪：** 公司的 Cloudflare 帳號（`it…@capsulecorporation.cc`），網址是 `https://jp-website-slider-notionapi.it-b89.workers.dev`。2026-11-11 從 zhaoen 的帳號搬過來。

兩個變數是在後台設定的。如果是一般變數（plain text），值在後台看得到明碼；改成 Secret 比較好，名稱和值不變即可。

**改程式後重新部署：**

```bash
cd worker
npx wrangler login     # 用公司的 Cloudflare 帳號
npx wrangler deploy
```

`wrangler.toml` 裡有 `keep_vars = true`，部署時會保留後台設定的變數。**不要拿掉這行**，否則一般變數會在部署時被清掉，輪播就抓不到資料。

**搬到別的 Cloudflare 帳號：** 在新帳號 `npx wrangler deploy`，再用 `npx wrangler secret put NOTION_API_KEY` 和 `npx wrangler secret put NOTION_DATABASE` 設定兩個值。部署完會拿到新網址 `https://jp-website-slider-notionapi.<子網域>.workers.dev`，把 `index.html` 的 `WORKER_URL` 改成它再 push 就完成了，Super.app 那邊不用動。

## 關於 `deploy.yml`

早期的 `index.html` 裡有 `NOTION_TOKEN_PLACEHOLDER` 這類佔位字串，部署時由這個 workflow 把 GitHub secrets 填進去，再推到 `gh-pages` 分支。後來改成透過 Worker 取資料，`index.html` 已經沒有佔位字串，而且 GitHub Pages 設定成直接提供 `main` 分支，所以這個 workflow 現在沒有作用，可以刪掉。

## 搬家紀錄

2026-11-11 從 `zhaoen-su/jp-website-carousel` 搬到這裡，完整歷史和所有分支都在。舊網址 `zhaoen-su.github.io/jp-website-carousel/` 會在原帳號刪除後失效。
