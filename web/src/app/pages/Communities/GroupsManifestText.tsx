import { Link, Typography } from '@mui/material';

import { slacklineGroupEditGoogleFormUrl, slacklineGroupsGithubUrl } from 'app/api/constants';

interface Props {
  type: 'communityCountry' | 'groupDetail' | 'createGroup';
}

export const GroupsManifestText = (props: Props) => {
  const GithubLink = (
    <Link href={slacklineGroupsGithubUrl} target={'_blank'}>
      Github
    </Link>
  );
  const GoogleFormLink = (
    <Link href={slacklineGroupEditGoogleFormUrl} target={'_blank'}>
      Google Form
    </Link>
  );

  if (props.type === 'communityCountry') {
    return (
      <Typography variant="body2">
        All groups informations are collectively managed by the community. We rely on you to keep
        the data up-to-date. You can view the data on {GithubLink}
      </Typography>
    );
  } else if (props.type === 'groupDetail') {
    return (
      <Typography variant="body2">
        The information about this group is managed by the community. You can view the full data on{' '}
        {GithubLink}. If you think the data is outdated, you can edit the directly on Github or
        suggest a modification via the Google Form below.
      </Typography>
    );
  } else if (props.type === 'createGroup') {
    return (
      <Typography variant="body2">
        Slackline groups are managed by the community. There are two ways to add a new group:
        <ul>
          <li>
            <b>Google Form:</b> Fill out the {GoogleFormLink}. It can take some time for admins to
            review and approve the request.
          </li>
          <li>
            <b>Github:</b> Create a pull request on {GithubLink}. Much faster than the Google Form
          </li>
        </ul>
        If you know how to use Github, we recommend the second option.
      </Typography>
    );
  }
  return null;
};
