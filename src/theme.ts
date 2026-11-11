import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  teal: '#209F9E',
  tealDark: '#167E7D',
  yellow: '#FFCA48',
  coral: '#F06B58',
  cream: '#FAF7F1',
  brown: '#4C382C',
  green: '#43B88A',
  blue: '#E3F4F5',
  pink: '#FDE9E7',
  white: '#FFFFFF',
  muted: '#8F7E73',
  line: '#EDE5DC',
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 40 };
export const radius = { sm: 14, md: 20, lg: 28, pill: 999 };

export const shadow: ViewStyle = Platform.select({
  android: { elevation: 4 },
  default: {
    shadowColor: '#6F4C32',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
}) as ViewStyle;

export const roundedFont: TextStyle = {
  fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  fontWeight: '700',
};
