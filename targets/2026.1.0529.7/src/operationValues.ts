/** Handwritten MP-native values used by the Wave A public API. */

export const AngularUnits = Object.freeze({
  degrees: 'degrees',
  degreesMinutesSeconds: 'degreesMinutesSeconds',
  radians: 'radians',
  milliradians: 'milliradians',
  gonsGrad: 'gonsGrad',
  mils: 'mils',
  arcseconds: 'arcseconds',
  degreesMinutes: 'degreesMinutes',
} as const);
export type AngularUnits = (typeof AngularUnits)[keyof typeof AngularUnits];

export const AsciiFileFormat = Object.freeze({
  xYZ: 'xYZ',
  xYZOffsetOffset2: 'xYZOffsetOffset2',
  xYZNotes: 'xYZNotes',
  radiusThetaPhi: 'radiusThetaPhi',
  radiusThetaZ: 'radiusThetaZ',
  pointNameXYZ: 'pointNameXYZ',
  pointNameXYZNotes: 'pointNameXYZNotes',
  pointNameXYZOffsetOffset2: 'pointNameXYZOffsetOffset2',
  pointNameXYZUxUyUz: 'pointNameXYZUxUyUz',
  pointNameXYZTxTyTzTd: 'pointNameXYZTxTyTzTd',
  pointNameXYZWxWyWzWmag: 'pointNameXYZWxWyWzWmag',
  pointNameXYZHighLowTolerance: 'pointNameXYZHighLowTolerance',
  pointNameXYZTxTyTzTdWxWyWz: 'pointNameXYZTxTyTzTdWxWyWz',
  pointNameXYZWxWyWzTxTyTzTd: 'pointNameXYZWxWyWzTxTyTzTd',
  pointNameXYZHighLowToleranceWxWyWz: 'pointNameXYZHighLowToleranceWxWyWz',
  pointNameXYZWxWyWzHighLowTolerance: 'pointNameXYZWxWyWzHighLowTolerance',
  pointNameRadiusThetaPhi: 'pointNameRadiusThetaPhi',
  pointNameRadiusThetaZ: 'pointNameRadiusThetaZ',
  pointNameXYZGroupName: 'pointNameXYZGroupName',
  pointNameYXZGroupName: 'pointNameYXZGroupName',
  groupNamePointNameXYZ: 'groupNamePointNameXYZ',
  groupNamePointNameXYZOffsetOffset2: 'groupNamePointNameXYZOffsetOffset2',
  groupNamePointNameXYZNotes: 'groupNamePointNameXYZNotes',
  groupNamePointNameXYZUxUyUz: 'groupNamePointNameXYZUxUyUz',
  groupNamePointNameRadiusThetaPhi: 'groupNamePointNameRadiusThetaPhi',
  groupNamePointNameRadiusThetaZ: 'groupNamePointNameRadiusThetaZ',
  collectionGroupPointXYZ: 'collectionGroupPointXYZ',
  collectionGroupPointXYZNotes: 'collectionGroupPointXYZNotes',
  collectionGroupPointRadiusThetaPhi: 'collectionGroupPointRadiusThetaPhi',
  collectionGroupPointRadiusThetaZ: 'collectionGroupPointRadiusThetaZ',
  xYZIJK: 'xYZIJK',
  vectorNameXYZIJK: 'vectorNameXYZIJK',
  vectorNameXYZDxDyDzSignedMagnitude: 'vectorNameXYZDxDyDzSignedMagnitude',
  vectorGroupNameVectorNameXYZIJK: 'vectorGroupNameVectorNameXYZIJK',
  vectorGroupNameVectorNameXYZDxDyDzSignedMagnitude:
    'vectorGroupNameVectorNameXYZDxDyDzSignedMagnitude',
  frameNameXYZRxRyRzTimestamp: 'frameNameXYZRxRyRzTimestamp',
  frameNameXYZEulerXYZTimestamp: 'frameNameXYZEulerXYZTimestamp',
  frameNameXYZEulerZYXTimestamp: 'frameNameXYZEulerZYXTimestamp',
  frameNameXYZEulerZYZTimestamp: 'frameNameXYZEulerZYZTimestamp',
  frameNameXYZEulerZXZTimestamp: 'frameNameXYZEulerZXZTimestamp',
  frameNameTransformationMatrixTimestamp:
    'frameNameTransformationMatrixTimestamp',
  transformationMatrixTimestamp: 'transformationMatrixTimestamp',
  frameNameXYZQuaternionTimestamp: 'frameNameXYZQuaternionTimestamp',
  planeNameXYZDxDyDzPlaneSize: 'planeNameXYZDxDyDzPlaneSize',
} as const);
export type AsciiFileFormat =
  (typeof AsciiFileFormat)[keyof typeof AsciiFileFormat];

