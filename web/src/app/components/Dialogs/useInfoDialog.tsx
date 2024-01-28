import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
  title: string;
  description: string | React.ReactNode;
}

export const useInfoDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<Props | null>(null);

  const InfoDialog: React.FC = () => (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      sx={{
        backdropFilter: 'blur(2px)',
      }}
    >
      <DialogTitle> {dialogProps?.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogProps?.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );

  const showInfoDialog = (props: Props) => {
    setDialogProps(props);
    setIsOpen(true);
  };

  return { InfoDialog, showInfoDialog };
};
