// Contract major 3 request rules (briosa admission-profile-migration.md and
// argument-defaults-migration.md). The shared conformance scenarios do not
// exercise these mappings, so each rule is pinned on the built request as the
// wire sees it.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BriosaProtocolError,
  ChartType,
  DatasetType,
  GeometryType,
  ItemType,
  ObjectType,
  ToleranceVectorOptions,
  createChartFromVectorGroup,
  deleteFolder,
  deleteIthVectorFromVectorGroup,
  deleteVariable,
  deleteVariablesWildcardMatch,
  deleteVectorByName,
  directCadAccess,
  fitGeometryToPointGroup,
  fitGeometryToPointGroupProjectedToPlane,
  fitGeometryToPoints,
  makeGroupToGroupRelationship,
  makeGroupToNominalGroupRelationship,
  makePointToPointRelationship,
  makePointsToPointsRelationship,
  removeReportTag,
  scaleObjects,
  setUserInterfaceProfile,
  type BriosaClient,
  type CollectionObjectName,
  type PointName,
} from '../src/index.js';
import { startedClient, succeeded } from './support/fakes.js';

type Wire = Record<string, unknown>;
type Call = (client: BriosaClient) => Promise<unknown>;

const instrument = { collectionName: 'Inspection', instrumentId: 1 };
const machine = { collectionName: 'Robots', machineId: 1 };

function objectName(
  name: string,
  objectType: (typeof ObjectType)[keyof typeof ObjectType] = ObjectType.pointGroup,
): CollectionObjectName {
  return { collectionName: 'Inspection', objectName: name, objectType };
}

function point(targetName: string): PointName {
  return { collectionName: 'Inspection', groupName: 'Measured', targetName };
}

const calloutView = {
  collectionName: 'Inspection',
  itemName: 'View 1',
  itemType: ItemType.calloutView,
};

/**
 * Sends one call through a started client and returns the wire request. The
 * scripted response carries no outputs, so a mapping failure after the request
 * was sent is expected and ignored here.
 */
async function sent(call: Call): Promise<Wire> {
  const { client, transport } = await startedClient();
  transport.respond = () => ({ execution: succeeded() });
  try {
    try {
      await call(client);
    } catch (error) {
      if (
        !(error instanceof BriosaProtocolError) ||
        transport.operations.length === 0
      )
        throw error;
    }
    return transport.lastWireRequest();
  } finally {
    await client.stop();
  }
}

/** Requires that the call fails in the client, before any RPC. */
async function rejectedBeforeCall(call: Call, name: string): Promise<void> {
  const { client, transport } = await startedClient();
  try {
    await assert.rejects(
      () => call(client),
      (error: unknown) =>
        error instanceof TypeError && error.message === `${name} is required.`,
    );
    assert.equal(transport.operations.length, 0, `${name}: no call is made`);
  } finally {
    await client.stop();
  }
}