export const ChartType = Object.freeze({
  runChart: 'runChart',
  individualXMovingRange: 'individualXMovingRange',
  bullseyeChart: 'bullseyeChart',
} as const);
export type ChartType = (typeof ChartType)[keyof typeof ChartType];

export const CoordinateSystemType = Object.freeze({
  cartesian: 'cartesian',
  cylindric: 'cylindric',
  polar: 'polar',
} as const);
export type CoordinateSystemType =
  (typeof CoordinateSystemType)[keyof typeof CoordinateSystemType];

export const DatasetType = Object.freeze({
  x: 'x',
  y: 'y',
  z: 'z',
  magnitude: 'magnitude',
} as const);
export type DatasetType = (typeof DatasetType)[keyof typeof DatasetType];

export const DistanceUnits = Object.freeze({
  meters: 'meters',
  centimeters: 'centimeters',
  millimeters: 'millimeters',
  feet: 'feet',
  inches: 'inches',
  usSurveyFeet: 'usSurveyFeet',
} as const);
export type DistanceUnits = (typeof DistanceUnits)[keyof typeof DistanceUnits];

export const ExportDataDelimeterType = Object.freeze({
  space: 'space',
  comma: 'comma',
  tab: 'tab',
} as const);
export type ExportDataDelimeterType =
  (typeof ExportDataDelimeterType)[keyof typeof ExportDataDelimeterType];

export const ExportTargetNameFormat = Object.freeze({
  collectionGroupTarget: 'collectionGroupTarget',
  groupTarget: 'groupTarget',
  target: 'target',
  none: 'none',
} as const);
export type ExportTargetNameFormat =
  (typeof ExportTargetNameFormat)[keyof typeof ExportTargetNameFormat];

export const ExportVectorNameFormat = Object.freeze({
  collectionGroupVector: 'collectionGroupVector',
  groupVector: 'groupVector',
  vector: 'vector',
  none: 'none',
} as const);
export type ExportVectorNameFormat =
  (typeof ExportVectorNameFormat)[keyof typeof ExportVectorNameFormat];

export const BaseColorType = Object.freeze({
  red: 'red',
  green: 'green',
  blue: 'blue',
} as const);
export type BaseColorType = (typeof BaseColorType)[keyof typeof BaseColorType];

export const BaseMidColorType = Object.freeze({
  red: 'red',
  green: 'green',
  gray: 'gray',
  blue: 'blue',
} as const);
export type BaseMidColorType =
  (typeof BaseMidColorType)[keyof typeof BaseMidColorType];

export const ColorRangeMethod = Object.freeze({
  singleColor: 'singleColor',
  continuous: 'continuous',
  tolerancedContinuous: 'tolerancedContinuous',
  tolerancedGoNoGo: 'tolerancedGoNoGo',
  tolerancedGoNoGoWithWarning: 'tolerancedGoNoGoWithWarning',
  discreteColors: 'discreteColors',
} as const);
export type ColorRangeMethod =
  (typeof ColorRangeMethod)[keyof typeof ColorRangeMethod];

export const GeometryType = Object.freeze({
  line: 'line',
  plane: 'plane',
  circle: 'circle',
  sphere: 'sphere',
  cylinder: 'cylinder',
  cone: 'cone',
  paraboloid: 'paraboloid',
  ellipse: 'ellipse',
  slot: 'slot',
  torus: 'torus',
} as const);
export type GeometryType = (typeof GeometryType)[keyof typeof GeometryType];

