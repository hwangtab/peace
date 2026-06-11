import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const useHydrated = (): boolean =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
