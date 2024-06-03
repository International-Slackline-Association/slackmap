import React, { ReactNode, useEffect } from 'react';
import { NavLink, Link as RouterLink, useLocation } from 'react-router-dom';

import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import { Box, IconButton, Link, List, ListItem, Stack, Typography } from '@mui/material';

import { Footer } from './Footer';
import { Profile } from './Profile';

export const DrawerPanel = () => {
  const location = useLocation();

  const [selectedTab, setSelectedTab] = React.useState<'slacklineMap' | 'communityMap'>();

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    switch (pathParts[1]) {
      case '':
      case 'line':
      case 'spot':
      case 'guide':
      case 'country':
      case 'create':
        setSelectedTab('slacklineMap');
        break;
      case 'communities':
        setSelectedTab('communityMap');
        break;
      default:
        setSelectedTab(undefined);
    }
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 2,
      }}
    >
      <Stack spacing={2} alignItems={'strech'}>
        <Link component={RouterLink} to="/">
          <img
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            src={'/images/slackmapLogoWithText.png'}
            alt="Slackmap Logo"
          />
        </Link>
        <Profile />
        <List sx={{ flexGrow: 1 }}>
          {/* <SectionHeaderText title="Maps" /> */}
          <NavigationItem to="/" selected={selectedTab === 'slacklineMap'}>
            <PublicIcon />
            <Typography>Slackline Map</Typography>
          </NavigationItem>
          <NavigationItem to="/communities" selected={selectedTab === 'communityMap'}>
            <PeopleIcon />
            <Typography>Community Map</Typography>
          </NavigationItem>
          {/* <SectionHeaderText title="Utilities" /> */}
        </List>
      </Stack>
      <Box sx={{ mt: 'auto' }}>
        <Footer />
      </Box>
    </Box>
  );
};

// const SectionHeaderText = (props: { title: string }) => {
//   return (
//     <ListSubheader
//       component={'div'}
//       disableGutters
//       disableSticky
//       sx={{
//         bgcolor: 'transparent',
//         color: (t) => t.palette.primary.contrastText,
//       }}
//     >
//       {props.title}
//     </ListSubheader>
//   );
// };

const NavigationItem = (props: {
  to: string;
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
}) => {
  return (
    <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
      <IconButton
        color="inherit"
        to={props.to}
        component={NavLink}
        size="small"
        disabled={props.disabled}
        sx={{
          borderRadius: 1,
          justifyContent: 'flex-start',
          width: '100%',
          color: 'inherit',
          '& svg': {
            mr: 2,
          },
          backgroundColor: (t) => (props.selected ? t.palette.primary.main : 'none'),
        }}
      >
        {props.children}
      </IconButton>
    </ListItem>
  );
};
