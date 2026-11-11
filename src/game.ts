import { accessories, challenges, experiencedChildProfile, newChildProfile, parentProfile, pets } from './data';
import {
  ActivityCategory,
  ActivityMinutes,
  ChildProfile,
  DailyActivity,
  EvolutionStage,
  GameActionResult,
  GameProgress,
  ParentSettings,
  PersistedDemoState,
  PetProgress,
} from './types';

export const INITIAL_SIMULATED_DATE = '2026-11-11';
export const emptyActivityMinutes = (): ActivityMinutes => ({ sport: 0, outdoor: 0, reading: 0, educational_screen: 0 });

const finiteNonNegative = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const safeInteger = (value: number, max = Number.MAX_SAFE_INTEGER) => Math.min(max, Math.floor(finiteNonNegative(value)));

export const xpRequiredForNextLevel = (level: number) => 100 + (Math.max(1, Math.floor(level)) - 1) * 25;
export const evolutionForLevel = (level: number): EvolutionStage => level >= 10 ? 'heroe' : level >= 4 ? 'explorador' : 'cria';
export const evolutionLabel = (stage: EvolutionStage) => ({ cria: 'Cría', explorador: 'Explorador', heroe: 'Héroe' })[stage];

export function calculateDailyScore(activity: DailyActivity, screenLimitMinutes: number) {
  const minutes = activity.activityMinutes ?? emptyActivityMinutes();
  const stepPoints = Math.floor(safeInteger(activity.steps) / 100);
  const activityPoints = finiteNonNegative(minutes.sport) * 1.5
    + finiteNonNegative(minutes.outdoor) * 1.25
    + finiteNonNegative(minutes.reading)
    + finiteNonNegative(minutes.educational_screen) * 0.5;
  const completedIds = Array.isArray(activity.completedChallengeIds) ? [...new Set(activity.completedChallengeIds)] : [];
  const challengePoints = completedIds.reduce((total, id) => total + (challenges.find((challenge) => challenge.id === id)?.points ?? 0), 0);
  const cappedBase = Math.min(Math.max(stepPoints + activityPoints + challengePoints, 0), 150);
  const limit = Math.max(1, finiteNonNegative(screenLimitMinutes));
  const screenMinutes = finiteNonNegative(activity.simulatedScreenMinutes);
  const multiplier = screenMinutes <= limit * 0.8 ? 1.2 : screenMinutes <= limit ? 1.1 : 1;
  return Math.min(Math.floor(cappedBase * multiplier), 180);
}

export function awardXp(progress: PetProgress, amount: number) {
  const awarded = safeInteger(amount, 180);
  let level = Math.max(1, progress.level);
  let currentLevelXp = safeInteger(progress.currentLevelXp) + awarded;
  let levelsGained = 0;
  while (currentLevelXp >= xpRequiredForNextLevel(level)) {
    currentLevelXp -= xpRequiredForNextLevel(level);
    level += 1;
    levelsGained += 1;
  }
  return {
    progress: { ...progress, level, currentLevelXp, totalXp: safeInteger(progress.totalXp) + awarded, evolutionStage: evolutionForLevel(level) },
    levelsGained,
  };
}

const dateAfter = (date: string, days = 1) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const today = (game: GameProgress) => game.activityHistory.find((activity) => activity.date === game.simulatedDate)
  ?? { date: game.simulatedDate, steps: 0, activityMinutes: emptyActivityMinutes(), completedChallengeIds: [], awardedPoints: 0, simulatedScreenMinutes: 0 };

const replaceToday = (game: GameProgress, activity: DailyActivity): GameProgress => ({
  ...game,
  activityHistory: game.activityHistory.some((day) => day.date === game.simulatedDate)
    ? game.activityHistory.map((day) => day.date === game.simulatedDate ? activity : day)
    : [...game.activityHistory, activity],
});

