# Website functionality monitoring

Free monitoring for public journeys on Ole Therkelsen, Fortaleza Real Estate (English and Portuguese domains), Cumbuco Rentals, and Águia Amazonas (English and Portuguese).

Every 30 minutes, Chromium runs 12 desktop/mobile journeys. The checks exercise lecture search, property filters and galleries, rental pages and invalid-date handling, tour search and filters, language links, images, contact-link targets, and mobile menus. No real leads or WhatsApp messages are sent. Browser writes are blocked. These checks do not prove successful email delivery, WhatsApp delivery, third-party video playback or real visitor behavior.

## Incidents

An isolated failing run stays quiet. Two consecutive failed runs open one issue assigned to `kaj-jensen`. Continued failures create no repeat messages. Two successful runs close the issue with a recovery comment. Runner/setup failures are tracked as a separate monitoring-system incident and never interpreted as website recovery. Each browser test also retries once. Expect approximately 30–60 minutes for confirmation, plus GitHub scheduling/runner delays; this is not an uptime SLA.

See [active incidents](https://github.com/kaj-jensen/website-monitoring/issues) and [latest checks](https://github.com/kaj-jensen/website-monitoring/actions/workflows/monitor.yml). Each run’s summary shows observed results and incident status. The `monitor-state` branch holds only counters and issue numbers. Notification email follows the repository watch subscription and GitHub account notification settings. Confirm the desired address and email delivery before relying on notifications.

## Zero-cost boundary

Only standard `ubuntu-latest` runners in this **public** repository are used. Jobs refuse to run if the repository becomes private. No paid monitoring API, AI API, Cloudflare browser sessions, larger runners, Actions caches, or artifact uploads are used. No website source, credentials, visitor data or screenshots are committed. Browser logs are retained by GitHub; screenshots created during failed checks remain ephemeral on the runner. Do not add paid services or change repository visibility without reviewing this boundary. Free-service terms can change; keep this boundary under review rather than automatically upgrading.

GitHub schedules can be delayed or disabled by GitHub; monitor the most recent run timestamp. Scheduled workflows in inactive public repositories may need re-enabling. The workflow's own infrastructure failures are surfaced when it can still execute the incident job; a platform-wide GitHub outage cannot notify through GitHub.

## Development

Node 24; `npm ci --ignore-scripts`; `npx playwright install chromium`; `npm test`; `npm run test:alerts`.

All external Actions are pinned. The browser job has read-only permissions and no credentials. Only the separate incident job can write this monitoring repository's state and issues; it installs no packages and receives no website secrets.

Microsoft Clarity is configured in the private website repositories, using separate projects, explicit visitor consent, denied advertising storage, and masked forms. This repository never reads recordings.
