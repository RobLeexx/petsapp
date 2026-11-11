jest.mock('react-native-reanimated', () => {
  const { Animated } = require('react-native');
  const immediate = (value, _config, callback) => {
    callback?.(true);
    return value;
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: (value) => ({ value }),
    useAnimatedStyle: (factory) => factory(),
    Easing: { linear: (value) => value },
    cancelAnimation: jest.fn(),
    withDelay: (_delay, value) => value,
    withRepeat: (value) => value,
    withSequence: (...values) => values.at(-1),
    withSpring: immediate,
    withTiming: immediate,
  };
});
