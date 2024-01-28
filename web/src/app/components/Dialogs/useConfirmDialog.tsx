import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps | null>(null);

  const ConfirmDialog: React.FC = () => (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
        dialogProps?.onCancel?.();
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
            dialogProps?.onCancel?.();
          }}
        >
          {dialogProps?.cancelText || 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setIsOpen(false);
            dialogProps?.onConfirm();
          }}
        >
          {dialogProps?.confirmText || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const showConfirmDialog = (props: ConfirmDialogProps) => {
    setDialogProps(props);
    setIsOpen(true);
  };

  return { ConfirmDialog, showConfirmDialog };
};
