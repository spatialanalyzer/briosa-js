// C3 (major3-client-consistency.md): every input the server requires is
// required in the public API, with no fill-in. Each row is a request field
// that the server at the 0.10.0-dev.1 checkpoint passes through a Required*
// mapper or rejects with an explicit check when it is absent; the audit that
// found them is recorded in the PR. Each row is required in the public type,
// omitting it fails in the client before any call, and a given value is sent.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BriosaProtocolError } from '../src/index.js';
import { briosaProtocolIdentity } from '../src/generated/protocolIdentity.js';
import { startedClient } from './support/fakes.js';
import {
  argumentsFor,
  checker,
  discover,
  inputParameters,
  isOptional,
  symbolType,
} from './support/publicOperations.js';

/** [public operation, input path, wire path] */
type Row = readonly [string, string, string];

const bothTargets: readonly Row[] = [
  [
    'autoFilterCloudsToNominalGeometry2D',
    'input.filterProximitySettings2D',
    'filterProximitySettings2d',
  ],
  [
    'autoFilterCloudsToNominalGeometry3D',
    'input.filterProximitySettings3D',
    'filterProximitySettings3d',
  ],
  ['autoFilterPointsGroupsCloudsToSurfaceFaces', 'input.points', 'points'],
  ['autoFilterPointsGroupsCloudsToSurfaceFaces', 'input.groups', 'groups'],
  ['autoFilterPointsGroupsCloudsToSurfaceFaces', 'input.clouds', 'clouds'],
  [
    'autoFilterPointsGroupsCloudsToSurfaceFaces',
    'input.offsetDirection',
    'offsetDirection',
  ],
  [
    'autoFilterPointsToNominalGeometry3D',
    'input.filterProximitySettings3D',
    'filterProximitySettings3d',
  ],
  ['createPointsToObjectsMap', 'input.points', 'points'],
  ['createPointsToObjectsMap', 'input.groups', 'groups'],
  ['doRelationshipFit', 'input.motionToAllow', 'motionToAllow'],
  [
    'makeDynamicCircleRelationship',
    'input.constructionMode',
    'constructionMode',
  ],
  [
    'makeDynamicEllipseRelationship',
    'input.constructionMode',
    'constructionMode',
  ],
  ['makeDynamicLineRelationship', 'input.constructionMode', 'constructionMode'],
  [
    'makeDynamicPlaneRelationship',
    'input.constructionMode',
    'constructionMode',
  ],
  [
    'makeDynamicPointRelationship',
    'input.constructionMode',
    'constructionMode',
  ],
  [
    'makeDynamicPointRelationship',
    'input.thirdReferenceGeometry',
    'thirdReferenceGeometry',
  ],
  [
    'makeFrameToFrameRelationship',
    'input.orientationTolerance',
    'orientationTolerance',
  ],
  [
    'makeFrameToFrameRelationship',
    'input.positionTolerance',
    'positionTolerance',
  ],
  [
    'makeGroupsToObjectsRelationship',
    'input.projectionOptions',
    'projectionOptions',
  ],
  [
    'makePointCloudsToObjectsRelationship',
    'input.projectionOptions',
    'projectionOptions',
  ],
  [
    'makePointsToObjectsRelationship',
    'input.projectionOptions',
    'projectionOptions',
  ],
  [
    'moveCollectionsByMinimizingRelationships',
    'input.motionToAllow',
    'motionToAllow',
  ],
  [
    'relationshipWatchWindowTemplate',
    'input.watchWindowTemplateName',
    'watchWindowTemplateName',
  ],
  [
    'relationshipWatchWindowTemplate',
    'input.options.udpNetworkTransmitSettings',
    'udpNetworkTransmitSettings',
  ],
  [
    'setObjectToObjectDirectionRelationshipTolerances',
    'input.angleBetweenVectorsTolerances',
    'angleBetweenVectorsTolerances',
  ],
  [
    'setObjectToObjectDirectionRelationshipTolerances',
    'input.mutualPerpendicularLengthTolerances',
    'mutualPerpendicularLengthTolerances',
  ],
  [
    'setPointsToPointsRelationshipAssociatedData',
    'input.nominalPoints',
    'nominalPoints',
  ],
  [
    'setPointsToPointsRelationshipAssociatedData',
    'input.actualPoints',
    'actualPoints',
  ],
  [
    'setRelationshipAssociatedData',
    'input.individualPoints',
    'individualPoints',
  ],
  ['setRelationshipAssociatedData', 'input.pointGroups', 'pointGroups'],
  ['setRelationshipAssociatedData', 'input.pointClouds', 'pointClouds'],
  ['setRelationshipAssociatedData', 'input.objects', 'objects'],
  [
    'constructionOperations.constructCrossSectionCloud',
    'input.referenceObject',
    'referenceObject',
  ],
  [
    'constructionOperations.constructEllipsoid',
    'input.transformInWorkingCoordinates',
    'transformInWorkingCoordinates',
  ],
  [
    'constructionOperations.constructFrame',
    'input.transformInWorkingCoordinates',
    'transformInWorkingCoordinates',
  ],
  [
    'constructionOperations.constructFrameFromTransformInWorld',
    'input.transformInWorldCoordinates',
    'transformInWorldCoordinates',
  ],
  [
    'constructionOperations.constructPointFromCloudPointRuntimeSelect',
    'input.constructedPointName',
    'constructedPointName',
  ],
  [
    'constructionOperations.constructPointsFromSurfacesOnUvGrid',
    'input.edgePointMode',
    'edgePointMode',
  ],
  [
    'constructionOperations.constructPointsShiftedInWorkingFrame',
    'input.shiftVector',
    'shiftVector',
  ],
  [
    'constructionOperations.constructPointsSubsetWithGreatestSpacing',
    'input.groupForSubset',
    'groupForSubset',
  ],
  [
    'constructionOperations.makeCollectionItemNameRefListWildcardSelection',
    'input.itemType',
    'itemType',
  ],
  [
    'constructionOperations.makeCollectionObjectNameRefListByType',
    'input.objectType',
    'objectType',
  ],
  [
    'constructionOperations.makeCollectionObjectNameRefListByTypeAndColor',
    'input.objectType',
    'objectType',
  ],
  [
    'constructionOperations.makeCollectionObjectNameRefListRuntimeSelect',
    'input.objectType',
    'objectType',
  ],
  [
    'constructionOperations.makeCollectionObjectNameRefListWildcardSelection',
    'input.objectType',
    'objectType',
  ],
  [
    'constructionOperations.makeCollectionObjectNameRuntimeSelect',
    'input.objectType',
    'objectType',
  ],
  [
    'constructionOperations.getGradientAtProjectedPointOnSurfaceEdge',
    'input.edgeOffsetDirection',
    'edgeOffsetDirection',
  ],
  [
    'gdtOperations.enableDisableDatumAlignmentForFeatureCheck',
    'input.alignment',
    'alignment',
  ],
  [
    'gdtOperations.featureInspectionAutoFilter',
    'input.offsetDirection',
    'offsetDirection',
  ],
  ['gdtOperations.makeGdtDatumAnnotation', 'options.objects', 'objects'],
  [
    'gdtOperations.makeGdtDatumAnnotation',
    'options.geometryRelationships',
    'geometryRelationships',
  ],
  [
    'gdtOperations.makeGdtDatumAnnotation',
    'options.auxiliaryObject',
    'auxiliaryObject',
  ],
  [
    'gdtOperations.makeGdtDatumAnnotation',
    'options.auxiliaryGeometryRelationship',
    'auxiliaryGeometryRelationship',
  ],
  ['gdtOperations.makeGdtFeatureCheckAnnotation', 'options.objects', 'objects'],
  [
    'gdtOperations.makeGdtFeatureCheckAnnotation',
    'options.geometryRelationships',
    'geometryRelationships',
  ],
  [
    'gdtOperations.makeGdtFeatureCheckAnnotation',
    'options.auxiliaryObject',
    'auxiliaryObject',
  ],
  [
    'gdtOperations.makeGdtFeatureCheckAnnotation',
    'options.auxiliaryGeometryRelationship',
    'auxiliaryGeometryRelationship',
  ],
  [
    'gdtOperations.setGdtOptions',
    'input.distanceBetweenMode',
    'distanceBetweenMode',
  ],
  ['gdtOperations.setGdtOptions', 'input.evaluationMethod', 'evaluationMethod'],
  [
    'instrumentOperations.autoCorrespondWithProximityTrigger',
    'input.deviationVectorGroupName',
    'deviationVectorGroupName',
  ],
  ['instrumentOperations.buildTarget', 'input.tolerance', 'tolerance'],
  [
    'instrumentOperations.calculateTcpFixtureUncertainties',
    'input.tcpInWorking',
    'tcpInWorking',
  ],
  ['instrumentOperations.collimation', 'input.tiltMode', 'tiltMode'],
  [
    'instrumentOperations.collimation',
    'input.baselineMethod',
    'baselineMethod',
  ],
  ['instrumentOperations.collimation', 'input.scalePoint1', 'scalePoint1'],
  ['instrumentOperations.collimation', 'input.scalePoint2', 'scalePoint2'],
  [
    'instrumentOperations.collimation',
    'input.notMeasuredByMovingInstrument',
    'notMeasuredByMovingInstrument',
  ],
  [
    'instrumentOperations.collimation',
    'input.asMeasuredByMovingInstrument',
    'asMeasuredByMovingInstrument',
  ],
  [
    'instrumentOperations.setObservationCollimationShotOptions',
    'input.targetedInstrument',
    'targetedInstrument',
  ],
  [
    'robotCalibrationApplianceNodeOperations.setCalibrationApplianceNodeMeasurementOffsetTransform',
    'input.measurementOffsetTransform',
    'measurementOffsetTransform',
  ],
  [
    'robotOperations.setRobotCalibrationMeasurementOffsetInToolFrame',
    'input.measurementFrame',
    'measurementFrame',
  ],
  [
    'robotOperations.setRobotCalibrationToolFrame',
    'input.toolFrame',
    'toolFrame',
  ],
  [
    'robotOperations.setRobotMachineBaseTransform',
    'input.destinationTransform',
    'destinationTransform',
  ],
  [
    'robotOperations.setRobotMachineModelLinkParameters',
    'input.configuration.segmentCgInSegment',
    'segmentCgInSegment',
  ],
];

