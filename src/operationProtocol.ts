import { BriosaProtocolError } from './errors.js';

export type OperationValueSchema =
  | {
      readonly kind: 'scalar';
      readonly type:
        | 'number'
        | 'integer'
        | 'unsignedInteger'
        | 'bigint'
        | 'boolean'
        | 'string';
    }
  | { readonly kind: 'enum'; readonly values: readonly (string | null)[] }
  | {
      readonly kind: 'message';
      readonly name: string;
      readonly fields: Readonly<Record<string, OperationMessageField>>;
    }
  | { readonly kind: 'repeated'; readonly item: OperationValueSchema };

interface OperationMessageField {
  readonly schema: OperationValueSchema;
  readonly optional: boolean;
}

export const operationScalarSchemas = Object.freeze({
  number: { kind: 'scalar', type: 'number' },
  integer: { kind: 'scalar', type: 'integer' },
  unsignedInteger: { kind: 'scalar', type: 'unsignedInteger' },
  bigint: { kind: 'scalar', type: 'bigint' },
  boolean: { kind: 'scalar', type: 'boolean' },
  string: { kind: 'scalar', type: 'string' },
} satisfies Record<string, OperationValueSchema>);

export const operationValueSchemas: Record<string, OperationValueSchema> = {
  angularUnits: {
    kind: 'enum',
    values: [
      null,
      'degrees',
      'degreesMinutesSeconds',
      'radians',
      'milliradians',
      'gonsGrad',
      'mils',
      'arcseconds',
      'degreesMinutes',
    ],
  },
  asciiFileFormat: {
    kind: 'enum',
    values: [
      null,
      'xYZ',
      'xYZOffsetOffset2',
      'xYZNotes',
      'radiusThetaPhi',
      'radiusThetaZ',
      'pointNameXYZ',
      'pointNameXYZNotes',
      'pointNameXYZOffsetOffset2',
      'pointNameXYZUxUyUz',
      'pointNameXYZTxTyTzTd',
      'pointNameXYZWxWyWzWmag',
      'pointNameXYZHighLowTolerance',
      'pointNameXYZTxTyTzTdWxWyWz',
      'pointNameXYZWxWyWzTxTyTzTd',
      'pointNameXYZHighLowToleranceWxWyWz',
      'pointNameXYZWxWyWzHighLowTolerance',
      'pointNameRadiusThetaPhi',
      'pointNameRadiusThetaZ',
      'pointNameXYZGroupName',
      'pointNameYXZGroupName',
      'groupNamePointNameXYZ',
      'groupNamePointNameXYZOffsetOffset2',
      'groupNamePointNameXYZNotes',
      'groupNamePointNameXYZUxUyUz',
      'groupNamePointNameRadiusThetaPhi',
      'groupNamePointNameRadiusThetaZ',
      'collectionGroupPointXYZ',
      'collectionGroupPointXYZNotes',
      'collectionGroupPointRadiusThetaPhi',
      'collectionGroupPointRadiusThetaZ',
      'xYZIJK',
      'vectorNameXYZIJK',
      'vectorNameXYZDxDyDzSignedMagnitude',
      'vectorGroupNameVectorNameXYZIJK',
      'vectorGroupNameVectorNameXYZDxDyDzSignedMagnitude',
      'frameNameXYZRxRyRzTimestamp',
      'frameNameXYZEulerXYZTimestamp',
      'frameNameXYZEulerZYXTimestamp',
      'frameNameXYZEulerZYZTimestamp',
      'frameNameXYZEulerZXZTimestamp',
      'frameNameTransformationMatrixTimestamp',
      'transformationMatrixTimestamp',
      'frameNameXYZQuaternionTimestamp',
      'planeNameXYZDxDyDzPlaneSize',
    ],
  },
  chartType: {
    kind: 'enum',
    values: [null, 'runChart', 'individualXMovingRange', 'bullseyeChart'],
  },
  coordinateSystemType: {
    kind: 'enum',
    values: [null, 'cartesian', 'cylindric', 'polar'],
  },
  datasetType: { kind: 'enum', values: [null, 'x', 'y', 'z', 'magnitude'] },
  distanceUnits: {
    kind: 'enum',
    values: [
      null,
      'meters',
      'centimeters',
      'millimeters',
      'feet',
      'inches',
      'usSurveyFeet',
    ],
  },
  exportDataDelimeterType: {
    kind: 'enum',
    values: [null, 'space', 'comma', 'tab'],
  },
  exportTargetNameFormat: {
    kind: 'enum',
    values: [null, 'collectionGroupTarget', 'groupTarget', 'target', 'none'],
  },
  exportVectorNameFormat: {
    kind: 'enum',
    values: [null, 'collectionGroupVector', 'groupVector', 'vector', 'none'],
  },
  baseColorType: { kind: 'enum', values: [null, 'red', 'green', 'blue'] },
  baseMidColorType: {
    kind: 'enum',
    values: [null, 'red', 'green', 'gray', 'blue'],
  },
  colorRangeMethod: {
    kind: 'enum',
    values: [
      null,
      'singleColor',
      'continuous',
      'tolerancedContinuous',
      'tolerancedGoNoGo',
      'tolerancedGoNoGoWithWarning',
      'discreteColors',
    ],
  },
  geometryType: {
    kind: 'enum',
    values: [
      null,
      'line',
      'plane',
      'circle',
      'sphere',
      'cylinder',
      'cone',
      'paraboloid',
      'ellipse',
      'slot',
      'torus',
    ],
  },
  objectType: {
    kind: 'enum',
    values: [
      null,
      'any',
      'bSpline',
      'circle',
      'cloud',
      'enhancedCloud',
      'scanStripeCloud',
      'crossSectionCloud',
      'cone',
      'cylinder',
      'datum',
      'ellipse',
      'frame',
      'frameSet',
      'line',
      'paraboloid',
      'perimeter',
      'plane',
      'pointGroup',
      'pointSet',
      'polySurface',
      'scanStripeMesh',
      'slot',
      'sphere',
      'surface',
      'torus',
      'vectorGroup',
    ],
  },
  itemType: {
    kind: 'enum',
    values: [
      null,
      'any',
      'alignment',
      'annotation',
      'bSpline',
      'calibrationApplianceNode',
      'calloutView',
      'chart',
      'circle',
      'cloud',
      'enhancedCloud',
      'scanStripeCloud',
      'crossSectionCloud',
      'cone',
      'cylinder',
      'datum',
      'dimension',
      'ellipse',
      'event',
      'featureCheck',
      'frame',
      'frameSet',
      'line',
      'paraboloid',
      'perimeter',
      'picture',
      'plane',
      'pointGroup',
      'pointSet',
      'polySurface',
      'relationship',
      'saDoc',
      'saReport',
      'saReportTemplate',
      'scaleBar',
      'scanStripeMesh',
      'slot',
      'sphere',
      'surface',
      'table',
      'tcpFixture',
      'torus',
      'vectorGroup',
    ],
  },
  pointFilterInputType: {
    kind: 'enum',
    values: [null, 'cardinalPoints', 'inputPoints', 'nominalCardinalPoints'],
  },
  relWeightingMode: {
    kind: 'enum',
    values: [
      null,
      'normalizeEquationCount',
      'normalizeEquationCountAndToleranceWidth',
      'resetAllWeights',
      'normalizeSquareRootEquationCount',
      'normalizeSquareRootAndToleranceWidth',
    ],
  },
  renderModeType: {
    kind: 'enum',
    values: [null, 'wireframe', 'hiddenLineRemoved', 'solidAndEdges', 'solid'],
  },
  reportOutputType: {
    kind: 'enum',
    values: [null, 'none', 'saReport', 'saDocument', 'pdf', 'rtf'],
  },
  reportPageSettings: { kind: 'enum', values: [null, 'portrait', 'landscape'] },
  reportViewType: {
    kind: 'enum',
    values: [null, 'none', 'currentView', 'calloutView'],
  },
  surfaceAnalysisMode: {
    kind: 'enum',
    values: [
      null,
      'none',
      'relationship',
      'normals',
      'curvature',
      'deviationRms',
      'deviationMax',
      'deviationAverage',
      'deviationMin',
      'deviationMaxAbsolute',
      'deviationMaxDelta',
      'pseudoSurface',
    ],
  },
  temperatureUnits: { kind: 'enum', values: [null, 'fahrenheit', 'celsius'] },
  translucencyType: {
    kind: 'enum',
    values: [null, 'solid', 'translucent', 'wireframe'],
  },
  compTechnique: {
    kind: 'enum',
    values: [null, 'standard', 'maxInscribed', 'minCircumscribed'],
  },
  degreeOfFreedom: {
    kind: 'enum',
    values: [null, 'any', 'lockFocusLocation', 'lockVertexLocation'],
  },
  fitMethod: { kind: 'enum', values: [null, 'minimumRms', 'bestAxis'] },
  measuredSideForPlanarOffset: {
    kind: 'enum',
    values: [null, 'abovePlane', 'probeCenter', 'belowPlane'],
  },
  measuredSideForRadialOffset: {
    kind: 'enum',
    values: [null, 'inside', 'probeCenter', 'outside'],
  },
  mpDialogInteractionMode: {
    kind: 'enum',
    values: [
      null,
      'blockApplicationInteraction',
      'allowApplicationInteraction',
    ],
  },
  mpInteractionMode: {
    kind: 'enum',
    values: [
      null,
      'haltOnFailureOnly',
      'haltOnFailureOrPartialSuccess',
      'neverHalt',
    ],
  },
  normalDirection: {
    kind: 'enum',
    values: [
      null,
      'probingDirection',
      'workingOriginPositive',
      'rightHandRule',
    ],
  },
  saInteractionMode: {
    kind: 'enum',
    values: [null, 'manual', 'automatic', 'silent'],
  },
  slotType: { kind: 'enum', values: [null, 'round', 'square'] },
  sphereFitComputationMode: {
    kind: 'enum',
    values: [null, 'standard', 'maxInscribed', 'minCircumscribed'],
  },
  windowState: {
    kind: 'enum',
    values: [null, 'maximize', 'minimize', 'restore', 'show', 'hide'],
  },
};

