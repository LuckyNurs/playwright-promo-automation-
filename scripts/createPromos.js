require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const LOGIN_URL = process.env.LOGIN_URL;
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const BRAND_LABEL = process.env.BRAND_LABEL || 'SampleBrand';

  const menuTemplateNames = [
    "Sample Template 1",
    "Sample Template 2"
  ];

  const menuItems = [
    { name: "Sample Item 1", value: "1000" },
    { name: "Sample Item 2", value: "2000" }
  ];

  console.log('🔑 Logging in...');
  await page.goto(LOGIN_URL);
  await page.fill('input[name="email"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button:has-text("Login")');
  await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});

  for (const templateName of menuTemplateNames) {
    console.log(`\n🎯 Creating promo with template: ${templateName}`);

    await page.goto('https://example-backoffice.com/promo/grab');

    for (const item of menuItems) {
      await page.goto('https://example-backoffice.com/promo/grab/add');

      await page.fill('#promoName', `${item.name} - ${templateName}`);
      await page.selectOption('#brandId', { label: BRAND_LABEL });

      const menuTemplateInput = page.locator('#react-select-menuTemplateId-input');
      await menuTemplateInput.click();
      await page.waitForTimeout(500);
      await menuTemplateInput.type(templateName);
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter');

      await page.selectOption('#eaterType', { label: 'All' });
      await page.waitForTimeout(500);

      await page.selectOption('#discountType', { label: 'Net' });
      await page.selectOption('#scopeType', { label: 'Item' });
      await page.fill('#discountValue', item.value);

      // Menu item selection
      await page.click('#menuItemName .css-ackcql');
      await page.fill('#react-select-menuItemName-input', item.name);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      await page.fill('#startDate', '2025-10-02');
      await page.fill('#endDate', '2025-10-31');
      await page.fill('#startTime', '00:01');
      await page.fill('#endTime', '23:59');

      // Submit promo
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      console.log(`✔ Promo created: [${templateName}] - ${item.name}`);
    }
  }

  await browser.close();
  console.log('\n All promos processed successfully!');
})();
