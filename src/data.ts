import { Accessory, Challenge, ChildProfile, DemoProfile, ParentProfile, Pet } from './types';

export const pets: Pet[] = [
  { id: 'fox', name: 'Zorro Explorador', personality: 'Curioso, valiente y siempre listo para descubrir.', stage: 'Explorador', spriteIndex: 0, color: '#FFE3C8' },
  { id: 'corgi', name: 'Corgi Saltarín', personality: 'Alegre, enérgico y fan de los grandes saltos.', stage: 'Compañero', spriteIndex: 1, color: '#FFF0C8' },
  { id: 'cat', name: 'Gatito Menta', personality: 'Dulce, creativo y muy observador.', stage: 'Compañero', spriteIndex: 2, color: '#DDF4EA' },
  { id: 'bunny', name: 'Conejito Brinco', personality: 'Rápido, cariñoso y lleno de buenas ideas.', stage: 'Compañero', spriteIndex: 3, color: '#FCE3DE' },
  { id: 'panda', name: 'Panda Bambú', personality: 'Tranquilo, fuerte y un amigo estupendo.', stage: 'Compañero', spriteIndex: 4, color: '#E0F1EE' },
  { id: 'hamster', name: 'Hámster Bolita', personality: 'Pequeño, divertido y sorprendentemente veloz.', stage: 'Compañero', spriteIndex: 5, color: '#FFEBCB' },
];

export const accessories: Accessory[] = [
  { id: 'explorer_hat', name: 'Sombrero explorador', requirement: '20.000 pasos totales', spriteIndex: 0 },
  { id: 'adventure_scarf', name: 'Pañuelo aventurero', requirement: 'Completa tu primer reto', spriteIndex: 1 },
  { id: 'route_backpack', name: 'Mochila de ruta', requirement: 'Completa 5 retos', spriteIndex: 2 },
  { id: 'hydration_bottle', name: 'Botella de hidratación', requirement: 'Completa el reto de hidratación', spriteIndex: 3 },
  { id: 'fast_shoes', name: 'Zapatillas veloces', requirement: '10.000 pasos totales', spriteIndex: 4 },
  { id: 'sunglasses', name: 'Gafas de sol', requirement: 'Completa un reto soleado', spriteIndex: 5 },
  { id: 'sports_cap', name: 'Gorra deportiva', requirement: 'Camina hasta el cole', spriteIndex: 6 },
  { id: 'warm_scarf', name: 'Bufanda calentita', requirement: 'Completa un reto de invierno', spriteIndex: 7 },
  { id: 'star_medal', name: 'Medalla estrella', requirement: 'Sube de nivel', spriteIndex: 8 },
  { id: 'hero_cape', name: 'Capa de héroe', requirement: 'Alcanza la etapa Héroe', spriteIndex: 9 },
  { id: 'bow_tie', name: 'Pajarita elegante', requirement: 'Completa un reto familiar', spriteIndex: 10 },
  { id: 'rain_umbrella', name: 'Paraguas de lluvia', requirement: 'Completa un reto de interior', spriteIndex: 11 },
];

export const challenges: Challenge[] = [
  { id: 'morning_walk', name: 'Paseo matutino', description: 'Da un paseo corto para empezar el día con energía.', points: 40, icon: 'sunny', color: '#FFE7A3' },
  { id: 'hydration', name: 'Héroe de la hidratación', description: 'Recuerda beber agua después de moverte.', points: 25, icon: 'water', color: '#DDF3FB' },
  { id: 'stairs', name: 'Sube escaleras', description: 'Elige las escaleras acompañado de un adulto.', points: 50, icon: 'trending-up', color: '#E6E0FA' },
  { id: 'family_walk', name: 'Paseo en familia', description: 'Invita a tu familia a compartir una aventura.', points: 80, icon: 'people', color: '#FBDDD7' },
  { id: 'outdoor_play', name: 'Juego al aire libre', description: 'Juega fuera durante unos minutos.', points: 60, icon: 'football', color: '#DDF2DD' },
  { id: 'prepare_bag', name: 'Prepara tu mochila', description: 'Ten lista tu mochila para la próxima ruta.', points: 20, icon: 'bag-handle', color: '#FFE7C9' },
];

const historyDates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11'];
const historySteps = [3120, 2880, 4010, 3560, 4420, 3750, 4900, 2100, 2850, 3210, 4100, 3350, 2831, 1900];
const activityHistory = historySteps.map((steps, index) => ({
  date: historyDates[index],
  steps,
  challenges: index % 3 === 0 ? 3 : 2,
}));

export const newChildProfile: ChildProfile = {
  id: 'kid_new', role: 'child', nickname: 'ZorroBravo32', birthYear: 2019,
  activePetId: null, level: 1, xp: 0, stepsToday: 0, dailyStepGoal: 5000,
  totalSteps: 0, weeklySteps: [0, 0, 0, 0, 0, 0, 0], activityHistory: [],
  completedChallenges: 0, completedChallengesToday: 0, dailyChallengesGoal: 3,
  streakDays: 0, unlockedAccessories: [], isNewUser: true,
};

export const experiencedChildProfile: ChildProfile = {
  id: 'kid_progress', role: 'child', nickname: 'MiaExploradora', birthYear: 2018,
  activePetId: 'fox', level: 8, evolutionStage: 'Explorador', xp: 640,
  stepsToday: 3452, dailyStepGoal: 5000, totalSteps: 68420,
  weeklySteps: [2100, 2850, 3210, 4100, 3350, 2831, 1900], activityHistory,
  completedChallenges: 18, completedChallengesToday: 3, dailyChallengesGoal: 3,
  streakDays: 7,
  unlockedAccessories: ['explorer_hat', 'adventure_scarf', 'route_backpack', 'hydration_bottle', 'fast_shoes'],
  isNewUser: false,
};

export const parentProfile: ParentProfile = {
  id: 'parent_demo', role: 'parent', displayName: 'Alex', email: 'familia@demo.local',
  childrenIds: ['kid_new', 'kid_progress'],
  settings: { safeMode: true, chatEnabled: false, dailyScreenLimitMinutes: 60, allowedFrom: '07:00', allowedTo: '20:00' },
};

export const demoProfiles: DemoProfile[] = [newChildProfile, experiencedChildProfile, parentProfile];
