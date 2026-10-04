// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Member {
  id: string;
  name: string;
  fee: number;
  phone?: string;
  photo?: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  sport: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  boxing: 'gym_boxing_members',
  kickboxing: 'gym_kickboxing_members',
  karate: 'gym_karate_members',
  gymnastics: 'gym_gymnastics_members',
};

export type SportKey = keyof typeof STORAGE_KEYS;

export async function getMembers(sport: SportKey): Promise<Member[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS[sport]);
    if (!data) return [];
    return JSON.parse(data) as Member[];
  } catch {
    return [];
  }
}

export async function saveMembers(sport: SportKey, members: Member[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS[sport], JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members:', e);
  }
}

export async function addMember(sport: SportKey, member: Omit<Member, 'id' | 'sport' | 'createdAt'>): Promise<Member> {
  const members = await getMembers(sport);
  const newMember: Member = {
    ...member,
    id: Date.now().toString(),
    sport,
    createdAt: new Date().toISOString(),
  };
  members.unshift(newMember);
  await saveMembers(sport, members);
  return newMember;
}

export async function deleteMember(sport: SportKey, id: string): Promise<void> {
  const members = await getMembers(sport);
  const updated = members.filter((m) => m.id !== id);
  await saveMembers(sport, updated);
}

export async function getAllMembers(): Promise<{ [key in SportKey]: Member[] }> {
  const [boxing, kickboxing, karate, gymnastics] = await Promise.all([
    getMembers('boxing'),
    getMembers('kickboxing'),
    getMembers('karate'),
    getMembers('gymnastics'),
  ]);
  return { boxing, kickboxing, karate, gymnastics };
}

export function getMemberStatus(endDate: string): 'active' | 'expiring' | 'expired' {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring';
  return 'active';
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
