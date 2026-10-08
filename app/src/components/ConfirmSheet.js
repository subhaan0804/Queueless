import { StyleSheet, Text } from 'react-native';
import { colors, space, type } from '../theme';
import BigButton from './BigButton';
import Sheet from './Sheet';

// The body is separate so a sheet that has other modes (queue options) can
// swap to a confirmation without closing and re-opening a second modal.
export function ConfirmBody({ message, confirmLabel, onConfirm, onCancel, busy, error }) {
  return (
    <>
      <Text style={[type.body, styles.message]}>{message}</Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[type.caption, styles.error]}>
          {error}
        </Text>
      ) : null}
      <BigButton label={confirmLabel} variant="danger" busy={busy} onPress={onConfirm} />
      <BigButton label="Cancel" variant="text" onPress={onCancel} style={styles.cancel} />
    </>
  );
}

export default function ConfirmSheet({ visible, onClose, title, ...body }) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <ConfirmBody {...body} onCancel={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.ink, marginBottom: space.xl },
  error: { color: colors.red, marginBottom: space.md },
  cancel: { marginTop: space.sm },
});
