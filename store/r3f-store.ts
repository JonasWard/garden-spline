import { create } from 'zustand';

type R3FStore = {
  enableOrbitConrol: boolean;
};

export const useR3FStore = create<R3FStore>((set) => ({
  enableOrbitConrol: true,
  setEnableOrbitConrol: (enableOrbitConrol: boolean) => set({ enableOrbitConrol })
}));
