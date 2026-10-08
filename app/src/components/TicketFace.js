import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import RollingNumber from './RollingNumber';
import Ticket from './Ticket';

function Row({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={[type.body, styles.ink]}>{label}</Text>
      {children}
    </View>
  );
}

const Stat = ({ children }) => <Text style={[type.stat, styles.ink]}>{children}</Text>;

// What the customer's ticket shows. `ahead` and `minutes` are null until the
// first snapshot arrives; `isTurn` drops the wait rows because they no longer apply.
export default function TicketFace({ bg, record, serving, ahead, minutes, isTurn, reduceMotion }) {
  const issued = new Date(record.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dash = '–';

  const upper = (
    <>
      <Text style={[type.section, styles.ink]}>{record.queueName}</Text>
      <Text style={[type.caption, styles.pencil, styles.gap]}>Your number</Text>
      <Text
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Your number is ${record.number}`}
        maxFontSizeMultiplier={1.3}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[type.token, styles.token]}
      >
        {record.number}
      </Text>
    </>
  );

  const lower = (
    <>
      <Row label="Now serving">
        {serving === null ? (
          <Stat>{dash}</Stat>
        ) : (
          <RollingNumber value={serving} style={type.stat} color={colors.ink} reduceMotion={reduceMotion} />
        )}
      </Row>
      {!isTurn && (
        <>
          <Row label="People ahead">
            <Stat>{ahead === null ? dash : ahead}</Stat>
          </Row>
          <Row label="Wait about">
            <Stat>{minutes === null ? dash : `${minutes} min`}</Stat>
          </Row>
        </>
      )}
      <View style={styles.foot}>
        <Text style={[type.caption, styles.pencil]}>Code {record.code}</Text>
        <Text style={[type.caption, styles.pencil]}>Issued {issued}</Text>
      </View>
    </>
  );

  return <Ticket bg={bg} upper={upper} lower={lower} />;
}

const styles = StyleSheet.create({
  ink: { color: colors.ink },
  pencil: { color: colors.pencil },
  gap: { marginTop: space.sm },
  token: { color: colors.ink, textAlign: 'center' },
  row: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
});