export const ObjectType = Object.freeze({
  any: 'any',
  bSpline: 'bSpline',
  circle: 'circle',
  cloud: 'cloud',
  enhancedCloud: 'enhancedCloud',
  scanStripeCloud: 'scanStripeCloud',
  crossSectionCloud: 'crossSectionCloud',
  cone: 'cone',
  cylinder: 'cylinder',
  datum: 'datum',
  ellipse: 'ellipse',
  frame: 'frame',
  frameSet: 'frameSet',
  line: 'line',
  paraboloid: 'paraboloid',
  perimeter: 'perimeter',
  plane: 'plane',
  pointGroup: 'pointGroup',
  pointSet: 'pointSet',
  polySurface: 'polySurface',
  scanStripeMesh: 'scanStripeMesh',
  slot: 'slot',
  sphere: 'sphere',
  surface: 'surface',
  torus: 'torus',
  vectorGroup: 'vectorGroup',
} as const);
export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];

export const ItemType = Object.freeze({
  any: 'any',
  alignment: 'alignment',
  annotation: 'annotation',
  bSpline: 'bSpline',
  calibrationApplianceNode: 'calibrationApplianceNode',
  calloutView: 'calloutView',
  chart: 'chart',
  circle: 'circle',
  cloud: 'cloud',
  enhancedCloud: 'enhancedCloud',
  scanStripeCloud: 'scanStripeCloud',
  crossSectionCloud: 'crossSectionCloud',
  cone: 'cone',
  cylinder: 'cylinder',
  datum: 'datum',
  dimension: 'dimension',
  ellipse: 'ellipse',
  event: 'event',
  featureCheck: 'featureCheck',
  frame: 'frame',
  frameSet: 'frameSet',
  line: 'line',
  paraboloid: 'paraboloid',
  perimeter: 'perimeter',
  picture: 'picture',
  plane: 'plane',
  pointGroup: 'pointGroup',
  pointSet: 'pointSet',
  polySurface: 'polySurface',
  relationship: 'relationship',
  saDoc: 'saDoc',
  saReport: 'saReport',
  saReportTemplate: 'saReportTemplate',
  scaleBar: 'scaleBar',
  scanStripeMesh: 'scanStripeMesh',
  slot: 'slot',
  sphere: 'sphere',
  surface: 'surface',
  table: 'table',
  tcpFixture: 'tcpFixture',
  torus: 'torus',
  vectorGroup: 'vectorGroup',
} as const);
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const PointFilterInputType = Object.freeze({
  cardinalPoints: 'cardinalPoints',
  inputPoints: 'inputPoints',
  nominalCardinalPoints: 'nominalCardinalPoints',
} as const);
export type PointFilterInputType =
  (typeof PointFilterInputType)[keyof typeof PointFilterInputType];

export const RelWeightingMode = Object.freeze({
  normalizeEquationCount: 'normalizeEquationCount',
  normalizeEquationCountAndToleranceWidth:
    'normalizeEquationCountAndToleranceWidth',
  resetAllWeights: 'resetAllWeights',
  normalizeSquareRootEquationCount: 'normalizeSquareRootEquationCount',
  normalizeSquareRootAndToleranceWidth: 'normalizeSquareRootAndToleranceWidth',
} as const);
export type RelWeightingMode =
  (typeof RelWeightingMode)[keyof typeof RelWeightingMode];

export const RenderModeType = Object.freeze({
  wireframe: 'wireframe',
  hiddenLineRemoved: 'hiddenLineRemoved',
  solidAndEdges: 'solidAndEdges',
  solid: 'solid',
} as const);
export type RenderModeType =
  (typeof RenderModeType)[keyof typeof RenderModeType];

export const ReportOutputType = Object.freeze({
  none: 'none',
  saReport: 'saReport',
  saDocument: 'saDocument',
  pdf: 'pdf',
  rtf: 'rtf',
} as const);
export type ReportOutputType =
  (typeof ReportOutputType)[keyof typeof ReportOutputType];

