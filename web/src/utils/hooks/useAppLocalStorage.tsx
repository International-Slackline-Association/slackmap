import { useLocalStorage } from 'react-use';

import { Get, Paths } from 'type-fest';

interface AppLocalStorage {
  tutorial: {
    welcomeSeen: boolean;
    createLineSeen: boolean;
  };
  announcements: {
    lastSeenIndex: number;
  };
  mapSettings: {
    mapStyle: 'default' | 'satellite' | 'outdoors' | 'streets';
  };
}

export const useAppLocalStorage = <
  Path extends Paths<AppLocalStorage>,
  ReturnValue = Get<AppLocalStorage, Path> | undefined,
  DefaultValue = Get<AppLocalStorage, Path>,
>(
  key: Path,
  initialValue?: DefaultValue,
) => {
  const [value, setValue] = useLocalStorage(`app.${key}`, initialValue);
  const set = (newValue: DefaultValue) => {
    setValue(newValue);
  };

  return {
    value: value as DefaultValue extends undefined ? ReturnValue : NonNullable<ReturnValue>,
    set,
  };
};
