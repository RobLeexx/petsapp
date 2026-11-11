import { render } from '@testing-library/react-native';
import { ProfileSummary } from '@/components';
import { demoProfiles, experiencedChildProfile, newChildProfile } from '@/data';
import { prepareWeeklyChart, progressPercent } from '@/utils';

describe('demo profiles', () => {
  test('contains exactly three identities with the expected roles', () => {
    expect(demoProfiles).toHaveLength(3);
    expect(demoProfiles.map((profile) => profile.role)).toEqual(['child', 'child', 'parent']);
  });

  test('new child starts without progress or a pet', () => {
    expect(newChildProfile).toMatchObject({ stepsToday: 0, xp: 0, activePetId: null });
    expect(newChildProfile.unlockedAccessories).toHaveLength(0);
  });

  test('experienced child includes progression and deterministic history', () => {
    expect(experiencedChildProfile.level).toBeGreaterThan(1);
    expect(experiencedChildProfile.activePetId).toBeTruthy();
    expect(experiencedChildProfile.unlockedAccessories.length).toBeGreaterThan(0);
    expect(experiencedChildProfile.activityHistory).toHaveLength(14);
  });
});

describe('progress utilities', () => {
  test('calculates progress and clamps it from zero to one hundred', () => {
    expect(progressPercent(3452, 5000)).toBeCloseTo(69.04);
    expect(progressPercent(20, 10)).toBe(100);
    expect(progressPercent(-1, 10)).toBe(0);
    expect(progressPercent(10, 0)).toBe(0);
  });

  test('prepares all seven chart columns', () => {
    const chart = prepareWeeklyChart(experiencedChildProfile);
    expect(chart).toHaveLength(7);
    expect(chart[0]).toMatchObject({ label: 'L', steps: 2100 });
  });
});

test('renders an important profile summary', async () => {
  const { getByText } = await render(<ProfileSummary profile={experiencedChildProfile} />);
  expect(getByText('MiaExploradora')).toBeTruthy();
  expect(getByText(/Nivel 8/)).toBeTruthy();
});
