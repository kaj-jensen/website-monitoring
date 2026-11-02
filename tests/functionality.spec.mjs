import { test, expect } from '@playwright/test';

// Public pages only. Never submit a lead or open an external messaging app.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const request = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.abort();
    return route.continue();
  });
});
async function open(page, url) {
  const response = await page.goto(url, { waitUntil: 'load' });
  expect(response?.status(), url).toBe(200);
  await expect(page.locator('main h1, .hero h1').first()).toBeVisible();
}
async function imageLoaded(image) {
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
}
async function follow(page, link) {
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
  await link.click();
  await expect(page).toHaveURL(new URL(href, page.url()).href);
  await expect(page.locator('h1').first()).toBeVisible();
}
async function decline(page) {
  const button = page.locator('[data-analytics-choice="denied"], [data-consent="denied"]').first();
  if (await button.isVisible()) await button.click();
}
async function menu(page, project, toggle, nav) {
  if (project.project.name !== 'mobile') return;
  await page.locator(toggle).click();
  await expect(page.locator(nav)).toBeVisible();
}

test('[ole] lecture search, lecture detail and mobile navigation', async ({ page }, project) => {
  await open(page, 'https://oletherkelsen.dk/');
  await decline(page);
  await menu(page, project, '.nav-toggle', '#primary-navigation');
  await follow(page, page.locator('#primary-navigation a[href="/foredrag/"]'));
  const cards = page.locator('[data-lecture]:visible');
  await expect(cards.first()).toBeVisible();
  const number = (await cards.first().locator('.lecture-number').getAttribute('aria-label')).match(/OT\d{3}/)?.[0];
  expect(number).toBeTruthy();
  await page.locator('#lecture-search').fill('monitor-no-match-7c91');
  await expect(page.locator('#lecture-no-results')).toBeVisible();
  await expect(cards).toHaveCount(0);
  await page.locator('#lecture-search').fill(number);
  await expect(cards.first().locator('.lecture-number')).toHaveAttribute('aria-label', 'Åbn ' + number);
  await follow(page, cards.first().locator('h2 a, h3 a').first());
  await expect(page.locator('audio, iframe, a[href*="spotify.com"], a[href*="youtube.com"], a[href$=".mp3"]').first()).toBeAttached();
});

for (const locale of ['en', 'pt']) {
  test(`[fortaleza] ${locale} filters, property gallery and enquiry validation`, async ({ page }, project) => {
    const base = locale === 'en' ? 'https://www.fortalezarealestate.com.br' : 'https://fortalezaimoveis.com.br';
    const archive = locale === 'en' ? '/properties/' : '/imoveis/';
    await open(page, base + '/');
    await decline(page);
    await menu(page, project, '.menu-toggle', '#main-nav');
    await follow(page, page.locator(`#main-nav a[href="${archive}"]`).first());
    const cards = page.locator('#property-grid article');
    const total = await cards.count();
    expect(total).toBeGreaterThan(0);
    const firstType = await cards.first().getAttribute('data-type');
    const select = page.locator('#property-filters select').nth(1);
    const option = locale === 'pt' ? ({apartment:'apartamento',house:'casa',villa:'vila',land:'terreno',commercial:'comercial'})[firstType] : firstType;
    const expected = await cards.evaluateAll((cards, type) => cards.filter(card => card.dataset.type === type).length, firstType);
    expect(expected).toBeLessThan(total);
    await expect(async () => {
      await select.selectOption(option);
      await expect(page.locator('#result-count')).toHaveText(String(expected));
    }).toPass({ timeout: 20_000 });
    for (const card of await page.locator('#property-grid article:not([hidden])').all()) await expect(card).toHaveAttribute('data-type', firstType);
    await page.locator('#clear-filters').click();
    await expect(page.locator('#result-count')).toHaveText(String(total));
    await follow(page, page.locator('#property-grid article h2 a').first());
    const dialog = page.locator('dialog[open]');
    await expect(async () => {
      if (!await dialog.isVisible()) await page.locator('[data-gallery-open]').first().click();
      await expect(dialog).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 20_000 });
    await imageLoaded(dialog.locator('[data-lightbox-image]'));
    const before = await dialog.locator('[data-lightbox-image]').getAttribute('src');
    await dialog.locator('[data-gallery-next]').click();
    await expect(dialog.locator('[data-lightbox-image]')).not.toHaveAttribute('src', before);
    await imageLoaded(dialog.locator('[data-lightbox-image]'));
    await dialog.locator('[data-gallery-close]').click();
    await expect(dialog).toBeHidden();
    const form = page.locator('form[action="/api/lead"]').first();
    await expect(form.locator('[name="name"]')).toBeVisible();
    expect(await form.evaluate(form => form.checkValidity())).toBe(false);
    await expect(form.locator('[name="consent"]')).not.toBeChecked();
  });
}

