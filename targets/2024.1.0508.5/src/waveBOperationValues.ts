// Handwritten Wave B domain values.
import type {
  CollectionInstrumentId,
  CollectionItemName,
  CollectionObjectName,
  Color,
  Font,
  PointName,
  Transform,
  Vector,
  WorldTransform,
} from './operationValues.js';

export type AxisIdentifier =
  | 'positive-x'
  | 'negative-x'
  | 'positive-y'
  | 'negative-y'
  | 'positive-z'
  | 'negative-z';

export type BSplinePointSortMode =
  | 'use_selection_order'
  | 'closest_neighbors_from_first_selection'
  | 'closest_neighbors_in_curve_direction';

export type CircleLineMode = 'circle' | 'line';

export type CloudBoxType =
  | 'worldAxisAlignedBox'
  | 'workAxisAlignedBox'
  | 'minimumOrientedBoxUnconditional'
  | 'minimumOrientedBoxVerifyVolume';

export type CloudThinningMode = 'None' | 'Random' | 'Nth Point';

export type CollimationBaselineMethod =
  | 'Determined By Value'
  | 'Determined From Scale'
  | 'Determined From Known Point';

export type CollimationTiltMode = 'Full Collimation' | 'No-Tilt Collimation';

export type ConstructObjectType =
  | 'any'
  | 'circles'
  | 'cones'
  | 'cylinders'
  | 'lines'
  | 'planes'
  | 'slots'
  | 'spheres'
  | 'center_points'
  | 'surface_points'
  | 'vertex_points';

export type DynamicCircleMode =
  | 'Cylinder and Plane Intersection - Hold Plane Normal'
  | 'Cylinder and Plane Intersection - Hold Cylinder Axis'
  | 'Cone and Plane Intersection - Hold Plane Normal'
  | 'Cone and Plane Intersection - Hold Cone Axis'
  | 'Sphere and Plane Intersection'
  | 'Two Cones Intersection'
  | 'Cone and Cylinder Intersection';

export type DynamicEllipseMode =
  'Cylinder and Plane Intersection' | 'Cone and Plane Intersection';

export type DynamicLineMode =
  | 'Cone Axis'
  | 'Cylinder Axis'
  | 'Intersection of Two Planes'
  | 'Bisect Two Lines'
  | 'Slot Centerline Along Length';

export type DynamicPlaneMode =
  | 'Bisect Two Planes'
  | 'Two Cones Intersection - Hold Normal to Best-Fit Plane'
  | 'Two Cones Intersection - Hold Normal to First Cone Axis'
  | 'Two Cones Intersection - Hold Normal to Second Cone Axis'
  | 'Cone and Cylinder Intersection - Hold Normal to Best-Fit Plane'
  | 'Cone and Cylinder Intersection - Hold Normal to Cone Axis'
  | 'Cone and Cylinder Intersection - Hold Normal to Cylinder Axis'
  | 'Offset Plane From Plane';

export type DynamicPointMode =
  | 'Intersection of Line and Plane'
  | 'Intersection of Cylinder and Plane'
  | 'Intersection of Cone and Plane'
  | 'Intersection of Three Planes'
  | 'Mid-Point of Perpendicular to Two Lines';

export type EdgePointMode = 'Include Edges' | 'Exclude Edges' | 'Edges Only';

export type FrameAxis = 'x' | 'y' | 'z';

export type FrameConstructionMethod =
  | 'origin-x-xy'
  | 'origin-x-xz'
  | 'origin-y-yx'
  | 'origin-y-yz'
  | 'origin-z-zx'
  | 'origin-x-zy';

export type GdtDistanceBetweenMode = 'centroid' | 'minMax';

export type GdtEvaluationMethod =
  | 'none'
  | 'asme1994'
  | 'asme2009'
  | 'asme2018'
  | 'iso1983'
  | 'iso2004'
  | 'iso2017';

