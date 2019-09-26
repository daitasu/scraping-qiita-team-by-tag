# scraping-qiita-team-by-tag
Qiita:Teamのタグ検索結果をpuppetterでスクレイピングするツールです。

Qiita: Teamはシングルサインオンを利用していると、APIで情報取得することができません。

そのため、puppeteerを用いて取得するようにしました。

`node index.ts <tagname>` でタグ検索結果のリストをスクレイピングした結果をcsvとして出力します。 

## 使用方法
1. ローカルにインストール
`git clone https://github.com/daitasu/scraping-qiita-team-by-tag.git`

2. .env-exampleに書いてあるように、 `.env` を作成してください。

```
USERNAME=<qiita:teamのログインusername>
PASSWORD=<qiita:teamのログインpass>
TEAMNAME=<xxx.qiita.comのxxx部分>
DEFAULT_TAG=<コマンドラインでtagnameを指定しない場合の検索タグ>
```

3. `node index.ts tagname` で取得したいtagを指定し実行
