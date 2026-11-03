import { managerApi } from '../lib/handlers.js';
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

  const fakeDataUrl = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

  // 1. Save photo for pizza
  const { req, res, getStatus, getBody } = mockReqRes('POST', '/api/gerant', {
    action: 'saveOverride',
    data: {
      id: 'pizzas:margherita:junior',
      img: fakeDataUrl
    }
  }, { 'x-kitchen-key': gerantPassword });

  await managerApi(req, res);
  console.log('Status saveOverride:', getStatus());
  const body = getBody();
  console.log('Saved images in response:', Object.keys(body.itemImages || {}));

  if (body.itemImages?.['margherita'] !== fakeDataUrl) {
    throw new Error('Pizza baseSlug image not saved');
  }
  // Check that duplicate sub-size keys are NOT created
  if (body.itemImages?.['pizzas:margherita:senior']) {
    throw new Error('Duplicate size key senior should not be created');
  }

  console.log('✅ Photo upload test PASSED without duplication!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