// The ten reviewed request defaults that #297 flipped so that waiting is the
// default. The old values now need the interactive opt-in or are never admitted.
const flippedDefaults: readonly (readonly [
  string,
  string,
  boolean,
  (client: BriosaClient, override: Record<string, boolean>) => Promise<unknown>,
])[] = [
  [
    'direct_cad_access',
    'promptOnMissingComponents',
    false,
    (client, override) =>
      directCadAccess(client, {
        cadFileName: { path: 'C:\\Parts\\part.step', embeddedFile: false },
        // Required on SA 2024, optional on SA 2026.
        surfaceCompatibilityMode: false,
        ...override,
      }),
  ],
  [
    'auto_measure_points',
    'autoStart',
    true,
    (client, override) =>
      client.instrumentOperations.autoMeasurePoints({
        instrument,
        referenceGroup: objectName('Reference'),
        actualsGroup: objectName('Actuals'),
        ...override,
      }),
  ],
  [
    'auto_measure_specified_geometry',
    'waitForComplete',
    true,
    (client, override) =>
      client.instrumentOperations.autoMeasureSpecifiedGeometry({
        instrument,
        geometry: objectName('Plane 1', ObjectType.plane),
        modeProfile: 'Default',
        ...override,
      }),
  ],
  [
    'configure_and_measure',
    'measureImmediately',
    true,
    (client, override) =>
      client.instrumentOperations.configureAndMeasure({
        instrument,
        target: point('P1'),
        measurementMode: 'Single Point',
        ...override,
      }),
  ],
  [
    'measure_existing_single_point',
    'measureImmediately',
    true,
    (client, override) =>
      client.instrumentOperations.measureExistingSinglePoint({
        instrument,
        existingTargetId: point('P1'),
        groupNameForNewPoint: objectName('New'),
        ...override,
      }),
  ],
  [
    'measure_existing_single_point_and_compare',
    'measureImmediately',
    true,
    (client, override) =>
      client.instrumentOperations.measureExistingSinglePointAndCompare({
        instrument,
        existingTargetId: point('P1'),
        groupNameForNewPoint: objectName('New'),
        ...override,
      }),
  ],
  [
    'measure_existing_single_point_manual_guide',
    'measureImmediately',
    true,
    (client, override) =>
      client.instrumentOperations.measureExistingSinglePointManualGuide({
        instrument,
        existingTargetId: point('P1'),
        groupNameForNewPoint: objectName('New'),
        ...override,
      }),
  ],
  [
    'measure_single_point_here',
    'measureImmediately',
    true,
    (client, override) =>
      client.instrumentOperations.measureSinglePointHere({
        instrument,
        targetId: point('P1'),
        ...override,
      }),
  ],
  [
    'move_robot_machine_to_frame',
    'acknowledgeArrival',
    true,
    (client, override) =>
      client.robotOperations.moveRobotMachineToFrame({
        machineId: machine,
        destinationFrame: objectName('Home', ObjectType.frame),
        ...override,
      }),
  ],
  [
    'move_robot_machine_to_named_destination',
    'acknowledgeArrival',
    true,
    (client, override) =>
      client.robotOperations.moveRobotMachineToNamedDestination({
        machineId: machine,
        ...override,
      }),
  ],
];

for (const [operation, field, value, call] of flippedDefaults) {
  void test(`${operation} sends ${field}=${String(value)} by default and keeps an explicit value`, async () => {
    assert.equal((await sent((client) => call(client, {})))[field], value);
    assert.equal(
      (await sent((client) => call(client, { [field]: !value })))[field],
      !value,
    );
  });
}

void test('an omitted template chart, profile file or fit seed leaves the field unset', async () => {
  const chart = {
    newChartName: { name: 'New Chart' },
    vectorGroupName: objectName('Vectors', ObjectType.vectorGroup),
    chartType: ChartType.runChart,
    dataSetToChart: DatasetType.x,
    auxDataSetToChart: DatasetType.magnitude,
  };
  assert.equal(
    (await sent((client) => createChartFromVectorGroup(client, chart)))
      .templateChartName,
    undefined,
  );
  assert.deepEqual(
    (
      await sent((client) =>
        createChartFromVectorGroup(client, {
          ...chart,
          templateChartName: { name: 'Template' },
        }),
      )
    ).templateChartName,
    { name: 'Template' },
  );

  assert.equal(
    (await sent((client) => setUserInterfaceProfile(client, {})))
      .profileFileName,
    undefined,
  );
  assert.deepEqual(
    (
      await sent((client) =>
        setUserInterfaceProfile(client, {
          profileFileName: { path: 'C:\\Profiles\\a.xml', embeddedFile: false },
        }),
      )
    ).profileFileName,
    { path: 'C:\\Profiles\\a.xml', embeddedFile: false },
  );

  const seed = objectName('Seed', ObjectType.plane);
  const fits: readonly ((
    client: BriosaClient,
    seedOverride: { startingConditionGeometry?: CollectionObjectName },
  ) => Promise<unknown>)[] = [
    (client, seedOverride) =>
      fitGeometryToPointGroup(client, {
        geometryType: GeometryType.plane,
        groupToFit: objectName('Group'),
        resultingObjectName: objectName('Plane', ObjectType.plane),
        ...seedOverride,
      }),
    (client, seedOverride) =>
      fitGeometryToPoints(client, {
        geometryType: GeometryType.plane,
        pointsToFit: [point('P1'), point('P2'), point('P3')],
        resultingObjectName: objectName('Plane', ObjectType.plane),
        ...seedOverride,
      }),
    (client, seedOverride) =>
      fitGeometryToPointGroupProjectedToPlane(client, {
        geometryType: GeometryType.circle,
        groupToFit: objectName('Group'),
        planeName: objectName('Plane', ObjectType.plane),
        resultingObjectName: objectName('Circle', ObjectType.circle),
        ...seedOverride,
      }),
  ];
  for (const fit of fits) {
    assert.equal(
      (await sent((client) => fit(client, {}))).startingConditionGeometry,
      undefined,
    );
    assert.deepEqual(
      (await sent((client) => fit(client, { startingConditionGeometry: seed })))
        .startingConditionGeometry,
      { ...seed, objectType: 17 },
    );
  }
});

