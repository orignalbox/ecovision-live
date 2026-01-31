
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
    addLog: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            logs: [],
            totalCo2: 0,
            totalWater: 0,
            addLog: (entry) => set((state) => ({
                logs: [{ ...entry, id: uuidv4(), date: new Date().toISOString() }, ...state.logs],
                totalCo2: state.totalCo2 + entry.co2,
                totalWater: state.totalWater + entry.water,
            })),
            reset: () => set({ logs: [], totalCo2: 0, totalWater: 0 }),
        }),
        {
            name: 'ecovision-storage',
        }
    )
);
