import { create } from "zustand";

const useUIStore = create((set) => ({
  drawerOpen: false,
  setDrawerOpen: () => set({ drawerOpen: true }),
  setDrawerClose: () => set({ drawerOpen: false }),

  appPage: "chat",
  setAppPage: (page) => set({ appPage: page }),

  settingOpen: false,
  setSettingOpen: () => set({ settingOpen: true }),
  setSettingClose: () => set({ settingOpen: false }),

  appTheme: "system",
  setAppTheme: (theme) => set({ appTheme: theme }),
}));

export default useUIStore;
