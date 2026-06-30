import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../src/components/TopBar';
import { Btn, Card, Field } from '../../src/components/ui';
import { reEmail } from '../../src/validate';
import { C, R } from '../../src/theme';

export default function Forgot() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    setErr('');
    if (!reEmail(email.trim())) {
      setErr(t('errEmail'));
      return;
    }
    setDone(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('fgTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
        <Card>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{t('fgH')}</Text>
          <Text style={{ color: C.muted, fontSize: 13, marginBottom: 14, marginTop: 4 }}>{t('fgSub')}</Text>
          <Field
            label={t('labelEmail')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            error={err}
          />
          <Btn title={t('btnSend')} onPress={submit} style={{ marginTop: 6 }} />
          {done ? (
            <View
              style={{
                backgroundColor: C.accentPale,
                borderWidth: 1,
                borderColor: '#BCE6D5',
                borderRadius: R.sm,
                padding: 14,
                marginTop: 14,
              }}
            >
              <Text style={{ color: C.ink2, fontWeight: '700', marginBottom: 4 }}>{t('fgDoneB')}</Text>
              <Text style={{ color: C.ink2, fontSize: 13, lineHeight: 20 }}>{t('fgDoneBody')}</Text>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
}