Object.assign(operationValueSchemas, {
  chartName: {
    kind: 'message',
    name: 'ChartName',
    fields: {
      name: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionName: {
    kind: 'message',
    name: 'CollectionName',
    fields: {
      name: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  frameName: {
    kind: 'message',
    name: 'FrameName',
    fields: {
      name: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  viewName: {
    kind: 'message',
    name: 'ViewName',
    fields: {
      name: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  pointName: {
    kind: 'message',
    name: 'PointName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      groupName: { schema: operationScalarSchemas.string, optional: false },
      targetName: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionInstrumentId: {
    kind: 'message',
    name: 'CollectionInstrumentId',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      instrumentId: { schema: operationScalarSchemas.integer, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionGroupName: {
    kind: 'message',
    name: 'CollectionGroupName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      groupName: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionObjectName: {
    kind: 'message',
    name: 'CollectionObjectName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      objectName: { schema: operationScalarSchemas.string, optional: false },
      objectType: {
        schema: getOperationValueSchema('objectType'),
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionItemName: {
    kind: 'message',
    name: 'CollectionItemName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      itemName: { schema: operationScalarSchemas.string, optional: false },
      itemType: { schema: getOperationValueSchema('itemType'), optional: true },
    },
  },
});

Object.assign(operationValueSchemas, {
  collectionVectorGroupName: {
    kind: 'message',
    name: 'CollectionVectorGroupName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      vectorGroupName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  vectorName: {
    kind: 'message',
    name: 'VectorName',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      groupName: { schema: operationScalarSchemas.string, optional: false },
      name: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  vector: {
    kind: 'message',
    name: 'Vector',
    fields: {
      x: { schema: operationScalarSchemas.number, optional: false },
      y: { schema: operationScalarSchemas.number, optional: false },
      z: { schema: operationScalarSchemas.number, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  transform: {
    kind: 'message',
    name: 'Transform',
    fields: {
      values: {
        schema: repeatedOperationValue(operationScalarSchemas.number),
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  worldTransform: {
    kind: 'message',
    name: 'WorldTransform',
    fields: {
      transform: {
        schema: getOperationValueSchema('transform'),
        optional: false,
      },
      scaleFactor: { schema: operationScalarSchemas.number, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  color: {
    kind: 'message',
    name: 'Color',
    fields: {
      red: { schema: operationScalarSchemas.unsignedInteger, optional: false },
      green: {
        schema: operationScalarSchemas.unsignedInteger,
        optional: false,
      },
      blue: { schema: operationScalarSchemas.unsignedInteger, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  colorizationOptions: {
    kind: 'message',
    name: 'ColorizationOptions',
    fields: {
      colorRangeMethod: {
        schema: getOperationValueSchema('colorRangeMethod'),
        optional: false,
      },
      baseHighColor: {
        schema: getOperationValueSchema('baseColorType'),
        optional: false,
      },
      baseMidColor: {
        schema: getOperationValueSchema('baseMidColorType'),
        optional: false,
      },
      baseLowColor: {
        schema: getOperationValueSchema('baseColorType'),
        optional: false,
      },
      drawTubes: { schema: operationScalarSchemas.boolean, optional: false },
      drawArrowheads: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      indicateValues: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      vectorMagnification: {
        schema: operationScalarSchemas.number,
        optional: false,
      },
      vectorWidth: { schema: operationScalarSchemas.integer, optional: false },
      drawBlotches: { schema: operationScalarSchemas.boolean, optional: false },
      blotchSize: { schema: operationScalarSchemas.number, optional: false },
      showOutOfToleranceOnly: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showColorBarInView: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showColorBarPercentages: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showColorBarFractions: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      highSaturationLimit: {
        schema: operationScalarSchemas.number,
        optional: false,
      },
      lowSaturationLimit: {
        schema: operationScalarSchemas.number,
        optional: false,
      },
      highTolerance: { schema: operationScalarSchemas.number, optional: false },
      lowTolerance: { schema: operationScalarSchemas.number, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  fileReference: {
    kind: 'message',
    name: 'FileReference',
    fields: {
      path: { schema: operationScalarSchemas.string, optional: false },
      embeddedFile: { schema: operationScalarSchemas.boolean, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  font: {
    kind: 'message',
    name: 'Font',
    fields: {
      fontName: { schema: operationScalarSchemas.string, optional: false },
      size: { schema: operationScalarSchemas.unsignedInteger, optional: false },
      color: { schema: getOperationValueSchema('color'), optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  scalarToleranceLimit: {
    kind: 'message',
    name: 'ScalarToleranceLimit',
    fields: {
      enabled: { schema: operationScalarSchemas.boolean, optional: false },
      value: { schema: operationScalarSchemas.number, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  toleranceLimit: {
    kind: 'message',
    name: 'ToleranceLimit',
    fields: {
      enabled: { schema: operationScalarSchemas.boolean, optional: false },
      value: { schema: operationScalarSchemas.number, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  toleranceVectorOptions: {
    kind: 'message',
    name: 'ToleranceVectorOptions',
    fields: {
      highX: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      highY: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      highZ: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      highMagnitude: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      lowX: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      lowY: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      lowZ: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
      lowMagnitude: {
        schema: getOperationValueSchema('toleranceLimit'),
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  fitConstraintScalarOptions: {
    kind: 'message',
    name: 'FitConstraintScalarOptions',
    fields: {
      high: {
        schema: getOperationValueSchema('scalarToleranceLimit'),
        optional: false,
      },
      low: {
        schema: getOperationValueSchema('scalarToleranceLimit'),
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  toleranceScalarOptions: {
    kind: 'message',
    name: 'ToleranceScalarOptions',
    fields: {
      high: {
        schema: getOperationValueSchema('scalarToleranceLimit'),
        optional: false,
      },
      low: {
        schema: getOperationValueSchema('scalarToleranceLimit'),
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  embeddedReportFile: {
    kind: 'message',
    name: 'EmbeddedReportFile',
    fields: {
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      fileName: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  reportOutputOptions: {
    kind: 'message',
    name: 'ReportOutputOptions',
    fields: {
      outputType: {
        schema: getOperationValueSchema('reportOutputType'),
        optional: false,
      },
      externalPath: { schema: operationScalarSchemas.string, optional: true },
      embeddedFile: {
        schema: getOperationValueSchema('embeddedReportFile'),
        optional: true,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  reportViewOptions: {
    kind: 'message',
    name: 'ReportViewOptions',
    fields: {
      viewType: {
        schema: getOperationValueSchema('reportViewType'),
        optional: false,
      },
      collectionName: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      calloutName: { schema: operationScalarSchemas.string, optional: false },
    },
  },
});

Object.assign(operationValueSchemas, {
  projectionOptions: {
    kind: 'message',
    name: 'ProjectionOptions',
    fields: {
      projectionType: {
        schema: operationScalarSchemas.string,
        optional: false,
      },
      ignoreEdgeProjections: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      overrideTargetOffsets: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      overrideTargetOffsetsValue: {
        schema: operationScalarSchemas.number,
        optional: false,
      },
      addExtraMaterialThickness: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      extraMaterialThicknessValue: {
        schema: operationScalarSchemas.number,
        optional: false,
      },
    },
  },
});

Object.assign(operationValueSchemas, {
  pointDeltaReportOptions: {
    kind: 'message',
    name: 'PointDeltaReportOptions',
    fields: {
      coordinateSystem: {
        schema: getOperationValueSchema('coordinateSystemType'),
        optional: false,
      },
      detailsFormat: { schema: operationScalarSchemas.string, optional: false },
      showPointA: { schema: operationScalarSchemas.boolean, optional: false },
      showPointB: { schema: operationScalarSchemas.boolean, optional: false },
      showDelta: { schema: operationScalarSchemas.boolean, optional: false },
      showMagnitude: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showComponent1: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showComponent2: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showComponent3: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      sortPointNames: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      showToleranceFields: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
      colorizeInToleranceFields: {
        schema: operationScalarSchemas.boolean,
        optional: false,
      },
    },
  },
});

Object.freeze(operationValueSchemas);

export function getOperationValueSchema(name: string): OperationValueSchema {
  const schema = operationValueSchemas[name];
  if (schema === undefined)
    throw new Error(`Unknown operation value schema: ${name}`);
  return schema;
}

export function repeatedOperationValue(
  item: OperationValueSchema,
): OperationValueSchema {
  return { kind: 'repeated', item };
}

export function requireOperationInput(value: unknown, name: string): unknown {
  if (value === undefined || value === null)
    throw new TypeError(`${name} is required.`);
  return value;
}

export function resolveOperationDefault<T>(
  value: T | undefined | null,
  fallback: T,
  name: string,
): T {
  if (value === null) throw new TypeError(`${name} cannot be null.`);
  return value === undefined ? fallback : value;
}

export function toWireOperationValue(
  schema: OperationValueSchema,
  value: unknown,
): unknown {
  switch (schema.kind) {
    case 'scalar':
      try {
        return validateScalar(schema.type, value);
      } catch (cause) {
        throw new BriosaProtocolError('invalid-scalar-value', { cause });
      }
    case 'enum': {
      if (typeof value !== 'string')
        throw new TypeError('MP choice must be a string value.');
      const index = schema.values.indexOf(value);
      if (index <= 0) throw new RangeError(`Unknown MP choice: ${value}`);
      return index;
    }
    case 'repeated': {
      if (
        typeof value === 'string' ||
        value === null ||
        value === undefined ||
        typeof (value as Iterable<unknown>)[Symbol.iterator] !== 'function'
      ) {
        throw new TypeError(
          'MP collection input must be a finite non-string iterable.',
        );
      }
      return Array.from(value as Iterable<unknown>, (item) =>
        toWireOperationValue(schema.item, item),
      );
    }
    case 'message': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new TypeError(`${schema.name} must be an object.`);
      }
      const source = value as Readonly<Record<string, unknown>>;
      const result: Record<string, unknown> = {};
      for (const [name, field] of Object.entries(schema.fields)) {
        const fieldValue = source[name];
        if (fieldValue === undefined) {
          if (field.optional) continue;
          throw new TypeError(`${schema.name}.${name} is required.`);
        }
        result[name] = toWireOperationValue(field.schema, fieldValue);
      }
      validateStructuredValue(schema.name, result);
      return result;
    }
  }
}

export function mapOperationResponse(
  response: Readonly<Record<string, unknown>>,
  outputs: readonly (readonly [string, OperationValueSchema, string?])[],
): unknown {
  if (outputs.length === 0) return undefined;
  if (outputs.length === 1) {
    const [name, schema] = outputs[0]!;
    return fromWireOperationValue(schema, requireOutput(response[name], name));
  }
  return Object.fromEntries(
    outputs.map(([name, schema, publicName]) => [
      publicName ?? name,
      fromWireOperationValue(schema, requireOutput(response[name], name)),
    ]),
  );
}

function fromWireOperationValue(
  schema: OperationValueSchema,
  value: unknown,
): unknown {
  switch (schema.kind) {
    case 'scalar':
      return validateScalar(schema.type, value);
    case 'enum': {
      if (!Number.isInteger(value) || typeof value !== 'number' || value <= 0) {
        throw new BriosaProtocolError('unknown-enum-value');
      }
      const mapped = schema.values[value];
      if (mapped === null || mapped === undefined)
        throw new BriosaProtocolError('unknown-enum-value');
      return mapped;
    }
    case 'repeated':
      if (!Array.isArray(value))
        throw new BriosaProtocolError('operation-output-shape-drift');
      return value.map((item) => fromWireOperationValue(schema.item, item));
    case 'message': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new BriosaProtocolError('operation-output-shape-drift');
      }
      const source = value as Readonly<Record<string, unknown>>;
      const result: Record<string, unknown> = {};
      for (const [name, field] of Object.entries(schema.fields)) {
        const fieldValue = source[name];
        if (fieldValue === undefined) {
          if (field.optional) continue;
          throw new BriosaProtocolError(
            `required-domain-field-missing:${name}`,
          );
        }
        result[name] = fromWireOperationValue(field.schema, fieldValue);
      }
      try {
        validateStructuredValue(schema.name, result);
      } catch (cause) {
        throw new BriosaProtocolError('invalid-domain-value', { cause });
      }
      return result;
    }
  }
}

function validateScalar(
  type: Extract<OperationValueSchema, { kind: 'scalar' }>['type'],
  value: unknown,
): unknown {
  if (type === 'bigint') {
    if (typeof value !== 'bigint')
      throw new TypeError('MP 64-bit integer must be a bigint.');
    return value;
  }
  if (type === 'boolean' || type === 'string') {
    if (typeof value !== type)
      throw new TypeError(`MP value must be a ${type}.`);
    return value;
  }
  if (typeof value !== 'number' || !Number.isFinite(value))
    throw new TypeError('MP numeric value must be finite.');
  if (
    (type === 'integer' || type === 'unsignedInteger') &&
    !Number.isInteger(value)
  )
    throw new TypeError('MP integer value must be integral.');
  if (type === 'unsignedInteger' && value < 0)
    throw new RangeError('MP unsigned value cannot be negative.');
  return value;
}

function validateStructuredValue(
  name: string,
  value: Readonly<Record<string, unknown>>,
): void {
  if (
    name === 'Transform' &&
    (value.values as readonly unknown[]).length !== 16
  ) {
    throw new RangeError('Transform.values must contain exactly 16 values.');
  }
  if (name === 'Color') {
    for (const channel of ['red', 'green', 'blue'] as const) {
      const current = value[channel] as number;
      if (current > 255)
        throw new RangeError('Color channels must be in 0..255.');
    }
  }
  if (
    name === 'ReportOutputOptions' &&
    value.externalPath !== undefined &&
    value.embeddedFile !== undefined
  ) {
    throw new TypeError('Only one report-output destination may be supplied.');
  }
}

function requireOutput(value: unknown, name: string): unknown {
  if (value === undefined)
    throw new BriosaProtocolError(`required-output-missing:${name}`);
  return value;
}
