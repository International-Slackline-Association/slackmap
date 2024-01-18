import * as React from 'react';
import { useWindowSize } from 'react-use';

import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import { DrawerPanel } from './DrawerPanel';

const drawerWidth = 240;

interface Props {
  children: React.ReactNode;
}

export const AppDrawer = (props: Props) => {
  const { children } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const size = useWindowSize();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: 'absolute',
          display: { lg: 'none' },
          margin: 2,
          zIndex: 99,
          color: (t) => t.palette.primary.contrastText,
          backgroundColor: (t) => t.palette.primary.main,
        }}
      >
        <MenuIcon />
      </IconButton>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: (t) => t.palette.primary.dark,
              color: (t) => t.palette.primary.contrastText,
            },
          }}
        >
          <DrawerPanel />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: (t) => t.palette.primary.dark,
              color: (t) => t.palette.primary.contrastText,
            },
          }}
          open
        >
          <DrawerPanel />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          //   width: { lg: `calc(100% - ${drawerWidth}px)` },
          height: size.height,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
