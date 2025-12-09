import { test, expect } from '@playwright/test';

test.beforeEach('working with swag labs login', async ({ page }) => {
    console.log('--- Starting Login ---');
    await page.goto('https://www.saucedemo.com/');
    await expect(page).toHaveTitle('Swag Labs');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    // Wait for products page to be visible (e.g., product sort dropdown)
    await page.waitForSelector('.product_sort_container', { timeout: 10000 });
    await page.screenshot({ path: 'login-success.png' });
    console.log('--- Login Successful ---');
});


test('adding items to cart and validating cart count', async ({ page }) => {
    // Select all visible 'Add to cart' buttons (not 'Remove')
    const addToCartButtons = page.locator("//button[contains(text(), 'Add to cart')]"); 
    let addedCount = 0;
    while (await addToCartButtons.count() > 0) {
        await addToCartButtons.first().click(); 
        addedCount++;
    }
    // Get the cart count from the UI
    const cartCount = await page.locator('.shopping_cart_badge').innerText();

    // Display both values in the test output
    console.log(`Cart count displayed: ${cartCount}`);
    console.log(`Number of selected items: ${addedCount}`);

    // Assert the cart count matches the number of items added
    expect(Number(cartCount)).toBe(addedCount);

});


test('sort products by price high to low', async ({ page }) => {
    console.log('--- Sorting: Price High to Low ---');
    await page.locator('.product_sort_container').selectOption('hilo');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const priceNumbers = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...priceNumbers].sort((a, b) => b - a);
    expect(priceNumbers).toEqual(sorted);
    await page.screenshot({ path: 'sorted-high-to-low.png' });
    console.log('--- Sorted: Price High to Low ---');
});


test('sort products by price low to high', async ({ page }) => {
    console.log('--- Sorting: Price Low to High ---');
    await page.locator('.product_sort_container').selectOption('lohi');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    // example = [1,2,3,4,5]
    // p takes each price string like '$29.99' and converts to number 29.99.
    // parseFloat removes the decimal and '$' sign.
    const priceNumbers = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...priceNumbers].sort((a, b) => a - b);
    expect(priceNumbers).toEqual(sorted);
    await page.screenshot({ path: 'sorted-low-to-high.png' });
    console.log('--- Sorted: Price Low to High ---');
});


test('filter products by name Z-A', async ({ page }) => {
    console.log('--- Sorting: Name Z-A ---');
    await page.locator('.product_sort_container').selectOption('za');
    const names = await page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
    await page.screenshot({ path: 'sorted-z-a.png' });
    console.log('--- Sorted: Name Z-A ---');
});


test('filter products by name A-Z', async ({ page }) => {
    console.log('--- Sorting: Name A-Z ---');
    await page.locator('.product_sort_container').selectOption('az');
    const names = await page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
    await page.screenshot({ path: 'sorted-a-z.png' });
    console.log('--- Sorted: Name A-Z ---');
});


test('add single item and complete checkout info and finish', async ({ page }) => {
    console.log('--- Adding one item to cart ---');
    await page.locator("//button[contains(text(), 'Add to cart')]").first().click();
    await page.screenshot({ path: 'checkout-item-added.png' });
    console.log('--- Item added, going to cart ---');
    await page.locator('.shopping_cart_link').click();
    await page.screenshot({ path: 'checkout-cart-view.png' });
    console.log('--- Clicking checkout ---');
    await page.locator('#checkout').click();
    await page.waitForSelector('#first-name', { timeout: 10000 });
    console.log('--- Filling checkout info ---');
    await page.locator('#first-name').fill('Nikith');
    await page.locator('#last-name').fill('Mint');
    await page.locator('#postal-code').fill('500038');
    await page.screenshot({ path: 'checkout-info-filled-2.png' });
    console.log('--- Clicking continue ---');
    await page.locator('#continue').click();
    await page.waitForSelector('.summary_info', { timeout: 10000 });
    await page.screenshot({ path: 'checkout-continued-2.png' });
    console.log('--- Checkout continued to overview ---');
    // Click Finish and verify order completion
    console.log('--- Clicking Finish ---');
    await page.locator('#finish').click();
    await page.waitForSelector('.complete-header', { timeout: 10000 });
    await page.screenshot({ path: 'checkout-finished.png' });
    console.log('--- Order finished and confirmation displayed ---');
});


test.afterEach('Logout', async ({ page }) => {
    console.log('--- Starting Logout ---');
    await page.locator('#react-burger-menu-btn').click();
    // Wait for the sidebar menu to be visible (menu is .bm-menu-wrap or .bm-item-list)
    await page.waitForSelector('.bm-menu-wrap, .bm-item-list', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('#logout_sidebar_link', { state: 'visible', timeout: 10000 });
    await page.locator('#logout_sidebar_link').click();
    // Optionally, wait for login page to reappear
    await page.waitForSelector('#login-button', { timeout: 10000 });
    await page.screenshot({ path: 'logout-success.png' });
    console.log('--- Logout Successful ---');
});