export type GdtExtendedEvaluationMethod =
  | 'leastSquares'
  | 'highPoint'
  | 'minimumSeparation'
  | 'leastSquaresHighPoint'
  | 'leastSquares3d'
  | 'leastSquaresHighPoint1StdDev'
  | 'leastSquaresHighPoint2StdDev'
  | 'leastSquaresHighPointHalfway'
  | 'minimumSeparationHighPoint'
  | 'equalizedHighPoint'
  | 'equalizedLsqHighPoint';

export type GdtFeatureType =
  | 'diameter'
  | 'radius'
  | 'distanceBetween'
  | 'width'
  | 'length'
  | 'angleBetween'
  | 'angularity'
  | 'perpendicularity'
  | 'parallelism'
  | 'circularity'
  | 'concentricity'
  | 'cylindricity'
  | 'straightness'
  | 'surfaceProfile'
  | 'lineProfile'
  | 'compositeSurfaceProfile'
  | 'flatness'
  | 'truePosition'
  | 'compositeTruePosition'
  | 'circularRunout'
  | 'totalRunout';

export type GdtToleranceZoneType =
  | 'none'
  | 'cylindrical'
  | 'planar'
  | 'spherical'
  | 'radialArc'
  | 'radialPlanar'
  | 'boundary'
  | 'planarMedian'
  | 'surface';

export type GeometryRelationshipPointEditMode =
  'Point List' | 'Point Graph' | 'Sub-Sampler Settings';

export type InspectionFilter = 'ALL' | 'CHECKS' | 'DATUMS';

export type InstrumentPositionReportingFrame =
  'Instrument Base' | 'World' | 'Working';

export type MeshOrientationType =
  'Use Current Point of View' | 'Use Current Working Frame';

export type MirrorFramePlane = 'xy' | 'xz' | 'yz';

export type OffsetDirectionType = 'both' | 'positiveOnly' | 'negativeOnly';

export type PointOutputType = 'points' | 'cloudPoints';

export type RGBColorChannel = 'red' | 'green' | 'blue' | 'intensity';

export type RGBFilterOperation =
  | 'incrementallyApplyFilter'
  | 'resetAndApplyFilter'
  | 'resetAllCloudPointsVisible';

export type RobotActiveJointComponent =
  'NONE' | 'X' | 'Y' | 'Z' | 'Rx' | 'Ry' | 'Rz' | 'Alpha' | 'A' | 'D' | 'THETA';

export type RobotModelLinkType = 'DH' | '6DOF';

export type ShowUsmnDialog = 'No' | 'Yes' | 'On Tolerance Violation';

export type SolverMode =
  | 'Gauss-Newton'
  | 'Levenberg-Marquardt'
  | 'Gauss-Newton /w Gradient Search'
  | 'Direct Search';

export type SurfaceDissectionMode = 'entireSolid' | 'selectFaces';

export type SurveyTargetType = 'Triangle' | 'Circle';

export type SystemString =
  | 'SA Version'
  | 'XIT Filename'
  | 'MP Filename'
  | 'MP Filename (Full Path)'
  | 'Date & Time'
  | 'Date'
  | 'Date (Short)'
  | 'Time'
  | 'Key Serial Number'
  | 'Company Name'
  | 'User Name';

export type TargetComputationMethod =
  | 'Use most recent shot from each face'
  | 'Use only most recent shot'
  | 'Do not change prior measurements at all'
  | 'Force a new point for each measurement'
  | 'Remove all prior shots'
  | 'Deactivate all prior shots';

export type WcfAxis = 'X Axis' | 'Y Axis' | 'Z Axis';

export interface BSplineFitOptions {
  readonly openCurve?: boolean;
  readonly useInterpolationForFit?: boolean;
  readonly numberOfControlPoints?: number;
  readonly degreeOfCurve?: number;
  readonly sortMethod?: BSplinePointSortMode;
  readonly spanAnyGap?: boolean;
  readonly terminationGapLength?: number;
  readonly ignoreProximatePoints?: boolean;
  readonly proximatePointThreshold?: number;
  readonly useGlobalTessellationOptions?: boolean;
  readonly maximumChordalDeviation?: number;
  readonly maximumTrimEdgeAngle?: number;
  readonly terminationAverageMultiplier?: number;
  readonly extension?: number;
}

