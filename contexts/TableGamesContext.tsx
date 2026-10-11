// Powered by OnSpace.AI
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import {
  TableSession,
  GameSettings,
  GameType,
  SessionMode,
  loadSessions,
  persistSessions,
  loadSettings,
  saveSettings,
  modeDuration,
  calcRemainingSeconds,
} from '@/services/tableGames';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TableGamesContextType {
  sessions: TableSession[];
  settings: GameSettings;
  tick: number;
  startSession: (
    tableId: string,
    tableNumber: number,
    gameType: GameType,
    mode: SessionMode,
    customRate?: number
  ) => Promise<void>;
  stopSession: (tableId: string) => Promise<void>;
  getActiveSession: (tableId: string) => TableSession | undefined;
  updateSettings: (settings: GameSettings) => Promise<void>;
}

export const TableGamesContext = createContext<TableGamesContextType | undefined>(undefined);

async function requestNotifPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

async function scheduleEndNotif(session: TableSession): Promise<string | undefined> {
  if (session.mode === 'open') return undefined;
  const granted = await requestNotifPermission();
  if (!granted) return undefined;
  const triggerSeconds = session.durationMinutes * 60;
  if (triggerSeconds < 1) return undefined;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'انتهى وقت الطاولة!',
        body: `الطاولة ${session.tableNumber} — انتهت المدة المحددة`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
      },
    });
    return id;
  } catch {
    return undefined;
  }
}

async function cancelNotif(id?: string) {
  if (id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export function TableGamesProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    billiards: { hourlyRate: 1000, tableCount: 4 },
    tabletennis: { hourlyRate: 500, tableCount: 3 },
  });
  const [tick, setTick] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const alreadyAlerter = useRef<Set<string>>(new Set());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Load initial data
  useEffect(() => {
    (async () => {
      const [s, g] = await Promise.all([loadSessions(), loadSettings()]);
      setSessions(s);
      setSettings(g);
    })();
  }, []);

  // Tick every second to update timers in UI
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for sessions that just ended → play alarm
  useEffect(() => {
    const now = Date.now();
    sessions.forEach((session) => {
      if (!session.isActive || session.mode === 'open') return;
      const remaining = calcRemainingSeconds(session, now);
      if (remaining === 0 && !alreadyAlerter.current.has(session.id)) {
        alreadyAlerter.current.add(session.id);
        playAlarm(session.gameType);
      }
    });
  }, [tick, sessions]);

  const playAlarm = useCallback(async (gameType: GameType) => {
    try {
      const currentSettings = settingsRef.current;
      const customUri = gameType === 'billiards'
        ? currentSettings.billiards.customSoundUri
        : currentSettings.tabletennis.customSoundUri;

      if (soundRef.current) {
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (customUri) {
        const { sound } = await Audio.Sound.createAsync({ uri: customUri });
        soundRef.current = sound;
        await sound.playAsync();
      } else {
        // Fallback: immediate notification as audio cue
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'انتهى وقت الطاولة!',
            body: 'انتهت المدة المحددة للطاولة',
            sound: true,
          },
          trigger: null,
        });
      }
    } catch {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'انتهى وقت الطاولة!',
            body: 'انتهت المدة المحددة للطاولة',
            sound: true,
          },
          trigger: null,
        });
      } catch {}
    }
  }, []);

  const startSession = useCallback(
    async (
      tableId: string,
      tableNumber: number,
      gameType: GameType,
      mode: SessionMode,
      customRate?: number
    ) => {
      const defaultRate = gameType === 'billiards'
        ? settingsRef.current.billiards.hourlyRate
        : settingsRef.current.tabletennis.hourlyRate;

      const hourlyRate = (customRate && customRate > 0) ? customRate : defaultRate;

      const session: TableSession = {
        id: `${tableId}_${Date.now()}`,
        tableId,
        tableNumber,
        gameType,
        mode,
        startTime: new Date().toISOString(),
        durationMinutes: modeDuration(mode),
        hourlyRate,
        isActive: true,
      };

      const notifId = await scheduleEndNotif(session);
      if (notifId) session.notifId = notifId;

      setSessions((prev) => {
        // Cancel notif for any existing active session on this table
        const existingActive = prev.find((s) => s.tableId === tableId && s.isActive);
        if (existingActive?.notifId) cancelNotif(existingActive.notifId);

        const filtered = prev.filter((s) => s.tableId !== tableId || !s.isActive);
        const updated = [session, ...filtered];
        persistSessions(updated);
        return updated;
      });

      // Remove from already-alerted set so a new session can trigger again
      alreadyAlerter.current.delete(session.id);
    },
    []
  );

  const stopSession = useCallback(async (tableId: string) => {
    // Stop any playing sound
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch {}
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }

    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.tableId === tableId && s.isActive) {
          cancelNotif(s.notifId);
          alreadyAlerter.current.delete(s.id);
          return { ...s, isActive: false, endTime: new Date().toISOString() };
        }
        return s;
      });
      persistSessions(updated);
      return updated;
    });
  }, []);

  const getActiveSession = useCallback(
    (tableId: string) => sessions.find((s) => s.tableId === tableId && s.isActive),
    [sessions]
  );

  const updateSettings = useCallback(async (newSettings: GameSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  }, []);

  return (
    <TableGamesContext.Provider
      value={{ sessions, settings, tick, startSession, stopSession, getActiveSession, updateSettings }}
    >
      {children}
    </TableGamesContext.Provider>
  );
}