// Only SA 2026 registers these operations.
const targetOnly: Readonly<Record<string, readonly Row[]>> = {
  '2026.1.0529.7': [
    [
      'exportQdasCharacteristics',
      'input.k0004DateTimeStamp',
      'k0004DateTimeStamp',
    ],
    ['prepareQdasDataList', 'input.k0004DateTimeStamp', 'k0004DateTimeStamp'],
    ['extractGeometryFromPointClouds', 'input.geometryType', 'geometryType'],
    [
      'extractGeometryFromPointClouds',
      'input.boundingPoints',
      'boundingPoints',
    ],
  ],
};

// The settings of the three Auto Filter operations go through
// RequiredProximity, which also rejects an unspecified proximity mode.
const proximityModes: readonly Row[] = (
  [
    [
      'autoFilterCloudsToNominalGeometry2D',
      'filterProximitySettings2D',
      'filterProximitySettings2d',
    ],
    [
      'autoFilterCloudsToNominalGeometry3D',
      'filterProximitySettings3D',
      'filterProximitySettings3d',
    ],
    [
      'autoFilterPointsToNominalGeometry3D',
      'filterProximitySettings3D',
      'filterProximitySettings3d',
    ],
  ] as const
).flatMap(([operation, settings, wire]) =>
  (
    [
      'surfaceProximityMode',
      'planarProximityMode',
      'radialProximityMode',
    ] as const
  ).map((mode): Row => [
    operation,
    `input.${settings}.${mode}`,
    `${wire}.${mode}`,
  ]),
);

