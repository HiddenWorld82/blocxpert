import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { getProperties, getPropertiesByBroker } from '../services/dataService';
import { getUserProfile, setUserProfile } from '../services/userProfileService';
import { getSharedWithMe, refreshSharedWithMeList } from '../services/shareService';
import { syncCurrentUserEmail } from '../services/userEmailService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownProperties, setOwnProperties] = useState([]);
  const [brokerProperties, setBrokerProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [userProfile, setUserProfileState] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sharedWithMe, setSharedWithMe] = useState([]);

  const properties = useMemo(
    () => [...ownProperties, ...brokerProperties],
    [ownProperties, brokerProperties],
  );

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setOwnProperties([]);
      setBrokerProperties([]);
      setPropertiesLoading(false);
      return undefined;
    }
    setPropertiesLoading(true);
    let done = 0;
    const maybeDone = () => {
      done += 1;
      if (done === 3) setPropertiesLoading(false);
    };
    const unsub1 = getProperties(currentUser.uid, (props) => {
      setOwnProperties(props);
      maybeDone();
    });
    const unsub2 = getPropertiesByBroker(currentUser.uid, (props) => {
      setBrokerProperties(props);
      maybeDone();
    });
    const unsub3 = getSharedWithMe(currentUser.uid, (items) => {
      setSharedWithMe(items);
      maybeDone();
    });
    return () => {
      const u1 = unsub1;
      const u2 = unsub2;
      const u3 = unsub3;
      queueMicrotask(() => {
        u1?.();
        u2?.();
        u3?.();
      });
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.email) {
      syncCurrentUserEmail(currentUser.uid, currentUser.email).catch(() => {});
    }
  }, [currentUser?.uid, currentUser?.email]);

  useEffect(() => {
    if (!currentUser) {
      setUserProfileState(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    getUserProfile(currentUser.uid)
      .then((profile) => {
        setUserProfileState(profile);
        setProfileLoading(false);
      })
      .catch(() => {
        setUserProfileState(null);
        setProfileLoading(false);
      });
  }, [currentUser?.uid]);

  const refreshUserProfile = useCallback(async () => {
    if (!currentUser) return;
    const profile = await getUserProfile(currentUser.uid);
    setUserProfileState(profile);
  }, [currentUser?.uid]);

  const updateUserProfile = useCallback(
    async (data) => {
      if (!currentUser) return;
      await setUserProfile(currentUser.uid, data);
      if (data.displayName !== undefined || data.avatarUrl !== undefined) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName ?? currentUser.displayName ?? '',
          photoURL: data.avatarUrl ?? currentUser.photoURL ?? '',
        });
      }
      await refreshUserProfile();
    },
    [currentUser, refreshUserProfile],
  );

  const completeOnboarding = useCallback(
    async (persona) => {
      if (!currentUser) return;
      const profileData = {
        persona: persona || 'autre',
        onboardingCompleted: true,
        displayName: currentUser.displayName ?? '',
        avatarUrl: currentUser.photoURL ?? '',
      };
      await setUserProfile(currentUser.uid, profileData);
      setUserProfileState((prev) => ({
        ...prev,
        id: currentUser.uid,
        ...profileData,
      }));
      await refreshUserProfile();
    },
    [currentUser, refreshUserProfile],
  );

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const refreshSharedWithMe = useCallback(() => {
    if (!currentUser?.uid) return;
    refreshSharedWithMeList(currentUser.uid).then(setSharedWithMe).catch((e) => {
      console.warn('refreshSharedWithMe', e);
    });
  }, [currentUser?.uid]);

  const value = {
    currentUser,
    loading,
    properties,
    propertiesLoading,
    sharedWithMe,
    refreshSharedWithMe,
    userProfile,
    profileLoading,
    refreshUserProfile,
    updateUserProfile,
    completeOnboarding,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