export const ReportPageSettings = Object.freeze({
  portrait: 'portrait',
  landscape: 'landscape',
} as const);
export type ReportPageSettings =
  (typeof ReportPageSettings)[keyof typeof ReportPageSettings];

export const ReportViewType = Object.freeze({
  none: 'none',
  currentView: 'currentView',
  calloutView: 'calloutView',
} as const);
export type ReportViewType =
  (typeof ReportViewType)[keyof typeof ReportViewType];

export const SurfaceAnalysisMode = Object.freeze({
  none: 'none',
  relationship: 'relationship',
  normals: 'normals',
  curvature: 'curvature',
  deviationRms: 'deviationRms',
  deviationMax: 'deviationMax',
  deviationAverage: 'deviationAverage',
  deviationMin: 'deviationMin',
  deviationMaxAbsolute: 'deviationMaxAbsolute',
  deviationMaxDelta: 'deviationMaxDelta',
  pseudoSurface: 'pseudoSurface',
} as const);
export type SurfaceAnalysisMode =
  (typeof SurfaceAnalysisMode)[keyof typeof SurfaceAnalysisMode];

export const TemperatureUnits = Object.freeze({
  fahrenheit: 'fahrenheit',
  celsius: 'celsius',
} as const);
export type TemperatureUnits =
  (typeof TemperatureUnits)[keyof typeof TemperatureUnits];

export const TranslucencyType = Object.freeze({
  solid: 'solid',
  translucent: 'translucent',
  wireframe: 'wireframe',
} as const);
export type TranslucencyType =
  (typeof TranslucencyType)[keyof typeof TranslucencyType];

export const CompTechnique = Object.freeze({
  standard: 'standard',
  maxInscribed: 'maxInscribed',
  minCircumscribed: 'minCircumscribed',
} as const);
export type CompTechnique = (typeof CompTechnique)[keyof typeof CompTechnique];

export const DegreeOfFreedom = Object.freeze({
  any: 'any',
  lockFocusLocation: 'lockFocusLocation',
  lockVertexLocation: 'lockVertexLocation',
} as const);
export type DegreeOfFreedom =
  (typeof DegreeOfFreedom)[keyof typeof DegreeOfFreedom];

export const FitMethod = Object.freeze({
  minimumRms: 'minimumRms',
  bestAxis: 'bestAxis',
} as const);
export type FitMethod = (typeof FitMethod)[keyof typeof FitMethod];

export const MeasuredSideForPlanarOffset = Object.freeze({
  abovePlane: 'abovePlane',
  probeCenter: 'probeCenter',
  belowPlane: 'belowPlane',
} as const);
export type MeasuredSideForPlanarOffset =
  (typeof MeasuredSideForPlanarOffset)[keyof typeof MeasuredSideForPlanarOffset];

export const MeasuredSideForRadialOffset = Object.freeze({
  inside: 'inside',
  probeCenter: 'probeCenter',
  outside: 'outside',
} as const);
export type MeasuredSideForRadialOffset =
  (typeof MeasuredSideForRadialOffset)[keyof typeof MeasuredSideForRadialOffset];

export const MpDialogInteractionMode = Object.freeze({
  blockApplicationInteraction: 'blockApplicationInteraction',
  allowApplicationInteraction: 'allowApplicationInteraction',
} as const);
export type MpDialogInteractionMode =
  (typeof MpDialogInteractionMode)[keyof typeof MpDialogInteractionMode];

export const MpInteractionMode = Object.freeze({
  haltOnFailureOnly: 'haltOnFailureOnly',
  haltOnFailureOrPartialSuccess: 'haltOnFailureOrPartialSuccess',
  neverHalt: 'neverHalt',
} as const);
export type MpInteractionMode =
  (typeof MpInteractionMode)[keyof typeof MpInteractionMode];

export const NormalDirection = Object.freeze({
  probingDirection: 'probingDirection',
  workingOriginPositive: 'workingOriginPositive',
  rightHandRule: 'rightHandRule',
} as const);
export type NormalDirection =
  (typeof NormalDirection)[keyof typeof NormalDirection];

