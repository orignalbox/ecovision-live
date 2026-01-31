
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface LogEntry {
    id: string;
    name: string;
    co2: number;
    water: number;
    date: string;
    savings?: string; // e.g. "400L Water" if swapped
}

interface AppState {
    logs: LogEntry[];
    totalCo2: number;
    totalWater: number;
    totalScans: number;
    scanStreak: number;
    lastScanDate: string | null;
    addLog: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            logs: [],
            totalCo2: 0,
            totalWater: 0,
            totalScans: 0,
            scanStreak: 0,
            lastScanDate: null,
            addLog: (entry) => set((state) => {
                const now = new Date();
                const today = now.toDateString();
                const lastScan = state.lastScanDate ? new Date(state.lastScanDate).toDateString() : null;

                let newStreak = state.scanStreak;

                if (lastScan !== today) {
                    // Check if consecutive day
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastScan === yesterday.toDateString()) {
                        newStreak += 1;
                    } else if (lastScan === null) {
                        newStreak = 1;
                    } else {
                        // Broke streak (unless it was already today, handled by if check)
                        newStreak = 1;
                    }
                }

                return {
                    logs: [{ ...entry, id: uuidv4(), date: now.toISOString() }, ...state.logs],
                    totalCo2: state.totalCo2 + entry.co2,
                    totalWater: state.totalWater + entry.water,
                    totalScans: state.totalScans + 1,
                    scanStreak: newStreak,
                    lastScanDate: now.toISOString()
                };
            }),
            reset: () => set({
                logs: [],
                totalCo2: 0,
                totalWater: 0,
                totalScans: 0,
                scanStreak: 0,
                lastScanDate: null
            }),
        }),
        {
            name: 'ecovision-storage',
        }
    )
);
