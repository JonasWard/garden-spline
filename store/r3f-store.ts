import { create } from 'zustand';

type R3FStore = {
  enableOrbitConrol: boolean;
  setEnableOrbitConrol: (enableOrbitConrol: boolean) => void;
  controlPointConstraint: 'x' | 'y' | 'z';
  setControlPointConstraint: (controlPointConstraint: 'x' | 'y' | 'z') => void;
};

export const useR3FStore = create<R3FStore>((set) => ({
  enableOrbitConrol: true,
  setEnableOrbitConrol: (enableOrbitConrol) => set({ enableOrbitConrol }),
  controlPointConstraint: 'z',
  setControlPointConstraint: (controlPointConstraint) => set({ controlPointConstraint })
}));
