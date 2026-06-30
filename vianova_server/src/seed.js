'use strict';
/** Initial seed data (bikes, news, 4-language terms). */

const SEED_BIKES = [
  { id: 'BK01', name: 'Vianova City 7', emoji: '🚲', spec_short: '7段変速 / 27インチ / 軽量アルミ', spec_long: '通勤通学にぴったりのシティクロス。7段変速で坂道も快適。LEDライト・カゴ標準装備。', price_monthly: 3800, frame_no: 'VN-CITY-0001', insurance: '2027-03-31', stock: 4, note: '', photos: '[]' },
  { id: 'BK02', name: 'Vianova E-Power', emoji: '⚡', spec_short: '電動アシスト / 走行60km / 大容量バッテリー', spec_long: '坂道もすいすい進む電動アシスト。1回の充電で約60km。買い物にも通勤にも。', price_monthly: 7200, frame_no: 'VN-EP-0002', insurance: '2027-05-31', stock: 2, note: '', photos: '[]' },
  { id: 'BK03', name: 'Vianova Mini Fold', emoji: '🛴', spec_short: '折りたたみ / 20インチ / 輪行可', spec_long: 'コンパクトに折りたためる人気モデル。電車との組み合わせや車載にも便利。', price_monthly: 4500, frame_no: 'VN-MF-0003', insurance: '2027-01-31', stock: 3, note: '', photos: '[]' },
  { id: 'BK04', name: 'Vianova Road S', emoji: '🚴', spec_short: 'ロードバイク / 16段変速 / カーボン', spec_long: '軽量カーボンフレームの本格ロード。週末のロングライドにおすすめ。', price_monthly: 9800, frame_no: 'VN-RD-0004', insurance: '2027-08-31', stock: 1, note: '', photos: '[]' },
];

const SEED_NEWS = [
  { id: 'N1', date: '2026-06-01', title: '夏のメンテナンスキャンペーン', body: '7月末まで、無料点検をご希望の会員さま全員にタイヤ空気圧チェック＆チェーン注油を実施中です。お気軽にご来店ください。', target: '' },
  { id: 'N2', date: '2026-05-15', title: '電動アシストモデル入荷', body: '人気のVianova E-Powerを追加入荷しました。台数に限りがございますのでお早めに。', target: '' },
];

const TERMS_JA = `■故障・破損
1 レンタル品について、故障または破損した場合は、直ちに使用を中止し、当店まで連絡してください。
2 利用者の責に帰すべき事由により、レンタル品を故障または破損した場合、損害金額を利用者に請求する場合があります。
■事故
1 レンタサイクル利用中の事故につきましては、各自の責任でお願いいたします。
2 事故に会われた場合は速やかに警察と当店に連絡してください。
3 レンタサイクル利用時の障害等につきましては、本施設加入の保険運用の保障範囲内で保障しますが、適応外の損害におきましては利用者自らの責任で行っていただきます。
■盗難・紛失
利用者の責に帰すべき事由により、レンタル品を盗難または紛失した場合、損害金額を利用者に請求する場合があります。
■禁止行為
1 無謀な運転、酒気帯び運転、その他交通規則に違反する行為。
2 危険個所、不適当な場所または方法での使用。歩行者等の通行妨害となる行為。
3 自転車放置禁止区域内及び通行の妨げとなるような場所での駐車。
4 利用者以外の第三者に使用させる事。
5 その他、法令諸規則に反する行為。(当店は一切の責任を負いかねます。)
6 ルールブックをよく読んで理解してから乗車して下さい。`;

const TERMS_EN = `■ Breakdown / Damage
1 If a rental item breaks down or is damaged, stop using it immediately and contact our store.
2 If a rental item is broken or damaged due to reasons attributable to the user, the user may be charged for the cost of the damage.
■ Accidents
1 The user is responsible for any accident that occurs while using the rental bicycle.
2 In the event of an accident, promptly contact the police and our store.
3 Injuries during use of the rental bicycle are covered within the scope of the insurance held by this facility; damages outside that coverage are the user's own responsibility.
■ Theft / Loss
If a rental item is stolen or lost due to reasons attributable to the user, the user may be charged for the cost of the damage.
■ Prohibited Acts
1 Reckless riding, riding under the influence of alcohol, or other acts that violate traffic rules.
2 Use in dangerous or inappropriate places or in an inappropriate manner, or acts that obstruct pedestrians.
3 Parking within no-parking zones for bicycles or in places that obstruct passage.
4 Letting any third party other than the user use the item.
5 Any other act that violates laws and regulations. (Our store accepts no liability whatsoever.)
6 Please read and understand the rule book carefully before riding.`;

const TERMS_ZH = `■ 故障・损坏
1 租赁物品如发生故障或损坏，请立即停止使用并联系本店。
2 因使用者的责任导致租赁物品故障或损坏时，本店可能向使用者收取损失金额。
■ 事故
1 使用租赁自行车期间发生的事故由各自负责。
2 如遇事故，请立即联系警察和本店。
3 使用租赁自行车时的伤害等，在本设施所投保险的保障范围内予以保障；超出范围的损害由使用者自行负责。
■ 失窃・遗失
因使用者的责任导致租赁物品失窃或遗失时，本店可能向使用者收取损失金额。
■ 禁止行为
1 鲁莽驾驶、酒后驾驶及其他违反交通规则的行为。
2 在危险或不当场所，或以不当方式使用；妨碍行人通行的行为。
3 在自行车禁停区域内或妨碍通行的场所停放。
4 将物品交给使用者以外的第三方使用。
5 其他违反法律法规的行为。（本店概不负责。）
6 请在仔细阅读并理解规则手册后再骑行。`;

const TERMS_KO = `■ 고장・파손
1 렌탈 물품이 고장 또는 파손된 경우, 즉시 사용을 중지하고 본점으로 연락해 주세요.
2 이용자의 책임으로 인해 렌탈 물품이 고장 또는 파손된 경우, 손해 금액을 이용자에게 청구할 수 있습니다.
■ 사고
1 렌탈 자전거 이용 중 발생한 사고는 각자의 책임으로 합니다.
2 사고가 발생한 경우 신속히 경찰과 본점에 연락해 주세요.
3 렌탈 자전거 이용 시의 부상 등은 본 시설이 가입한 보험의 보장 범위 내에서 보장하며, 적용 외 손해는 이용자 본인의 책임으로 합니다.
■ 도난・분실
이용자의 책임으로 인해 렌탈 물품이 도난 또는 분실된 경우, 손해 금액을 이용자에게 청구할 수 있습니다.
■ 금지 행위
1 난폭 운전, 음주 운전, 그 외 교통 규칙을 위반하는 행위.
2 위험한 장소・부적절한 장소 또는 방법으로의 사용. 보행자 등의 통행을 방해하는 행위.
3 자전거 방치 금지 구역 내 및 통행에 방해가 되는 장소에서의 주차.
4 이용자 이외의 제3자에게 사용하게 하는 것.
5 그 외 법령 및 규칙에 반하는 행위. (본점은 일체의 책임을 지지 않습니다.)
6 룰북을 잘 읽고 이해한 후 탑승해 주세요.`;

const SEED_TERMS = { ja: TERMS_JA, en: TERMS_EN, zh: TERMS_ZH, ko: TERMS_KO };

module.exports = { SEED_BIKES, SEED_NEWS, SEED_TERMS };
