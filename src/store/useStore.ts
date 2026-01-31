
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

export interface DecisionLog {
    id: string;
    date: string;
    originalItem: string;
    chosenItem: string;
    savedCo2: number;
    savedWater: number;
}

interface AppState {
    logs: LogEntry[];
    decisions: DecisionLog[];
    totalCo2: number; // Consumption footprint
    totalWater: number;
    savedCo2: number; // Active savings from decisions
    savedWater: number;
    totalScans: number;
    scanStreak: number;
    lastScanDate: string | null;
    addLog: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
    addDecision: (original: string, chosen: string, co2Delta: number, waterDelta: number) => void;
    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            logs: [],
            decisions: [],
            totalCo2: 0,
            totalWater: 0,
            savedCo2: 0,
            savedWater: 0,
            totalScans: 0,
            scanStreak: 0,
            lastScanDate: null,
            addLog: (entry) => set((state) => {
                const now = new Date();
                const today = now.toDateString();
                const lastScan = state.lastScanDate ? new Date(state.lastScanDate).toDateString() : null;

                let newStreak = state.scanStreak;

                if (lastScan !== today) {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastScan === yesterday.toDateString()) {
                        newStreak += 1;
                    } else if (lastScan === null) {
                        newStreak = 1;
                    } else {
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
            addDecision: (original, chosen, co2Delta, waterDelta) => set((state) => ({
                decisions: [{
                    id: uuidv4(),
                    date: new Date().toISOString(),
                    originalItem: original,
                    chosenItem: chosen,
                    savedCo2: co2Delta,
                    savedWater: waterDelta
                }, ...state.decisions],
                savedCo2: state.savedCo2 + co2Delta,
                savedWater: state.savedWater + waterDelta
            })),
            reset: () => set({
                logs: [],
                decisions: [],
                totalCo2: 0,
                totalWater: 0,
                savedCo2: 0,
                savedWater: 0,
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