function unlockedFor(game: GameProgress) {
  const completed = new Set(game.activityHistory.flatMap((activity) => activity.completedChallengeIds));
  const heroReached = Object.values(game.pets).some((pet) => pet.evolutionStage === 'heroe');
  return accessories.filter((accessory) => {
    switch (accessory.id) {
      case 'explorer_hat': return game.totalSteps >= 20000;
      case 'adventure_scarf': return game.lifetimeCompletedChallenges >= 1;
      case 'route_backpack': return game.lifetimeCompletedChallenges >= 5;
      case 'hydration_bottle': return completed.has('hydration');
      case 'fast_shoes': return game.totalSteps >= 10000;
      case 'sunglasses': return completed.has('sunny_day');
      case 'sports_cap': return completed.has('walk_school');
      case 'warm_scarf': return completed.has('winter_fun');
      case 'star_medal': return game.leveledUpInDemo;
      case 'hero_cape': return heroReached;
      case 'bow_tie': return completed.has('family_walk');
      case 'rain_umbrella': return completed.has('rainy_indoor');
      default: return false;
    }
  }).map((accessory) => accessory.id);
}

const unchangedResult = (game: GameProgress): GameActionResult => ({ game, changed: false, xpAwarded: 0, levelsGained: 0, newAccessoryIds: [], dailyGoalReached: false });

function finalize(previous: GameProgress, changed: GameProgress, settings: ParentSettings, dailyGoalReached = false): GameActionResult {
  const activity = today(changed);
  const score = calculateDailyScore(activity, settings.dailyScreenLimitMinutes);
  const active = changed.activePetId ? changed.pets[changed.activePetId] : undefined;
  const xpAwarded = active ? Math.max(0, score - safeInteger(activity.awardedPoints, 180)) : 0;
  let next = replaceToday(changed, { ...activity, awardedPoints: active ? Math.max(activity.awardedPoints, score) : activity.awardedPoints });
  let levelsGained = 0;
  let previousStage: EvolutionStage | undefined;
  let newStage: EvolutionStage | undefined;
  if (active && xpAwarded) {
    previousStage = active.evolutionStage;
    const awarded = awardXp(active, xpAwarded);
    levelsGained = awarded.levelsGained;
    newStage = awarded.progress.evolutionStage;
    next = { ...next, pets: { ...next.pets, [active.petId]: awarded.progress }, leveledUpInDemo: next.leveledUpInDemo || levelsGained > 0 };
  }
  const unlocked = unlockedFor(next);
  const allUnlocked = [...new Set([...next.unlockedAccessoryIds, ...unlocked])];
  const newAccessoryIds = allUnlocked.filter((id) => !previous.unlockedAccessoryIds.includes(id));
  next = { ...next, unlockedAccessoryIds: allUnlocked };
  return { game: next, changed: true, xpAwarded, levelsGained, previousStage, newStage, newAccessoryIds, dailyGoalReached };
}

export function addSteps(game: GameProgress, amount: number, settings: ParentSettings): GameActionResult {
  const steps = safeInteger(amount, 50000);
  if (!steps) return unchangedResult(game);
  const activity = today(game);
  const goalWasReached = activity.steps >= game.dailyStepGoal;
  const nextActivity = { ...activity, steps: activity.steps + steps };
  const next = replaceToday({ ...game, totalSteps: game.totalSteps + steps }, nextActivity);
  return finalize(game, next, settings, !goalWasReached && nextActivity.steps >= game.dailyStepGoal);
}

export function addActivityMinutes(game: GameProgress, category: ActivityCategory, amount: number, settings: ParentSettings): GameActionResult {
  const minutes = safeInteger(amount, 240);
  if (!minutes) return unchangedResult(game);
  const activity = today(game);
  const nextActivity = {
    ...activity,
    activityMinutes: { ...activity.activityMinutes, [category]: activity.activityMinutes[category] + minutes },
    simulatedScreenMinutes: activity.simulatedScreenMinutes + (category === 'educational_screen' ? minutes : 0),
  };
  return finalize(game, replaceToday(game, nextActivity), settings);
}

export function completeChallenge(game: GameProgress, challengeId: string, settings: ParentSettings): GameActionResult {
  if (!challenges.some((challenge) => challenge.id === challengeId)) return unchangedResult(game);
  const activity = today(game);
  if (activity.completedChallengeIds.includes(challengeId)) return unchangedResult(game);
  const nextActivity = { ...activity, completedChallengeIds: [...activity.completedChallengeIds, challengeId] };
  const next = replaceToday({ ...game, lifetimeCompletedChallenges: game.lifetimeCompletedChallenges + 1 }, nextActivity);
  return finalize(game, next, settings);
}