export interface CalloutViewProperties {
  readonly lockViewPoint?: boolean;
  readonly recallWorkingFrame?: boolean;
  readonly recallVisibleLayer?: boolean;
  readonly calloutLeaderThickness?: number; // 2
  readonly calloutLeaderColor?: Color; // RGB 128, 128, 128
  readonly calloutBorderThickness?: number; // 2
  readonly calloutBorderColor?: Color; // RGB 0, 0, 255
  readonly divideTextWithLines?: boolean;
  readonly font?: Font;
}

export interface CloudThinningOptions {
  readonly mode?: CloudThinningMode;
  readonly pointIncrement?: number;
  readonly minimumNumberOfPoints?: number;
  readonly maximumNumberOfPoints?: number;
}

export interface CloudToCadAlignmentResult {
  readonly rmsDeviation: number;
  readonly averageDeviation: number;
  readonly maximumAbsoluteDeviation: number;
  readonly resultantTransformInWorking: Transform;
}

export interface CollectionMachineId {
  readonly collectionName: string;
  readonly machineId: number;
}

export interface CurrentTrappingStatus {
  readonly active: boolean;
  readonly focusedItem?: CollectionItemName;
  readonly instrument?: CollectionInstrumentId;
}

export type DoubleVector6 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface FeatureCheckCylinderEvalOptions {
  readonly enableActualDiameterOverride: boolean;
  readonly actualDiameterOverride: number;
}

export interface FeatureCheckDatumReference {
  readonly referenceString: string;
  readonly cadFaces: string;
  readonly saObjects: readonly CollectionObjectName[];
  readonly auxiliarySaObjects: readonly CollectionObjectName[];
  readonly geometryRelationships: readonly CollectionItemName[];
  readonly auxiliaryGeometryRelationships: readonly CollectionItemName[];
}

export interface FeatureCheckReportingOptions {
  readonly showFeatureControlFrameSummary: boolean;
  readonly includeTitle: boolean;
  readonly showDatumAndToleranceSummary: boolean;
  readonly showFeatureSummary: boolean;
  readonly showPointDetails: boolean;
  readonly showLowerTierTables: boolean;
}

export interface FilterProximitySettings {
  readonly surfaceInclusionProximity?: number;
  readonly edgeExclusionProximity?: number;
  readonly planarInclusionProximity?: number;
  readonly planarExclusionProximity?: number;
  readonly radialInclusionProximity?: number;
  readonly geometryExtractionTolerance?: number;
  readonly surfaceProximityMode?: OffsetDirectionType;
  readonly planarProximityMode?: OffsetDirectionType;
  readonly radialProximityMode?: OffsetDirectionType;
  readonly projectToPlane?: boolean;
  readonly assertPlaneBoundaries?: boolean;
}

export interface FitDofOptions {
  readonly allowX?: boolean;
  readonly allowY?: boolean;
  readonly allowZ?: boolean;
  readonly allowRx?: boolean;
  readonly allowRy?: boolean;
  readonly allowRz?: boolean;
  readonly rotateAboutCentroid?: boolean;
}

export interface GdtMeasurements {
  readonly pointNames: readonly PointName[];
  readonly cloudNames: readonly CollectionObjectName[];
}

export interface GdtOptions {
  readonly useHighPoints: boolean;
  readonly extrapolateAxialExtent: boolean;
  readonly excludeFromAutoEvaluation: boolean;
  readonly distanceBetweenMode?: GdtDistanceBetweenMode;
  readonly evaluationMethod?: GdtEvaluationMethod;
  readonly createActualFeatures: boolean;
  readonly createSolvedPoints: boolean;
  readonly crossSectionCriteria: number;
  readonly enableAutoFeatureDetection: boolean;
}