void test('the already optional plane names and nominals group stay unset when omitted', async () => {
  const bounding = await sent((client) =>
    client.constructionOperations.constructPlanesBoundingPointGroup({
      referencePlaneName: objectName('Reference', ObjectType.plane),
      groupToBound: objectName('Group'),
    }),
  );
  assert.equal(bounding.resultingHighPlaneName, undefined);
  assert.equal(bounding.resultingLowPlaneName, undefined);
  const usmn = await sent((client) =>
    client.instrumentOperations.locateInstrumentsUsmn({
      instruments: [instrument],
      outputGroup: objectName('Output'),
    }),
  );
  assert.equal(usmn.nominalsGroup, undefined);
});

const relationships: readonly (readonly [
  string,
  (
    client: BriosaClient,
    options: Partial<
      Record<'tolerance' | 'constraint', ToleranceVectorOptions>
    >,
  ) => Promise<unknown>,
])[] = [
  [
    'make_group_to_group_relationship',
    (client, options) =>
      makeGroupToGroupRelationship(client, {
        relationshipName: {
          collectionName: 'Inspection',
          itemName: 'R1',
          itemType: ItemType.relationship,
        },
        firstGroupName: objectName('First'),
        secondGroupName: objectName('Second'),
        ...options,
      } as never),
  ],
  [
    'make_group_to_nominal_group_relationship',
    (client, options) =>
      makeGroupToNominalGroupRelationship(client, {
        relationshipName: {
          collectionName: 'Inspection',
          itemName: 'R1',
          itemType: ItemType.relationship,
        },
        nominalGroupName: objectName('Nominal'),
        measuredGroupName: objectName('Measured'),
        ...options,
      } as never),
  ],
  [
    'make_point_to_point_relationship',
    (client, options) =>
      makePointToPointRelationship(client, {
        relationshipName: {
          collectionName: 'Inspection',
          itemName: 'R1',
          itemType: ItemType.relationship,
        },
        firstPointName: point('P1'),
        secondPointName: point('P2'),
        ...options,
      } as never),
  ],
  [
    'make_points_to_points_relationship',
    (client, options) =>
      makePointsToPointsRelationship(client, {
        relationshipName: {
          collectionName: 'Inspection',
          itemName: 'R1',
          itemType: ItemType.relationship,
        },
        nominalPoints: [point('N1')],
        measuredPoints: [point('M1')],
        ...options,
      } as never),
  ],
];

for (const [operation, call] of relationships) {
  void test(`${operation} requires a tolerance and a constraint, with no implicit default`, async () => {
    const noLimits = ToleranceVectorOptions.noLimits;
    await rejectedBeforeCall(
      (client) => call(client, { constraint: noLimits }),
      'tolerance',
    );
    await rejectedBeforeCall(
      (client) => call(client, { tolerance: noLimits }),
      'constraint',
    );
    const wire = await sent((client) =>
      call(client, { tolerance: noLimits, constraint: noLimits }),
    );
    for (const field of ['tolerance', 'constraint'] as const) {
      const limits = wire[field] as Record<string, { enabled?: boolean }>;
      assert.deepEqual(Object.keys(limits).sort(), [
        'highMagnitude',
        'highX',
        'highY',
        'highZ',
        'lowMagnitude',
        'lowX',
        'lowY',
        'lowZ',
      ]);
      for (const limit of Object.values(limits))
        assert.equal(limit.enabled, false);
    }
  });
}

void test('the named all-disabled tolerance options are frozen and disable all eight limits', () => {
  const noLimits = ToleranceVectorOptions.noLimits;
  assert.ok(Object.isFrozen(noLimits));
  assert.equal(Object.keys(noLimits).length, 8);
  for (const limit of Object.values(noLimits)) {
    assert.ok(Object.isFrozen(limit));
    assert.deepEqual(limit, { enabled: false, value: 0 });
  }
});