export const SaInteractionMode = Object.freeze({
  manual: 'manual',
  automatic: 'automatic',
  silent: 'silent',
} as const);
export type SaInteractionMode =
  (typeof SaInteractionMode)[keyof typeof SaInteractionMode];

export const SlotType = Object.freeze({
  round: 'round',
  square: 'square',
} as const);
export type SlotType = (typeof SlotType)[keyof typeof SlotType];

export const SphereFitComputationMode = Object.freeze({
  standard: 'standard',
  maxInscribed: 'maxInscribed',
  minCircumscribed: 'minCircumscribed',
} as const);
export type SphereFitComputationMode =
  (typeof SphereFitComputationMode)[keyof typeof SphereFitComputationMode];

export const WindowState = Object.freeze({
  maximize: 'maximize',
  minimize: 'minimize',
  restore: 'restore',
  show: 'show',
  hide: 'hide',
} as const);
export type WindowState = (typeof WindowState)[keyof typeof WindowState];

export interface ChartName {
  readonly name: string;
}

export interface CollectionName {
  readonly name: string;
}

export interface FrameName {
  readonly name: string;
}

export interface ViewName {
  readonly name: string;
}

export interface PointName {
  readonly collectionName: string;
  readonly groupName: string;
  readonly targetName: string;
}

export interface CollectionInstrumentId {
  readonly collectionName: string;
  readonly instrumentId: number;
}

export interface CollectionGroupName {
  readonly collectionName: string;
  readonly groupName: string;
}

export interface CollectionObjectName {
  readonly collectionName: string;
  readonly objectName: string;
  readonly objectType: ObjectType;
}

export interface CollectionItemName {
  readonly collectionName: string;
  readonly itemName: string;
  readonly itemType?: ItemType;
}

export interface CollectionVectorGroupName {
  readonly collectionName: string;
  readonly vectorGroupName: string;
}

export interface VectorName {
  readonly collectionName: string;
  readonly groupName: string;
  readonly name: string;
}

