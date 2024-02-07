import { Link } from 'react-router-dom';

import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import PentagonIcon from '@mui/icons-material/Pentagon';
import { Avatar, Button, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';

import { SlacklineFeatureIcon } from 'app/components/Icons/SlacklineFeatureIcon';
import { appColors } from 'styles/theme/colors';
import { useAppLocalStorage } from 'utils/hooks/useAppLocalStorage';
import { useMediaQuery } from 'utils/hooks/useMediaQuery';

import { TutorialDialog } from './TutorialDialog';

const AnnouncementPage = (props: { img: string; title: string; children: React.ReactNode }) => {
  return (
    <Stack
      spacing={1}
      sx={{
        height: { xs: '66vh', lg: '75vh' },
        overflowY: 'scroll',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="body2Bold"
        sx={{
          backgroundColor: (t) => t.palette.secondary.light,
          color: (t) => t.palette.primary.contrastText,
          p: 1,
        }}
      >
        New on SlackMap 🎉
      </Typography>
      <Stack
        spacing={4}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          px: 4,
        }}
      >
        <Typography variant="h6" fontWeight={'bold'}>
          {props.title}
        </Typography>
        <img
          src={props.img}
          style={{
            maxWidth: '100%',
            objectFit: 'contain',
          }}
          loading="eager"
        />
        {props.children}
      </Stack>
    </Stack>
  );
};

const announcementPages = [
  <AnnouncementPage
    key={'announcement-0'}
    img={'/images/tutorials/anchor-images.png'}
    title={'Anchor Photos'}
  >
    <Typography variant="subtitle2">
      You can upload photos of the anchors to help other slackliners to <b>find the anchors</b>,{' '}
      <b>see the necessary gears</b>, and <b>show the safe rig</b>.
    </Typography>

    <Button component={Link} to={`line/gc8u-6O`} variant="outlined" onClick={close}>
      See Example
    </Button>
  </AnnouncementPage>,
];

const Item = (props: { color: string; label: string }) => {
  const { isDesktop } = useMediaQuery();
  return (
    <Stack spacing={0.5} direction={'row'} alignItems={'center'}>
      <Box
        sx={{
          width: isDesktop ? '10px' : '5px',
          height: isDesktop ? '10px' : '5px',
          bgcolor: props.color,
          borderRadius: '50%',
        }}
      />
      <Typography variant={'caption'} fontSize={isDesktop ? 'auto' : '0.6rem'}>
        {props.label}
      </Typography>
    </Stack>
  );
};

const TutorialPage = (props: { img: string; title: string; children: React.ReactNode }) => {
  return (
    <Stack
      spacing={4}
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

export const welcomeTutorialPages = [
  <TutorialPage
    key={'tutorial-0'}
    img={'/images/tutorials/map-features.png'}
    title={'Try the Interactable Map'}
  >
    <Stack spacing={1} direction={'row'} alignItems={'center'}>
      <Item color={appColors.lineStrokeColor} label={'Slacklines'} />
      <Item color={appColors.spotFillColor} label={'Spots'} />
      <Item color={appColors.guideFeaturesColor} label={'Access Guides'} />
      <Item color={appColors.countryColor} label={'Countries'} />
    </Stack>
    <Typography variant="subtitle2">
      You can click on any of these features to see more information about them. <br />
    </Typography>
    <Typography variant="caption" fontStyle={'italic'}>
      Hint: Click on the country flags to filter the features and see the activities within the
      country.
    </Typography>
  </TutorialPage>,
  <TutorialPage
    key={'tutorial-1'}
    img={'/images/tutorials/feature-types.png'}
    title={'Add Your Features'}
  >
    <Stack spacing={2} direction={'row'} alignItems={'center'}>
      <Avatar sx={{ bgcolor: appColors.lineStrokeColor }}>
        <SlacklineFeatureIcon />
      </Avatar>
      <Avatar sx={{ bgcolor: appColors.spotFillColor }}>
        <PentagonIcon />
      </Avatar>
      <Avatar sx={{ bgcolor: appColors.guideFeaturesColor }}>
        <FollowTheSignsIcon />
      </Avatar>
    </Stack>
    <Typography variant="subtitle2">
      <b>- Lines</b> are the slacklines on the map. <br /> <br />
      <b>- Spots</b> are the areas that are slacklining zones. <br /> <br />
      <b>- Access Guides</b> are the visual helpers, like access trails, camping spot, parking lots,
      etc.
    </Typography>
  </TutorialPage>,
  <TutorialPage
    key={'tutorial-2'}
    img={'/images/tutorials/map-settings.png'}
    title={'Change Settings'}
  >
    <Typography variant="subtitle2">
      You can change the map style, show/hide features, and filter the slacklines by their types
      from the map settings.
    </Typography>
  </TutorialPage>,
];

export const WelcomeTutorial = () => {
  const isWelcomeSeen = useAppLocalStorage('tutorial.welcomeSeen', false);
  const lastSeenAnnouncementIndex = useAppLocalStorage('announcements.lastSeenIndex', -1);

  const pages: JSX.Element[] = [];

  if (lastSeenAnnouncementIndex.value < announcementPages.length - 1) {
    pages.push(...announcementPages.slice(lastSeenAnnouncementIndex.value + 1));
  }
  if (!isWelcomeSeen.value) {
    pages.push(...welcomeTutorialPages);
  }

  const onClose = () => {
    isWelcomeSeen.set(true);
    lastSeenAnnouncementIndex.set(announcementPages.length - 1);
  };

  if (pages.length === 0) return null;

  return <TutorialDialog pages={pages} onClose={onClose} />;
};
