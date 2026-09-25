import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compatible,
  legacyVersion,
  legacySource,
} from '../src/installationPolicy.js';

void test('contract major two is required for runtime selection', () => {
  assert.equal(compatible(1, 0, '0.8.0', 'source'), false);
  assert.equal(compatible(2, 0, '0.9.0', 'source'), true);
  assert.equal(compatible(3, 0, '1.0.0', 'source'), false);
  assert.equal(compatible(0, 0, legacyVersion, legacySource), false);
});
