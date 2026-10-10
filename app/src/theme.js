export const colors = {
  ink: '#101820',
  blue: '#2453D4',
  bluePressed: '#193FAF',
  yellow: '#F4C84A',
  paper: '#E9EEF2',
  white: '#FFFFFF',
  pencil: '#64717C',
  hairline: '#CBD5DC',
  green: '#167A54',
  red: '#B83228',
  fog: '#DDE5EA',
  scrim: 'rgba(16, 24, 32, 0.58)',
  mask: 'rgba(16, 24, 32, 0.72)',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, huge: 64 };
export const radius = { sm: 6, md: 12, ticket: 22, sheet: 28 };

export const font = {
  regular: 'Archivo_400Regular',
  semibold: 'Archivo_600SemiBold',
  narrow: 'ArchivoNarrow_700Bold',
};

// Tabular digits keep columns from shifting while a number rolls.
const nums = { fontVariant: ['tabular-nums'] };

export const type = {
  token: { fontFamily: font.narrow, fontSize: 148, lineHeight: 144, letterSpacing: -3, ...nums },
  serving: { fontFamily: font.narrow, fontSize: 88, lineHeight: 88, letterSpacing: -2, ...nums },
  code: { fontFamily: font.narrow, fontSize: 40, lineHeight: 44, ...nums },
  stat: { fontFamily: font.narrow, fontSize: 28, lineHeight: 32, ...nums },
  rowNumber: { fontFamily: font.narrow, fontSize: 24, lineHeight: 28, ...nums },
  title: { fontFamily: font.semibold, fontSize: 30, lineHeight: 34, letterSpacing: -0.5 },
  section: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: font.semibold, fontSize: 17, lineHeight: 22 },
};
