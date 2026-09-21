import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Card } from '../src/components/ui';
import { myMembership, useDB } from '../src/store';
import type { MemberRank } from '../src/types';
import { C, R } from '../src/theme';

/** Rank colours: bronze / silver / gold, kept close to the real metals. */
const RANK_COLOR: Record<MemberRank, string> = {
  bronze: '#A9713C',
  silver: '#8C97A0',
  gold: '#C9A227',
};

/**
 * Membership rank screen (会員ランク).
 *
 * The rank itself is decided by the server from the customer's purchases and
 * running contracts; the benefit text of each rank is edited by the operator in
 * the admin, so this screen only presents what it is given.
 */
export default function Rank() {
  const { t } = useTranslation();
  useDB();
  const m = myMembership();
  const ranks: MemberRank[] = m?.ranks?.length ? m.ranks : ['bronze', 'silver', 'gold'];
  const current = m?.rank ?? 'bronze';

  const label = (r: MemberRank) =>
    t(r === 'gold' ? 'rankGold' : r === 'silver' ? 'rankSilver' : 'rankBronze');
  const condition = (r: MemberRank) =>
    t(r === 'gold' ? 'rankCondGold' : r === 'silver' ? 'rankCondSilver' : 'rankCondBronze');

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('rankTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Current rank */}
        <View
          style={{
            backgroundColor: C.ink,
            borderRadius: R.lg,
            padding: 22,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5, fontWeight: '700' }}>
            {t('rankCurrent')}
          </Text>
          <View
            style={{
              marginTop: 12,
              paddingHorizontal: 22,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: RANK_COLOR[current],
            }}
          >
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 1 }}>
              {label(current)}
            </Text>
          </View>
        </View>

        {/* Benefits of the current rank */}
        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.accentPress, marginBottom: 8 }}>
            {t('rankYourBenefits')}
          </Text>
          <Text style={{ color: C.text, fontSize: 13.5, lineHeight: 23 }}>
            {m?.benefits?.[current] || t('rankNoBenefit')}
          </Text>
        </Card>

        {/* All ranks and how to reach them */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.muted, marginTop: 22, marginBottom: 10 }}>
          {t('rankAll')}
        </Text>
        {ranks.map((r) => (
          <Card
            key={r}
            style={{
              marginBottom: 10,
              borderColor: r === current ? RANK_COLOR[r] : C.line,
              borderWidth: r === current ? 2 : 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: RANK_COLOR[r],
                }}
              />
              <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.ink }}>{label(r)}</Text>
              {r === current ? (
                <View
                  style={{
                    backgroundColor: C.accentPale,
                    borderRadius: 999,
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: C.accentPress, fontSize: 11, fontWeight: '700' }}>
                    {t('rankCurrent')}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: C.muted, fontSize: 12.5, lineHeight: 20, marginTop: 8 }}>
              {condition(r)}
            </Text>
            {m?.benefits?.[r] ? (
              <Text style={{ color: C.text, fontSize: 12.5, lineHeight: 21, marginTop: 8 }}>
                {m.benefits[r]}
              </Text>
            ) : null}
          </Card>
        ))}

        <Text style={{ color: C.muted, fontSize: 11.5, lineHeight: 18, marginTop: 8 }}>
          {t('rankNote')}
        </Text>
      </ScrollView>
    </View>
  );
}
