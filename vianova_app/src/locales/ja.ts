const ja = {
  // app / common
  appName: 'Vianova',
  brandSub: 'CYCLE PASS',
  language: '言語',
  logout: 'ログアウト',
  ok: 'OK',
  cancel: 'キャンセル',
  save: '保存',
  close: '閉じる',

  // hero / login
  heroTitle1: '毎月のりかえ自由。',
  heroTitle2: 'メンテ込みの自転車生活。',
  heroSub: '月額制でいつでも快適。点検・整備はすべておまかせ。',
  heroPill: '● メンテナンス込み 月額レンタル',
  loginH: 'ログイン',
  loginSub: '会員IDとパスワードを入力してください。',
  labelId: '会員ID',
  phId: '英数12文字以内',
  labelPw: 'パスワード',
  phPw: 'パスワード',
  show: '表示',
  hide: '非表示',
  btnLogin: 'ログイン',
  forgot: 'パスワードをお忘れですか？',
  toRegister: '新規登録はこちら',
  loginErr: '会員IDまたはパスワードが正しくありません。',

  // register
  regTitle: '新規登録',
  phIdReg: '英数12文字以内',
  hintId: '半角の英字・数字のみ、12文字以内。すでに使われているIDは登録できません。',
  labelEmail: 'メールアドレス',
  hintEmail: 'パスワード再設定とお店からのお知らせの際に使用します。',
  phPwReg: '記号・英数を含む8文字以上',
  hintPw: '英字と数字を含む8文字以上。記号も使えます。',
  labelPw2: 'パスワード（確認）',
  phPw2: 'もう一度入力',
  btnRegister: '登録する',
  errIdReq: '会員IDを入力してください。',
  errIdAlnum: '英字・数字のみで入力してください。',
  errIdLen: '12文字以内で入力してください。',
  errIdTaken: 'このIDは既に使われています。別のIDをお選びください。',
  errEmail: '正しいメールアドレスを入力してください。',
  errPw: '英字と数字を含む8文字以上で入力してください。',
  errPw2: 'パスワードが一致しません。',
  toastRegistered: '登録が完了しました',

  // forgot
  fgTitle: 'パスワード再設定',
  fgH: '再設定メールの送信',
  fgSub: 'ご登録のメールアドレスに、パスワード再設定用のリンクをお送りします。',
  btnSend: '再設定メールを送信',
  fgDoneB: '✓ 送信しました（デモ）',
  fgDoneBody:
    'ご登録のメールアドレス宛に再設定リンクを送信した想定です。本番ではここから新しいパスワードを設定できます。',

  // terms gate
  gateTitle: '利用規約への同意',
  gateH: 'ご利用の前に',
  gateSub: 'サービスをご利用いただくには、利用規約への同意が必要です。',
  gateCheck: '利用規約の内容を確認し、同意します。',
  gateGo: '同意して進む',

  // home
  homeSub: '本日もご利用ありがとうございます。',
  homeHello: '{{id}} さん、こんにちは',
  mBikesT: 'レンタル自転車一覧',
  mBikesS: '借りられる自転車を見る',
  mCertT: 'レンタル中自転車証明書',
  mCertS: 'いま借りている自転車',
  mAmtT: '今月の利用金額',
  mAmtS: '今月のお支払い予定',
  mNewsT: 'お店からのお知らせ',
  mNewsS: '最新情報・キャンペーン',
  mTermsT: '利用規約',
  mTermsS: 'サービスの規約を確認',

  // bikes
  bikesTitle: 'レンタル自転車一覧',
  badgeRenting: 'レンタル中',
  badgeSoldout: '在庫なし',
  toastLocked: 'レンタル中、または在庫がありません',
  perMonth: '/月',
  emptyBikes: '現在ご利用いただける自転車がありません。',
  detailTitle: '自転車の詳細',
  perMonthTax: '/月（税込）',
  maintIncluded: 'メンテナンス・点検費用込み',
  specFeature: '特徴',
  specPrice: '月額料金',
  specStock: '在庫',
  stockNone: 'なし',
  btnApplyThis: 'この自転車をレンタル申込',

  // apply
  applyTitle: 'レンタル申込',
  applyH: '{{name}} のお申込み',
  applyHFallback: 'お申込み内容',
  applySub: 'ご本人さまの情報をご入力ください。',
  labelName: 'お名前',
  phName: '山田 太郎',
  labelBirth: '生年月日',
  labelAddr: 'ご住所',
  phAddr: '〇〇県〇〇市…',
  labelTel: '電話番号',
  labelIdDoc: '本人確認書類の撮影',
  idCam: 'カメラで身分証明書を撮影',
  btnToPayment: 'お支払い情報の登録へ進む',
  errAllFields: 'すべての項目をご入力ください。',
  errIdPhoto: '本人確認書類を撮影してください。',

  // payment (GMO mock)
  gmoTitle: 'お支払い情報の登録',
  gmoSecure: '🔒 SSL 保護',
  gmoLinktype: 'リンクタイプPlus（カード決済）',
  labelCard: 'カード番号',
  labelExp: '有効期限',
  labelCvc: 'セキュリティコード',
  labelHolder: 'カード名義',
  btnConfirmRental: '登録してレンタルを確定',
  gmoNote:
    '※ デモ版です。実際の決済は行われません。本番ではGMOの安全な画面に遷移します。',
  toastCard: 'カード情報をご入力ください',

  // success
  successTitle: 'お申込み完了',
  successH: 'レンタルが確定しました',
  successSub: 'お客様のレンタルIDは以下のとおりです。',
  btnViewCert: 'レンタル証明書を見る',
  btnToHome: 'ホームに戻る',

  // certificate
  certTitle: 'レンタル中自転車証明書',
  emptyCert: '現在レンタル中の自転車はありません。',
  certStart: 'レンタル開始日',
  certBikename: '自転車名',
  certSpec: 'スペック',
  certPrice: '月額料金',
  certHolder: 'ご契約者',

  // amount
  amountTitle: '今月の利用金額',
  emptyAmount: '今月のご利用はありません。',
  amountLabel: '{{y}}年 {{m}}月のお支払い予定',
  amountVia: 'GMOカード決済（リンクタイプPlus）にて請求',
  amountTotal: '合計',

  // news / terms
  newsTitle: 'お店からのお知らせ',
  emptyNews: '現在お知らせはありません。',
  newsToYou: 'あなた宛',
  termsTitle: '利用規約',
  logoutConfirm: 'ログアウトしますか？',

  // server / errors / email confirmation
  errNetwork: 'サーバーに接続できませんでした。接続先をご確認ください。',
  errGeneric: 'エラーが発生しました。しばらくして再度お試しください。',
  errEmailNotVerified: 'メールアドレスの確認が完了していません。確認メールのリンクを開いてください。',
  confirmSentTitle: '確認メールを送信しました',
  confirmSentBody:
    'ご登録のメールアドレスに確認メールをお送りしました。メール内のリンクを開いて登録を完了してから、初回ログインを行ってください。',
  openConfirmLink: '確認リンクを開く（デモ）',
  resendVerify: '確認メールを再送する',
  resendDone: '確認メールを再送しました',
  backToLogin: 'ログイン画面へ戻る',
  serverSettings: 'サーバー接続設定',
  serverUrl: 'サーバーURL',
};

export type Dict = typeof ja;
export default ja;
