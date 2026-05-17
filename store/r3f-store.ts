import { create } from 'zustand';

type R3FStore = {
  enableOrbitConrol: boolean;
  setEnableOrbitConrol: (enableOrbitConrol: boolean) => void;
  showControlPoints: boolean;
  setShowControlPoints: (showControlPoints: boolean) => void;
  controlPointConstraint: 'x' | 'y' | 'z';
  setControlPointConstraint: (controlPointConstraint: 'x' | 'y' | 'z') => void;
};

export const useR3FStore = create<R3FStore>((set) => ({
  enableOrbitConrol: true,
  setEnableOrbitConrol: (enableOrbitConrol) => set({ enableOrbitConrol }),
  showControlPoints: false,
  setShowControlPoints: (showControlPoints) => set({ showControlPoints }),
  controlPointConstraint: 'z',
  setControlPointConstraint: (controlPointConstraint) => set({ controlPointConstraint })
}));