// R1 to R7 (argument-defaults.md, rule 6): an absent field is rejected, so
// the client requires it and never fills in 0, false or an empty string.
const requiredFields: readonly (readonly [
  string,
  Wire,
  string,
  unknown,
  (client: BriosaClient, input: Wire) => Promise<unknown>,
])[] = [
  ...(
    ['joint1', 'joint2', 'joint3', 'joint4', 'joint5', 'joint6'] as const
  ).map(
    (joint) =>
      [
        'move_robot_machine_to_joint_pose_six_dof',
        {
          machineId: machine,
          joint1: 0,
          joint2: 0,
          joint3: 0,
          joint4: 0,
          joint5: 0,
          joint6: 0,
        },
        joint,
        0,
        (client: BriosaClient, input: Wire) =>
          client.robotOperations.moveRobotMachineToJointPoseSixDof(
            input as never,
          ),
      ] as const,
  ),
  [
    'set_instrument_weather_setting',
    { instrument, setAutomatically: false },
    'setAutomatically',
    false,
    (client, input) =>
      client.instrumentOperations.setInstrumentWeatherSetting(input as never),
  ],
  [
    'scale_objects',
    { objects: [objectName('Group')], scaleFactor: 0 },
    'scaleFactor',
    0,
    (client, input) => scaleObjects(client, input as never),
  ],
  [
    'set_absolute_instrument_scale_factor',
    { instrument, scaleFactor: 0 },
    'scaleFactor',
    0,
    (client, input) =>
      client.instrumentOperations.setAbsoluteInstrumentScaleFactor(
        input as never,
      ),
  ],
  [
    'set_multiply_instrument_scale_factor',
    { instrument, scaleFactor: 0 },
    'scaleFactor',
    0,
    (client, input) =>
      client.instrumentOperations.setMultiplyInstrumentScaleFactor(
        input as never,
      ),
  ],
  [
    'set_robot_machine_parameter',
    { machineId: machine, parameterName: 'Speed', parameterValue: 0 },
    'parameterValue',
    0,
    (client, input) =>
      client.robotOperations.setRobotMachineParameter(input as never),
  ],
  [
    'delete_measurement_observation',
    { pointName: point('P1'), observationIndex: 0 },
    'observationIndex',
    0,
    (client, input) =>
      client.instrumentOperations.deleteMeasurementObservation(input as never),
  ],
  [
    'move_measurement_observation',
    {
      sourcePointName: point('P1'),
      destinationPointName: point('P2'),
      observationIndex: 0,
    },
    'observationIndex',
    0,
    (client, input) =>
      client.instrumentOperations.moveMeasurementObservation(input as never),
  ],
  [
    'delete_ith_vector_from_vector_group',
    {
      vectorGroupName: objectName('Vectors', ObjectType.vectorGroup),
      vectorIndex: 0,
    },
    'vectorIndex',
    0,
    (client, input) => deleteIthVectorFromVectorGroup(client, input as never),
  ],
  [
    'delete_folder',
    { folderPath: '' },
    'folderPath',
    '',
    (client, input) => deleteFolder(client, input as never),
  ],
  [
    'delete_variable',
    { name: '' },
    'name',
    '',
    (client, input) => deleteVariable(client, input as never),
  ],
  [
    'delete_variables_wildcard_match',
    { variableWildcardCriteria: '' },
    'variableWildcardCriteria',
    '',
    (client, input) => deleteVariablesWildcardMatch(client, input as never),
  ],
  [
    'delete_vector_by_name',
    {
      vectorGroupName: objectName('Vectors', ObjectType.vectorGroup),
      vectorName: '',
    },
    'vectorName',
    '',
    (client, input) => deleteVectorByName(client, input as never),
  ],
  [
    'delete_collections_by_wildcard',
    { searchString: '' },
    'searchString',
    '',
    (client, input) =>
      client.constructionOperations.deleteCollectionsByWildcard(input as never),
  ],
  [
    'delete_folders_by_wildcard',
    { searchString: '' },
    'searchString',
    '',
    (client, input) =>
      client.constructionOperations.deleteFoldersByWildcard(input as never),
  ],
  [
    'delete_robot_calibration',
    { machineId: machine, calibrationName: '' },
    'calibrationName',
    '',
    (client, input) =>
      client.robotOperations.deleteRobotCalibration(input as never),
  ],
  [
    'remove_report_tag',
    { tagName: '' },
    'tagName',
    '',
    (client, input) => removeReportTag(client, input as never),
  ],
];

