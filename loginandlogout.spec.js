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


test('adding items to cart and validating cart count || Filtering ', async ({ page }) => {
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

    console.log('--- Sorting: Price High to Low ---');
    await page.locator('.product_sort_container').selectOption('hilo');
    const prices1 = await page.locator('.inventory_item_price').allTextContents();
    const priceNumbers1 = prices1.map(p => parseFloat(p.replace('$', '')));
    const sorted1 = [...priceNumbers1].sort((a, b) => b - a);
    expect(priceNumbers1).toEqual(sorted1);
    await page.screenshot({ path: 'sorted-high-to-low.png' });
    console.log('--- Sorted: Price High to Low ---');


    console.log('--- Sorting: Price Low to High ---');
    await page.locator('.product_sort_container').selectOption('lohi');
    const prices2 = await page.locator('.inventory_item_price').allTextContents();
    // example = [1,2,3,4,5]
    // p takes each price string like '$29.99' and converts to number 29.99.
    // parseFloat removes the decimal and '$' sign.
    const priceNumbers2 = prices2.map(p => parseFloat(p.replace('$', '')));
    const sorted2 = [...priceNumbers2].sort((a, b) => a - b);
    expect(priceNumbers2).toEqual(sorted2);
    await page.screenshot({ path: 'sorted-low-to-high.png' });
    console.log('--- Sorted: Price Low to High ---');


    console.log('--- Sorting: Name Z-A ---');
    await page.locator('.product_sort_container').selectOption('za');
    const names1 = await page.locator('.inventory_item_name').allTextContents();
    const sorted3 = [...names1].sort().reverse();
    expect(names1).toEqual(sorted3);
    await page.screenshot({ path: 'sorted-z-a.png' });
    console.log('--- Sorted: Name Z-A ---');

    console.log('--- Sorting: Name A-Z ---');
    await page.locator('.product_sort_container').selectOption('az');
    const names2 = await page.locator('.inventory_item_name').allTextContents();
    const sorted4 = [...names2].sort();
    expect(names2).toEqual(sorted4);
    await page.screenshot({ path: 'sorted-a-z.png' });
    console.log('--- Sorted: Name A-Z ---');
});


test('proceeding to checkout', async ({ page }) => {
    // Proceed to add one item to cart and checkout
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


test('add two items, remove one in checkout, continue shopping, add one more, and checkout again', async ({ page }) => {
    console.log('--- Adding two specific items to cart ---');
    // Add backpack and bike light by ID
    await page.locator('#add-to-cart-sauce-labs-backpack').click();
    await page.locator('#add-to-cart-sauce-labs-bike-light').click();
    await page.screenshot({ path: 'step1-two-items-added.png' });
    // Go to cart
    console.log('--- Going to cart ---');
    await page.locator('.shopping_cart_link').click();
    await page.screenshot({ path: 'step2-cart-view.png' });
    // Remove backpack in cart by ID
    console.log('--- Removing backpack in cart ---');
    await page.locator('#remove-sauce-labs-backpack').click();
    await page.screenshot({ path: 'step3-one-item-removed.png' });
    // Continue shopping
    console.log('--- Clicking Continue Shopping ---');
    await page.locator('#continue-shopping').click();
    await page.screenshot({ path: 'step4-continued-shopping.png' });
    // Add bolt t-shirt by ID
    console.log('--- Adding bolt t-shirt to cart ---');
    await page.locator('#add-to-cart-sauce-labs-bolt-t-shirt').click();
    await page.screenshot({ path: 'step5-third-item-added.png' });
    // Go to cart and checkout again
    console.log('--- Going to cart and clicking checkout again ---');
    await page.locator('.shopping_cart_link').click();
    await page.screenshot({ path: 'step6-final-cart-view.png' });
    await page.locator('#checkout').click();
    await page.screenshot({ path: 'step7-final-checkout.png' });
    console.log('--- Final checkout reached ---');
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








