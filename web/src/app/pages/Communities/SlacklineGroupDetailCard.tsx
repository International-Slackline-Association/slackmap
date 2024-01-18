import { useNavigate } from 'react-router-dom';

import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Divider, Link } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import { communityApi } from 'app/api/community-api';
import { slacklineGroupEditGoogleFormUrl } from 'app/api/constants';
import { FeatureDetailFieldLayout } from 'app/components/FeatureDetailFields/DetailFieldLayout';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { format } from 'date-fns';
import { appColors } from 'styles/theme/colors';

import { GroupsManifestText } from './GroupsManifestText';

interface Props {
  groupId: string;
}

export const SlacklineGroupDetailCard = (props: Props) => {
  const navigate = useNavigate();

  const { data: groupDetails, isFetching } = communityApi.useGetSlacklineGroupDetailsQuery(
    props.groupId,
  );

  const onCloseClicked = () => {
    navigate('/communities');
  };

  const InfoField = (props: { icon: any; url?: string; text?: string }) => {
    if (!props.url || !props.text) {
      return null;
    }
    return (
      <Stack direction={'row'} spacing={1} alignItems="center">
        <props.icon color="primary" />
        <Link href={props.url} target="_blank" rel="noopener">
          {props.text}
        </Link>
      </Stack>
    );
  };

  const groupInfo = groupDetails?.info;

  return (
    <Card
      sx={{
        boxShadow: 'none',
        border: 'none',
        height: '100%',
        width: '100%',
        overflow: 'scroll',
      }}
    >
      {isFetching || !groupInfo ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                sx={{
                  bgcolor: appColors.slacklineGroupColor,
                }}
              >
                G
              </Avatar>
            }
            action={
              <>
                <IconButton onClick={onCloseClicked}>
                  <CloseIcon />
                </IconButton>
              </>
            }
            title={groupInfo.name ?? 'Unknown'}
            titleTypographyProps={{
              variant: 'h6',
            }}
            subheader={`Last updated: ${format(
              new Date(groupInfo.updatedDateTime || groupInfo.createdDateTime),
              'dd MMM yyy',
            )}`}
          />
          <Divider />
          <CardContent component={Stack} spacing={2}>
            <FeatureDetailFieldLayout
              icon={<CallIcon />}
              header={'Contact'}
              subHeader={<GroupsManifestText type="groupDetail" />}
            >
              <Stack spacing={1}>
                <InfoField
                  icon={EmailIcon}
                  text={groupInfo.email}
                  url={`mailto:${groupInfo.email}`}
                />
                <InfoField icon={FacebookIcon} text="Facebook Page" url={groupInfo.facebookPage} />
                <InfoField
                  icon={FacebookIcon}
                  text="Facebook Group"
                  url={groupInfo.facebookGroup}
                />
                <InfoField icon={TelegramIcon} text={'Telegram Group'} url={groupInfo.telegram} />
                <InfoField icon={InstagramIcon} text={'Instagram Page'} url={groupInfo.instagram} />
                <InfoField icon={WhatsAppIcon} text={'WhatsApp Group'} url={groupInfo.whatsapp} />
                <InfoField icon={LinkIcon} text={'Web Page'} url={groupInfo.webpage} />
              </Stack>
              <Button
                variant="contained"
                color="error"
                href={slacklineGroupEditGoogleFormUrl + encodeURIComponent(groupInfo.name)}
                target="_blank"
                rel="noreferrer"
              >
                Edit on Google Form
              </Button>
            </FeatureDetailFieldLayout>
          </CardContent>
        </>
      )}
    </Card>
  );
};
