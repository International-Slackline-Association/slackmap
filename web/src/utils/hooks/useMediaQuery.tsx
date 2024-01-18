import { useMediaQuery as query, useTheme } from '@mui/material';

export const useMediaQuery = () => {
  const theme = useTheme();
  const isDesktop = query(theme.breakpoints.up('lg'));
  return { isDesktop };
};
