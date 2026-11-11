export type ProfileRole = 'child' | 'parent';

export type ActivityDay = {
  date: string;
  steps: number;
  challenges: number;
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
};

export type ParentProfile = {
  id: 'parent_demo';
  role: 'parent';
  displayName: string;
  email: string;
  childrenIds: ChildProfile['id'][];
  settings: {
    safeMode: boolean;
    chatEnabled: boolean;
    dailyScreenLimitMinutes: number;
    allowedFrom: string;
    allowedTo: string;
  };
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
};