export interface GeometryRelationshipOutlierFilterMetrics {
  readonly firstPassRmsError: number;
  readonly firstPassMaximumError: number;
  readonly firstPassMinimumError: number;
  readonly firstPassAverageError: number;
  readonly finalPassRmsError: number;
  readonly finalPassMaximumError: number;
  readonly finalPassMinimumError: number;
  readonly finalPassAverageError: number;
  readonly totalInputPointCount: number;
  readonly excludePointCount: number;
}

export interface GroupAverageResult {
  readonly rmsDeviation: number;
  readonly maxAbsoluteDeviation: number;
  readonly averageDeviation: number;
}

export interface InstrumentTargetStatus {
  readonly isLocked: boolean;
  readonly name: string;
  readonly numberOfFaces: number;
  readonly lockedFace: number;
}

export interface InstrumentTypeName {
  readonly value: string;
}

export interface LrFlipTestResult {
  /** Length in inches. */
  readonly frontRange: number;
  /** Angle in degrees. */
  readonly frontAzimuth: number;
  /** Angle in degrees. */
  readonly frontElevation: number;
  readonly frontQuality: number;
  /** Length in inches. */
  readonly backRange: number;
  /** Angle in degrees. */
  readonly backAzimuth: number;
  /** Angle in degrees. */
  readonly backElevation: number;
  readonly backQuality: number;
  /** Length in inches. */
  readonly frontBackDifferenceRange: number;
  /** Angle in degrees. */
  readonly frontBackDifferenceAzimuth: number;
  /** Angle in degrees. */
  readonly frontBackDifferenceElevation: number;
}

export interface LrLoSeparationTestResult {
  /** Indexing starts at 1. */
  readonly primaryLo: number;
  /** Indexing starts at 1. */
  readonly secondaryLo: number;
  readonly primaryLoMeasurementCount: number;
  /** Length in inches. */
  readonly primaryLoRangeMean: number;
  /** Length in inches. */
  readonly primaryLoRangeStandardDeviation: number;
  readonly primaryLoQualityMean: number;
  readonly primaryLoQualityStandardDeviation: number;
  readonly secondaryLoMeasurementCount: number;
  /** Length in inches. */
  readonly secondaryLoRangeMean: number;
  /** Length in inches. */
  readonly secondaryLoRangeStandardDeviation: number;
  readonly secondaryLoQualityMean: number;
  readonly secondaryLoQualityStandardDeviation: number;
}

export interface LrSnrInfo {
  readonly snr: number;
  readonly sizeOfDataArray: number;
  readonly peakValueIndex: number;
  /** Value in decibels. */
  readonly peakValue: number;
  /** Range in meters. */
  readonly measuredRange: number;
}

export interface ObjectOriginResult {
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
}

export interface ObservationInfo {
  readonly instrument: CollectionInstrumentId;
  readonly sphericalValues: ObservationSphericalValues;
  readonly active: boolean;
  readonly timestamp: string;
  readonly rmsError: number;
  /** Temperature in degrees Fahrenheit. */
  readonly temperature: number;
  /** Pressure in inches of mercury. */
  readonly pressure: number;
  /** Relative humidity in percent. */
  readonly relativeHumidity: number;
  readonly infoData: string;
}

export interface ObservationSphericalValues {
  readonly distance: number;
  readonly azimuth: number;
  readonly elevation: number;
}

export interface PerimeterLists {
  readonly scanPerimeters: readonly CollectionObjectName[];
  readonly exclusionPerimeters: readonly CollectionObjectName[];
}

export interface PointsToPointsRelationshipAssociatedData {
  readonly nominalPoints: readonly PointName[];
  readonly actualPoints: readonly PointName[];
}

export interface ProjectedPointGradient {
  readonly projectedPoint: Vector;
  readonly normalVector: Vector;
  readonly uDirection: Vector;
  readonly vDirection: Vector;
}