test('[cumbuco] rental list, images, availability and enquiry validation', async ({ page }, project) => {
  await open(page, 'https://www.cumbuco.net/');
  await decline(page);
  await menu(page, project, '.mobile-menu summary', '.mobile-menu nav');
  const nav = project.project.name === 'mobile' ? '.mobile-menu' : '.desktop-navigation';
  await follow(page, page.locator(`${nav} a[href="/properties/"]`).first());
  await follow(page, page.locator('main article h3 a').first());
  await imageLoaded(page.locator('.gallery img').first());
  const form = page.locator('[data-enquiry-form]').first();
  await form.scrollIntoViewIfNeeded();
  await expect(form.locator('[name="arrival"]')).toBeVisible();
  expect(await form.evaluate(form => form.checkValidity())).toBe(false);
  const year = new Date().getFullYear() + 1;
  await form.locator('[name="arrival"]').fill(`${year}-07-20`);
  await form.locator('[name="departure"]').fill(`${year}-07-19`);
  await expect.poll(() => form.locator('[name="departure"]').evaluate(field => field.validity.valid)).toBe(false);
  await expect(form.locator('[data-whatsapp-submit]')).toBeVisible();
  await expect(form.locator('[name="consent"]')).not.toBeChecked();
});

for (const locale of ['en', 'pt']) {
  test(`[aguia] ${locale} tour search, detail, contact and language navigation`, async ({ page }, project) => {
    const base = 'https://aguiaamazonas.com.br';
    await open(page, base + (locale === 'en' ? '/' : '/pt/'));
    await decline(page);
    await menu(page, project, '.mobile-nav summary', '.mobile-nav nav');
    const nav = project.project.name === 'mobile' ? '.mobile-nav' : '.desktop-nav';
    const alternate = locale === 'en' ? '/pt/' : '/';
    await follow(page, page.locator(`${nav} a[href="${alternate}"]`).first());
    await expect(page.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'pt-BR' : 'en');
    await open(page, base + (locale === 'en' ? '/' : '/pt/'));
    const finder = page.locator('[data-tour-finder]');
    const items = page.locator('.tour-filter-item:not([hidden])');
    const total = await items.count();
    expect(total).toBeGreaterThan(1);
    await finder.locator('[name="query"]').fill('monitor-no-match-7c91');
    await expect(items).toHaveCount(0);
    await finder.locator('[data-reset]').click();
    await expect(items).toHaveCount(total);
    await finder.locator('[name="kind"]').selectOption('day');
    await expect.poll(() => items.count()).toBeGreaterThan(0);
    await expect.poll(() => items.count()).toBeLessThan(total);
    await follow(page, items.first().locator('a[href*="/experiences/"], a[href*="/experiencias/"]').first());
    const whatsapp = page.locator('main a[href^="https://wa.me/"]').first();
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute('href', /https:\/\/wa\.me\/5592994587173/);
    await imageLoaded(page.locator('main img').first());
  });
}
