import { render } from '@testing-library/react-native';
import { PetStepsLoader } from '@/PetStepsLoader';
import { experiencedChildProfile, newChildProfile, parentProfile } from '@/data';
import {
  addSteps,
  advanceDay,
  awardXp,
  calculateDailyScore,
  completeChallenge,
  createInitialDemoState,
  deriveChildProfile,
  emptyActivityMinutes,
  equipAccessory,
  migrateDemoState,
  switchPet,
} from '@/game';
import { DailyActivity, PetProgress } from '@/types';

const settings = parentProfile.settings;
const activeNewGame = () => switchPet(createInitialDemoState().children.kid_new, 'fox').game;

test('adding simulated steps increases daily and lifetime totals', () => {
  const initial = activeNewGame();
  const result = addSteps(initial, 1000, settings);
  expect(result.game.totalSteps).toBe(1000);
  expect(result.game.activityHistory.at(-1)?.steps).toBe(1000);
});

test('negative steps cannot reduce totals', () => {
  const initial = activeNewGame();
  expect(addSteps(initial, -100, settings).game.totalSteps).toBe(0);
});

test('daily scoring is finite, non-negative and capped at 180', () => {
  const activity: DailyActivity = { date: '2026-11-11', steps: 999999, activityMinutes: { sport: 500, outdoor: 500, reading: 500, educational_screen: 500 }, completedChallengeIds: ['morning_walk'], awardedPoints: 0, simulatedScreenMinutes: 0 };
  expect(calculateDailyScore(activity, 60)).toBe(180);
  expect(calculateDailyScore({ ...activity, steps: Number.NaN, activityMinutes: { sport: -5, outdoor: Number.POSITIVE_INFINITY, reading: -1, educational_screen: -2 } }, Number.NaN)).toBeGreaterThanOrEqual(0);
});

test('a repeated challenge cannot award points or XP twice', () => {
  const first = completeChallenge(activeNewGame(), 'morning_walk', settings);
  const second = completeChallenge(first.game, 'morning_walk', settings);
  expect(second.changed).toBe(false);
  expect(second.game.lifetimeCompletedChallenges).toBe(1);
  expect(second.game.pets.fox.totalXp).toBe(first.game.pets.fox.totalXp);
});

test('recalculating an unchanged daily score cannot duplicate XP', () => {
  const first = addSteps(activeNewGame(), 1000, settings);
  const unchanged = addSteps(first.game, 0, settings);
  expect(unchanged.game.pets.fox.totalXp).toBe(first.game.pets.fox.totalXp);
});

test('level-up carries remaining XP forward', () => {
  const pet: PetProgress = { petId: 'fox', level: 1, totalXp: 90, currentLevelXp: 90, evolutionStage: 'cria', equippedAccessoryIds: [] };
  const result = awardXp(pet, 30);
  expect(result.progress).toMatchObject({ level: 2, currentLevelXp: 20, totalXp: 120 });
});

test('each pet preserves independent level and XP', () => {
  const foxResult = addSteps(activeNewGame(), 5000, settings);
  const nextDay = advanceDay(foxResult.game).game;
  const corgiGame = switchPet(nextDay, 'corgi').game;
  const corgiResult = addSteps(corgiGame, 1000, settings).game;
  expect(corgiResult.pets.fox.totalXp).toBeGreaterThan(0);
  expect(corgiResult.pets.corgi.totalXp).toBeGreaterThan(0);
  expect(corgiResult.pets.fox.totalXp).not.toBe(corgiResult.pets.corgi.totalXp);
});

test('a total-step milestone unlocks fast sneakers', () => {
  const result = addSteps(activeNewGame(), 10000, settings);
  expect(result.game.unlockedAccessoryIds).toContain('fast_shoes');
});

test('unlocking and equipping cannot create duplicate accessory IDs', () => {
  const unlocked = addSteps(activeNewGame(), 10000, settings).game;
  const later = addSteps(unlocked, 250, settings).game;
  expect(later.unlockedAccessoryIds.filter((id) => id === 'fast_shoes')).toHaveLength(1);
  const equipped = equipAccessory(later, 'fast_shoes').game;
  expect(equipped.pets.fox.equippedAccessoryIds).toEqual(['fast_shoes']);
});

test('advancing a day resets daily activity without losing history', () => {
  const active = addSteps(activeNewGame(), 1000, settings).game;
  const advanced = advanceDay(active).game;
  expect(advanced.totalSteps).toBe(1000);
  expect(advanced.activityHistory.at(-1)).toMatchObject({ steps: 0, completedChallengeIds: [], awardedPoints: 0 });
  expect(advanced.activityHistory.at(-2)?.steps).toBe(1000);
});

test('parent-facing profile values derive from the same child game state', () => {
  const game = addSteps(activeNewGame(), 1250, settings).game;
  const profile = deriveChildProfile(newChildProfile, game);
  expect(profile).toMatchObject({ stepsToday: 1250, totalSteps: 1250, activePetId: 'fox' });
  expect(profile.weeklySteps.at(-1)).toBe(1250);
});

test('reset fixtures restore original demonstration progress', () => {
  const reset = createInitialDemoState();
  expect(reset.children.kid_new.totalSteps).toBe(0);
  expect(reset.children.kid_progress.totalSteps).toBe(experiencedChildProfile.totalSteps);
  expect(reset.parentSettings).toEqual(parentProfile.settings);
});

test('Stage 1 state migrates without losing pet selection', () => {
  const migrated = migrateDemoState(undefined, 'kid_new', { kid_new: 'panda' });
  expect(migrated.selectedProfileId).toBe('kid_new');
  expect(migrated.children.kid_new.activePetId).toBe('panda');
});

test('invalid score inputs do not produce negative or non-finite output', () => {
  const activity: DailyActivity = { date: 'bad', steps: Number.NEGATIVE_INFINITY, activityMinutes: emptyActivityMinutes(), completedChallengeIds: ['unknown', 'unknown'], awardedPoints: 0, simulatedScreenMinutes: Number.POSITIVE_INFINITY };
  const score = calculateDailyScore(activity, -10);
  expect(Number.isFinite(score)).toBe(true);
  expect(score).toBeGreaterThanOrEqual(0);
});

test('the animated loader renders with its message', async () => {
  const { getByLabelText, getByText } = await render(<PetStepsLoader message="Preparando tu aventura..." />);
  expect(getByLabelText('Preparando tu aventura...')).toBeTruthy();
  expect(getByText('Preparando tu aventura...')).toBeTruthy();
});