export interface RelationshipAssociatedData {
  readonly relationshipType: string;
  readonly individualPoints: readonly PointName[];
  readonly pointGroups: readonly CollectionObjectName[];
  readonly pointClouds: readonly CollectionObjectName[];
  readonly objects: readonly CollectionObjectName[];
}

export interface RelationshipStatusFlags {
  readonly dormant: boolean;
  readonly success: boolean;
  readonly measured: boolean;
  readonly failed: boolean;
  readonly unmeasured: boolean;
}

export interface RelationshipWatchWindowUdpSettings {
  readonly enabled?: boolean;
  readonly broadcast?: boolean;
  readonly ipAddress?: string;
  readonly port?: number;
}

export interface RobotCalibrationMetrics {
  readonly xyzMax: number;
  readonly xyzAverage: number;
  readonly xyzRms: number;
  readonly orientMax: number;
  readonly orientAverage: number;
  readonly orientRms: number;
  readonly robustness: number;
}

export interface SigmoidalGapFitConstraints {
  readonly useSigmoidalGapConstraints: boolean;
  readonly minimumGapBoundary: number;
  readonly minimumGapWeight: number;
  readonly maximumGapBoundary: number;
  readonly maximumGapWeight: number;
  readonly nominalGap: number;
  readonly nominalGapWeight: number;
  readonly gradientSteepnessFactor: number;
}

export interface SurfaceFaceList {
  readonly value: string;
}

export interface TcpFixtureUncertainties {
  readonly solutionValid: boolean;
  readonly refinedTcpInWorking: Transform;
  readonly uncertaintiesInTcpFixtureFrame: DoubleVector6;
  readonly uncertaintiesInWorkingFrame: DoubleVector6;
  readonly rmsError: number;
  readonly maximumAbsoluteError: number;
  readonly goodnessOfFit: number;
  readonly robustness: number;
  readonly resultNotes: readonly string[];
}

export interface UncertaintyCovarianceMatrix {
  readonly row1: DoubleVector6;
  readonly row2: DoubleVector6;
  readonly row3: DoubleVector6;
  readonly row4: DoubleVector6;
  readonly row5: DoubleVector6;
  readonly row6: DoubleVector6;
}

export interface WrtlChannelStatus {
  readonly connectionStatus: boolean;
  readonly activeChannel: number;
}

export interface CalibrationApplianceNodeStatus {
  readonly instrumentConnected: boolean;
  readonly calibrationApplianceConnected: boolean;
}

export interface CalloutPosition {
  readonly xPosition: number;
  readonly yPosition: number;
  readonly xAnchorPosition: number;
  readonly yAnchorPosition: number;
  readonly calloutWidth: number;
  readonly calloutHeight: number;
}

export interface CloudViewerInstrumentInput {
  readonly instrument: CollectionInstrumentId;
}

export interface DatumInput {
  readonly datum: CollectionItemName;
}

export type EulerXyzTransformComponents = FixedXyzTransformComponents;

export interface EulerZxzTransformComponents {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly firstRz: number;
  readonly rx: number;
  readonly secondRz: number;
}

export interface EulerZyxTransformComponents {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rz: number;
  readonly ry: number;
  readonly rx: number;
}

export interface EulerZyzTransformComponents {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly firstRz: number;
  readonly ry: number;
  readonly secondRz: number;
}

export interface FeatureCheckDatumReferencesResult {
  readonly datum1: FeatureCheckDatumReference;
  readonly datum2: FeatureCheckDatumReference;
  readonly datum3: FeatureCheckDatumReference;
}

export interface FeatureCheckInput {
  readonly featureCheck: CollectionItemName;
}

export interface FitErrorResult {
  readonly rmsError: number;
  readonly maximumError: number;
}

export interface FixedXyzTransformComponents {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rx: number;
  readonly ry: number;
  readonly rz: number;
}

export interface FixedXyzTransformVectors {
  readonly positionInWorking: Vector;
  readonly orientationInWorking: Vector;
}

