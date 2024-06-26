import React, { useState } from 'react';

import { TextField } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';

interface ConfirmDialogProps {
  title: string;
  description: string;
  textBoxLabel: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (text: string) => void;
  onCancel?: () => void;
}

export const useTextBoxDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps | null>(null);

  const TextBoxDialog: React.FC = () => {
    const [text, setText] = useState('');

    return (
      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          dialogProps?.onCancel?.();
        }}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            dialogProps?.onConfirm(formJson.text);
            setIsOpen(false);
          },
        }}
        fullWidth
        sx={{
          backdropFilter: 'blur(2px)',
        }}
      >
        <DialogTitle> {dialogProps?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>{dialogProps?.description}</DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              name="text"
              label={dialogProps?.textBoxLabel}
              type="text"
              variant="outlined"
              fullWidth
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Stack>
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
          <Button type="submit" variant="contained" disabled={text.length <= 5}>
            {dialogProps?.confirmText || 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const showTextBoxDialog = (props: ConfirmDialogProps) => {
    setDialogProps(props);
    setIsOpen(true);
  };

  return { TextBoxDialog, showTextBoxDialog };
};
