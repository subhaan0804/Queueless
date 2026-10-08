import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../theme';

// Bottom sheet. Closes on a scrim tap, the x button, or the Android back button.
export default function Sheet({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent statusBarTranslucent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close" style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[type.section, styles.title]}>
              {title}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.close} onPress={onClose}>
              <Feather name="x" size={24} color={colors.ink} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  sheet: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space.lg },
  title: { flex: 1, color: colors.ink },
  close: { width: 48, height: 48, marginRight: -space.md, alignItems: 'center', justifyContent: 'center' },
});
