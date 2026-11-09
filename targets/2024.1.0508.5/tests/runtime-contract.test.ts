import assert from 'node:assert/strict';
import { test } from 'node:test';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import {
  compatible,
  legacyVersion,
  legacySource,
} from '../src/installationPolicy.js';

void test('contract major three is required for runtime selection', () => {
  assert.equal(briosaProtocolIdentity.compatibilityMajor, 3);
  assert.equal(briosaProtocolIdentity.compatibilityRevision, 0);
  assert.equal(compatible(1, 0, '0.8.0', 'source'), false);
  assert.equal(compatible(2, 0, '0.9.2', 'source'), false);
  assert.equal(compatible(3, 0, '0.10.0', 'source'), true);
  assert.equal(compatible(3, 1, '0.10.1', 'source'), true);
  assert.equal(compatible(4, 0, '1.0.0', 'source'), false);
  assert.equal(compatible(0, 0, legacyVersion, legacySource), false);
});
