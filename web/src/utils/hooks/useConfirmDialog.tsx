import { useConfirm } from 'material-ui-confirm';

interface Props {
  title?: string;
  content?: string;
}
export const useConfirmDialog = () => {
  const confirm = useConfirm();

  const verifyConfirm = async (props: Props) => {
    return confirm({
      title: props.title,
      content: props.content,
      dialogProps: {
        PaperProps: {
          sx: {
            color: 'inherit',
            border: '1px solid',
            borderColor: (t) => t.palette.error.main,
          },
        },
      },
    });
  };
  return verifyConfirm;
};
