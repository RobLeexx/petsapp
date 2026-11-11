export type ProfileRole = 'child' | 'parent';

export type ActivityDay = {
  date: string;
  steps: number;
  challenges: number;
};

export type EvolutionStage = 'cria' | 'explorador' | 'heroe';
export type ActivityCategory = 'sport' | 'outdoor' | 'reading' | 'educational_screen';
export type ActivityMinutes = Record<ActivityCategory, number>;

export type DailyActivity = {
  date: string;
  steps: number;
  activityMinutes: ActivityMinutes;
  completedChallengeIds: string[];
  awardedPoints: number;
  simulatedScreenMinutes: number;
};

export type PetProgress = {
  petId: string;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  evolutionStage: EvolutionStage;
  equippedAccessoryIds: string[];
};

export type GameProgress = {
  childId: ChildProfile['id'];
  simulatedDate: string;
  activePetId: string | null;
  pets: Record<string, PetProgress>;
  totalSteps: number;
  dailyStepGoal: number;
  unlockedAccessoryIds: string[];
  activityHistory: DailyActivity[];
  lifetimeCompletedChallenges: number;
  dailyPetSwitchUsed: boolean;
  leveledUpInDemo: boolean;
};

export type ChildProfile = {
  id: 'kid_new' | 'kid_progress';
  role: 'child';
  nickname: string;
  birthYear: number;
  activePetId: string | null;
  level: number;
  evolutionStage?: string;
  xp: number;
  stepsToday: number;
  dailyStepGoal: number;
  totalSteps: number;
  weeklySteps: number[];
  activityHistory: ActivityDay[];
  completedChallenges: number;
  completedChallengesToday: number;
  dailyChallengesGoal: number;
  streakDays: number;
  unlockedAccessories: string[];
  isNewUser: boolean;
  currentLevelXp?: number;
  xpRequiredForNextLevel?: number;
  simulatedDate?: string;
  completedChallengeIds?: string[];
  dailyAwardedPoints?: number;
  activityMinutes?: ActivityMinutes;
  equippedAccessoryIds?: string[];
  petProgress?: Record<string, PetProgress>;
  totalActivityMinutes?: number;
};

export type ParentSettings = {
  safeMode: boolean;
  chatEnabled: boolean;
  dailyScreenLimitMinutes: number;
  allowedFrom: string;
  allowedTo: string;
};

export type ParentProfile = {
  id: 'parent_demo';
  role: 'parent';
  displayName: string;
  email: string;
  childrenIds: ChildProfile['id'][];
  settings: ParentSettings;
};

export type DemoProfile = ChildProfile | ParentProfile;

export type Pet = {
  id: string;
  name: string;
  personality: string;
  stage: string;
  spriteIndex: number;
  color: string;
};

export type Accessory = {
  id: string;
  name: string;
  requirement: string;
  spriteIndex: number;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  color: string;
  category?: ActivityCategory;
  associatedAccessoryId?: string;
  special?: boolean;
};

export type PersistedDemoState = {
  schemaVersion: 2;
  selectedProfileId: string | null;
  children: Record<ChildProfile['id'], GameProgress>;
  parentSettings: ParentSettings;
};

export type GameActionResult = {
  game: GameProgress;
  changed: boolean;
  xpAwarded: number;
  levelsGained: number;
  previousStage?: EvolutionStage;
  newStage?: EvolutionStage;
  newAccessoryIds: string[];
  dailyGoalReached: boolean;
};

export type GameFeedback = {
  kind: 'achievement' | 'accessory' | 'level' | 'evolution' | 'goal' | 'challenge' | 'info';
  title: string;
  message: string;
  accessoryId?: string;
  petId?: string;
  level?: number;
};