const rows: readonly Row[] = [
  ...bothTargets,
  ...(targetOnly[briosaProtocolIdentity.spatialAnalyzerTarget] ?? []),
  ...proximityModes,
];

function at(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const segment of path)
    current = (current as Readonly<Record<string, unknown>> | undefined)?.[
      segment
    ];
  return current;
}

void test('every input the server requires is required, with no fill-in', async (t) => {
  const { client, transport } = await startedClient();
  try {
    const operations = new Map(
      discover(client).map((operation) => [operation.label, operation]),
    );
    for (const [label, path, wirePath] of rows) {
      await t.test(`${label}: ${path}`, async () => {
        const operation = operations.get(label);
        assert.ok(operation !== undefined, `${label} is public`);
        const [parameterName, ...members] = path.split('.');
        const leaf = members.at(-1);
        assert.ok(parameterName !== undefined && leaf !== undefined);
        const parameters = inputParameters(operation);
        const index = parameters.findIndex(
          (parameter) => parameter.name === parameterName,
        );
        const parameter = parameters[index];
        assert.ok(parameter !== undefined, `${label} takes ${parameterName}`);

        // Required in the public type, with every container on its path.
        const optional: string[] = isOptional(parameter) ? [parameterName] : [];
        let type = checker.getNonNullableType(symbolType(parameter));
        for (const member of members) {
          const property = checker.getPropertyOfType(type, member);
          assert.ok(property !== undefined, `${label} has ${member}`);
          if (isOptional(property)) optional.push(member);
          type = checker.getNonNullableType(symbolType(property));
        }
        assert.deepEqual(optional, [], 'required in the public type');

        // Omitted, it fails in the client before any call.
        const argumentIndex = (operation.takesClient ? 1 : 0) + index;
        const omitted = argumentsFor(operation, client);
        const container = at(omitted[argumentIndex], members.slice(0, -1));
        if (typeof container === 'object' && container !== null)
          delete (container as Record<string, unknown>)[leaf];
        const before = transport.operations.length;
        await assert.rejects(
          () => operation.invoke(omitted),
          (error: unknown) =>
            error instanceof TypeError &&
            error.message.endsWith(`${leaf} is required.`),
        );
        assert.equal(transport.operations.length, before, 'no call is made');

        // Given, it is sent.
        try {
          await operation.invoke(argumentsFor(operation, client));
        } catch (error) {
          // The scripted response has no outputs to map.
          if (!(error instanceof BriosaProtocolError)) throw error;
        }
        assert.equal(transport.operations.length, before + 1);
        // The generated input is never a zero value, so a decoded zero value
        // or empty list means the field was not sent.
        const sent = at(transport.lastWireRequest(), wirePath.split('.'));
        assert.ok(
          sent !== undefined &&
            sent !== 0 &&
            sent !== '' &&
            sent !== false &&
            !(Array.isArray(sent) && sent.length === 0),
          `${wirePath} is sent`,
        );
      });
    }
  } finally {
    await client.stop();
  }
});

void test('an operation whose input is now required rejects a missing input before any call', async () => {
  const { client, transport } = await startedClient();
  try {
    const operations = new Map(
      discover(client).map((operation) => [operation.label, operation]),
    );
    for (const label of new Set(rows.map(([name]) => name))) {
      const operation = operations.get(label);
      assert.ok(operation !== undefined, label);
      const args = argumentsFor(operation, client);
      args[operation.takesClient ? 1 : 0] = undefined;
      await assert.rejects(
        () => operation.invoke(args),
        (error: unknown) =>
          error instanceof TypeError && /is required\.$/.test(error.message),
        label,
      );
    }
    assert.equal(transport.operations.length, 0, 'no call is made');
  } finally {
    await client.stop();
  }
});
