// routes/hosting.js
const router = require('express').Router();
const HostingCategory = require('../models/HostingCategory');

/* 1. lightweight category list */
router.get('/categories', async (_req, res) => {
  const list = await HostingCategory.find({}, { gid: 1, category: 1, _id: 0 });
  res.json(list);
});

/* 2. full dump */
router.get('/hosting', async (_req, res) => {
  res.json(await HostingCategory.find({}).lean());
});

/* 3. single category */
router.get('/hosting/:gid', async (req, res) => {
  const cat = await HostingCategory.findOne({ gid: Number(req.params.gid) }).lean();
  if (!cat) return res.status(404).json({ error: 'GID not found' });
  res.json(cat);
});

/* 4. filtered plans (keeps same query-string logic) */
router.get('/hosting/:gid/plans', async (req, res) => {
  const gid = Number(req.params.gid);
  const cat = await HostingCategory.findOne({ gid }, { plans: 1, _id: 0 }).lean();
  if (!cat) return res.status(404).json({ error: 'GID not found' });

  let plans = cat.plans;

  // price ceiling
  const max = parseFloat(req.query.maxPrice);
  if (!isNaN(max)) plans = plans.filter(p => p.pricing.monthly <= max);

  // free domain
  if (req.query.free_domain === 'true')
    plans = plans.filter(p => p.free_domain.available);

  // sort
  const sortKey = req.query.sort;
  if (['monthly', 'annually'].includes(sortKey))
    plans.sort((a, b) => a.pricing[sortKey] - b.pricing[sortKey]);

  // pagination
  const page    = parseInt(req.query.page)    || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const start   = (page - 1) * perPage;
  const total   = plans.length;
  const data    = plans.slice(start, start + perPage);
console.log(data);
  res.json({ page, perPage, total, data });
});

/* 5. single plan slug */
router.get('/hosting/:gid/plans/:planName', async (req, res) => {
  const gid = Number(req.params.gid);
  const name = req.params.planName.replace(/-/g, ' ').toLowerCase();
  const cat = await HostingCategory.findOne({ gid }, { plans: 1, _id: 0 }).lean();
  if (!cat) return res.status(404).json({ error: 'GID not found' });
  const plan = cat.plans.find(p => p.Name.toLowerCase() === name);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
});

/* 6. health */
router.get('/ping', (_req, res) => res.send('pong'));

module.exports = router;