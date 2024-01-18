import React from 'react';

import { Box, Divider, Stack, Typography, styled } from '@mui/material';

interface Props {
  icon: React.ReactNode;
  header: string | React.ReactNode;
  subHeader?: string | React.ReactNode;
  children?: React.ReactNode;
  noDivider?: boolean;
}

export const FeatureDetailFieldLayout = styled((props: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box sx={{ width: '8%', ml: 1, mr: 1 }}>{props.icon}</Box>
      <Stack spacing={1} sx={{ flex: 1 }}>
        {typeof props.header === 'string' ? (
          <Typography variant="body2Bold"> {props.header} </Typography>
        ) : (
          props.header
        )}
        {typeof props.subHeader === 'string' ? (
          <Typography variant="body2" fontSize={'0.66rem'}>
            {props.subHeader}
          </Typography>
        ) : (
          <Box
            sx={{
              '.MuiTypography-root': {
                fontSize: '0.66rem',
              },
            }}
          >
            {props.subHeader}
          </Box>
        )}

        {props.children}
        {!props.noDivider && <Divider />}
      </Stack>
    </Box>
  );
})();
