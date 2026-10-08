import { StyleSheet, Text } from 'react-native';
import { colors, space, type } from '../theme';
import BigButton from './BigButton';
import { ConfirmBody } from './ConfirmSheet';
import Sheet from './Sheet';

// Pause/resume and, out of accidental reach, close. Closing is a second mode of
// this same sheet, so there is never a modal opening while another is closing.
export default function QueueOptionsSheet({ mode, paused, busy, error, onClose, onPause, onAskClose, onConfirmClose }) {
  const closing = mode === 'close';
  const title = closing ? 'Close queue' : paused ? 'Joining is paused' : 'Pause joining';
  return (
    <Sheet visible={mode !== null} onClose={onClose} title={title}>
      {closing ? (
        <ConfirmBody
          message="Close this queue? Anyone still waiting will be removed."
          confirmLabel="Close queue"
          busy={busy}
          error={error}
          onConfirm={onConfirmClose}
          onCancel={onClose}
        />
      ) : (
        <>
          <Text style={[type.body, styles.message]}>
            {paused
              ? 'New people cannot get a number. Everyone already in line keeps their place.'
              : 'Nobody new can join while paused. Everyone already in line keeps their place.'}
          </Text>
          <BigButton label={paused ? 'Resume joining' : 'Pause joining'} busy={busy} onPress={onPause} />
          <BigButton label="Close queue" variant="text" color={colors.red} onPress={onAskClose} style={styles.close} />
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.ink, marginBottom: space.xl },
  close: { marginTop: space.md },
});
