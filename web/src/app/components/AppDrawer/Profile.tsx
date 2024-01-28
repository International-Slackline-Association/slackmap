import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InputIcon from '@mui/icons-material/Input';
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { accountApi } from 'app/api/account-api';
import { appActions } from 'app/slices/app';
import { selectIsUserSignedIn } from 'app/slices/app/selectors';
import { AuthState } from 'app/slices/app/types';
import { signInWithRedirect } from 'aws-amplify/auth';

import { LoadingIndicator } from '../LoadingIndicator';

export const Profile = () => {
  const isSignedIn = useSelector(selectIsUserSignedIn);

  const { data: userInfo, isFetching } = accountApi.useGetBasicDetailsQuery(undefined, {
    skip: !isSignedIn,
  });

  const dispatch = useDispatch();

  const name: string = userInfo?.name ?? '';
  const surname: string = userInfo?.surname || '';

  const signInClicked = () => {
    dispatch(appActions.updateAuthState(AuthState.SigningIn));
    signInWithRedirect();
  };

  const signOutClicked = () => {
    dispatch(appActions.updateAuthState(AuthState.SigningOut));
  };

  return !isSignedIn ? (
    <Box>
      <Button
        fullWidth
        variant="contained"
        startIcon={<img src="/images/isa-logo-no-text.svg" width={30} />}
        onClick={signInClicked}
      >
        Sign In / Sign Up
      </Button>
    </Box>
  ) : (
    <Stack direction={'row'} spacing={2}>
      {isFetching ? (
        <LoadingIndicator />
      ) : (
        <>
          <Avatar
            sx={{
              width: '48px',
              height: '48px',
              borderStyle: 'solid',
              borderColor: (t) => t.palette.primary.contrastText,
            }}
            alt="Profile Picture"
            src={userInfo?.profilePictureUrl || ''}
          >
            {name.substring(0, 1)} {surname?.substring(0, 1)}
          </Avatar>
          <Grid spacing={0} container sx={{}}>
            <Grid item xs={12}>
              <Typography variant="body1">
                {name} {surname}
              </Typography>
            </Grid>
            <Grid item>
              <Tooltip title={'Go to ISA Profile'}>
                <IconButton
                  color="inherit"
                  href={'https://account.slacklineinternational.org'}
                  target="_blank"
                  rel="noopener"
                  component={Link}
                  size="small"
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title={'Logout'}>
                <IconButton color="inherit" size="small" onClick={signOutClicked}>
                  <InputIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
};
