import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Btn, Card, Field, BrandLogo, Pill } from '../../src/components/ui';
import { LangSwitch } from '../../src/components/LangSwitch';
import { useToast } from '../../src/components/toast';
import { login, resendVerification } from '../../src/store';
import { ApiError, errKey, getBaseUrl, setBaseUrl } from '../../src/api';
import { C, R } from '../../src/theme';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);
  const [showServer, setShowServer] = useState(false);
  const [serverUrl, setServerUrl] = useState(getBaseUrl());

  const doLogin = async () => {
    if (!id.trim() || !pw) return;
    setErr('');
    setUnverified(false);
    setConfirmUrl(null);
    setBusy(true);
    try {
      await login(id.trim(), pw);
      router.replace('/gate');
    } catch (e) {
      setErr(t(errKey(e)));
      if (e instanceof ApiError && e.code === 'EMAIL_NOT_VERIFIED') setUnverified(true);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      const r = await resendVerification(id.trim());
      if (r.alreadyVerified) {
        setUnverified(false);
        setErr('');
        toast(t('btnLogin'));
        return;
      }
      toast(t('resendDone'));
      if (r.devConfirmUrl) setConfirmUrl(r.devConfirmUrl);
    } catch {
      toast(t('errGeneric'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
        <View
          style={{
            backgroundColor: C.ink,
            paddingTop: insets.top + 20,
            paddingHorizontal: 22,
            paddingBottom: 30,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BrandLogo height={42} />
            <LangSwitch dark />
          </View>

          <Text style={{ color: '#fff', fontSize: 27, fontWeight: '700', marginTop: 22, lineHeight: 34 }}>
            {t('heroTitle1')}
            {'\n'}
            {t('heroTitle2')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,.78)', fontSize: 14, marginTop: 8 }}>{t('heroSub')}</Text>
          <View style={{ marginTop: 18 }}>
            <Pill text={t('heroPill')} />
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <Card>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink }}>{t('loginH')}</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginBottom: 14, marginTop: 4 }}>{t('loginSub')}</Text>
            <Field
              label={t('labelId')}
              value={id}
              onChangeText={setId}
              maxLength={12}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('phId')}
            />
            <Field
              label={t('labelPw')}
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              placeholder={t('phPw')}
              error={err}
            />

            {unverified ? (
              <View style={{ marginBottom: 8 }}>
                <Btn title={t('resendVerify')} kind="ghost" onPress={resend} />
                {confirmUrl ? (
                  <Pressable onPress={() => Linking.openURL(confirmUrl)} style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={{ color: C.accentPress, fontSize: 13.5, fontWeight: '700' }}>{t('openConfirmLink')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <Btn title={t('btnLogin')} onPress={doLogin} loading={busy} style={{ marginTop: 6 }} />
            <Pressable onPress={() => router.push('/forgot')} style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ color: C.ink2, fontSize: 14, fontWeight: '700' }}>{t('forgot')}</Text>
            </Pressable>
          </Card>
          <View style={{ height: 14 }} />
          <Btn title={t('toRegister')} kind="ghost" onPress={() => router.push('/register')} />

          <Pressable onPress={() => setShowServer(true)} style={{ marginTop: 22, alignItems: 'center' }}>
            <Text style={{ color: '#b9b2a0', fontSize: 11.5 }}>{t('serverSettings')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showServer} transparent animationType="fade" onRequestClose={() => setShowServer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(18,58,64,.5)', justifyContent: 'center', padding: 22 }}>
          <Card>
            <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 14, color: C.ink }}>{t('serverSettings')}</Text>
            <Field
              label={t('serverUrl')}
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://localhost:4080"
            />
            <Btn
              title={t('save')}
              onPress={async () => {
                await setBaseUrl(serverUrl);
                setShowServer(false);
                toast(t('save'));
              }}
              style={{ marginTop: 6 }}
            />
            <View style={{ height: 10 }} />
            <Btn title={t('cancel')} kind="ghost" onPress={() => setShowServer(false)} />
          </Card>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
