import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import PentagonIcon from '@mui/icons-material/Pentagon';
import { SpeedDial, SpeedDialAction } from '@mui/material';

import { useSignInDialog } from 'app/components/Dialogs/useSignInDialog';
import { SlacklineFeatureIcon } from 'app/components/Icons/SlacklineFeatureIcon';
import { mapUrlSearchParams } from 'app/components/Maps/mapUtils';
import { selectIsUserSignedIn, selectLastMapLocation } from 'app/slices/app/selectors';

export function CreateFeatureSpeedDial() {
  const navigate = useNavigate();

  const lastMapLocation = useSelector(selectLastMapLocation);
  const isUserSignedIn = useSelector(selectIsUserSignedIn);

  const { SignInDialog, showSignInDialog } = useSignInDialog();

  const getSearchParams = () => {
    if (!lastMapLocation) {
      return undefined;
    }

    return `map=${mapUrlSearchParams.stringify(
      lastMapLocation.longitude,
      lastMapLocation.latitude,
      lastMapLocation.zoom,
    )}`;
  };

  const checkUserSignIn = async () => {
    if (!isUserSignedIn) {
      showSignInDialog();
      return false;
    }
    return true;
  };

  const onAddSpotClick = async () => {
    const signedIn = await checkUserSignIn();
    if (signedIn) {
      navigate({ pathname: '/create/spot', search: getSearchParams() });
    }
  };

  const onAddLineClick = async () => {
    const signedIn = await checkUserSignIn();
    if (signedIn) {
      navigate({ pathname: '/create/line', search: getSearchParams() });
    }
  };

  const onAddGuideClick = async () => {
    const signedIn = await checkUserSignIn();
    if (signedIn) {
      navigate({ pathname: '/create/guide', search: getSearchParams() });
    }
  };

  return (
    <>
      <SignInDialog />
      <SpeedDial
        sx={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3,
        }}
        icon={<AddIcon />}
        ariaLabel={'speed dial'}
      >
        <SpeedDialAction
          icon={<SlacklineFeatureIcon />}
          tooltipTitle={'Add a new line'}
          onClick={onAddLineClick}
          sx={{
            color: (t) => t.palette.primary.main,
          }}
        />
        <SpeedDialAction
          icon={<PentagonIcon />}
          tooltipTitle={'Add a new spot'}
          onClick={onAddSpotClick}
          sx={{
            color: (t) => t.palette.primary.main,
          }}
        />
        <SpeedDialAction
          icon={<FollowTheSignsIcon />}
          tooltipTitle={'Add a new access guide'}
          onClick={onAddGuideClick}
          sx={{
            color: (t) => t.palette.primary.main,
          }}
        />
      </SpeedDial>
    </>
  );
}
