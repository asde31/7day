import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText, Button, Screen } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme';
import { AINotConfiguredError, recognizeFood } from '@/features/nutrition/api';

type Phase = 'camera' | 'analyzing' | 'error';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<Phase>('camera');
  const [errorMsg, setErrorMsg] = useState('');

  async function capture() {
    if (!cameraRef.current) return;
    setPhase('analyzing');
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: false });
      if (!photo?.uri) throw new Error('no photo');

      // Downscale to ~1024px before sending — caps vision-token cost (see the
      // cost analysis: full-res photos use far more tokens for no accuracy gain
      // on food) and shrinks the upload.
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.6, base64: true, format: ImageManipulator.SaveFormat.JPEG },
      );
      if (!resized.base64) throw new Error('no base64');

      const items = await recognizeFood(resized.base64);
      // Navigate to the editable result screen. Nothing about the photo is kept.
      router.replace({
        pathname: '/nutrition/result',
        params: { items: JSON.stringify(items) },
      });
    } catch (e) {
      if (e instanceof AINotConfiguredError) {
        setErrorMsg(t('nutrition.scanScreen.notConfigured'));
      } else {
        setErrorMsg(t('nutrition.scanScreen.error'));
      }
      setPhase('error');
    }
  }

  if (!permission) {
    return (
      <Screen>
        <View style={{ flex: 1 }} />
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg }}>
          <AppText variant="h2" style={{ textAlign: 'center' }}>
            📷 {t('nutrition.scanScreen.permissionTitle')}
          </AppText>
          <Button title={t('nutrition.scanScreen.grantPermission')} onPress={requestPermission} />
          <Button title={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {phase !== 'error' && (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      <View
        style={{
          position: 'absolute',
          top: spacing.xl,
          left: spacing.lg,
          right: spacing.lg,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <AppText color="#fff">✕</AppText>
        </Pressable>
      </View>

      {phase === 'analyzing' && (
        <View style={overlay}>
          <AppText variant="h3" color="#fff">
            {t('nutrition.scanScreen.analyzing')}
          </AppText>
        </View>
      )}

      {phase === 'error' && (
        <View style={[overlay, { padding: spacing.lg, gap: spacing.lg }]}>
          <AppText variant="h3" color="#fff" style={{ textAlign: 'center' }}>
            {errorMsg}
          </AppText>
          <Button title={t('nutrition.scanScreen.retake')} onPress={() => setPhase('camera')} />
          <Button title={t('common.cancel')} variant="ghost" onPress={() => router.back()} />
        </View>
      )}

      {phase === 'camera' && (
        <View style={{ position: 'absolute', bottom: spacing.xxl, left: 0, right: 0, alignItems: 'center' }}>
          <Pressable
            onPress={capture}
            style={{
              width: 76,
              height: 76,
              borderRadius: radius.pill,
              backgroundColor: theme.primary,
              borderWidth: 4,
              borderColor: '#fff',
            }}
          />
        </View>
      )}
    </View>
  );
}

const overlay = {
  position: 'absolute' as const,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'rgba(0,0,0,0.85)',
};
