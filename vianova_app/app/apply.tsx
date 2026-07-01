import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../src/components/TopBar';
import { Btn, Card, Field } from '../src/components/ui';
import { useToast } from '../src/components/toast';
import { findBike, getStores, setDraft, useDB } from '../src/store';
import { C, R } from '../src/theme';

export default function Apply() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  useDB();
  const bike = findBike(bikeId ?? '');
  const stores = getStores();

  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [addr, setAddr] = useState('');
  const [tel, setTel] = useState('');
  const [storeId, setStoreId] = useState('');
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const handleResult = (res: ImagePicker.ImagePickerResult) => {
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    setIdPhoto(a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.granted) {
      handleResult(await ImagePicker.launchCameraAsync({ quality: 0.4, base64: true }));
      return;
    }
    pickFromLibrary();
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast(t('errIdPhoto'));
      return;
    }
    handleResult(await ImagePicker.launchImageLibraryAsync({ quality: 0.4, base64: true }));
  };

  const submit = () => {
    setErr('');
    if (!name.trim() || !birth.trim() || !addr.trim() || !tel.trim()) {
      setErr(t('errAllFields'));
      return;
    }
    if (stores.length > 0 && !storeId) {
      setErr(t('errStore'));
      return;
    }
    if (!idPhoto) {
      setErr(t('errIdPhoto'));
      return;
    }
    if (!bike) return;
    setDraft({ bikeId: bike.id, storeId, name: name.trim(), birth: birth.trim(), addr: addr.trim(), tel: tel.trim(), idPhoto });
    router.push('/payment' as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <TopBar title={t('applyTitle')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
          <Card>
            <Text style={{ fontSize: 19, fontWeight: '700', color: C.ink }}>
              {bike ? t('applyH', { name: bike.name }) : t('applyHFallback')}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t('applySub')}</Text>

            <Field label={`${t('labelName')} *`} value={name} onChangeText={setName} placeholder={t('phName')} />
            <Field label={`${t('labelBirth')} *`} value={birth} onChangeText={setBirth} placeholder="1990-01-01" />
            <Field label={`${t('labelAddr')} *`} value={addr} onChangeText={setAddr} placeholder={t('phAddr')} />
            <Field
              label={`${t('labelTel')} *`}
              value={tel}
              onChangeText={setTel}
              keyboardType="phone-pad"
              placeholder="090-1234-5678"
            />

            {stores.length > 0 ? (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 6 }}>
                  {t('labelStore')} *
                </Text>
                <View style={{ gap: 8 }}>
                  {stores.map((s) => {
                    const sel = s.id === storeId;
                    return (
                      <Pressable
                        key={s.id}
                        onPress={() => setStoreId(s.id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: 10,
                          borderWidth: 1.5,
                          borderColor: sel ? C.accent : C.line,
                          borderRadius: R.sm,
                          padding: 12,
                          backgroundColor: sel ? C.accentPale : '#fff',
                        }}
                      >
                        <Ionicons
                          name={sel ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={sel ? C.accent : C.muted}
                          style={{ marginTop: 1 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '700', color: C.ink, fontSize: 14 }}>{s.name}</Text>
                          {s.address ? (
                            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{s.address}</Text>
                          ) : null}
                          <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                            {t('storeHours')}: {s.hours || '—'}　/　{t('storeHoliday')}: {s.holiday || t('holidayNone')}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Text style={{ fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 6 }}>
              {t('labelIdDoc')} *
            </Text>
            <Pressable
              onPress={takePhoto}
              style={{
                borderWidth: 1.5,
                borderColor: C.line,
                borderStyle: 'dashed',
                borderRadius: R.sm,
                paddingVertical: 24,
                alignItems: 'center',
                backgroundColor: '#FBFBF9',
              }}
            >
              <Text style={{ fontSize: 34 }}>📷</Text>
              <Text style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{t('idCam')}</Text>
            </Pressable>
            {idPhoto ? (
              <Image
                source={{ uri: idPhoto }}
                style={{ width: '100%', height: 200, borderRadius: R.sm, marginTop: 10 }}
                contentFit="cover"
              />
            ) : null}

            {err ? <Text style={{ color: C.persimmon, fontWeight: '600', fontSize: 12, marginTop: 10 }}>{err}</Text> : null}
            <Btn title={t('btnToPayment')} onPress={submit} style={{ marginTop: 18 }} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
