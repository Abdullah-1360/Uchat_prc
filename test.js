/*  hosting-api/test.js  */
const axios = require('axios');
const assert = require('assert');

const BASE = 'http://localhost:3000/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};
let pass = 0, fail = 0;

function ok(desc) {
  console.log(`${colors.green}✅ ${desc}${colors.reset}`);
  pass++;
}
function ko(desc, e) {
  console.log(`${colors.red}❌ ${desc}${colors.reset}`, e?.message || e);
  fail++;
}

async function GET(path, expect = 200) {
  const { status, data } = await axios.get(BASE + path, { validateStatus: null });
  assert.strictEqual(status, expect);
  return data;
}

async function run() {
  console.log('🧪  Starting integration tests\n');

  /* ---------- 1. health ---------- */
  try {
    const pong = await GET('/ping');
    assert.strictEqual(pong, 'pong');
    ok('GET /api/ping');
  } catch (e) { ko('/api/ping', e); }

  /* ---------- 2. categories ---------- */
  try {
    const cats = await GET('/categories');
    assert(Array.isArray(cats));
    assert(cats.length === 5);
    assert(cats[0].gid === 1);
    ok('GET /api/categories');
  } catch (e) { ko('/api/categories', e); }

  /* ---------- 3. full dump ---------- */
  try {
    const full = await GET('/hosting');
    assert(Array.isArray(full));
    assert(full.length === 5);
    ok('GET /api/hosting (full dump)');
  } catch (e) { ko('/api/hosting', e); }

  /* ---------- 4. single category ---------- */
  try {
    const cat = await GET('/hosting/28');
    assert.strictEqual(cat.gid, 28);
    assert(cat.category.includes('Windows'));
    ok('GET /api/hosting/28');
  } catch (e) { ko('/api/hosting/28', e); }

  /* ---------- 5. 404 on bad gid ---------- */
  try {
    await GET('/hosting/999', 404);
    ok('GET /api/hosting/999 → 404');
  } catch (e) { ko('404 test', e); }

  /* ---------- 6. plans inside category ---------- */
  try {
    const plans = await GET('/hosting/21/plans');
    assert(Array.isArray(plans));
    assert(plans.length === 3);
    assert(plans[0].product_name === 'WooCommerce Starter');
    ok('GET /api/hosting/21/plans');
  } catch (e) { ko('/api/hosting/21/plans', e); }

  /* ---------- 7. single plan by slug ---------- */
  try {
    const plan = await GET('/hosting/1/plans/Starter');
    assert.strictEqual(plan.product_name, 'Starter');
    assert(plan.pricing.monthly === 2.99);
    ok('GET /api/hosting/1/plans/Starter');
  } catch (e) { ko('/api/hosting/1/plans/Starter', e); }

  /* ---------- 8. 404 on bad plan ---------- */
  try {
    await GET('/api/hosting/1/plans/NonExistent', 404);
    ok('GET /api/hosting/1/plans/NonExistent → 404');
  } catch (e) { ko('plan 404', e); }

  /* ---------- 9. dash-in-slug ---------- */
  try {
    const plan = await GET('/hosting/20/plans/WordPress-Starter');
    assert.strictEqual(plan.product_name, 'WordPress Starter');
    ok('GET /api/hosting/20/plans/WordPress-Starter (dash slug)');
  } catch (e) { ko('dash slug', e); }

  /* ---------- summary ---------- */
  console.log(`\n📊  Tests: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
  process.exit(0);
}

/* ---------- run ---------- */
run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});