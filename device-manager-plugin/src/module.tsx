import React from 'react';

import { AppPlugin, AppRootProps } from '@grafana/data';

function App(_props: AppRootProps) {
  return (
    <iframe
      src="/dm/"
      title="Device Manager"
      style={{ width: '100%', height: 'calc(100vh - 80px)', border: 0 }}
    />
  );
}

export const plugin = new AppPlugin().setRootPage(App);
