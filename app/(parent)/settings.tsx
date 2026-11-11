import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ProfileSwitcher, Screen, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

function SettingRow({ icon, title, description, value, onValueChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <View style={styles.row}><View style={styles.icon}><Ionicons name={icon} size={23} color={colors.tealDark} /></View><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#D6CEC7', true: '#9DDBCC' }} thumbColor={value ? colors.teal : '#F6F1EC'} accessibilityLabel={title} /></View>;
}

export default function ParentalSettingsScreen() {
  const { currentProfile, resetDemo } = useApp();
  const [safeMode, setSafeMode] = useState(currentProfile?.role === 'parent' ? currentProfile.settings.safeMode : true);
  const [chat, setChat] = useState(currentProfile?.role === 'parent' ? currentProfile.settings.chatEnabled : false);
  const [supervision, setSupervision] = useState(true);
  const [limit, setLimit] = useState(currentProfile?.role === 'parent' ? currentProfile.settings.dailyScreenLimitMinutes : 60);
  if (currentProfile?.role !== 'parent') return null;

  const reset = () => Alert.alert('Restablecer demostración', 'Se olvidará el perfil reciente y la primera mascota elegida.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Restablecer', style: 'destructive', onPress: async () => { await resetDemo(); router.replace('/'); } },
  ]);

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Preferencias familiares</Text><Text style={typography.title}>Controles</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <View style={styles.demoBanner}><Ionicons name="flask" size={23} color={colors.coral} /><View><Text style={styles.demoTitle}>Configuración de demostración</Text><Text style={styles.demoCopy}>Estos controles no cambian ajustes reales del dispositivo.</Text></View></View>

      <View style={styles.card}>
        <SettingRow icon="shield-checkmark" title="Modo seguro" description="Simula una experiencia con contenido apropiado." value={safeMode} onValueChange={setSafeMode} />
        <SettingRow icon="chatbubbles" title="Chat y mensajería" description="La mensajería permanece desactivada en esta demo." value={chat} onValueChange={setChat} />
        <SettingRow icon="eye" title="Supervisión de actividad" description="Muestra los resúmenes locales del panel familiar." value={supervision} onValueChange={setSupervision} />
      </View>

      <Text style={styles.sectionTitle}>Tiempo de pantalla diario</Text>
      <View style={styles.limitCard}>
        <Pressable onPress={() => setLimit(Math.max(15, limit - 15))} style={styles.stepper} accessibilityLabel="Reducir tiempo"><Ionicons name="remove" size={22} color={colors.tealDark} /></Pressable>
        <View style={styles.limitCopy}><Text style={styles.limitValue}>{limit}</Text><Text style={styles.limitLabel}>minutos al día</Text></View>
        <Pressable onPress={() => setLimit(Math.min(180, limit + 15))} style={styles.stepper} accessibilityLabel="Aumentar tiempo"><Ionicons name="add" size={22} color={colors.tealDark} /></Pressable>
      </View>

      <Text style={styles.sectionTitle}>Horario permitido</Text>
      <View style={styles.schedule}><View style={styles.time}><Ionicons name="sunny" size={21} color={colors.yellow} /><Text style={styles.timeLabel}>Desde</Text><Text style={styles.timeValue}>{currentProfile.settings.allowedFrom}</Text></View><Ionicons name="arrow-forward" size={20} color={colors.muted} /><View style={styles.time}><Ionicons name="moon" size={21} color="#7566A8" /><Text style={styles.timeLabel}>Hasta</Text><Text style={styles.timeValue}>{currentProfile.settings.allowedTo}</Text></View></View>

      <Pressable onPress={reset} style={styles.reset} accessibilityRole="button"><Ionicons name="refresh" size={20} color={colors.coral} /><Text style={styles.resetText}>Restablecer demostración</Text></Pressable>
      <Text style={styles.disclaimer}>PetSteps no aplica límites del sistema, bloqueos ni protecciones reales. Esta pantalla solo representa la experiencia visual prevista.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  demoBanner: { marginTop: spacing.lg, backgroundColor: colors.pink, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  demoTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
  demoCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: '600', maxWidth: 280 },
  card: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, ...shadow },
  row: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
  rowDescription: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '600', marginTop: 3 },
  sectionTitle: { color: colors.brown, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm, ...roundedFont },
  limitCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow },
  stepper: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  limitCopy: { alignItems: 'center' },
  limitValue: { color: colors.brown, fontSize: 30, ...roundedFont },
  limitLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  schedule: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', ...shadow },
  time: { alignItems: 'center', gap: 3 },
  timeLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  timeValue: { color: colors.brown, fontSize: 18, ...roundedFont },
  reset: { marginTop: spacing.xl, minHeight: 52, borderWidth: 2, borderColor: '#F4C9C2', borderRadius: radius.pill, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.coral, fontWeight: '900' },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
});
