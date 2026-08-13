import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';

const report = {
  schema_version: 2,
  implementation: 'javascript',
  protocol: {
    artifact: briosaProtocolIdentity.artifactName,
    source_revision: briosaProtocolIdentity.sourceRevision,
    package: briosaProtocolIdentity.protocolPackage,
    spatial_analyzer_target: briosaProtocolIdentity.spatialAnalyzerTarget,
  },
  construction_is_dormant: true,
  owns_local_server: true,
  default_start: [
    'start_server',
    'start_spatial_analyzer_sdk',
    'launch_spatial_analyzer',
    'connect_to_spatial_analyzer',
    'verify_mp_readiness',
  ],
  lifecycle_methods: [
    'get_spatial_analyzer_state',
    'launch_spatial_analyzer',
    'close_owned_spatial_analyzer',
    'get_spatial_analyzer_sdk_state',
    'start_spatial_analyzer_sdk',
    'connect_to_spatial_analyzer',
    'reconnect_to_spatial_analyzer',
    'stop_spatial_analyzer_sdk',
    'recover_spatial_analyzer_sdk',
  ],
  stop_closes_spatial_analyzer: false,
  automatic_mp_replay: false,
};

process.stdout.write(`${JSON.stringify(report)}\n`);
