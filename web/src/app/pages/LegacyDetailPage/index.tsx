import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const LegacyDetailPage = () => {
  const { legacyId } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!legacyId) {
      navigate('/');
      return;
    }
    const redirectToNewURL = async () => {
      const response = await fetch('/data/legacyIdDictionary.json');
      const data = await response.json();
      const newDetails = data[legacyId];

      if (newDetails) {
        navigate(`/${newDetails.type}/${newDetails.newId}`);
      } else {
        navigate('/');
      }
    };
    redirectToNewURL();
  }, [legacyId, navigate]);

  return null;
};