export interface Vector {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Transform {
  readonly values: readonly number[];
}

export interface WorldTransform {
  readonly transform: Transform;
  readonly scaleFactor: number;
}

export interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

export interface ColorizationOptions {
  readonly colorRangeMethod: ColorRangeMethod;
  readonly baseHighColor: BaseColorType;
  readonly baseMidColor: BaseMidColorType;
  readonly baseLowColor: BaseColorType;
  readonly drawTubes: boolean;
  readonly drawArrowheads: boolean;
  readonly indicateValues: boolean;
  readonly vectorMagnification: number;
  readonly vectorWidth: number;
  readonly drawBlotches: boolean;
  readonly blotchSize: number;
  readonly showOutOfToleranceOnly: boolean;
  readonly showColorBarInView: boolean;
  readonly showColorBarPercentages: boolean;
  readonly showColorBarFractions: boolean;
  readonly highSaturationLimit: number;
  readonly lowSaturationLimit: number;
  readonly highTolerance: number;
  readonly lowTolerance: number;
}

export interface FileReference {
  readonly path: string;
  readonly embeddedFile: boolean;
}

export interface Font {
  readonly fontName: string;
  readonly size: number;
  readonly color: Color;
}

export interface ScalarToleranceLimit {
  readonly enabled: boolean;
  readonly value: number;
}

export interface ToleranceLimit {
  readonly enabled: boolean;
  readonly value: number;
}

export interface ToleranceVectorOptions {
  readonly highX: ToleranceLimit;
  readonly highY: ToleranceLimit;
  readonly highZ: ToleranceLimit;
  readonly highMagnitude: ToleranceLimit;
  readonly lowX: ToleranceLimit;
  readonly lowY: ToleranceLimit;
  readonly lowZ: ToleranceLimit;
  readonly lowMagnitude: ToleranceLimit;
}

export interface FitConstraintScalarOptions {
  readonly high: ScalarToleranceLimit;
  readonly low: ScalarToleranceLimit;
}

export interface ToleranceScalarOptions {
  readonly high: ScalarToleranceLimit;
  readonly low: ScalarToleranceLimit;
}

export interface EmbeddedReportFile {
  readonly collectionName: string;
  readonly fileName: string;
}

export interface ReportOutputOptions {
  readonly outputType: ReportOutputType;
  readonly externalPath?: string;
  readonly embeddedFile?: EmbeddedReportFile;
}

export interface ReportViewOptions {
  readonly viewType: ReportViewType;
  readonly collectionName: string;
  readonly calloutName: string;
}

export interface ProjectionOptions {
  readonly projectionType: string;
  readonly ignoreEdgeProjections: boolean;
  readonly overrideTargetOffsets: boolean;
  readonly overrideTargetOffsetsValue: number;
  readonly addExtraMaterialThickness: boolean;
  readonly extraMaterialThicknessValue: number;
}

export interface PointDeltaReportOptions {
  readonly coordinateSystem: CoordinateSystemType;
  readonly detailsFormat: string;
  readonly showPointA: boolean;
  readonly showPointB: boolean;
  readonly showDelta: boolean;
  readonly showMagnitude: boolean;
  readonly showComponent1: boolean;
  readonly showComponent2: boolean;
  readonly showComponent3: boolean;
  readonly sortPointNames: boolean;
  readonly showToleranceFields: boolean;
  readonly colorizeInToleranceFields: boolean;
}

export const ColorizationOptions = Object.freeze({
  default: deepFreeze<ColorizationOptions>({
    colorRangeMethod: ColorRangeMethod.continuous,
    baseHighColor: BaseColorType.blue,
    baseMidColor: BaseMidColorType.green,
    baseLowColor: BaseColorType.red,
    drawTubes: false,
    drawArrowheads: true,
    indicateValues: false,
    vectorMagnification: 100,
    vectorWidth: 1,
    drawBlotches: false,
    blotchSize: 0.1,
    showOutOfToleranceOnly: false,
    showColorBarInView: false,
    showColorBarPercentages: true,
    showColorBarFractions: false,
    highSaturationLimit: 0.5,
    lowSaturationLimit: -0.5,
    highTolerance: 0.03,
    lowTolerance: -0.03,
  }),
});

export const Font = Object.freeze({
  default: deepFreeze<Font>({
    fontName: 'MS Shell Dlg',
    size: 8,
    color: { red: 0, green: 0, blue: 0 },
  }),
});

const disabledScalarLimit = deepFreeze<ScalarToleranceLimit>({
  enabled: false,
  value: 0,
});

export const FitConstraintScalarOptions = Object.freeze({
  default: deepFreeze<FitConstraintScalarOptions>({
    high: disabledScalarLimit,
    low: disabledScalarLimit,
  }),
});

export const ToleranceScalarOptions = Object.freeze({
  default: deepFreeze<ToleranceScalarOptions>({
    high: disabledScalarLimit,
    low: disabledScalarLimit,
  }),
});

export const ProjectionOptions = Object.freeze({
  default: deepFreeze<ProjectionOptions>({
    projectionType: 'Object To Probe Vectors',
    ignoreEdgeProjections: false,
    overrideTargetOffsets: false,
    overrideTargetOffsetsValue: 0,
    addExtraMaterialThickness: false,
    extraMaterialThicknessValue: 0,
  }),
});

export const PointDeltaReportOptions = Object.freeze({
  default: deepFreeze<PointDeltaReportOptions>({
    coordinateSystem: CoordinateSystemType.cartesian,
    detailsFormat: 'Single',
    showPointA: true,
    showPointB: true,
    showDelta: true,
    showMagnitude: true,
    showComponent1: true,
    showComponent2: true,
    showComponent3: true,
    sortPointNames: false,
    showToleranceFields: true,
    colorizeInToleranceFields: true,
  }),
});

export const ReportOutputOptions = Object.freeze({
  default: deepFreeze<ReportOutputOptions>({
    outputType: ReportOutputType.saReport,
    embeddedFile: { collectionName: '', fileName: 'My Report' },
  }),
});

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}
