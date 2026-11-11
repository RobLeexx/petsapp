import { accessories, demoProfiles, pets } from './data';
import { ChildProfile } from './types';

export const getProfileById = (id: string | null) => demoProfiles.find((profile) => profile.id === id);

export const getActivePet = (profile: ChildProfile) => pets.find((pet) => pet.id === profile.activePetId);

export const progressPercent = (value: number, goal: number) =>
  goal <= 0 ? 0 : Math.min(100, Math.max(0, (value / goal) * 100));

export const getUnlockedAccessories = (profile: ChildProfile) =>
  accessories.filter((accessory) => profile.unlockedAccessories.includes(accessory.id));

export const prepareWeeklyChart = (profile: ChildProfile) => {
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const max = Math.max(profile.dailyStepGoal, ...profile.weeklySteps, 1);
  return profile.weeklySteps.map((steps, index) => ({
    label: labels[index],
    steps,
    percent: progressPercent(steps, max),
  }));
};
