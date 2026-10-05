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
  calcCost,
  calcRemainingSeconds,
  calcElapsedSeconds,
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
  tick: number; // increments every second to drive UI re-renders
  startSession: (tableId: string, tableNumber: number, gameType: GameType, mode: SessionMode) => Promise<void>;
  stopSession: (tableId: string) => Promise<void>;
  getActiveSession: (tableId: string) => TableSession | undefined;
  updateSettings: (settings: GameSettings) => Promise<void>;
}

export const TableGamesContext = createContext<TableGamesContextType | undefined>(undefined);

async function requestNotifPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleEndNotif(session: TableSession): Promise<string | undefined> {
  if (session.mode === 'open') return undefined;
  const granted = await requestNotifPermission();
  if (!granted) return undefined;
  const triggerSeconds = session.durationMinutes * 60;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ انتهى وقت الطاولة!',
      body: `الطاولة ${session.tableNumber} — انتهت المدة المحددة`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, triggerSeconds),
    },
  });
  return id;
}

async function cancelNotif(id?: string) {
  if (id) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
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
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load initial data
  useEffect(() => {
    (async () => {
      const [s, g] = await Promise.all([loadSessions(), loadSettings()]);
      setSessions(s);
      setSettings(g);
    })();
  }, []);

  // Tick every second
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
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
  }, [tick]);

  const playAlarm = useCallback(async (gameType: GameType) => {
    try {
      const customUri = gameType === 'billiards'
        ? settings.billiards.customSoundUri
        : settings.tabletennis.customSoundUri;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (customUri) {
        const { sound } = await Audio.Sound.createAsync({ uri: customUri });
        soundRef.current = sound;
        await sound.playAsync();
      } else {
        // No default sound file — trigger a local notification as audio cue
        throw new Error('no_default_sound');
      }
    } catch (e) {
      // Fallback: trigger local notification as audio cue
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ انتهى وقت الطاولة!',
          body: 'انتهت المدة المحددة للطاولة',
          sound: true,
        },
        trigger: null,
      });
    }
  }, [settings]);

  const startSession = useCallback(
    async (tableId: string, tableNumber: number, gameType: GameType, mode: SessionMode) => {
      const hourlyRate = gameType === 'billiards'
        ? settings.billiards.hourlyRate
        : settings.tabletennis.hourlyRate;

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
        const filtered = prev.filter((s) => s.tableId !== tableId || !s.isActive);
        const updated = [session, ...filtered];
        persistSessions(updated);
        return updated;
      });
    },
    [settings]
  );

  const stopSession = useCallback(async (tableId: string) => {
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
    // Stop any playing sound
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch {}
    }
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
