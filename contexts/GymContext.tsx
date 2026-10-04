// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Member,
  SportKey,
  getMembers,
  addMember,
  deleteMember,
  getMemberStatus,
} from '@/services/storage';

interface SportStats {
  total: number;
  expiringSoon: number;
  expired: number;
}

interface GymContextType {
  members: { [key in SportKey]: Member[] };
  loading: boolean;
  refreshSport: (sport: SportKey) => Promise<void>;
  refreshAll: () => Promise<void>;
  addMemberToSport: (sport: SportKey, data: Omit<Member, 'id' | 'sport' | 'createdAt'>) => Promise<void>;
  removeMember: (sport: SportKey, id: string) => Promise<void>;
  getStats: (sport: SportKey) => SportStats;
}

export const GymContext = createContext<GymContextType | undefined>(undefined);

export function GymProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<{ [key in SportKey]: Member[] }>({
    boxing: [],
    kickboxing: [],
    karate: [],
    gymnastics: [],
  });
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [boxing, kickboxing, karate, gymnastics] = await Promise.all([
      getMembers('boxing'),
      getMembers('kickboxing'),
      getMembers('karate'),
      getMembers('gymnastics'),
    ]);
    setMembers({ boxing, kickboxing, karate, gymnastics });
    setLoading(false);
  }, []);

  const refreshSport = useCallback(async (sport: SportKey) => {
    const updated = await getMembers(sport);
    setMembers((prev) => ({ ...prev, [sport]: updated }));
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addMemberToSport = useCallback(
    async (sport: SportKey, data: Omit<Member, 'id' | 'sport' | 'createdAt'>) => {
      await addMember(sport, data);
      await refreshSport(sport);
    },
    [refreshSport]
  );

  const removeMember = useCallback(
    async (sport: SportKey, id: string) => {
      await deleteMember(sport, id);
      await refreshSport(sport);
    },
    [refreshSport]
  );

  const getStats = useCallback(
    (sport: SportKey): SportStats => {
      const list = members[sport];
      const total = list.length;
      const expiringSoon = list.filter((m) => getMemberStatus(m.endDate) === 'expiring').length;
      const expired = list.filter((m) => getMemberStatus(m.endDate) === 'expired').length;
      return { total, expiringSoon, expired };
    },
    [members]
  );

  return (
    <GymContext.Provider
      value={{ members, loading, refreshSport, refreshAll, addMemberToSport, removeMember, getStats }}
    >
      {children}
    </GymContext.Provider>
  );
}