export interface GeneralRelationshipStatistics {
  readonly maxDeviation: number;
  readonly rms: number;
  readonly hasSignedDeviation: boolean;
  readonly signedMaxDeviation: number;
  readonly signedMinDeviation: number;
}

export interface InstrumentBestFitResult {
  readonly transformInWorking: Transform;
  readonly optimumTransform: WorldTransform;
  readonly rmsDeviation: number;
  readonly maximumAbsoluteDeviation: number;
  readonly numberOfUnknowns: number;
  readonly numberOfEquations: number;
  readonly robustness: number;
}

export interface InstrumentModelResult {
  readonly name: string;
  readonly model: string;
}

export interface InstrumentPositionUpdate {
  readonly xOrR: number;
  /** Angle in degrees. */
  readonly yOrTheta: number;
  /** Angle in degrees. */
  readonly zOrPhi: number;
  /** Time in seconds. */
  readonly timeSinceUpdate: number;
  /** MP qualifier: Approximate. */
  readonly timestamp: string;
}

export interface InstrumentTargetsAndModeProfiles {
  readonly modeProfiles: readonly string[];
  readonly targetNames: readonly string[];
}

export interface InstrumentWeatherSetting {
  readonly temperature: number;
  /** Pressure in millimeters of mercury. */
  readonly pressure: number;
  readonly relativeHumidity: number;
  readonly setAutomatically: boolean;
}

export interface InstrumentXyzUncertainties {
  readonly xUncertainty: number;
  readonly yUncertainty: number;
  readonly zUncertainty: number;
}

export interface LastInstrumentIndexResult {
  readonly instrumentIndex: number;
  readonly instrument: CollectionInstrumentId;
}

export interface LrInstrumentInput {
  readonly instrument: CollectionInstrumentId;
}

export interface MakeGdtDatumAnnotationOptions {
  datumName: string;
  objects?: readonly CollectionObjectName[];
  geometryRelationships?: readonly CollectionItemName[];
  surfaceFaces?: SurfaceFaceList;
  auxiliaryObject?: CollectionObjectName;
  auxiliaryGeometryRelationship?: CollectionItemName;
  isSlot?: boolean;
  forceSurfaceFeature?: boolean;
}

export interface MakeGdtFeatureCheckAnnotationOptions {
  featureAnnotationName: string;
  featureType?: GdtFeatureType;
  objects?: readonly CollectionObjectName[];
  geometryRelationships?: readonly CollectionItemName[];
  surfaceFaces?: SurfaceFaceList;
  decomposeMultipleFeatures?: boolean;
  autoCreateDiameterChecks?: boolean;
  autoCreateSlotWidthChecks?: boolean;
  autoCreateSlotLengthChecks?: boolean;
  datumReferences?: string;
  tolerance?: string;
  isSlot?: boolean;
  perUnitLengthOrArea?: boolean;
  circularArea?: boolean;
  perUnitLengthDistance?: number;
  perUnitLengthStepOverPercent?: number;
  perUnitAreaWidthDistance?: number;
  perUnitAreaWidthStepOverPercent?: number;
  perUnitAreaCircleDiameter?: number;
  perUnitAreaDiameterStepOver?: number;
  auxiliaryObject?: CollectionObjectName;
  auxiliaryGeometryRelationship?: CollectionItemName;
  useNominalForDimensionTolerance?: boolean;
  useReferenceObjectForNominal?: boolean;
  nominalDimensionTolerance?: number;
  lowDimensionTolerance?: number;
  highDimensionTolerance?: number;
  toleranceZoneType?: GdtToleranceZoneType;
  useProjectedToleranceZone?: boolean;
  projectedToleranceZone?: number;
}

export interface PointComparisonResult {
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
  readonly magnitude: number;
  readonly resultingPointName: PointName;
}

export interface PointToPointRelationshipStatistics {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly deltaZ: number;
  readonly deltaMagnitude: number;
  readonly referenceFrame: CollectionObjectName;
}