for (const [operation, input, field, explicit, call] of requiredFields) {
  void test(`${operation} requires ${field} and sends an explicit ${JSON.stringify(explicit)}`, async () => {
    const omitted: Wire = { ...input };
    delete omitted[field];
    await rejectedBeforeCall((client) => call(client, omitted), field);
    // An explicit zero, false or empty value is the caller's choice; the
    // server, not the client, rejects an empty name.
    assert.equal(
      (await sent((client) => call(client, input)))[field],
      explicit,
    );
  });
}

void test('the weather values have no zero default whatever set_automatically is', async () => {
  for (const setAutomatically of [true, false]) {
    const wire = await sent((client) =>
      client.instrumentOperations.setInstrumentWeatherSetting({
        instrument,
        setAutomatically,
      }),
    );
    assert.equal(wire.setAutomatically, setAutomatically);
    assert.equal(wire.temperature, undefined);
    assert.equal(wire.pressure, undefined);
    assert.equal(wire.relativeHumidity, undefined);
  }
  const explicit = await sent((client) =>
    client.instrumentOperations.setInstrumentWeatherSetting({
      instrument,
      setAutomatically: false,
      temperature: 0,
      pressure: 760,
      relativeHumidity: 45,
    }),
  );
  assert.equal(explicit.temperature, 0);
  assert.equal(explicit.pressure, 760);
  assert.equal(explicit.relativeHumidity, 45);
});

const modelLinkParameters = [
  'dhAlphaComponent',
  'dhAComponent',
  'dhDComponent',
  'dhThetaComponent',
  'dhXAxisDeflectionFactor',
  'dhYAxisDeflectionFactor',
  'dhZAxisDeflectionFactor',
  'sixDofXComponent',
  'sixDofYComponent',
  'sixDofZComponent',
  'sixDofRxComponent',
  'sixDofRyComponent',
  'sixDofRzComponent',
  'encoderOffsetValue',
  'minimumEncoderLimit',
  'maximumEncoderLimit',
  'encoderSenseNegative',
  'includeAdditionalEncoder',
  'additionalEncoderIndexOffset',
  'additionalEncoderSenseNegative',
  'segmentOriginMassKg',
  'segmentCgMassKg',
] as const;

void test('the model-link configuration and its 22 parameters are required', async () => {
  const configuration: Record<string, unknown> = Object.fromEntries(
    modelLinkParameters.map((name) => [
      name,
      /Negative|Encoder$/.test(name) ? false : 0,
    ]),
  );
  const call = (client: BriosaClient, input: Wire): Promise<unknown> =>
    client.robotOperations.setRobotMachineModelLinkParameters(input as never);
  await rejectedBeforeCall(
    (client) => call(client, { machineId: machine, linkName: 'Link 1' }),
    'configuration',
  );
  for (const name of modelLinkParameters) {
    const partial = { ...configuration };
    delete partial[name];
    await rejectedBeforeCall(
      (client) =>
        call(client, {
          machineId: machine,
          linkName: 'Link 1',
          configuration: partial,
        }),
      name,
    );
  }
  const wire = await sent((client) =>
    call(client, {
      machineId: machine,
      linkName: 'Link 1',
      configuration,
    }),
  );
  for (const name of modelLinkParameters)
    assert.equal(wire[name], configuration[name], name);
});

void test('the USMN excluded groups stay optional and are sent empty when omitted', async () => {
  const omitted = await sent((client) =>
    client.instrumentOperations.locateInstrumentsUsmn({
      instruments: [instrument],
      outputGroup: objectName('Output'),
    }),
  );
  assert.deepEqual(omitted.excludedGroups, []);
  const explicit = await sent((client) =>
    client.instrumentOperations.locateInstrumentsUsmn({
      instruments: [instrument],
      outputGroup: objectName('Output'),
      excludedGroups: [objectName('Excluded')],
    }),
  );
  assert.deepEqual(explicit.excludedGroups, [
    { ...objectName('Excluded'), objectType: 18 },
  ]);
});

