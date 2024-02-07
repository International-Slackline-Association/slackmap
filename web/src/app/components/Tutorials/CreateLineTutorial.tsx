import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { useAppLocalStorage } from 'utils/hooks/useAppLocalStorage';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';

import { TutorialDialog } from './TutorialDialog';

const Page = (props: { img: string; title: string; children: React.ReactNode }) => {
  return (
    <Stack
      spacing={0}
      sx={{
        height: { xs: '66vh', lg: '75vh' },
        overflowY: 'scroll',
      }}
    >
      <img
        src={props.img}
        style={{
          maxWidth: '100%',
          objectFit: 'contain',
        }}
        alt={''}
      />
      <Stack spacing={2} sx={{ px: 4, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={'bold'}>
          {props.title}
        </Typography>
        {props.children}
      </Stack>
    </Stack>
  );
};

export const CreateLineTutorial = () => {
  const { isDesktop } = useMediaQuery();

  const isSeen = useAppLocalStorage('tutorial.createLineSeen', false);

  if (isDesktop || isSeen.value) return null;

  const pages: JSX.Element[] = [
    <Page
      key={'create-line-tutorial-0'}
      img={'/images/tutorials/create-line-controls.png'}
      title={'Tip: Double Click'}
    >
      <Typography variant="subtitle2">
        In order to <b>finish drawing</b> the line, you need to <b>click twice</b> the last point.
      </Typography>
    </Page>,
  ];

  const onClose = () => {
    isSeen.set(true);
  };

  return <TutorialDialog pages={pages} onClose={onClose} closeText="Ok" />;
};
