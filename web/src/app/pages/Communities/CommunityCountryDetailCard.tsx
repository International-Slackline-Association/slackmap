import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import CloseIcon from '@mui/icons-material/Close';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import InfoIcon from '@mui/icons-material/Info';
import LinkIcon from '@mui/icons-material/Link';
import { Divider, Link, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import { communityApi } from 'app/api/community-api';
import { FeatureDetailFieldLayout } from 'app/components/FeatureDetailFields/DetailFieldLayout';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { appColors } from 'styles/theme/colors';

import { GroupsManifestText } from './GroupsManifestText';

interface Props {
  countryCode: string;
}

export const CommunityCountryDetailCard = (props: Props) => {
  const navigate = useNavigate();

  const { data: countryDetails, isFetching } = communityApi.useGetCommunityCountryDetailsQuery(
    props.countryCode,
  );

  const onCloseClicked = () => {
    navigate('/communities');
  };

  const slacklineGroups =
    countryDetails?.slacklineGroups.filter(
      (g) => !countryDetails.isaMembers.find((m) => m.groupId === g.id),
    ) ?? [];

  const MemberSubLink = (props: { icon: any; text: string; url?: string; groupId?: string }) => {
    if (!props.url && !props.groupId) return null;
    return (
      <Stack
        direction={'row'}
        spacing={1}
        sx={{
          '.MuiTypography-root': {
            fontSize: '0.66rem',
          },
        }}
      >
        <props.icon color="primary" sx={{ fontSize: '1rem' }} />
        {props.url && (
          <Link href={props.url} target="_blank" rel="noopener">
            <Typography>{props.text}</Typography>
          </Link>
        )}
        {props.groupId && (
          <NavLink to={`/communities/group/${props.groupId}`}>
            <Typography>Details</Typography>
          </NavLink>
        )}
      </Stack>
    );
  };

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
      {isFetching || !countryDetails ? (
        <LoadingIndicator />
      ) : (
        <>
          <CardHeader
            avatar={
              <Avatar
                src={`https://hatscripts.github.io/circle-flags/flags/${props.countryCode.toLowerCase()}.svg`}
              >
                C
              </Avatar>
            }
            action={
              <>
                <IconButton onClick={onCloseClicked}>
                  <CloseIcon />
                </IconButton>
              </>
            }
            title={countryDetails.name ?? 'Unknown'}
            titleTypographyProps={{
              variant: 'h6',
            }}
          />
          <Divider />
          <CardContent component={Stack} spacing={2}>
            <FeatureDetailFieldLayout
              icon={<Diversity3Icon />}
              header={'ISA Members & Partners'}
              subHeader={
                <Typography variant="body2">
                  List of officially recognized slackline organizations by ISA.{' '}
                  <Link
                    href="https://www.slacklineinternational.org/members-partners/"
                    target={'_blank'}
                  >
                    Read more...
                  </Link>
                </Typography>
              }
            >
              {countryDetails.isaMembers.length > 0 ? (
                countryDetails.isaMembers.map((member, index) => (
                  <Stack key={index} direction={'row'} spacing={1} alignItems="center">
                    <Avatar
                      src={member.profilePictureUrl}
                      sx={{
                        bgcolor: appColors.isaMemberGroupColor,
                      }}
                    >
                      {member.name[0]}
                    </Avatar>
                    <Stack alignItems="flex-start" justifyContent="center">
                      <Typography variant="body2">{member.name} </Typography>
                      <Stack direction={'row'} spacing={1}>
                        <MemberSubLink
                          icon={EmailIcon}
                          text={'Email'}
                          url={`mailto:${member.email}`}
                        />
                        <MemberSubLink icon={InfoIcon} text={'Details'} groupId={member.groupId} />
                        <MemberSubLink icon={LinkIcon} text={'Link'} url={member.infoUrl} />
                      </Stack>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography variant="body2">
                  There are no registered members in this country.
                </Typography>
              )}
            </FeatureDetailFieldLayout>
            <FeatureDetailFieldLayout
              icon={<GroupIcon />}
              header={'Slackline Groups'}
              subHeader={<GroupsManifestText type="communityCountry" />}
            >
              {slacklineGroups.length > 0 ? (
                <Stack
                  direction={'row'}
                  spacing={1}
                  sx={{
                    justifyContent: 'space-evenly',
                    flexWrap: 'wrap',
                  }}
                >
                  {slacklineGroups.map((group, index) => (
                    <>
                      <NavLink to={`/communities/group/${group.id}`}>
                        <Typography key={index} variant="body2">
                          - {group.name}
                        </Typography>
                      </NavLink>
                    </>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">
                  There are no slackline groups in this country.
                </Typography>
              )}
            </FeatureDetailFieldLayout>
          </CardContent>
        </>
      )}
    </Card>
  );
};
