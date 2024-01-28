import React, { useState } from 'react';

import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Stack } from '@mui/system';

import { signInWithRedirect } from 'aws-amplify/auth';

export const useSignInDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const signInClicked = () => {
    signInWithRedirect();
  };

  const SignInDialog: React.FC = () => (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      maxWidth="sm"
      sx={{
        backdropFilter: 'blur(2px)',
      }}
    >
      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <img src="/images/isa-logo-wide.svg" alt="ISA Logo" width={'50%'} />
          <Typography variant="body2">Login to your ISA Account</Typography>
          <Typography variant="body2" fontSize={'0.8rem'}>
            If you don`t have an account, you can create one in a few seconds.
          </Typography>

          <Button
            variant="contained"
            startIcon={<img src="/images/isa-logo-no-text.svg" alt="ISA Logo" width={50} />}
            onClick={signInClicked}
            sx={{ alignSelf: 'center' }}
          >
            Sign In / Sign Up
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );

  const showSignInDialog = () => {
    setIsOpen(true);
  };

  return { SignInDialog, showSignInDialog };
};
