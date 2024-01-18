import { useSelector } from 'react-redux';

import WarningIcon from '@mui/icons-material/Warning';
import { Stack, Typography } from '@mui/material';

import { selectIsUserSignedIn } from 'app/slices/app/selectors';
import { useConfirm } from 'material-ui-confirm';

export const useSignInAlert = () => {
  const isUserSignedIn = useSelector(selectIsUserSignedIn);
  const confirm = useConfirm();

  const verifyUserSignIn = async () => {
    if (isUserSignedIn) {
      return true;
    } else {
      await confirm({
        title: (
          <Stack direction={'row'} spacing={1} sx={{ alignItems: 'center' }}>
            <WarningIcon
              sx={{
                color: (t) => t.palette.warning.main,
              }}
            />
            <Typography variant="body2Bold">Sign In Required</Typography>
          </Stack>
        ),

        content: (
          <Typography variant="body2">
            This action requires an authenticated user. Please, use the ISA Account sign in on the
            homepage.
          </Typography>
        ),
        cancellationButtonProps: {
          sx: { display: 'none' },
        },
        dialogProps: {
          PaperProps: {
            sx: {
              color: 'inherit',
              // border: '1px solid',
              borderRadius: '4px',
              boxShadow: (t) => t.shadows[5],
              borderColor: (t) => t.palette.error.main,
            },
          },
        },
      })
        .then(() => {
          /* ... */
        })
        .catch(() => {
          /* ... */
        });
    }
  };
  return verifyUserSignIn;
};
