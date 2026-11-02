# Website functionality monitoring

Free monitoring for public journeys on Ole Therkelsen, Fortaleza Real Estate (English and Portuguese domains), Cumbuco Rentals, Águia Amazonas (English and Portuguese), and O Terceiro Testamento.

Every 30 minutes, Chromium runs 14 desktop/mobile journeys. The checks exercise lecture search, property filters and galleries, rental pages and invalid-date handling, tour search and filters, language links, symbol navigation and attribution, images, contact-link targets, contact validation, and mobile menus. No real leads or WhatsApp messages are sent. Enquiry writes are blocked; ordinary Cloudflare browser verification may run. CAPTCHAs are never solved. These checks do not prove successful email delivery, WhatsApp delivery, third-party video playback or real visitor behavior.

## Pilot status — 2 November 2026

Clarity is live on all five sites, with strict masking and verified consent/withdrawal behavior. All 14 desktop/mobile journeys pass from the local Mac and the standard free GitHub cloud runner. With the owner’s explicit approval on 2 November 2026, Bot Fight Mode was turned off for cumbuco.net only to allow the monitoring browser to complete the rental journey. Browser Integrity Check and the enquiry Turnstile protection remain enabled. Incident #1 closes automatically after two consecutive successful cloud runs.

A successful workflow means the monitoring pipeline completed; check the run summary and incident issues for individual website health. Google PageSpeed verification for Fortaleza was incomplete because its free quota returned HTTP 429.

## Incidents

An isolated failing run stays quiet. Two consecutive failed runs open one incident issue. Continued failures create no repeat messages. Two successful runs close the issue with a recovery comment. Runner/setup failures are tracked as a separate monitoring-system incident and never interpreted as website recovery. Each browser test also retries once. Expect approximately 30–60 minutes for confirmation, plus GitHub scheduling/runner delays; this is not an uptime SLA.

See [active incidents](https://github.com/kaj-jensen/website-monitoring/issues) and [latest checks](https://github.com/kaj-jensen/website-monitoring/actions/workflows/monitor.yml). Each run’s summary shows observed results and incident status. The `monitor-state` branch holds only counters and issue numbers. The repository has an issue-only subscription, with email routed to the owner’s configured GitHub notification address. Pilot test delivery was verified on 2 November 2026.

## Zero-cost boundary

Only standard `ubuntu-latest` runners in this **public** repository are used. Jobs refuse to run if the repository becomes private. No paid monitoring API, AI API, Cloudflare browser sessions, larger runners, Actions caches, or artifact uploads are used. No website source, credentials, visitor data or screenshots are committed. Browser logs are retained by GitHub; screenshots created during failed checks remain ephemeral on the runner. Do not add paid services or change repository visibility without reviewing this boundary. Free-service terms can change; keep this boundary under review rather than automatically upgrading.

GitHub schedules can be delayed or disabled by GitHub; monitor the most recent run timestamp. Scheduled workflows in inactive public repositories may need re-enabling. The workflow's own infrastructure failures are surfaced when it can still execute the incident job; a platform-wide GitHub outage cannot notify through GitHub.

## Development

Node 24; `npm ci --ignore-scripts`; `npx playwright install chromium`; `npm test`; `npm run test:alerts`.

All external Actions are pinned. The browser job has read-only permissions and no credentials. Only the separate incident job can write this monitoring repository's state and issues; it installs no packages and receives no website secrets.

Microsoft Clarity is configured in the private website repositories, using separate projects, explicit visitor consent, denied advertising storage, and masked forms. This repository never reads recordings.
