import { Box } from '@mui/system';

export const MapLogo = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: '5vh',
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        display: { xs: 'flex', lg: 'none' },
        pointerEvents: 'none',
      }}
    >
      <img
        style={{ maxWidth: '100%', maxHeight: '100%', opacity: 0.7 }}
        src={'/images/slackmapLogo.png'}
        alt=""
      />
    </Box>
  );
};
