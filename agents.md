AGENTS.md: Add "Device Manager" to the Grafana sidebar
Goal
Add a Device Manager entry to the Grafana 11.1.3 sidebar. Clicking it must open the Device Manager (a Python/Flask app on port 2999) inside Grafana's content area. The Grafana sidebar and header must stay visible, and the browser must not navigate to a different page.

Approach
Build a Grafana app plugin with one page that renders an iframe pointing at /dm/. Do not patch Grafana core. The Grafana install is a built distribution with no pkg/ source tree, so a plugin is the only supported route.

Plugin ID: neutron-devicemanager-app
Plugin name: Device Manager
Iframe target: /dm/ (same origin, served by the reverse proxy)
Scope and boundaries
You do:

Scaffold, implement, and build the plugin.
Install the built plugin into Grafana's plugins directory.
Make the small Flask-side changes listed below, only if the Flask repo is in your working scope.
You do NOT:

Edit, create, or reload any nginx configuration. The owner manages nginx and will paste the config themselves. Reference config is given at the bottom for the owner only.
Patch Grafana core source or binaries.
Sign the plugin, commit secrets, or change Grafana auth settings.
Restart production services without telling the owner first.
Tasks
1. Scaffold
npx @grafana/create-plugin@latest
Choose type app, org neutron, name devicemanager. Node 18 or newer is required. If the scaffold prompts for backend or extra features, say no.

2. src/plugin.json
Set the includes section to:

"includes": [
  {
    "type": "page",
    "name": "Device Manager",
    "path": "/a/neutron-devicemanager-app/main",
    "addToNav": true,
    "defaultNav": true
  }
],
"dependencies": { "grafanaDependency": ">=11.0.0", "plugins": [] }
Keep only this one page. Remove the template's example pages and nav entries.

3. Page component
The root page (usually src/components/App/App.tsx) must render only the iframe:

import React from 'react';
import { AppRootProps } from '@grafana/data';

export function App(props: AppRootProps) {
  return (
    <iframe
      src="/dm/"
      title="Device Manager"
      style={{ width: '100%', height: 'calc(100vh - 80px)', border: 0 }}
    />
  );
}
Confirm module.ts registers it with new AppPlugin().setRootPage(App). Remove unused template pages and routes.

4. Build and install
npm install && npm run build
Find the plugins directory (check paths.plugins in grafana.ini; common locations are /var/lib/grafana/plugins or <grafana-home>/data/plugins). Copy the build output:

cp -r dist <plugins-dir>/neutron-devicemanager-app
5. Grafana config (tell the owner; apply only if asked)
[plugins]
allow_loading_unsigned_plugins = neutron-devicemanager-app

[navigation.app_sections]
neutron-devicemanager-app = dashboards
After a Grafana restart, the plugin must be enabled under Administration → Plugins → Device Manager.

6. Flask-side requirements (Device Manager app on port 2999)
The app is served under the /dm/ prefix and framed by Grafana, so:

Send X-Frame-Options: SAMEORIGIN. Never DENY.
Respect the proxy prefix: wrap the app with ProxyFix(app.wsgi_app, x_prefix=1) from werkzeug.middleware.proxy_fix.
Make the frontend use relative URLs (for example api/license, not /api/license) so requests stay under /dm/ and don't land on Grafana's API.
Do not use target="_blank" or absolute redirects to /, which would break out of the iframe.
Keep the existing license activation flow and endpoints unchanged.
Acceptance checks
[ ] npm run build succeeds with no TypeScript errors
[ ] The plugin appears in Administration → Plugins and can be enabled
[ ] The Device Manager item appears in the sidebar
[ ] Clicking it shows the app inside Grafana, with the sidebar and header still visible and the URL staying under /a/neutron-devicemanager-app/main
[ ] Device Manager's API calls go to /dm/..., not to Grafana's /api/...
[ ] The browser console shows no framing, CSP, or mixed-content errors
If blocked
If the plugin does not load (unsigned, wrong directory, version mismatch), or the iframe is blocked, report the exact error and what you checked. If a Grafana content_security_policy is set, tell the owner that frame-src 'self' is needed. Do not work around it by editing nginx or Grafana core.

Owner-managed nginx reference (agents: do not apply)
The owner pastes this into their own nginx config. Adjust server_name and TLS as needed.

server {
    listen 80;
    server_name _;

    # Device Manager (Flask on 2999), served under /dm/
    location /dm/ {
        proxy_pass http://127.0.0.1:2999/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Prefix /dm;
    }

    # Grafana live websocket
    location /api/live/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Grafana
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
After pasting, run sudo nginx -t && sudo systemctl reload nginx.




