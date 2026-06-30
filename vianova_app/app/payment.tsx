import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../src/components/TopBar';
import { Btn } from '../src/components/ui';
import { useToast } from '../src/components/toast';
import { createRental, getDraft, setDraft } from '../src/store';
import { C, R } from '../src/theme';

export default function Payment() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const [num, setNum] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [holder, setHolder] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    const digits = num.replace(/\s/g, '');
    if (digits.length < 12 || !exp.trim() || cvc.trim().length < 3 || !holder.trim()) {
      toast(t('toastCard'));
      return;
    }
    const draft = getDraft();
    if (!draft) {
      router.replace('/home');
      return;
    }
    setBusy(true);
    try {
      const rental = await createRental(draft);
      setDraft(null);
      router.replace(`/success?rentalId=${rental.rentalId}` as never);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('gmoTitle')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
          <View style={{ backgroundColor: '#0E2E33', borderRadius: R.lg, padding: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>GMO PAYMENT</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 }}>
                <Text style={{ color: '#fff', fontSize: 11 }}>{t('gmoSecure')}</Text>
              </View>
            </View>
            <Text style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginBottom: 12 }}>{t('gmoLinktype')}</Text>

            <DarkField label={t('labelCard')} value={num} onChangeText={setNum} keyboardType="number-pad" placeholder="4242 4242 4242 4242" maxLength={19} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <DarkField label={t('labelExp')} value={exp} onChangeText={setExp} placeholder="MM / YY" />
              </View>
              <View style={{ flex: 1 }}>
                <DarkField label={t('labelCvc')} value={cvc} onChangeText={setCvc} keyboardType="number-pad" placeholder="123" maxLength={4} />
              </View>
            </View>
            <DarkField label={t('labelHolder')} value={holder} onChangeText={setHolder} placeholder="TARO YAMADA" autoCapitalize="characters" />

            <Btn title={t('btnConfirmRental')} onPress={confirm} loading={busy} style={{ marginTop: 16 }} />
            <Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 11.5, marginTop: 14, textAlign: 'center' }}>
              {t('gmoNote')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function DarkField({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <TextInput
        placeholderTextColor="#9aa6a2"
        {...props}
        style={{
          backgroundColor: 'rgba(255,255,255,.95)',
          borderRadius: R.sm,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
          color: C.text,
        }}
      />
    </View>
  );
}