void test('the quick-fit other objects are required and an explicit list is sent', async () => {
  const quickFit = {
    instrument,
    measuredGroup: objectName('Measured'),
    surfacePointsGroup: objectName('Surface Points'),
    surfaceToFit: objectName('Surface', ObjectType.surface),
  };
  const call = (client: BriosaClient, input: Wire): Promise<unknown> =>
    client.instrumentOperations.locateInstrumentGroupToSurfaceQuickFit(
      input as never,
    );
  await rejectedBeforeCall(
    (client) => call(client, quickFit),
    'otherObjectsToTransform',
  );
  assert.deepEqual(
    (
      await sent((client) =>
        call(client, { ...quickFit, otherObjectsToTransform: [] }),
      )
    ).otherObjectsToTransform,
    [],
  );
});

void test('the four Feature Inspection Auto Filter lists are required', async () => {
  const lists = {
    pointNames: [point('P1')],
    groupNames: [objectName('Group')],
    cloudNames: [objectName('Cloud', ObjectType.cloud)],
    featureCheckNameList: [
      {
        collectionName: 'Inspection',
        itemName: 'Check 1',
        itemType: ItemType.featureCheck,
      },
    ],
  };
  const call = (client: BriosaClient, input: unknown): Promise<unknown> =>
    client.gdtOperations.featureInspectionAutoFilter(input as never);
  await rejectedBeforeCall((client) => call(client, undefined), 'input');
  for (const name of Object.keys(lists)) {
    const partial: Wire = { ...lists };
    delete partial[name];
    await rejectedBeforeCall((client) => call(client, partial), name);
  }
  const wire = await sent((client) => call(client, lists));
  assert.equal((wire.pointNames as unknown[]).length, 1);
  assert.equal((wire.featureCheckNameList as unknown[]).length, 1);
});

void test('omitted callout notes and Quick Align lists are sent empty', async () => {
  const notes = await sent((client) =>
    client.constructionOperations.createPointCallout({
      destinationCalloutView: calloutView,
      point: point('P1'),
    }),
  );
  assert.deepEqual(notes.notes, []);
  const additional = await sent((client) =>
    client.constructionOperations.createRelationshipCallout({
      destinationCalloutView: calloutView,
      relationshipName: {
        collectionName: 'Inspection',
        itemName: 'R1',
        itemType: ItemType.relationship,
      },
    }),
  );
  assert.deepEqual(additional.additionalNotes, []);
  const quickAlign = await sent((client) =>
    client.instrumentOperations.quickAlign({
      instruments: [instrument],
      objects: [objectName('Surface', ObjectType.surface)],
    }),
  );
  assert.deepEqual(quickAlign.nominalPoints, []);
  assert.deepEqual(quickAlign.nominalPointOfViewNames, []);
});

void test('the quick-fit result maps maximum_absolute_error to maximumError', async () => {
  const { client, transport } = await startedClient();
  transport.respond = () => ({
    rmsError: 0.012,
    maximumAbsoluteError: 0.034,
    execution: succeeded(),
  });
  assert.deepEqual(
    await client.instrumentOperations.locateInstrumentGroupToSurfaceQuickFit({
      instrument,
      measuredGroup: objectName('Measured'),
      surfacePointsGroup: objectName('Surface Points'),
      surfaceToFit: objectName('Surface', ObjectType.surface),
      otherObjectsToTransform: [],
    }),
    { rmsError: 0.012, maximumError: 0.034 },
  );
  await client.stop();
});

// The required inputs are compile errors too, never silent defaults.
export function compileTimeRules(client: BriosaClient): void {
  // @ts-expect-error The joints are required at contract major 3.
  void client.robotOperations.moveRobotMachineToJointPoseSixDof({
    machineId: machine,
  });
  // @ts-expect-error The tolerance and constraint are required.
  void makePointToPointRelationship(client, {
    relationshipName: {
      collectionName: 'Inspection',
      itemName: 'R1',
      itemType: ItemType.relationship,
    },
    firstPointName: point('P1'),
    secondPointName: point('P2'),
  });
  // @ts-expect-error The Auto Filter lists are required.
  void client.gdtOperations.featureInspectionAutoFilter({});
  // @ts-expect-error The quick-fit other objects are required.
  void client.instrumentOperations.locateInstrumentGroupToSurfaceQuickFit({
    instrument,
    measuredGroup: objectName('Measured'),
    surfacePointsGroup: objectName('Surface Points'),
    surfaceToFit: objectName('Surface', ObjectType.surface),
  });
  // @ts-expect-error set_automatically is required.
  void client.instrumentOperations.setInstrumentWeatherSetting({ instrument });
}
