// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { GameSettings } from '@/services/tableGames';
import { Colors, Radius, Spacing, FontSize } from '@/constants/theme';

interface TableSettingsModalProps {
  visible: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
}

export function TableSettingsModal({ visible, settings, onClose, onSave }: TableSettingsModalProps) {
  const [billiardsRate, setBilliardsRate] = useState('');
  const [billiardsCount, setBilliardsCount] = useState('');
  const [billiardsSound, setBilliardsSound] = useState<string | undefined>();

  const [ttRate, setTtRate] = useState('');
  const [ttCount, setTtCount] = useState('');
  const [ttSound, setTtSound] = useState<string | undefined>();

  const [testingSound, setTestingSound] = useState<'billiards' | 'tabletennis' | null>(null);
  const [soundRef, setSoundRef] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    if (visible) {
      setBilliardsRate(String(settings.billiards.hourlyRate));
      setBilliardsCount(String(settings.billiards.tableCount));
      setBilliardsSound(settings.billiards.customSoundUri);
      setTtRate(String(settings.tabletennis.hourlyRate));
      setTtCount(String(settings.tabletennis.tableCount));
      setTtSound(settings.tabletennis.customSoundUri);
    }
  }, [visible, settings]);

  const pickSound = async (type: 'billiards' | 'tabletennis') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (type === 'billiards') setBilliardsSound(uri);
        else setTtSound(uri);
      }
    } catch (e) {
      console.error('Sound pick error:', e);
    }
  };

  const testSound = async (type: 'billiards' | 'tabletennis') => {
    setTestingSound(type);
    try {
      if (soundRef) {
        await soundRef.unloadAsync();
        setSoundRef(null);
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const uri = type === 'billiards' ? billiardsSound : ttSound;
      if (uri) {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSoundRef(sound);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setTestingSound(null);
          }
        });
      }
    } catch {
      setTestingSound(null);
    }
  };

  const handleSave = () => {
    const br = Number(billiardsRate);
    const bc = Number(billiardsCount);
    const tr = Number(ttRate);
    const tc = Number(ttCount);

    onSave({
      billiards: {
        hourlyRate: br > 0 ? br : settings.billiards.hourlyRate,
        tableCount: bc > 0 ? bc : settings.billiards.tableCount,
        customSoundUri: billiardsSound,
      },
      tabletennis: {
        hourlyRate: tr > 0 ? tr : settings.tabletennis.hourlyRate,
        tableCount: tc > 0 ? tc : settings.tabletennis.tableCount,
        customSoundUri: ttSound,
      },
    });
    onClose();
  };

  const SoundRow = ({
    type,
    label,
    color,
    soundUri,
    onPick,
    onClear,
  }: {
    type: 'billiards' | 'tabletennis';
    label: string;
    color: string;
    soundUri?: string;
    onPick: () => void;
    onClear: () => void;
  }) => (
    <View style={[styles.soundRow, { borderColor: color + '30' }]}>
      <View style={styles.soundInfo}>
        <Text style={styles.soundLabel}>{label}</Text>
        <Text style={[styles.soundName, { color: soundUri ? Colors.reports : Colors.textMuted }]}>
          {soundUri ? 'صوت مخصص محدد ✓' : 'الصوت الافتراضي (جرس)'}
        </Text>
      </View>
      <View style={styles.soundBtns}>
        {soundUri ? (
          <Pressable
            style={({ pressed }) => [styles.soundBtn, { backgroundColor: Colors.reportsDim, borderColor: Colors.reports + '40' }, pressed && { opacity: 0.7 }]}
            onPress={() => testSound(type)}
          >
            {testingSound === type ? (
              <ActivityIndicator size="small" color={Colors.reports} />
            ) : (
              <MaterialIcons name="volume-up" size={16} color={Colors.reports} />
            )}
          </Pressable>
        ) : null}
        {soundUri ? (
          <Pressable
            style={({ pressed }) => [styles.soundBtn, { backgroundColor: Colors.statRedDim, borderColor: Colors.danger + '40' }, pressed && { opacity: 0.7 }]}
            onPress={onClear}
          >
            <MaterialIcons name="close" size={16} color={Colors.danger} />
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.soundBtn, { backgroundColor: color + '20', borderColor: color + '40' }, pressed && { opacity: 0.7 }]}
          onPress={onPick}
        >
          <MaterialIcons name="audio-file" size={16} color={color} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.avoidWrap}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={[styles.strip, { backgroundColor: Colors.reports }]} />

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>إعدادات الألعاب</Text>
                <Text style={[styles.subtitle, { color: Colors.reports }]}>الأسعار والصوت</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

              {/* Billiards */}
              <View style={[styles.section, { borderColor: '#F97316' + '30' }]}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="sports-esports" size={20} color="#F97316" />
                  <Text style={[styles.sectionTitle, { color: '#F97316' }]}>البلياردو</Text>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>سعر الساعة (ر.ي)</Text>
                    <TextInput
                      style={[styles.input, { borderColor: '#F97316' + '40' }]}
                      value={billiardsRate}
                      onChangeText={setBilliardsRate}
                      keyboardType="numeric"
                      textAlign="center"
                      placeholder="1000"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>عدد الطاولات</Text>
                    <TextInput
                      style={[styles.input, { borderColor: '#F97316' + '40' }]}
                      value={billiardsCount}
                      onChangeText={setBilliardsCount}
                      keyboardType="numeric"
                      textAlign="center"
                      placeholder="4"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
                <SoundRow
                  type="billiards"
                  label="صوت التنبيه"
                  color="#F97316"
                  soundUri={billiardsSound}
                  onPick={() => pickSound('billiards')}
                  onClear={() => setBilliardsSound(undefined)}
                />
              </View>

              {/* Table Tennis */}
              <View style={[styles.section, { borderColor: '#06B6D4' + '30' }]}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="sports-tennis" size={20} color="#06B6D4" />
                  <Text style={[styles.sectionTitle, { color: '#06B6D4' }]}>تنس الطاولة</Text>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>سعر الساعة (ر.ي)</Text>
                    <TextInput
                      style={[styles.input, { borderColor: '#06B6D4' + '40' }]}
                      value={ttRate}
                      onChangeText={setTtRate}
                      keyboardType="numeric"
                      textAlign="center"
                      placeholder="500"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>عدد الطاولات</Text>
                    <TextInput
                      style={[styles.input, { borderColor: '#06B6D4' + '40' }]}
                      value={ttCount}
                      onChangeText={setTtCount}
                      keyboardType="numeric"
                      textAlign="center"
                      placeholder="3"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
                <SoundRow
                  type="tabletennis"
                  label="صوت التنبيه"
                  color="#06B6D4"
                  soundUri={ttSound}
                  onPick={() => pickSound('tabletennis')}
                  onClear={() => setTtSound(undefined)}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
                onPress={handleSave}
              >
                <MaterialIcons name="save" size={20} color={Colors.white} />
                <Text style={styles.saveBtnText}>حفظ الإعدادات</Text>
              </Pressable>

              <View style={{ height: 24 }} />
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  avoidWrap: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  strip: {
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'right',
  },
  closeBtn: { padding: 4 },
  body: { paddingHorizontal: Spacing.xl },
  section: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'flex-end',
  },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  soundRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  soundInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  soundLabel: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  soundName: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  soundBtns: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  soundBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.reports,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  saveBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
