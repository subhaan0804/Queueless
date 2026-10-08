export const colors = {
  ink: '#14171F',
  blue: '#1F3FBF',
  bluePressed: '#18309A',
  yellow: '#FFD23F',
  paper: '#F2F4F7',
  white: '#FFFFFF',
  pencil: '#6B7280',
  hairline: '#D9DEE6',
  green: '#1E8E5A',
  red: '#C8321F',
  scrim: 'rgba(20, 23, 31, 0.4)',
  mask: 'rgba(20, 23, 31, 0.6)',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 4, ticket: 20, sheet: 24 };

export const font = {
  regular: 'Archivo_400Regular',
  semibold: 'Archivo_600SemiBold',
  narrow: 'ArchivoNarrow_700Bold',
};

// Tabular digits keep columns from shifting while a number rolls.
const nums = { fontVariant: ['tabular-nums'] };

export const type = {
  token: { fontFamily: font.narrow, fontSize: 152, lineHeight: 152, letterSpacing: -2, ...nums },
  serving: { fontFamily: font.narrow, fontSize: 96, lineHeight: 96, ...nums },
  code: { fontFamily: font.narrow, fontSize: 40, lineHeight: 44, ...nums },
  stat: { fontFamily: font.narrow, fontSize: 28, lineHeight: 32, ...nums },
  rowNumber: { fontFamily: font.narrow, fontSize: 24, lineHeight: 28, ...nums },
  title: { fontFamily: font.semibold, fontSize: 28, lineHeight: 32 },
  section: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22 },
};
