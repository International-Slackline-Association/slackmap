import { Theme, createTheme, responsiveFontSizes } from '@mui/material';

import { palette } from './palette';

export const theme: Theme = responsiveFontSizes(
  createTheme({
    palette: palette,
    components: {
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            body2Bold: 'p',
          },
        },
      },
    },
    typography: {
      fontFamily: 'Lato',
      body2Bold: {
        fontWeight: 'bold',
        letterSpacing: -0.08,
      },
      body1: {
        letterSpacing: 0.04,
      },
      body2: {
        letterSpacing: 0.04,
      },
    },
  }),
);
