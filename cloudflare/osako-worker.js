/**
 * kaminendo.art/osako → GitHub Pages（kaminendo-osako.github.io/ryu-quest）中継Worker
 *
 * しくみ：
 *   kaminendo.art/osako/ に来たアクセスを、GitHub Pages の最新の中身で返す。
 *   GitHub を更新すれば kaminendo.art/osako も自動で最新になる（Worker の変更は不要）。
 *
 * 設定手順（Cloudflareダッシュボード）：
 *   1. Workers & Pages → 「作成」→ Worker を作成（名前例: osako-proxy）
 *   2. このファイルの中身を貼り付けて「デプロイ」
 *   3. Worker の「設定」→「トリガー」→「ルートを追加」
 *      - ルート: kaminendo.art/osako*
 *      - ゾーン: kaminendo.art
 *   4. https://kaminendo.art/osako/ を開いて確認
 */

const ORIGIN = 'https://kaminendo-osako.github.io/ryu-quest';
const BASE_PATH = '/osako';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /osako（スラッシュなし）は /osako/ へリダイレクト（相対パスを正しく解決させるため）
    if (url.pathname === BASE_PATH) {
      return Response.redirect(url.origin + BASE_PATH + '/', 301);
    }

    // /osako/ 配下以外は関与しない（ルート設定上は来ないはずだが念のため）
    if (!url.pathname.startsWith(BASE_PATH + '/')) {
      return fetch(request);
    }

    // /osako/xxx → GitHub Pages の /xxx を取得して返す
    const path = url.pathname.slice(BASE_PATH.length);
    const target = ORIGIN + path + url.search;

    const resp = await fetch(target, {
      method: request.method,
      headers: request.headers,
      redirect: 'follow',
    });

    // レスポンスはそのまま返す（サイトは相対パスのみ使用のため書き換え不要）
    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: resp.headers,
    });
  },
};
