import { managerApi, getConfig } from '../lib/handlers.js';
import { store } from '../lib/store.js';

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

async function run() {
  const cfg = await store.getConfigData();
  const gerantPassword = cfg.gerantPassword || 'testpass';
  await store.updateConfigData({ gerantPassword });

  // 1. Test saveDetails for a pizza catalog item (should apply across sizes)
  {
    const { req, res, getStatus, getBody } = mockReqRes('POST', '/api/gerant', {
      action: 'saveDetails',
      data: {
        id: 'pizzas:regina:senior',
        name: 'Regina Della Casa',
        desc: 'Sauce tomate San Marzano, mozzarella fior di latte, jambon supérieur, champignons frais'
      }
    }, { 'x-kitchen-key': gerantPassword });

    await managerApi(req, res);
    console.log('Status saveDetails pizza:', getStatus());
    const body = getBody();
    console.log('itemDetails regina senior:', body.itemDetails?.['pizzas:regina:senior']);
    console.log('itemDetails regina junior (propagated):', body.itemDetails?.['pizzas:regina:junior']);
    if (body.itemDetails?.['pizzas:regina:senior']?.name !== 'Regina Della Casa') {
      throw new Error('Failed to save pizza details');
    }
    if (body.itemDetails?.['pizzas:regina:junior']?.name !== 'Regina Della Casa') {
      throw new Error('Failed to propagate pizza details to junior size');
    }
  }

  // 2. Test GET /api/config returns itemDetails
  {
    const { req, res, getStatus, getBody } = mockReqRes('GET', '/api/config');
    await getConfig(req, res);
    const body = getBody();
    console.log('GET /api/config itemDetails present:', !!body.itemDetails);
    if (!body.itemDetails?.['pizzas:regina:senior']) {
      throw new Error('Config does not return itemDetails');
    }
  }

  // 3. Test reset details
  {
    const { req, res, getStatus, getBody } = mockReqRes('POST', '/api/gerant', {
      action: 'saveDetails',
      data: {
        id: 'pizzas:regina:senior',
        name: '',
        desc: ''
      }
    }, { 'x-kitchen-key': gerantPassword });

    await managerApi(req, res);
    const body = getBody();
    console.log('Reset details, entry removed:', !body.itemDetails?.['pizzas:regina:senior']);
  }

  console.log('✅ ALL DETAILS TESTS PASSED!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
