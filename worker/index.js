export default {
  async fetch(request, env) {
    // 處理瀏覽器的預檢請求 (CORS Preflight)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, Notion-Version",
        },
      });
    }

    // 設定 Notion API 的 URL (使用環境變數中的 DATABASE_ID)
    const url = `https://api.notion.com/v1/databases/${env.NOTION_DATABASE}/query`;

    // 向 Notion 發送請求
    const notionResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      // 轉發前端傳來的 body (例如過濾條件)
      body: request.method === "POST" ? await request.text() : null,
    });

    const data = await notionResponse.json();

    // 回傳給網頁，並加上 CORS Header 允許你的網頁讀取
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 允許所有網域存取，或改成你的 GitHub Pages 網址
      },
    });
  },
};