export function switchPet(game: GameProgress, petId: string): GameActionResult {
  if (!pets.some((pet) => pet.id === petId) || game.activePetId === petId || (game.activePetId && game.dailyPetSwitchUsed)) return unchangedResult(game);
  return { ...unchangedResult(game), game: { ...game, activePetId: petId, dailyPetSwitchUsed: Boolean(game.activePetId) }, changed: true };
}

export function equipAccessory(game: GameProgress, accessoryId: string): GameActionResult {
  if (!game.activePetId || !game.unlockedAccessoryIds.includes(accessoryId)) return unchangedResult(game);
  const pet = game.pets[game.activePetId];
  const equippedAccessoryIds = pet.equippedAccessoryIds.includes(accessoryId) ? [] : [accessoryId];
  return { ...unchangedResult(game), game: { ...game, pets: { ...game.pets, [pet.petId]: { ...pet, equippedAccessoryIds } } }, changed: true };
}

export function advanceDay(game: GameProgress): GameActionResult {
  const simulatedDate = dateAfter(game.simulatedDate);
  const next: GameProgress = {
    ...game,
    simulatedDate,
    dailyPetSwitchUsed: false,
    activityHistory: [...game.activityHistory, { date: simulatedDate, steps: 0, activityMinutes: emptyActivityMinutes(), completedChallengeIds: [], awardedPoints: 0, simulatedScreenMinutes: 0 }],
  };
  return { ...unchangedResult(game), game: next, changed: true };
}

export function simulateSevenDays(game: GameProgress, settings: ParentSettings): GameActionResult {
  const stepPattern = [1800, 3200, 5100, 2750, 4300, 3900, 5600];
  let next = game;
  let xpAwarded = 0;
  let levelsGained = 0;
  const initialUnlocks = game.unlockedAccessoryIds;
  for (let index = 0; index < stepPattern.length; index += 1) {
    next = advanceDay(next).game;
    let result = addSteps(next, stepPattern[index], settings);
    next = result.game; xpAwarded += result.xpAwarded; levelsGained += result.levelsGained;
    result = addActivityMinutes(next, index % 2 ? 'sport' : 'outdoor', 15 + index * 2, settings);
    next = result.game; xpAwarded += result.xpAwarded; levelsGained += result.levelsGained;
    result = completeChallenge(next, challenges[index % 6].id, settings);
    next = result.game; xpAwarded += result.xpAwarded; levelsGained += result.levelsGained;
  }
  return { game: next, changed: true, xpAwarded, levelsGained, newAccessoryIds: next.unlockedAccessoryIds.filter((id) => !initialUnlocks.includes(id)), dailyGoalReached: false };
}

const createPets = (activePetId: string | null, activeLevel: number, lifetimeXp: number): Record<string, PetProgress> => Object.fromEntries(pets.map((pet) => {
  const active = pet.id === activePetId;
  const level = active ? activeLevel : 1;
  return [pet.id, { petId: pet.id, level, totalXp: active ? lifetimeXp : 0, currentLevelXp: active && level > 1 ? 80 : 0, evolutionStage: evolutionForLevel(level), equippedAccessoryIds: [] }];
}));

const activityFromFixture = (profile: ChildProfile): DailyActivity[] => profile.activityHistory.map((day, index) => ({
  date: day.date,
  steps: index === profile.activityHistory.length - 1 ? profile.stepsToday : (index === 6 ? 0 : day.steps),
  activityMinutes: emptyActivityMinutes(),
  completedChallengeIds: index === profile.activityHistory.length - 1 && profile.id === 'kid_progress' ? challenges.slice(0, 3).map((challenge) => challenge.id) : [],
  awardedPoints: index === profile.activityHistory.length - 1 && profile.id === 'kid_progress' ? 94 : 0,
  simulatedScreenMinutes: profile.id === 'kid_progress' ? 32 : 0,
}));

export function createInitialGameProgress(profile: ChildProfile): GameProgress {
  const activityHistory = activityFromFixture(profile);
  if (!activityHistory.some((day) => day.date === INITIAL_SIMULATED_DATE)) activityHistory.push({ date: INITIAL_SIMULATED_DATE, steps: profile.stepsToday, activityMinutes: emptyActivityMinutes(), completedChallengeIds: [], awardedPoints: 0, simulatedScreenMinutes: 0 });
  return {
    childId: profile.id,
    simulatedDate: INITIAL_SIMULATED_DATE,
    activePetId: profile.activePetId,
    pets: createPets(profile.activePetId, profile.level, profile.xp),
    totalSteps: profile.totalSteps,
    dailyStepGoal: profile.dailyStepGoal,
    unlockedAccessoryIds: [...profile.unlockedAccessories],
    activityHistory,
    lifetimeCompletedChallenges: profile.completedChallenges,
    dailyPetSwitchUsed: false,
    leveledUpInDemo: false,
  };
}

