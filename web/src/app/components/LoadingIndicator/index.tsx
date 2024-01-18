import { CircularProgress, Typography, styled } from '@mui/material';
import { Stack } from '@mui/system';

interface Props {
  loadingText?: string;
}
export const LoadingIndicator = styled((props: Props) => {
  return (
    <Stack
      spacing={1}
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        flex: 1,
        // ...props.sx,
      }}
    >
      <CircularProgress />
      <Typography variant="subtitle1" color="primary">
        {props.loadingText || 'Loading'}
      </Typography>
    </Stack>
  );
})();
