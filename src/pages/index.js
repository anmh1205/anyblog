import React from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Home() {
  const docsUrl = useBaseUrl('/docs/ivts-training/how-to-start/');
  return <Redirect to={docsUrl} />;
}
