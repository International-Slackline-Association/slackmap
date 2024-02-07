import { PaletteOptions } from '@mui/material';

import { appColors } from './colors';

export const palette: PaletteOptions = {
  mode: 'light',
  text: {
    primary: appColors.primaryText,
  },
  primary: {
    main: appColors.slackmapBlue,
  },
  secondary: {
    main: appColors.slackmapGreen,
  },
};