export function createInitialDemoState(): PersistedDemoState {
  return {
    schemaVersion: 2,
    selectedProfileId: null,
    children: { kid_new: createInitialGameProgress(newChildProfile), kid_progress: createInitialGameProgress(experiencedChildProfile) },
    parentSettings: { ...parentProfile.settings },
  };
}

const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

function sanitizeActivity(value: unknown): DailyActivity | null {
  if (!value || typeof value !== 'object') return null;
  const activity = value as Partial<DailyActivity>;
  if (!isDate(activity.date)) return null;
  const storedMinutes = activity.activityMinutes ?? emptyActivityMinutes();
  return {
    date: activity.date,
    steps: safeInteger(activity.steps ?? 0),
    activityMinutes: {
      sport: safeInteger(storedMinutes.sport), outdoor: safeInteger(storedMinutes.outdoor),
      reading: safeInteger(storedMinutes.reading), educational_screen: safeInteger(storedMinutes.educational_screen),
    },
    completedChallengeIds: Array.isArray(activity.completedChallengeIds) ? [...new Set(activity.completedChallengeIds.filter((id) => challenges.some((challenge) => challenge.id === id)))] : [],
    awardedPoints: safeInteger(activity.awardedPoints ?? 0, 180),
    simulatedScreenMinutes: safeInteger(activity.simulatedScreenMinutes ?? 0, 1440),
  };
}

export function migrateDemoState(raw: unknown, stageOneProfileId: string | null = null, stageOnePets: Record<string, string> = {}): PersistedDemoState {
  const initial = createInitialDemoState();
  if (raw && typeof raw === 'object' && (raw as Partial<PersistedDemoState>).schemaVersion === 2) {
    const stored = raw as Partial<PersistedDemoState>;
    const selectedProfileId = ['kid_new', 'kid_progress', 'parent_demo'].includes(stored.selectedProfileId ?? '') ? stored.selectedProfileId! : null;
    const children = { ...initial.children };
    (['kid_new', 'kid_progress'] as const).forEach((id) => {
      const game = stored.children?.[id];
      if (!game || !Array.isArray(game.activityHistory)) return;
      const unlockedAccessoryIds = Array.isArray(game.unlockedAccessoryIds) ? [...new Set(game.unlockedAccessoryIds.filter((value) => accessories.some((item) => item.id === value)))] : initial.children[id].unlockedAccessoryIds;
      const petProgress = Object.fromEntries(pets.map((pet) => {
        const fallback = initial.children[id].pets[pet.id];
        const saved = game.pets?.[pet.id];
        const level = Math.max(1, safeInteger(saved?.level ?? fallback.level, 100));
        return [pet.id, {
          ...fallback,
          level,
          totalXp: safeInteger(saved?.totalXp ?? fallback.totalXp),
          currentLevelXp: safeInteger(saved?.currentLevelXp ?? fallback.currentLevelXp),
          evolutionStage: evolutionForLevel(level),
          equippedAccessoryIds: Array.isArray(saved?.equippedAccessoryIds) ? [...new Set(saved.equippedAccessoryIds.filter((accessoryId) => unlockedAccessoryIds.includes(accessoryId)))].slice(0, 1) : [],
        }];
      }));
      const simulatedDate = isDate(game.simulatedDate) ? game.simulatedDate : INITIAL_SIMULATED_DATE;
      const activityHistory = game.activityHistory.map(sanitizeActivity).filter((activity): activity is DailyActivity => Boolean(activity));
      if (!activityHistory.some((activity) => activity.date === simulatedDate)) activityHistory.push({ date: simulatedDate, steps: 0, activityMinutes: emptyActivityMinutes(), completedChallengeIds: [], awardedPoints: 0, simulatedScreenMinutes: 0 });
      children[id] = {
        ...initial.children[id],
        simulatedDate,
        pets: petProgress,
        totalSteps: safeInteger(game.totalSteps),
        dailyStepGoal: Math.min(20000, Math.max(1000, safeInteger(game.dailyStepGoal))),
        unlockedAccessoryIds,
        activityHistory,
        lifetimeCompletedChallenges: safeInteger(game.lifetimeCompletedChallenges),
        dailyPetSwitchUsed: Boolean(game.dailyPetSwitchUsed),
        leveledUpInDemo: Boolean(game.leveledUpInDemo),
        activePetId: pets.some((pet) => pet.id === game.activePetId) ? game.activePetId : initial.children[id].activePetId,
      };
    });
    const savedSettings = stored.parentSettings;
    return { schemaVersion: 2, selectedProfileId, children, parentSettings: {
      safeMode: typeof savedSettings?.safeMode === 'boolean' ? savedSettings.safeMode : initial.parentSettings.safeMode,
      chatEnabled: typeof savedSettings?.chatEnabled === 'boolean' ? savedSettings.chatEnabled : initial.parentSettings.chatEnabled,
      dailyScreenLimitMinutes: Math.min(180, Math.max(15, safeInteger(savedSettings?.dailyScreenLimitMinutes ?? initial.parentSettings.dailyScreenLimitMinutes))),
      allowedFrom: typeof savedSettings?.allowedFrom === 'string' ? savedSettings.allowedFrom : initial.parentSettings.allowedFrom,
      allowedTo: typeof savedSettings?.allowedTo === 'string' ? savedSettings.allowedTo : initial.parentSettings.allowedTo,
    } };
  }
  const selectedProfileId = ['kid_new', 'kid_progress', 'parent_demo'].includes(stageOneProfileId ?? '') ? stageOneProfileId : null;
  (['kid_new', 'kid_progress'] as const).forEach((id) => {
    if (pets.some((pet) => pet.id === stageOnePets[id])) initial.children[id].activePetId = stageOnePets[id];
  });
  return { ...initial, selectedProfileId };
}

