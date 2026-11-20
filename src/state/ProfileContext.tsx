import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  createProfile,
  deleteProfile,
  getActiveProfile,
  getProfiles,
  renameProfile,
  setActiveProfile,
  updateProfile,
  type Profile,
  type ProfileChanges,
} from '@/db/profiles';

type ProfileContextValue = {
  profiles: Profile[];
  activeProfile: Profile | null;
  activate: (id: number) => Promise<void>;
  create: (name: string) => Promise<number>;
  rename: (id: number, name: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  update: (id: number, changes: ProfileChanges) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type Loaded = { profiles: Profile[]; activeProfile: Profile };

async function loadProfiles(): Promise<Loaded> {
  const [profiles, activeProfile] = await Promise.all([
    getProfiles(),
    getActiveProfile(),
  ]);
  return { profiles, activeProfile };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActive] = useState<Profile | null>(null);

  const apply = useCallback((loaded: Loaded) => {
    setProfiles(loaded.profiles);
    setActive(loaded.activeProfile);
  }, []);

  async function reload() {
    apply(await loadProfiles());
  }

  useEffect(() => {
    loadProfiles()
      .then(apply)
      .catch((e) => console.error('Nie udało się wczytać profili', e));
  }, [apply]);

  async function activate(id: number) {
    await setActiveProfile(id);
    await reload();
    // TODO(A6): await syncActiveProfile();
  }

  async function create(name: string) {
    const id = await createProfile(name);
    await reload();
    return id;
  }

  async function rename(id: number, name: string) {
    await renameProfile(id, name);
    await reload();
  }

  async function remove(id: number) {
    await deleteProfile(id);
    await reload();
  }

  async function update(id: number, changes: ProfileChanges) {
    await updateProfile(id, changes);
    await reload();
    if (id === activeProfile?.id) {
      // TODO(A6): await syncActiveProfile();
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activate,
        create,
        rename,
        remove,
        update,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error('useProfiles musi być użyte wewnątrz ProfileProvider');
  }
  return value;
}
