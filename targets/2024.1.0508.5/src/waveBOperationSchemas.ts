// Wave B public-value schemas for the handwritten operation mapper.
import type { OperationValueSchema } from './operationProtocol.js';

type RegisterSchema = (name: string, schema: OperationValueSchema) => void;
type GetSchema = (name: string) => OperationValueSchema;
interface ScalarSchemas {
  readonly number: OperationValueSchema;
  readonly integer: OperationValueSchema;
  readonly unsignedInteger: OperationValueSchema;
  readonly bigint: OperationValueSchema;
  readonly boolean: OperationValueSchema;
  readonly string: OperationValueSchema;
}

export function registerWaveBOperationValueSchemas(
  register: RegisterSchema,
  get: GetSchema,
  scalars: ScalarSchemas,
): void {
  const repeatedOperationValue = (
    item: OperationValueSchema,
  ): OperationValueSchema => ({ kind: 'repeated', item });
  register('axisIdentifier', {
    kind: 'enum',
    values: [
      null,
      'positive-x',
      'negative-x',
      'positive-y',
      'negative-y',
      'positive-z',
      'negative-z',
    ],
  });
  register('bSplinePointSortMode', {
    kind: 'enum',
    values: [
      null,
      'use_selection_order',
      'closest_neighbors_from_first_selection',
      'closest_neighbors_in_curve_direction',
    ],
  });
  register('circleLineMode', {
    kind: 'enum',
    values: [null, 'circle', 'line'],
  });
  register('cloudBoxType', {
    kind: 'enum',
    values: [
      null,
      'worldAxisAlignedBox',
      'workAxisAlignedBox',
      'minimumOrientedBoxUnconditional',
      'minimumOrientedBoxVerifyVolume',
    ],
  });
  register('cloudThinningMode', {
    kind: 'enum',
    values: [null, 'None', 'Random', 'Nth Point'],
  });
  register('collimationBaselineMethod', {
    kind: 'enum',
    values: [
      null,
      'Determined By Value',
      'Determined From Scale',
      'Determined From Known Point',
    ],
  });
  register('collimationTiltMode', {
    kind: 'enum',
    values: [null, 'Full Collimation', 'No-Tilt Collimation'],
  });
  register('constructObjectType', {
    kind: 'enum',
    values: [
      null,
      'any',
      'circles',
      'cones',
      'cylinders',
      'lines',
      'planes',
      'slots',
      'spheres',
      'center_points',
      'surface_points',
      'vertex_points',
    ],
  });
  register('dynamicCircleMode', {
    kind: 'enum',
    values: [
      null,
      'Cylinder and Plane Intersection - Hold Plane Normal',
      'Cylinder and Plane Intersection - Hold Cylinder Axis',
      'Cone and Plane Intersection - Hold Plane Normal',
      'Cone and Plane Intersection - Hold Cone Axis',
      'Sphere and Plane Intersection',
      'Two Cones Intersection',
      'Cone and Cylinder Intersection',
    ],
  });
  register('dynamicEllipseMode', {
    kind: 'enum',
    values: [
      null,
      'Cylinder and Plane Intersection',
      'Cone and Plane Intersection',
    ],
  });
  register('dynamicLineMode', {
    kind: 'enum',
    values: [
      null,
      'Cone Axis',
      'Cylinder Axis',
      'Intersection of Two Planes',
      'Bisect Two Lines',
      'Slot Centerline Along Length',
    ],
  });
  register('dynamicPlaneMode', {
    kind: 'enum',
    values: [
      null,
      'Bisect Two Planes',
      'Two Cones Intersection - Hold Normal to Best-Fit Plane',
      'Two Cones Intersection - Hold Normal to First Cone Axis',
      'Two Cones Intersection - Hold Normal to Second Cone Axis',
      'Cone and Cylinder Intersection - Hold Normal to Best-Fit Plane',
      'Cone and Cylinder Intersection - Hold Normal to Cone Axis',
      'Cone and Cylinder Intersection - Hold Normal to Cylinder Axis',
      'Offset Plane From Plane',
    ],
  });
  register('dynamicPointMode', {
    kind: 'enum',
    values: [
      null,
      'Intersection of Line and Plane',
      'Intersection of Cylinder and Plane',
      'Intersection of Cone and Plane',
      'Intersection of Three Planes',
      'Mid-Point of Perpendicular to Two Lines',
    ],
  });
  register('edgePointMode', {
    kind: 'enum',
    values: [null, 'Include Edges', 'Exclude Edges', 'Edges Only'],
  });
  register('frameAxis', { kind: 'enum', values: [null, 'x', 'y', 'z'] });
  register('frameConstructionMethod', {
    kind: 'enum',
    values: [
      null,
      'origin-x-xy',
      'origin-x-xz',
      'origin-y-yx',
      'origin-y-yz',
      'origin-z-zx',
      'origin-x-zy',
    ],
  });
  register('gdtDistanceBetweenMode', {
    kind: 'enum',
    values: [null, 'centroid', 'minMax'],
  });
  register('gdtEvaluationMethod', {
    kind: 'enum',
    values: [
      null,
      'none',
      'asme1994',
      'asme2009',
      'asme2018',
      'iso1983',
      'iso2004',
      'iso2017',
    ],
  });
  register('gdtExtendedEvaluationMethod', {
    kind: 'enum',
    values: [
      null,
      'leastSquares',
      'highPoint',
      'minimumSeparation',
      'leastSquaresHighPoint',
      'leastSquares3d',
      'leastSquaresHighPoint1StdDev',
      'leastSquaresHighPoint2StdDev',
      'leastSquaresHighPointHalfway',
      'minimumSeparationHighPoint',
      'equalizedHighPoint',
      'equalizedLsqHighPoint',
    ],
  });
  register('gdtFeatureType', {
    kind: 'enum',
    values: [
      null,
      'diameter',
      'radius',
      'distanceBetween',
      'width',
      'length',
      'angleBetween',
      'angularity',
      'perpendicularity',
      'parallelism',
      'circularity',
      'concentricity',
      'cylindricity',
      'straightness',
      'surfaceProfile',
      'lineProfile',
      'compositeSurfaceProfile',
      'flatness',
      'truePosition',
      'compositeTruePosition',
      'circularRunout',
      'totalRunout',
    ],
  });
  register('gdtToleranceZoneType', {
    kind: 'enum',
    values: [
      null,
      'none',
      'cylindrical',
      'planar',
      'spherical',
      'radialArc',
      'radialPlanar',
      'boundary',
      'planarMedian',
      'surface',
    ],
  });
  register('geometryRelationshipPointEditMode', {
    kind: 'enum',
    values: [null, 'Point List', 'Point Graph', 'Sub-Sampler Settings'],
  });
  register('inspectionFilter', {
    kind: 'enum',
    values: [null, 'ALL', 'CHECKS', 'DATUMS'],
  });
  register('instrumentPositionReportingFrame', {
    kind: 'enum',
    values: [null, 'Instrument Base', 'World', 'Working'],
  });
  register('meshOrientationType', {
    kind: 'enum',
    values: [null, 'Use Current Point of View', 'Use Current Working Frame'],
  });
  register('mirrorFramePlane', {
    kind: 'enum',
    values: [null, 'xy', 'xz', 'yz'],
  });
  register('offsetDirectionType', {
    kind: 'enum',
    values: [null, 'both', 'positiveOnly', 'negativeOnly'],
  });
  register('pointOutputType', {
    kind: 'enum',
    values: [null, 'points', 'cloudPoints'],
  });
  register('rGBColorChannel', {
    kind: 'enum',
    values: [null, 'red', 'green', 'blue', 'intensity'],
  });
  register('rGBFilterOperation', {
    kind: 'enum',
    values: [
      null,
      'incrementallyApplyFilter',
      'resetAndApplyFilter',
      'resetAllCloudPointsVisible',
    ],
  });
  register('robotActiveJointComponent', {
    kind: 'enum',
    values: [
      null,
      'NONE',
      'X',
      'Y',
      'Z',
      'Rx',
      'Ry',
      'Rz',
      'Alpha',
      'A',
      'D',
      'THETA',
    ],
  });
  register('robotModelLinkType', {
    kind: 'enum',
    values: [null, 'DH', '6DOF'],
  });
  register('showUsmnDialog', {
    kind: 'enum',
    values: [null, 'No', 'Yes', 'On Tolerance Violation'],
  });
  register('solverMode', {
    kind: 'enum',
    values: [
      null,
      'Gauss-Newton',
      'Levenberg-Marquardt',
      'Gauss-Newton /w Gradient Search',
      'Direct Search',
    ],
  });
  register('surfaceDissectionMode', {
    kind: 'enum',
    values: [null, 'entireSolid', 'selectFaces'],
  });
  register('surveyTargetType', {
    kind: 'enum',
    values: [null, 'Triangle', 'Circle'],
  });
  register('systemString', {
    kind: 'enum',
    values: [
      null,
      'SA Version',
      'XIT Filename',
      'MP Filename',
      'MP Filename (Full Path)',
      'Date & Time',
      'Date',
      'Date (Short)',
      'Time',
      'Key Serial Number',
      'Company Name',
      'User Name',
    ],
  });
  register('targetComputationMethod', {
    kind: 'enum',
    values: [
      null,
      'Use most recent shot from each face',
      'Use only most recent shot',
      'Do not change prior measurements at all',
      'Force a new point for each measurement',
      'Remove all prior shots',
      'Deactivate all prior shots',
    ],
  });
  register('wcfAxis', {
    kind: 'enum',
    values: [null, 'X Axis', 'Y Axis', 'Z Axis'],
  });
  register('bSplineFitOptions', {
    kind: 'message',
    name: 'BSplineFitOptions',
    fields: {
      openCurve: { schema: scalars.boolean, optional: true },
      useInterpolationForFit: { schema: scalars.boolean, optional: true },
      numberOfControlPoints: { schema: scalars.integer, optional: true },
      degreeOfCurve: { schema: scalars.integer, optional: true },
      sortMethod: { schema: get('bSplinePointSortMode'), optional: true },
      spanAnyGap: { schema: scalars.boolean, optional: true },
      terminationGapLength: { schema: scalars.number, optional: true },
      ignoreProximatePoints: { schema: scalars.boolean, optional: true },
      proximatePointThreshold: { schema: scalars.number, optional: true },
      useGlobalTessellationOptions: { schema: scalars.boolean, optional: true },
      maximumChordalDeviation: { schema: scalars.number, optional: true },
      maximumTrimEdgeAngle: { schema: scalars.number, optional: true },
      terminationAverageMultiplier: { schema: scalars.number, optional: true },
      extension: { schema: scalars.number, optional: true },
    },
  });
  register('calloutViewProperties', {
    kind: 'message',
    name: 'CalloutViewProperties',
    fields: {
      lockViewPoint: { schema: scalars.boolean, optional: true },
      recallWorkingFrame: { schema: scalars.boolean, optional: true },
      recallVisibleLayer: { schema: scalars.boolean, optional: true },
      calloutLeaderThickness: { schema: scalars.integer, optional: true },
      calloutLeaderColor: { schema: get('color'), optional: true },
      calloutBorderThickness: { schema: scalars.integer, optional: true },
      calloutBorderColor: { schema: get('color'), optional: true },
      divideTextWithLines: { schema: scalars.boolean, optional: true },
      font: { schema: get('font'), optional: true },
    },
  });
  register('cloudThinningOptions', {
    kind: 'message',
    name: 'CloudThinningOptions',
    fields: {
      mode: { schema: get('cloudThinningMode'), optional: true },
      pointIncrement: { schema: scalars.integer, optional: true },
      minimumNumberOfPoints: { schema: scalars.integer, optional: true },
      maximumNumberOfPoints: { schema: scalars.integer, optional: true },
    },
  });
  register('cloudToCadAlignmentResult', {
    kind: 'message',
    name: 'CloudToCadAlignmentResult',
    fields: {
      rmsDeviation: { schema: scalars.number, optional: false },
      averageDeviation: { schema: scalars.number, optional: false },
      maximumAbsoluteDeviation: { schema: scalars.number, optional: false },
      resultantTransformInWorking: {
        schema: get('transform'),
        optional: false,
      },
    },
  });
  register('collectionMachineId', {
    kind: 'message',
    name: 'CollectionMachineId',
    fields: {
      collectionName: { schema: scalars.string, optional: true },
      machineId: { schema: scalars.integer, optional: true },
    },
  });
  register('currentTrappingStatus', {
    kind: 'message',
    name: 'CurrentTrappingStatus',
    fields: {
      active: { schema: scalars.boolean, optional: false },
      focusedItem: { schema: get('collectionItemName'), optional: true },
      instrument: { schema: get('collectionInstrumentId'), optional: true },
    },
  });
  register('doubleVector6', {
    kind: 'message',
    name: 'DoubleVector6',
    fields: {
      values: {
        schema: repeatedOperationValue(scalars.number),
        optional: false,
      },
    },
  });
  register('featureCheckCylinderEvalOptions', {
    kind: 'message',
    name: 'FeatureCheckCylinderEvalOptions',
    fields: {
      enableActualDiameterOverride: {
        schema: scalars.boolean,
        optional: false,
      },
      actualDiameterOverride: { schema: scalars.number, optional: false },
    },
  });
  register('featureCheckDatumReference', {
    kind: 'message',
    name: 'FeatureCheckDatumReference',
    fields: {
      referenceString: { schema: scalars.string, optional: false },
      cadFaces: { schema: scalars.string, optional: false },
      saObjects: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
      auxiliarySaObjects: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
      geometryRelationships: {
        schema: repeatedOperationValue(get('collectionItemName')),
        optional: false,
      },
      auxiliaryGeometryRelationships: {
        schema: repeatedOperationValue(get('collectionItemName')),
        optional: false,
      },
    },
  });
  register('featureCheckReportingOptions', {
    kind: 'message',
    name: 'FeatureCheckReportingOptions',
    fields: {
      showFeatureControlFrameSummary: {
        schema: scalars.boolean,
        optional: false,
      },
      includeTitle: { schema: scalars.boolean, optional: false },
      showDatumAndToleranceSummary: {
        schema: scalars.boolean,
        optional: false,
      },
      showFeatureSummary: { schema: scalars.boolean, optional: false },
      planarProximityMode: {
        schema: get('offsetDirectionType'),
        optional: true,
      },
      radialProximityMode: {
        schema: get('offsetDirectionType'),
        optional: true,
      },
      projectToPlane: { schema: scalars.boolean, optional: true },
      assertPlaneBoundaries: { schema: scalars.boolean, optional: true },
    },
  });
  register('fitDofOptions', {
    kind: 'message',
    name: 'FitDofOptions',
    fields: {
      allowX: { schema: scalars.boolean, optional: true },
      allowY: { schema: scalars.boolean, optional: true },
      allowZ: { schema: scalars.boolean, optional: true },
      allowRx: { schema: scalars.boolean, optional: true },
      allowRy: { schema: scalars.boolean, optional: true },
      allowRz: { schema: scalars.boolean, optional: true },
      rotateAboutCentroid: { schema: scalars.boolean, optional: true },
    },
  });
  register('gdtMeasurements', {
    kind: 'message',
    name: 'GdtMeasurements',
    fields: {
      pointNames: {
        schema: repeatedOperationValue(get('pointName')),
        optional: false,
      },
      cloudNames: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
    },
  });
  register('gdtOptions', {
    kind: 'message',
    name: 'GdtOptions',
    fields: {
      useHighPoints: { schema: scalars.boolean, optional: false },
      extrapolateAxialExtent: { schema: scalars.boolean, optional: false },
      excludeFromAutoEvaluation: { schema: scalars.boolean, optional: false },
      distanceBetweenMode: {
        schema: get('gdtDistanceBetweenMode'),
        optional: true,
      },
      evaluationMethod: { schema: get('gdtEvaluationMethod'), optional: true },
      createActualFeatures: { schema: scalars.boolean, optional: false },
      createSolvedPoints: { schema: scalars.boolean, optional: false },
      crossSectionCriteria: { schema: scalars.number, optional: false },
      enableAutoFeatureDetection: { schema: scalars.boolean, optional: false },
    },
  });
  register('geometryRelationshipOutlierFilterMetrics', {
    kind: 'message',
    name: 'GeometryRelationshipOutlierFilterMetrics',
    fields: {
      firstPassRmsError: { schema: scalars.number, optional: false },
      firstPassMaximumError: { schema: scalars.number, optional: false },
      firstPassMinimumError: { schema: scalars.number, optional: false },
      firstPassAverageError: { schema: scalars.number, optional: false },
      finalPassRmsError: { schema: scalars.number, optional: false },
      finalPassMaximumError: { schema: scalars.number, optional: false },
      finalPassMinimumError: { schema: scalars.number, optional: false },
      finalPassAverageError: { schema: scalars.number, optional: false },
      totalInputPointCount: { schema: scalars.integer, optional: false },
      excludePointCount: { schema: scalars.integer, optional: false },
    },
  });
  register('groupAverageResult', {
    kind: 'message',
    name: 'GroupAverageResult',
    fields: {
      rmsDeviation: { schema: scalars.number, optional: false },
      maxAbsoluteDeviation: { schema: scalars.number, optional: false },
      averageDeviation: { schema: scalars.number, optional: false },
    },
  });
  register('instrumentTargetStatus', {
    kind: 'message',
    name: 'InstrumentTargetStatus',
    fields: {
      isLocked: { schema: scalars.boolean, optional: false },
      name: { schema: scalars.string, optional: false },
      numberOfFaces: { schema: scalars.integer, optional: false },
      lockedFace: { schema: scalars.integer, optional: false },
    },
  });
  register('instrumentTypeName', {
    kind: 'message',
    name: 'InstrumentTypeName',
    fields: {
      value: { schema: scalars.string, optional: false },
    },
  });
  register('lrFlipTestResult', {
    kind: 'message',
    name: 'LrFlipTestResult',
    fields: {
      frontRange: { schema: scalars.number, optional: false },
      frontAzimuth: { schema: scalars.number, optional: false },
      frontElevation: { schema: scalars.number, optional: false },
      frontQuality: { schema: scalars.number, optional: false },
      backRange: { schema: scalars.number, optional: false },
      backAzimuth: { schema: scalars.number, optional: false },
      backElevation: { schema: scalars.number, optional: false },
      backQuality: { schema: scalars.number, optional: false },
      frontBackDifferenceRange: {
        schema: scalars.number,
        optional: false,
      },
      frontBackDifferenceAzimuth: {
        schema: scalars.number,
        optional: false,
      },
      frontBackDifferenceElevation: {
        schema: scalars.number,
        optional: false,
      },
    },
  });
  register('lrLoSeparationTestResult', {
    kind: 'message',
    name: 'LrLoSeparationTestResult',
    fields: {
      primaryLo: { schema: scalars.integer, optional: false },
      secondaryLo: { schema: scalars.integer, optional: false },
      primaryLoMeasurementCount: { schema: scalars.integer, optional: false },
      primaryLoRangeMean: { schema: scalars.number, optional: false },
      primaryLoRangeStandardDeviation: {
        schema: scalars.number,
        optional: false,
      },
      primaryLoQualityMean: { schema: scalars.number, optional: false },
      primaryLoQualityStandardDeviation: {
        schema: scalars.number,
        optional: false,
      },
      secondaryLoMeasurementCount: { schema: scalars.integer, optional: false },
      secondaryLoRangeMean: { schema: scalars.number, optional: false },
      secondaryLoRangeStandardDeviation: {
        schema: scalars.number,
        optional: false,
      },
      secondaryLoQualityMean: { schema: scalars.number, optional: false },
      secondaryLoQualityStandardDeviation: {
        schema: scalars.number,
        optional: false,
      },
    },
  });
  register('lrSnrInfo', {
    kind: 'message',
    name: 'LrSnrInfo',
    fields: {
      snr: { schema: scalars.number, optional: false },
      sizeOfDataArray: { schema: scalars.integer, optional: false },
      peakValueIndex: { schema: scalars.integer, optional: false },
      peakValue: { schema: scalars.number, optional: false },
      measuredRange: { schema: scalars.number, optional: false },
    },
  });
  register('objectOriginResult', {
    kind: 'message',
    name: 'ObjectOriginResult',
    fields: {
      vectorRepresentation: { schema: get('vector'), optional: false },
      xValue: { schema: scalars.number, optional: false },
      yValue: { schema: scalars.number, optional: false },
      zValue: { schema: scalars.number, optional: false },
    },
  });
  register('observationSphericalValues', {
    kind: 'message',
    name: 'ObservationSphericalValues',
    fields: {
      distance: { schema: scalars.number, optional: false },
      azimuth: { schema: scalars.number, optional: false },
      elevation: { schema: scalars.number, optional: false },
    },
  });
  register('perimeterLists', {
    kind: 'message',
    name: 'PerimeterLists',
    fields: {
      scanPerimeters: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
      exclusionPerimeters: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
    },
  });
  register('pointsToPointsRelationshipAssociatedData', {
    kind: 'message',
    name: 'PointsToPointsRelationshipAssociatedData',
    fields: {
      nominalPoints: {
        schema: repeatedOperationValue(get('pointName')),
        optional: false,
      },
      actualPoints: {
        schema: repeatedOperationValue(get('pointName')),
        optional: false,
      },
    },
  });
  register('projectedPointGradient', {
    kind: 'message',
    name: 'ProjectedPointGradient',
    fields: {
      projectedPoint: { schema: get('vector'), optional: false },
      normalVector: { schema: get('vector'), optional: false },
      uDirection: { schema: get('vector'), optional: false },
      vDirection: { schema: get('vector'), optional: false },
    },
  });
  register('relationshipAssociatedData', {
    kind: 'message',
    name: 'RelationshipAssociatedData',
    fields: {
      relationshipType: { schema: scalars.string, optional: false },
      individualPoints: {
        schema: repeatedOperationValue(get('pointName')),
        optional: false,
      },
      pointGroups: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
      pointClouds: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
      objects: {
        schema: repeatedOperationValue(get('collectionObjectName')),
        optional: false,
      },
    },
  });
  register('relationshipStatusFlags', {
    kind: 'message',
    name: 'RelationshipStatusFlags',
    fields: {
      dormant: { schema: scalars.boolean, optional: false },
      success: { schema: scalars.boolean, optional: false },
      measured: { schema: scalars.boolean, optional: false },
      failed: { schema: scalars.boolean, optional: false },
      unmeasured: { schema: scalars.boolean, optional: false },
    },
  });
  register('relationshipWatchWindowUdpSettings', {
    kind: 'message',
    name: 'RelationshipWatchWindowUdpSettings',
    fields: {
      enabled: { schema: scalars.boolean, optional: true },
      broadcast: { schema: scalars.boolean, optional: true },
      ipAddress: { schema: scalars.string, optional: true },
      port: { schema: scalars.integer, optional: true },
    },
  });
  register('robotCalibrationMetrics', {
    kind: 'message',
    name: 'RobotCalibrationMetrics',
    fields: {
      xyzMax: { schema: scalars.number, optional: false },
      xyzAverage: { schema: scalars.number, optional: false },
      xyzRms: { schema: scalars.number, optional: false },
      orientMax: { schema: scalars.number, optional: false },
      orientAverage: { schema: scalars.number, optional: false },
      orientRms: { schema: scalars.number, optional: false },
      robustness: { schema: scalars.number, optional: false },
    },
  });
  register('sigmoidalGapFitConstraints', {
    kind: 'message',
    name: 'SigmoidalGapFitConstraints',
    fields: {
      useSigmoidalGapConstraints: { schema: scalars.boolean, optional: false },
      minimumGapBoundary: { schema: scalars.number, optional: false },
      minimumGapWeight: { schema: scalars.number, optional: false },
      maximumGapBoundary: { schema: scalars.number, optional: false },
      maximumGapWeight: { schema: scalars.number, optional: false },
      nominalGap: { schema: scalars.number, optional: false },
      nominalGapWeight: { schema: scalars.number, optional: false },
      gradientSteepnessFactor: { schema: scalars.number, optional: false },
    },
  });
  register('surfaceFaceList', {
    kind: 'message',
    name: 'SurfaceFaceList',
    fields: {
      value: { schema: scalars.string, optional: false },
    },
  });
  register('wrtlChannelStatus', {
    kind: 'message',
    name: 'WrtlChannelStatus',
    fields: {
      connectionStatus: { schema: scalars.boolean, optional: false },
      activeChannel: { schema: scalars.integer, optional: false },
    },
  });
  register('observationInfo', {
    kind: 'message',
    name: 'ObservationInfo',
    fields: {
      instrument: { schema: get('collectionInstrumentId'), optional: false },
      sphericalValues: {
        schema: get('observationSphericalValues'),
        optional: false,
      },
      active: { schema: scalars.boolean, optional: false },
      timestamp: { schema: scalars.string, optional: false },
      rmsError: { schema: scalars.number, optional: false },
      temperature: { schema: scalars.number, optional: false },
      pressure: { schema: scalars.number, optional: false },
      relativeHumidity: { schema: scalars.number, optional: false },
      infoData: { schema: scalars.string, optional: false },
    },
  });
  register('tcpFixtureUncertainties', {
    kind: 'message',
    name: 'TcpFixtureUncertainties',
    fields: {
      solutionValid: { schema: scalars.boolean, optional: false },
      refinedTcpInWorking: { schema: get('transform'), optional: false },
      uncertaintiesInTcpFixtureFrame: {
        schema: get('doubleVector6'),
        optional: false,
      },
      uncertaintiesInWorkingFrame: {
        schema: get('doubleVector6'),
        optional: false,
      },
      rmsError: { schema: scalars.number, optional: false },
      maximumAbsoluteError: { schema: scalars.number, optional: false },
      goodnessOfFit: { schema: scalars.number, optional: false },
      robustness: { schema: scalars.number, optional: false },
      resultNotes: {
        schema: repeatedOperationValue(scalars.string),
        optional: false,
      },
    },
  });
  register('uncertaintyCovarianceMatrix', {
    kind: 'message',
    name: 'UncertaintyCovarianceMatrix',
    fields: {
      row1: { schema: get('doubleVector6'), optional: false },
      row2: { schema: get('doubleVector6'), optional: false },
      row3: { schema: get('doubleVector6'), optional: false },
      row4: { schema: get('doubleVector6'), optional: false },
      row5: { schema: get('doubleVector6'), optional: false },
      row6: { schema: get('doubleVector6'), optional: false },
    },
  });
}