const streakFrom = (activities: DailyActivity[]) => {
  let streak = 0;
  for (let index = activities.length - 1; index >= 0; index -= 1) {
    const activity = activities[index];
    if (!activity.steps && !activity.completedChallengeIds.length) break;
    streak += 1;
  }
  return streak;
};

export function deriveChildProfile(base: ChildProfile, game: GameProgress): ChildProfile {
  const activity = today(game);
  const pet = game.activePetId ? game.pets[game.activePetId] : undefined;
  const weeklySteps = game.activityHistory.slice(-7).map((day) => day.steps);
  while (weeklySteps.length < 7) weeklySteps.unshift(0);
  return {
    ...base,
    activePetId: game.activePetId,
    level: pet?.level ?? 1,
    evolutionStage: pet ? evolutionLabel(pet.evolutionStage) : undefined,
    xp: pet?.totalXp ?? 0,
    currentLevelXp: pet?.currentLevelXp ?? 0,
    xpRequiredForNextLevel: xpRequiredForNextLevel(pet?.level ?? 1),
    stepsToday: activity.steps,
    dailyStepGoal: game.dailyStepGoal,
    totalSteps: game.totalSteps,
    weeklySteps,
    activityHistory: game.activityHistory.map((day) => ({ date: day.date, steps: day.steps, challenges: day.completedChallengeIds.length })),
    completedChallenges: game.lifetimeCompletedChallenges,
    completedChallengesToday: activity.completedChallengeIds.length,
    streakDays: streakFrom(game.activityHistory),
    unlockedAccessories: game.unlockedAccessoryIds,
    simulatedDate: game.simulatedDate,
    completedChallengeIds: activity.completedChallengeIds,
    dailyAwardedPoints: activity.awardedPoints,
    activityMinutes: activity.activityMinutes,
    equippedAccessoryIds: pet?.equippedAccessoryIds ?? [],
    petProgress: game.pets,
    totalActivityMinutes: game.activityHistory.reduce((total, day) => total + Object.values(day.activityMinutes).reduce((sum, minutes) => sum + minutes, 0), 0),
  };
}

export function updateDailyStepGoal(game: GameProgress, goal: number): GameProgress {
  return { ...game, dailyStepGoal: Math.min(20000, Math.max(1000, safeInteger(goal))) };
}