export interface PointsToObjectsRelationshipStatistics {
  readonly absoluteMaxDeviation: number;
  readonly maxDeviation: number;
  readonly minDeviation: number;
  readonly rms: number;
  readonly candidatePointCount: number;
  readonly sampledPointCount: number;
  readonly rejectedPointCount: number;
  readonly usedPointCount: number;
  readonly outOfTolerancePointCount: number;
}

export interface RelationshipFitResult {
  readonly transformInReference: Transform;
  readonly transformInWorking: WorldTransform;
  readonly transformInWorld: WorldTransform;
  readonly fitObjectiveValue: number;
}

export interface RelationshipWatchWindowTemplateOptions {
  readonly linearPrecision?: number;
  readonly angularPrecision?: number;
  readonly font?: Font;
  readonly textColor?: Color;
  readonly backgroundColor?: Color;
  readonly highlightColor?: Color;
  readonly showDeviationX?: boolean;
  readonly showDeviationY?: boolean;
  readonly showDeviationZ?: boolean;
  readonly showDeviationMagnitude?: boolean;
  readonly udpNetworkTransmitSettings?: RelationshipWatchWindowUdpSettings;
  readonly transparentBackground?: boolean;
  readonly hideUnits?: boolean;
}

export interface RobotModelLinkConfiguration {
  readonly linkType?: RobotModelLinkType;
  readonly dhAlphaComponent?: number;
  readonly dhAComponent?: number;
  readonly dhDComponent?: number;
  readonly dhThetaComponent?: number;
  readonly dhXAxisDeflectionFactor?: number;
  readonly dhYAxisDeflectionFactor?: number;
  readonly dhZAxisDeflectionFactor?: number;
  readonly sixDofXComponent?: number;
  readonly sixDofYComponent?: number;
  readonly sixDofZComponent?: number;
  readonly sixDofRxComponent?: number;
  readonly sixDofRyComponent?: number;
  readonly sixDofRzComponent?: number;
  readonly activeJointComponent?: RobotActiveJointComponent;
  readonly encoderOffsetValue?: number;
  readonly minimumEncoderLimit?: number;
  readonly maximumEncoderLimit?: number;
  readonly encoderSenseNegative?: boolean;
  readonly includeAdditionalEncoder?: boolean;
  readonly additionalEncoderIndexOffset?: number;
  readonly additionalEncoderSenseNegative?: boolean;
  readonly segmentOriginMassKg?: number;
  readonly segmentCgMassKg?: number;
  readonly segmentCgInSegment?: Vector;
}

export interface RobotModelLinkParameters {
  readonly configuration: Required<RobotModelLinkConfiguration>;
  readonly encoderValue: number;
}

export interface SetInstrumentBaseUncertaintyCovarianceMatrixInput {
  readonly instrument: CollectionInstrumentId;
  readonly covarianceMatrix: UncertaintyCovarianceMatrix;
}

export interface SetMeasurementsInput {
  readonly pointNames: Iterable<PointName>;
  readonly cloudNames: Iterable<CollectionObjectName>;
  readonly replaceExistingMeasurements?: boolean;
}

export interface TrackerEdmTheodoliteUncertainties {
  /** Angle in arcseconds. */
  readonly thetaDispersion: number;
  readonly thetaThreshold: number;
  /** Angle in arcseconds. */
  readonly phiDispersion: number;
  readonly phiThreshold: number;
  /** Value in parts per million. */
  readonly distance: number;
  readonly distanceThreshold: number;
}

export interface TransformAxes {
  readonly origin: Vector;
  readonly xAxis: Vector;
  readonly yAxis: Vector;
  readonly zAxis: Vector;
}

export interface WorldFixedXyzTransformComponents extends FixedXyzTransformComponents {
  readonly scale: number;
}

export interface WorldFixedXyzTransformVectors {
  readonly positionInWorking: Vector;
  readonly orientationInWorking: Vector;
  readonly scale: number;
}
