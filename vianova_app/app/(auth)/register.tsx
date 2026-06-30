import React, { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../src/components/TopBar';
import { Btn, Card, Field } from '../../src/components/ui';
import { register } from '../../src/store';
import { ApiError, errKey } from '../../src/api';
import { reAlnum, reEmail, validPw } from '../../src/validate';
import { C } from '../../src/theme';

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [errs, setErrs] = useState<{ id?: string; email?: string; pw?: string; pw2?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);

  const submit = async () => {
    const next: typeof errs = {};
    const idV = id.trim();
    if (!idV) next.id = t('errIdReq');
    else if (!reAlnum(idV)) next.id = t('errIdAlnum');
    else if (idV.length > 12) next.id = t('errIdLen');
    if (!reEmail(email.trim())) next.email = t('errEmail');
    if (!validPw(pw)) next.pw = t('errPw');
    if (pw !== pw2) next.pw2 = t('errPw2');
    setErrs(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const r = await register(idV, email.trim(), pw);
      setConfirmUrl(r.devConfirmUrl ?? null);
      setSent(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'ID_TAKEN') setErrs({ id: t('errIdTaken') });
      else if (e instanceof ApiError && e.code === 'INVALID_EMAIL') setErrs({ email: t('errEmail') });
      else if (e instanceof ApiError && e.code === 'WEAK_PASSWORD') setErrs({ pw: t('errPw') });
      else setErrs({ id: t(errKey(e)) });
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <TopBar title={t('regTitle')} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: C.accentPale,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="mail-outline" size={38} color={C.accent} />
            </View>
            <Text style={{ fontSize: 19, fontWeight: '700', color: C.ink, textAlign: 'center' }}>
              {t('confirmSentTitle')}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13.5, lineHeight: 22, marginTop: 10, textAlign: 'center' }}>
              {t('confirmSentBody')}
            </Text>
            {confirmUrl ? (
              <Pressable onPress={() => Linking.openURL(confirmUrl)} style={{ marginTop: 16 }}>
                <Text style={{ color: C.accentPress, fontSize: 14, fontWeight: '700' }}>{t('openConfirmLink')}</Text>
              </Pressable>
            ) : null}
            <Btn title={t('backToLogin')} onPress={() => router.back()} style={{ marginTop: 20, alignSelf: 'stretch' }} />
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('regTitle')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
          <Card>
            <Field
              label={`${t('labelId')} *`}
              value={id}
              onChangeText={setId}
              maxLength={12}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('phIdReg')}
              hint={t('hintId')}
              error={errs.id}
            />
            <Field
              label={`${t('labelEmail')} *`}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
              hint={t('hintEmail')}
              error={errs.email}
            />
            <Field
              label={`${t('labelPw')} *`}
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              placeholder={t('phPwReg')}
              hint={t('hintPw')}
              error={errs.pw}
            />
            <Field
              label={`${t('labelPw2')} *`}
              value={pw2}
              onChangeText={setPw2}
              secureTextEntry
              placeholder={t('phPw2')}
              error={errs.pw2}
            />
            <Btn title={t('btnRegister')} onPress={submit} loading={busy} style={{ marginTop: 6 }} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
