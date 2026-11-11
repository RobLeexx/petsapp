import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { accessories, challenges, demoProfiles, parentProfile, pets } from '../data';
import {
  addActivityMinutes as addMinutesToGame,
  addSteps as addStepsToGame,
  advanceDay,
  completeChallenge as completeGameChallenge,
  createInitialDemoState,
  deriveChildProfile,
  equipAccessory as equipGameAccessory,
  evolutionLabel,
  migrateDemoState,
  simulateSevenDays,
  switchPet,
  updateDailyStepGoal,
  xpRequiredForNextLevel,
} from '../game';
import {
  ActivityCategory,
  ChildProfile,
  DemoProfile,
  GameActionResult,
  GameFeedback,
  ParentSettings,
  PersistedDemoState,
} from '../types';

const STATE_KEY = 'petsteps:demo-state:v2';
const PROFILE_KEY = 'petsteps:selected-profile';
const PETS_KEY = 'petsteps:pet-selections';

type AppContextValue = {
  hydrated: boolean;
  selectedProfileId: string | null;
  currentProfile?: DemoProfile;
  children: ChildProfile[];
  parentSettings: ParentSettings;
  loadingMessage: string | null;
  feedback: GameFeedback | null;
  splashReplayKey: number;
  selectProfile: (id: string) => void;
  selectPet: (childId: ChildProfile['id'], petId: string) => void;
  addSteps: (amount: number, childId?: ChildProfile['id']) => void;
  addActivityMinutes: (category: ActivityCategory, amount: number, childId?: ChildProfile['id']) => void;
  completeChallenge: (challengeId: string, childId?: ChildProfile['id']) => void;
  completeNextChallenge: (childId?: ChildProfile['id']) => void;
  equipAccessory: (accessoryId: string, childId?: ChildProfile['id']) => void;
  advanceSimulation: (days: 1 | 7, childId?: ChildProfile['id']) => void;
  updateParentSettings: (settings: Partial<ParentSettings>) => void;
  updateStepGoal: (childId: ChildProfile['id'], goal: number) => void;
  previewAchievement: (childId?: ChildProfile['id']) => void;
  previewEvolution: (childId?: ChildProfile['id']) => void;
  previewLoader: () => void;
  replaySplash: () => void;
  clearFeedback: () => void;
  resetDemo: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function AppProvider({ children: content }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PersistedDemoState>(createInitialDemoState);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [splashReplayKey, setSplashReplayKey] = useState(0);

  useEffect(() => {
    AsyncStorage.multiGet([STATE_KEY, PROFILE_KEY, PETS_KEY]).then(([[, storedState], [, profileId], [, storedPets]]) => {
      let parsedState: unknown;
      let parsedPets: Record<string, string> = {};
      try { if (storedState) parsedState = JSON.parse(storedState); } catch { parsedState = undefined; }
      try { if (storedPets) parsedPets = JSON.parse(storedPets) as Record<string, string>; } catch { parsedPets = {}; }
      setState(migrateDemoState(parsedState, profileId, parsedPets));
    }).finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const children = useMemo(() => [
    deriveChildProfile(demoProfiles[0] as ChildProfile, state.children.kid_new),
    deriveChildProfile(demoProfiles[1] as ChildProfile, state.children.kid_progress),
  ], [state.children]);
  const profiles: DemoProfile[] = [...children, { ...parentProfile, settings: state.parentSettings }];
  const currentProfile = profiles.find((profile) => profile.id === state.selectedProfileId);

  const childIdFor = (childId?: ChildProfile['id']) => childId ?? (currentProfile?.role === 'child' ? currentProfile.id : 'kid_progress');

  const feedbackFrom = (result: GameActionResult, fallback?: GameFeedback): GameFeedback | null => {
    const activePet = result.game.activePetId ? result.game.pets[result.game.activePetId] : undefined;
    if (result.previousStage && result.newStage && result.previousStage !== result.newStage) return { kind: 'evolution', title: '¡Tu compañero ha evolucionado!', message: `¡Increíble! Ahora está en la etapa ${evolutionLabel(result.newStage)}.`, petId: activePet?.petId };
    if (result.levelsGained) return { kind: 'level', title: '¡Nuevo nivel!', message: `Nivel ${activePet?.level}: ${activePet?.currentLevelXp ?? 0} de ${xpRequiredForNextLevel(activePet?.level ?? 1)} XP hacia el siguiente.`, petId: activePet?.petId, level: activePet?.level };
    if (result.newAccessoryIds.length) {
      const accessory = accessories.find((item) => item.id === result.newAccessoryIds[0]);
      return { kind: 'accessory', title: '¡Nuevo accesorio desbloqueado!', message: `${accessory?.name ?? 'Una nueva recompensa'} ya está en tu colección.`, accessoryId: accessory?.id };
    }
    if (result.dailyGoalReached) return { kind: 'goal', title: '¡Meta diaria conseguida!', message: '¡Cada paso cuenta! Tu mascota está muy orgullosa de ti.', petId: activePet?.petId };
    return fallback ?? null;
  };

  const applyResult = (childId: ChildProfile['id'], result: GameActionResult, fallback?: GameFeedback) => {
    if (!result.changed) return false;
    setState((previous) => ({ ...previous, children: { ...previous.children, [childId]: result.game } }));
    const nextFeedback = feedbackFrom(result, fallback);
    if (nextFeedback) setFeedback(nextFeedback);
    return true;
  };

  const selectProfile = (id: string) => {
    if (!profiles.some((profile) => profile.id === id)) return;
    setState((previous) => ({ ...previous, selectedProfileId: id }));
  };

  const selectPet = (childId: ChildProfile['id'], petId: string) => {
    if (!pets.some((pet) => pet.id === petId)) return;
    const game = state.children[childId];
    const result = switchPet(game, petId);
    if (!result.changed && game.activePetId !== petId) {
      setFeedback({ kind: 'info', title: '¡Tu compañero quiere descansar!', message: '¡Mañana podrás cambiar de compañero otra vez!' });
      return;
    }
    applyResult(childId, result, game.activePetId ? { kind: 'achievement', title: '¡Nuevo compañero activo!', message: 'Su progreso anterior se ha guardado y vuestra aventura continúa.', petId } : undefined);
  };

  const addSteps = (amount: number, requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    applyResult(childId, addStepsToGame(state.children[childId], amount, state.parentSettings), { kind: 'achievement', title: '¡Pasos añadidos!', message: '¡Cada paso cuenta! Tu progreso ya está actualizado.' });
  };

  const addActivityMinutes = (category: ActivityCategory, amount: number, requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    applyResult(childId, addMinutesToGame(state.children[childId], category, amount, state.parentSettings), { kind: 'achievement', title: '¡Actividad registrada!', message: 'Tu compañero celebra estos minutos de actividad.' });
  };

  const completeChallenge = (challengeId: string, requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const result = completeGameChallenge(state.children[childId], challengeId, state.parentSettings);
    if (!result.changed) return;
    const challenge = challenges.find((item) => item.id === challengeId);
    applyResult(childId, result, { kind: 'challenge', title: '¡Reto completado!', message: `${challenge?.name ?? 'Una aventura más'} completado. ¡Tu mascota está orgullosa de ti!` });
  };

  const completeNextChallenge = (requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const completed = state.children[childId].activityHistory.find((day) => day.date === state.children[childId].simulatedDate)?.completedChallengeIds ?? [];
    const next = challenges.find((challenge) => !completed.includes(challenge.id));
    if (next) completeChallenge(next.id, childId);
    else setFeedback({ kind: 'info', title: '¡Todos los retos listos!', message: 'Avanza al día siguiente para descubrir nuevas aventuras.' });
  };

  const equipAccessory = (accessoryId: string, requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const result = equipGameAccessory(state.children[childId], accessoryId);
    if (!result.changed) return;
    applyResult(childId, result);
  };

  const advanceSimulation = (days: 1 | 7, requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const result = days === 1 ? advanceDay(state.children[childId]) : simulateSevenDays(state.children[childId], state.parentSettings);
    applyResult(childId, result, { kind: 'achievement', title: days === 1 ? '¡Nuevo día de aventuras!' : '¡Una semana simulada!', message: days === 1 ? 'Los retos diarios vuelven a estar disponibles.' : 'La actividad determinista ya aparece en tu historial.' });
  };

  const updateParentSettings = (settings: Partial<ParentSettings>) => setState((previous) => ({ ...previous, parentSettings: { ...previous.parentSettings, ...settings } }));
  const updateStepGoal = (childId: ChildProfile['id'], goal: number) => setState((previous) => ({ ...previous, children: { ...previous.children, [childId]: updateDailyStepGoal(previous.children[childId], goal) } }));

  const previewAchievement = (requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const game = state.children[childId];
    setFeedback({ kind: 'achievement', title: '¡Has conseguido un nuevo logro!', message: 'Esta es la animación de celebración para la presentación.', petId: game.activePetId ?? undefined });
  };

  const previewEvolution = (requestedId?: ChildProfile['id']) => {
    const childId = childIdFor(requestedId);
    const game = state.children[childId];
    const pet = game.activePetId ? game.pets[game.activePetId] : undefined;
    const targetLevel = (pet?.level ?? 1) < 4 ? 4 : 10;
    setFeedback({ kind: 'evolution', title: `Próxima etapa: ${evolutionLabel(targetLevel >= 10 ? 'heroe' : 'explorador')}`, message: `Esta vista previa no cambia el progreso. Se alcanza en el nivel ${targetLevel}.`, petId: pet?.petId });
  };

  const previewLoader = () => {
    setLoadingMessage('Organizando tus logros...');
    setTimeout(() => setLoadingMessage(null), 1400);
  };

  const resetDemo = async () => {
    setLoadingMessage('Preparando tu aventura...');
    await Promise.all([AsyncStorage.multiRemove([STATE_KEY, PROFILE_KEY, PETS_KEY]), wait(650)]);
    setState(createInitialDemoState());
    setFeedback(null);
    setLoadingMessage(null);
  };

  return (
    <AppContext.Provider value={{
      hydrated, selectedProfileId: state.selectedProfileId, currentProfile, children, parentSettings: state.parentSettings,
      loadingMessage, feedback, splashReplayKey, selectProfile, selectPet, addSteps, addActivityMinutes,
      completeChallenge, completeNextChallenge, equipAccessory, advanceSimulation, updateParentSettings,
      updateStepGoal, previewAchievement, previewEvolution, previewLoader, replaySplash: () => setSplashReplayKey((value) => value + 1),
      clearFeedback: () => setFeedback(null), resetDemo,
    }}>
      {content}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
