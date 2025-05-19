import { create } from "zustand";

const useUIStore = create((set) => ({
  drawerOpen: false,
  setDrawerOpen: () => set({ drawerOpen: true }),
  setDrawerClose: () => set({ drawerOpen: false }),

  appPage: "chat",
  setAppPage: (page) => set({ appPage: page }),

  appTheme: "light",
  setAppTheme: (theme) => set({ appTheme: theme }),
}));

export default useUIStore;
