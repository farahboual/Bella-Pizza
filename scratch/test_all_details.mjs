import { managerApi } from '../lib/handlers.js';
import { store } from '../lib/store.js';
import { CATALOG } from '../shared/catalog.js';

function mockReqRes(method, path, body = null, headers = {}) {
  const req = {
    method,
    url: path,
    headers: { ...headers, host: 'localhost' },
    body
  };
  let statusCode = 200;
  let responseData = null;
  const res = {
    writeHead(code, h) { statusCode = code; },
    setHeader() {},
    end(data) { responseData = data ? JSON.parse(data) : null; }
  };
  return { req, res, getStatus: () => statusCode, getBody: () => responseData };
}

async function testAll() {
  const cfg = await store.getConfigData();
  const gerantPassword = cfg.gerantPassword || 'testpass';
  await store.updateConfigData({ gerantPassword });

  const customItems = await store.getCustomItems();
  const allItems = { ...CATALOG, ...customItems };
  const keys = Object.keys(allItems);

  console.log('Testing saveDetails on sample items...');
  const sampleKeys = [
    'pizzas:margherita:junior',
    'pizzas:margherita:senior',
    'pates:spaghetti-bolognaise',
    'gratins:lasagne-bolognaise',
    'desserts:tiramisu-maison',
    'boissons:coca-cola-33cl',
    ...Object.keys(customItems)
  ];

  for (const id of sampleKeys) {
    if (!allItems[id]) continue;
    const { req, res, getStatus, getBody } = mockReqRes('POST', '/api/gerant', {
      action: 'saveDetails',
      data: {
        id,
        name: 'Test ' + id,
        desc: 'Description test pour ' + id
      }
    }, { 'x-kitchen-key': gerantPassword });

    await managerApi(req, res);
    const status = getStatus();
    const body = getBody();
    if (status !== 200) {
      console.error(`❌ FAILED for id ${id}: status ${status}, body:`, body);
    } else {
      console.log(`✅ OK for id ${id}`);
    }
  }
}

testAll().catch(console.error);
