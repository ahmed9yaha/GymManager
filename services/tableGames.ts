// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameType = 'billiards' | 'tabletennis';
export type SessionMode = '1h' | '2h' | '3h' | 'open';

export interface TableSession {
  id: string;
  tableId: string;
  tableNumber: number;
  gameType: GameType;
  mode: SessionMode;
  startTime: string; // ISO
  durationMinutes: number; // 0 for open
  hourlyRate: number;
  endTime?: string; // ISO, set when stopped
  isActive: boolean;
  notifId?: string;
}

export interface GameSettings {
  billiards: {
    hourlyRate: number;
    tableCount: number;
    customSoundUri?: string;
  };
  tabletennis: {
    hourlyRate: number;
    tableCount: number;
    customSoundUri?: string;
  };
}

// ── Session Record (closed sessions for reports) ─────────────────────────────

export interface SessionRecord {
  id: string;
  tableId: string;
  tableNumber: number;
  gameType: GameType;
  mode: SessionMode;
  startTime: string;  // ISO
  endTime: string;    // ISO
  durationMinutes: number;
  hourlyRate: number;
  finalCost: number;
}

const KEYS = {
  sessions: 'table_games_sessions_v2',
  settings: 'table_games_settings_v2',
  records: 'table_games_records_v1',
};

const DEFAULT_SETTINGS: GameSettings = {
  billiards: { hourlyRate: 1000, tableCount: 4 },
  tabletennis: { hourlyRate: 500, tableCount: 3 },
};

// ── Settings ─────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<GameSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      billiards: { ...DEFAULT_SETTINGS.billiards, ...parsed.billiards },
      tabletennis: { ...DEFAULT_SETTINGS.tabletennis, ...parsed.tabletennis },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch {}
}

// ── Sessions ──────────────────────────────────────────────────────────────────

// ── Records ──────────────────────────────────────────────────────────────────

export async function loadRecords(): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.records);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export async function persistRecords(records: SessionRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.records, JSON.stringify(records));
  } catch {}
}

export async function appendRecord(record: SessionRecord): Promise<void> {
  try {
    const existing = await loadRecords();
    // keep last 500 records to avoid unbounded growth
    const updated = [record, ...existing].slice(0, 500);
    await persistRecords(updated);
  } catch {}
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function loadSessions(): Promise<TableSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.sessions);
    if (!raw) return [];
    return JSON.parse(raw) as TableSession[];
  } catch {
    return [];
  }
}

export async function persistSessions(sessions: TableSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
  } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function modeDuration(mode: SessionMode): number {
  if (mode === '1h') return 60;
  if (mode === '2h') return 120;
  if (mode === '3h') return 180;
  return 0; // open
}

export function modeLabel(mode: SessionMode): string {
  if (mode === '1h') return 'ساعة';
  if (mode === '2h') return 'ساعتان';
  if (mode === '3h') return '٣ ساعات';
  return 'وقت مفتوح';
}

export function calcCost(session: TableSession, nowMs: number): number {
  const startMs = new Date(session.startTime).getTime();
  const elapsedMinutes = Math.max(0, (nowMs - startMs) / 60000);
  if (session.mode === 'open') {
    return Math.ceil((elapsedMinutes / 60) * session.hourlyRate);
  }
  return Math.ceil((session.durationMinutes / 60) * session.hourlyRate);
}

export function calcRemainingSeconds(session: TableSession, nowMs: number): number {
  if (session.mode === 'open') return -1;
  const startMs = new Date(session.startTime).getTime();
  const endMs = startMs + session.durationMinutes * 60 * 1000;
  return Math.max(0, Math.ceil((endMs - nowMs) / 1000));
}

export function calcElapsedSeconds(session: TableSession, nowMs: number): number {
  const startMs = new Date(session.startTime).getTime();
  return Math.floor((nowMs - startMs) / 1000);
}

export function formatDuration(totalSeconds: number): string {
  const absSeconds = Math.abs(totalSeconds);
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
