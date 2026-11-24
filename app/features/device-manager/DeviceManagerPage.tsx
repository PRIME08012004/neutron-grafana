import React from 'react';

import { PageLayoutType } from '@grafana/data';
import { Page } from 'app/core/components/Page/Page';

export default function DeviceManagerPage() {
  return (
    <Page navId="device-manager" layout={PageLayoutType.Custom}>
      <iframe
        title="Device Manager"
        src="http://192.168.1.250:2999"
        style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
      />
    </Page>
  );
}
