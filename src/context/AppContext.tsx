import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { demoProfiles, pets } from '../data';
import { ChildProfile, DemoProfile } from '../types';

const PROFILE_KEY = 'petsteps:selected-profile';
const PETS_KEY = 'petsteps:pet-selections';

type AppContextValue = {
  hydrated: boolean;
  selectedProfileId: string | null;
  currentProfile?: DemoProfile;
  children: ChildProfile[];
  selectProfile: (id: string) => Promise<void>;
  selectPet: (childId: ChildProfile['id'], petId: string) => Promise<void>;
  resetDemo: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children: content }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [petSelections, setPetSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.multiGet([PROFILE_KEY, PETS_KEY]).then(([[, profileId], [, storedPets]]) => {
      if (demoProfiles.some((profile) => profile.id === profileId)) setSelectedProfileId(profileId);
      if (storedPets) {
        try {
          const parsed = JSON.parse(storedPets) as Record<string, string>;
          setPetSelections(Object.fromEntries(Object.entries(parsed).filter(([, petId]) => pets.some((pet) => pet.id === petId))));
        } catch {
          AsyncStorage.removeItem(PETS_KEY);
        }
      }
    }).finally(() => setHydrated(true));
  }, []);

  const profiles = useMemo(() => demoProfiles.map((profile) => {
    if (profile.role !== 'child' || !petSelections[profile.id]) return profile;
    return { ...profile, activePetId: petSelections[profile.id] };
  }), [petSelections]);

  const selectProfile = async (id: string) => {
    if (!demoProfiles.some((profile) => profile.id === id)) return;
    setSelectedProfileId(id);
    await AsyncStorage.setItem(PROFILE_KEY, id);
  };

  const selectPet = async (childId: ChildProfile['id'], petId: string) => {
    if (!pets.some((pet) => pet.id === petId)) return;
    const next = { ...petSelections, [childId]: petId };
    setPetSelections(next);
    await AsyncStorage.setItem(PETS_KEY, JSON.stringify(next));
  };

  const resetDemo = async () => {
    await AsyncStorage.multiRemove([PROFILE_KEY, PETS_KEY]);
    setSelectedProfileId(null);
    setPetSelections({});
  };

  const currentProfile = profiles.find((profile) => profile.id === selectedProfileId);
  const childProfiles = profiles.filter((profile): profile is ChildProfile => profile.role === 'child');

  return <AppContext.Provider value={{ hydrated, selectedProfileId, currentProfile, children: childProfiles, selectProfile, selectPet, resetDemo }}>{content}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
