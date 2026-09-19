import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  runWindowsAdapter,
  windowsAclPolicyScript,
} from '../src/windowsDiscovery.js';

const cases = [
  {
    name: 'null DACL permits everyone',
    sddl: 'O:SYG:SY',
    includeWrite: true,
    expected: false,
  },
  {
    name: 'protected leaf',
    sddl: 'O:SYG:SYD:(A;;FA;;;SY)(A;;FA;;;BA)',
    includeWrite: true,
    expected: true,
  },
  {
    name: 'ancestor permits unrelated files',
    sddl: 'O:SYG:SYD:(A;;FA;;;SY)(A;;FW;;;BU)',
    includeWrite: false,
    expected: true,
  },
  {
    name: 'payload cannot be writable',
    sddl: 'O:SYG:SYD:(A;;FA;;;SY)(A;;FW;;;BU)',
    includeWrite: true,
    expected: false,
  },
  {
    name: 'ancestor cannot delete children',
    sddl: 'O:SYG:SYD:(A;;FA;;;SY)(A;;0x40;;;BU)',
    includeWrite: false,
    expected: false,
  },
  {
    name: 'generic all cannot grant access',
    sddl: 'O:SYG:SYD:(A;;GA;;;BU)',
    includeWrite: false,
    expected: false,
  },
  {
    name: 'inherit only does not grant current access',
    sddl: 'O:SYG:SYD:(A;CIIO;GA;;;BU)',
    includeWrite: true,
    expected: true,
  },
  {
    name: 'trusted installer owner',
    sddl: 'O:S-1-5-80-956008885-3418522649-1831038044-1853292631-2271478464G:SYD:(A;;FA;;;SY)',
    includeWrite: true,
    expected: true,
  },
  {
    name: 'untrusted owner',
    sddl: 'O:BUG:SYD:(A;;FA;;;SY)',
    includeWrite: true,
    expected: false,
  },
];

void test(
  'native ACL policy protects payloads while allowing unrelated ancestor creation',
  { skip: process.platform !== 'win32' },
  async () => {
    const script =
      windowsAclPolicyScript +
      String.raw`
$ErrorActionPreference = 'Stop'
$results = @()
foreach ($item in ([Console]::In.ReadToEnd() | ConvertFrom-Json)) {
  $acl = [Security.AccessControl.DirectorySecurity]::new()
  $acl.SetSecurityDescriptorSddlForm($item.sddl)
  $results += (Test-BriosaAcl $acl ([bool]$item.includeWrite))
}
ConvertTo-Json -InputObject $results -Compress
`;
    const results: unknown = JSON.parse(
      await runWindowsAdapter(script, JSON.stringify(cases)),
    );
    assert.deepEqual(
      results,
      cases.map((item) => item.expected),
    );
  },
);
