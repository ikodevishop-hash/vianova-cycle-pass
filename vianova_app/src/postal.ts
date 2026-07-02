/**
 * 郵便番号 → 住所 検索（日本国内）。
 * zipaddress.net の無料API（認証不要）を使用。
 *   GET https://api.zipaddress.net/?zipcode=5300001
 *   → { code: 200, data: { fullAddress, ... } }
 * 7桁（ハイフン有無どちらでも可）から都道府県+市区町村+町域を返す。
 * 該当なし・海外・通信失敗時は null を返し、手入力にフォールバックする。
 */
export async function lookupPostal(raw: string): Promise<string | null> {
  const zip = (raw || '').replace(/[^0-9]/g, '');
  if (zip.length !== 7) return null;
  try {
    const res = await fetch(`https://api.zipaddress.net/?zipcode=${zip}`);
    const json = (await res.json()) as { code?: number; data?: { fullAddress?: string } };
    if (json?.code === 200 && json?.data?.fullAddress) return String(json.data.fullAddress);
    return null;
  } catch {
    return null;
  }
}
