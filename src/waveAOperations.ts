// Drafted mechanically from the approved Briosa documentation contract.
import { invokeClientOperation, type BriosaClient } from './client.js';
import type { BriosaCallOptions } from './models.js';
import {
  getOperationValueSchema,
  mapOperationResponse,
  operationScalarSchemas,
  repeatedOperationValue,
  requireOperationInput,
  resolveOperationDefault,
  toWireOperationValue,
} from './operationProtocol.js';
import {
  AngularUnits,
  ColorizationOptions,
  CompTechnique,
  CoordinateSystemType,
  DegreeOfFreedom,
  DistanceUnits,
  FitConstraintScalarOptions,
  FitMethod,
  Font,
  MeasuredSideForPlanarOffset,
  MeasuredSideForRadialOffset,
  NormalDirection,
  ObjectType,
  PointDeltaReportOptions,
  PointFilterInputType,
  ProjectionOptions,
  RelWeightingMode,
  RenderModeType,
  ReportOutputOptions,
  ReportPageSettings,
  SlotType,
  SphereFitComputationMode,
  SurfaceAnalysisMode,
  TemperatureUnits,
  ToleranceScalarOptions,
} from './operationValues.js';
import type {
  AsciiFileFormat,
  ChartName,
  ChartType,
  CollectionGroupName,
  CollectionInstrumentId,
  CollectionItemName,
  CollectionName,
  CollectionObjectName,
  CollectionVectorGroupName,
  Color,
  DatasetType,
  ExportDataDelimeterType,
  ExportTargetNameFormat,
  ExportVectorNameFormat,
  FileReference,
  FrameName,
  GeometryType,
  MpDialogInteractionMode,
  MpInteractionMode,
  PointName,
  ReportViewOptions,
  SaInteractionMode,
  ToleranceVectorOptions,
  Transform,
  TranslucencyType,
  Vector,
  VectorName,
  ViewName,
  WindowState,
  WorldTransform,
} from './operationValues.js';
import * as AnalysisOperationsProtocol from './generated/protocol/briosa/analysis_operations.js';
import * as DimensionOperationsProtocol from './generated/protocol/briosa/dimension_operations.js';
import * as EventOperationsProtocol from './generated/protocol/briosa/event_operations.js';
import * as FileOperationsProtocol from './generated/protocol/briosa/file_operations.js';
import * as MpSubroutinesProtocol from './generated/protocol/briosa/mp_subroutines.js';
import * as MpTaskOverviewProtocol from './generated/protocol/briosa/mp_task_overview.js';
import * as ProcessFlowOperationsProtocol from './generated/protocol/briosa/process_flow_operations.js';
import * as RelationshipOperationsProtocol from './generated/protocol/briosa/relationship_operations.js';
import * as ReportingOperationsProtocol from './generated/protocol/briosa/reporting_operations.js';
import * as ScaleBarOperationsProtocol from './generated/protocol/briosa/scale_bar_operations.js';
import * as UtilityOperationsProtocol from './generated/protocol/briosa/utility_operations.js';
import * as VariablesProtocol from './generated/protocol/briosa/variables.js';
import * as VectorOperationsProtocol from './generated/protocol/briosa/vector_operations.js';
import * as ViewControlProtocol from './generated/protocol/briosa/view_control.js';

export interface ActiveUnits {
  readonly length: string;
  readonly angular: string;
  readonly temperature: string;
}

export interface AddAVectorToVectorNameRefListInput {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorName?: string;
  readonly vectorNameList: Iterable<VectorName>;
}

export interface AddChartsToReportBarInput {
  readonly charts: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddCustomTableToSaReportInput {
  readonly tableName: CollectionObjectName;
  readonly reportName: CollectionObjectName;
  readonly showReport?: boolean;
}

export interface AddCustomTablesToReportBarInput {
  readonly customTablesToReport: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddDatumsToReportBarInput {
  readonly datums: Iterable<CollectionObjectName>;
  readonly clearExisting?: boolean;
}

export interface AddDoubleToNamedDoubleListVariableInput {
  readonly name?: string;
  readonly doubleValue?: number;
}

export interface AddEventsToReportBarInput {
  readonly events: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddFeatureChecksToReportBarInput {
  readonly featureChecks: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddItemToSaReportAtLocationInput {
  readonly reportName: CollectionObjectName;
  readonly itemName: CollectionObjectName;
  readonly pageNumber?: number;
  readonly horizontalLocation?: number;
  readonly verticalLocation?: number;
  readonly showReport?: boolean;
}

export interface AddObjectsToReportBarInput {
  readonly objects: Iterable<CollectionObjectName>;
  readonly clearExisting?: boolean;
}

export interface AddPicturesToReportBarInput {
  readonly pictures: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddRelationshipsToReportBarInput {
  readonly relationships: Iterable<CollectionItemName>;
  readonly clearExisting?: boolean;
}

export interface AddTaskOverviewItemInput {
  readonly taskName?: string;
  readonly commentText?: string;
  readonly effortIndex?: number;
}

export interface AngleBetweenLineAndPlaneInput {
  readonly selectedLine: CollectionObjectName;
  readonly selectedPlane: CollectionObjectName;
  readonly nominalAngle?: number;
  readonly angleTolerance00ForNone?: number;
}

export interface AngleBetweenTwoLinesInput {
  readonly line1: CollectionObjectName;
  readonly line2: CollectionObjectName;
  readonly nominalAngle?: number;
  readonly angleTolerance00ForNone?: number;
}

export interface AngleBetweenTwoPlanesNormalsInput {
  readonly planeA: CollectionObjectName;
  readonly planeB: CollectionObjectName;
  readonly nominalAngle?: number;
  readonly angleTolerance00ForNone?: number;
}

export interface AppendItemsToSaReportInput {
  readonly reportName: CollectionObjectName;
  readonly itemsToReport: Iterable<CollectionObjectName>;
  readonly showReport?: boolean;
  readonly beginOnNewPage?: boolean;
}

export interface AskForDoubleInput {
  readonly questionToAsk?: string;
  readonly initialValue?: number;
  readonly enforceMinMaxValues?: boolean;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly font?: Font;
}

export interface AskForIntegerInput {
  readonly questionToAsk?: string;
  readonly initialValue?: number;
  readonly enforceMinMaxValues?: boolean;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly font?: Font;
}

export interface AskForPointNameInput {
  readonly questionToAsk?: string;
  readonly initialValue: PointName;
  readonly font?: Font;
}

export interface AskForStringInput {
  readonly questionToAsk?: string;
  readonly passwordEntry?: boolean;
  readonly initialAnswer?: string;
  readonly font?: Font;
}

export interface AskForStringPullDownVersionInput {
  readonly questionOrStatement: Iterable<string>;
  readonly possibleAnswers: Iterable<string>;
  readonly font?: Font;
}

export interface AskForStringPullDownVersionResult {
  readonly answer: string;
  readonly answerIndex: number;
}

export interface AskForUserDecisionFromImageInput {
  readonly imageFile: FileReference;
  readonly imageMapXmlFile: FileReference;
  readonly windowCaption?: string;
  readonly windowWidth0Default?: number;
  readonly windowHeight0Default?: number;
}

export interface AskForUserDecisionFromStringsInput {
  readonly questionOrStatement: Iterable<string>;
  readonly font?: Font;
  readonly button1TextEmptyToHideButton?: string;
  readonly button2TextEmptyToHideButton?: string;
  readonly button3TextEmptyToHideButton?: string;
}

export interface AutoRangeAndSetVectorGroupColorizationAllInput {
  readonly treatIndividually?: boolean;
  readonly colorizationOptionsUsesModeOnly?: ColorizationOptions;
}

export interface AutoRangeAndSetVectorGroupColorizationSelectedInput {
  readonly vectorGroupsToBeSet: Iterable<CollectionVectorGroupName>;
  readonly treatIndividually?: boolean;
  readonly colorizationOptionsUsesModeOnly?: ColorizationOptions;
}

export interface BestFitTransformationGroupToGroupInput {
  readonly referenceGroup: CollectionObjectName;
  readonly correspondingGroup: CollectionObjectName;
  readonly showInterface?: boolean;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
  readonly allowScale?: boolean;
  readonly allowX?: boolean;
  readonly allowY?: boolean;
  readonly allowZ?: boolean;
  readonly allowRx?: boolean;
  readonly allowRy?: boolean;
  readonly allowRz?: boolean;
  readonly lockDegreesOfFreedom?: boolean;
  readonly generateEvent?: boolean;
  readonly filePathForCsvTextReportRequiresShowInterfaceTrue: FileReference;
}

export interface BestFitTransformationGroupToGroupResult {
  readonly transformInWorking: Transform;
  readonly optimumTransform: WorldTransform;
  readonly rmsDeviation: number;
  readonly maximumAbsoluteDeviation: number;
  readonly numberOfUnknowns: number;
  readonly numberOfEquations: number;
  readonly robustness: number;
}

export interface CaptureCurrentViewInput {
  readonly pictureName: CollectionItemName;
}

export interface CaptureScreenToFileBmpJpgPngGifTiffInput {
  readonly fileToSaveTo: FileReference;
}

export interface CenterGraphicsAboutObjectsInput {
  readonly objectType?: ObjectType;
  readonly collectionWildcardCriteria?: string;
  readonly objectWildcardCriteria?: string;
}

export interface CenterGraphicsAboutPointInput {
  readonly pointName: PointName;
}

export interface ClearCustomTableInput {
  readonly tableName: CollectionObjectName;
}

export interface ClearNamedDoubleListVariableInput {
  readonly name?: string;
}

export interface CombineSaReportsInput {
  readonly saReportsToCombine: Iterable<CollectionItemName>;
  readonly outputSaReportName: CollectionObjectName;
  readonly showReport?: boolean;
}

export interface ComputeGroupToGroupOrientationRxRyRzInput {
  readonly referenceGroup: CollectionObjectName;
  readonly correspondingGroup: CollectionObjectName;
}

export interface ComputeGroupToGroupOrientationRxRyRzResult {
  readonly rx: number;
  readonly ry: number;
  readonly rz: number;
}

export interface CopyGeneralFileInput {
  readonly sourceFileName: FileReference;
  readonly destinationFileName: FileReference;
  readonly overwrite?: boolean;
}

export interface CreateChartFromVectorGroupInput {
  readonly newChartName: ChartName;
  readonly vectorGroupName: CollectionObjectName;
  readonly chartType: ChartType;
  readonly dataSetToChart: DatasetType;
  readonly auxDataSetToChart: DatasetType;
  readonly templateChartNameOptional: ChartName;
  readonly showInterface?: boolean;
}

export interface CreateClearTaskOverviewListInput {
  readonly taskNameFont?: Font;
  readonly taskCommentFont?: Font;
}

export interface CreatePointUncertaintyCloudPointSetsInput {
  readonly pointNameList: Iterable<PointName>;
  readonly numberOfSamples?: number;
  readonly uncertaintyReferenceFrameMode?: string;
  readonly groupingMode?: string;
  readonly pointSetMode?: string;
}

export interface CreatePointUncertaintyCloudPointSetsResult {
  readonly pointGroups: readonly CollectionObjectName[];
  readonly pointSets: readonly CollectionObjectName[];
  readonly pointClouds: readonly CollectionObjectName[];
}

export interface CreatePointUncertaintyFieldsInput {
  readonly pointNameList: Iterable<PointName>;
  readonly numberOfSamples?: number;
}

export interface DefinePointOfViewInput {
  readonly viewName: ViewName;
  readonly rotationX?: number;
  readonly rotationY?: number;
  readonly rotationZ?: number;
  readonly restoreZoomSettings?: boolean;
  readonly scaleFactor?: number;
  readonly originX?: number;
  readonly originY?: number;
  readonly restoreRenderMode?: boolean;
  readonly renderingMode?: RenderModeType;
}

export interface DefineReportTemplateInput {
  readonly reportTemplateName: CollectionObjectName;
  readonly title: Iterable<string>;
  readonly graphicalViewOptions: ReportViewOptions;
  readonly itemsToReport: Iterable<CollectionObjectName>;
  readonly relationshipsToReport: Iterable<CollectionItemName>;
  readonly eventsToReport: Iterable<CollectionItemName>;
  readonly reportOutputOptions?: ReportOutputOptions;
  readonly reportPageSettingsSaReportOnly?: ReportPageSettings;
  readonly generateNow?: boolean;
  readonly showGeneratedReport?: boolean;
}

export interface DeleteChartInput {
  readonly chartName: CollectionObjectName;
}

export interface DeleteCustomTableInput {
  readonly tableName: CollectionObjectName;
}

export interface DeleteDimensionInput {
  readonly dimensionName: CollectionObjectName;
}

export interface DeleteEventInput {
  readonly eventName: CollectionObjectName;
}

export interface DeleteFolderInput {
  readonly folderPath?: string;
}

export interface DeleteGeneralFileInput {
  readonly fileName: FileReference;
}

export interface DeleteItemsInput {
  readonly itemList: Iterable<CollectionItemName>;
}

export interface DeleteIthVectorFromVectorGroupInput {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorIndex?: number;
}

export interface DeleteObjectsInput {
  readonly objectNames: Iterable<CollectionObjectName>;
}

export interface DeletePictureInput {
  readonly pictureName: CollectionItemName;
}

export interface DeleteSaDocInput {
  readonly docName: CollectionObjectName;
}

export interface DeleteSaReportInput {
  readonly reportName: CollectionObjectName;
}

export interface DeleteSaReportTemplateInput {
  readonly reportTemplateName: CollectionObjectName;
}

export interface DeleteScaleBarInput {
  readonly scaleBarName: CollectionObjectName;
}

export interface DeleteVariableInput {
  readonly name?: string;
}

export interface DeleteVariablesWildcardMatchInput {
  readonly variableWildcardCriteria?: string;
}

export interface DeleteVectorByNameInput {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorName?: string;
}

export interface DeleteVectorsInput {
  readonly vectorNameList: Iterable<VectorName>;
}

export interface DirectCadAccessInput {
  readonly cadFileName: FileReference;
  readonly importSolids?: boolean;
  readonly importSurfaces?: boolean;
  readonly importPolygonizedSurfaces?: boolean;
  readonly importAnnotations?: boolean;
  readonly importVectors?: boolean;
  readonly importPoints?: boolean;
  readonly pointGroupName?: string;
  readonly importAttributesMetadata?: boolean;
  readonly importCooordinateFrames?: boolean;
  readonly importPlanes?: boolean;
  readonly import3DCurvesLines?: boolean;
  readonly import3DCurvesCircles?: boolean;
  readonly import3DCurvesGeneralCurves?: boolean;
  readonly importConstructionGeometry?: boolean;
  readonly importHiddenEntities?: boolean;
  readonly importAllSurfacesAsMeshGraphicalEntities?: boolean;
  readonly doNotImportFillets?: boolean;
  readonly doNotImportDittos?: boolean;
  readonly dittoThreshold?: number;
  readonly centerViewOnImportedObjects?: boolean;
  readonly importIntoFoldersMatchingCadFileHierarchy?: boolean;
  readonly removeEmptyFolders?: boolean;
  readonly surfaceNormalsMode1Or2?: number;
  readonly promptOnMissingComponents?: boolean;
  readonly selectiveImport?: boolean;
  readonly surfaceCompatibilityMode?: boolean;
  readonly explodeSurfaces?: boolean;
  readonly cadFileUnitsLeaveBlankToUseTheUnitsSpecifiedInTheFile?: string;
  readonly buildCalloutViews?: boolean;
}

export interface DirectCadAccessResult {
  readonly importWarnings: boolean;
  readonly importWarningMessages: string;
  readonly extentsMin: Vector;
  readonly extentsMax: Vector;
}

export interface EnableDisableRelationshipsForOptimizationInput {
  readonly relationships: Iterable<CollectionItemName>;
  readonly enable?: boolean;
}

export interface ExportAsciiFrameSetInput {
  readonly asciiFilePath: FileReference;
  readonly frameSetContainer: CollectionObjectName;
  readonly dataDelimiter: ExportDataDelimeterType;
  readonly fileFormat: AsciiFileFormat;
  readonly includeExportFormatInfo?: boolean;
  readonly decimalPrecision?: number;
  readonly append?: boolean;
}

export interface ExportAsciiFramesInput {
  readonly asciiFilePath: FileReference;
  readonly objectList: Iterable<CollectionObjectName>;
  readonly exportFrameMode?: string;
  readonly overwriteExistingFile?: boolean;
}

export interface ExportAsciiPointCloudsInput {
  readonly asciiFilePath: FileReference;
  readonly pointCloudList: Iterable<CollectionObjectName>;
  readonly dataDelimiter: ExportDataDelimeterType;
  readonly overwriteExistingFile?: boolean;
  readonly showProgressDialog?: boolean;
  readonly includeCloudPointLabeling?: boolean;
  readonly includeScanDirectionVector?: boolean;
}

export interface ExportAsciiPointSetInput {
  readonly asciiFilePath: FileReference;
  readonly pointSetContainer: CollectionObjectName;
  readonly dataDelimiter: ExportDataDelimeterType;
  readonly targetNameFormat: ExportTargetNameFormat;
  readonly desiredCoordinateSystem: CoordinateSystemType;
  readonly includeTargetOffsets?: boolean;
  readonly includeTimestamps?: boolean;
  readonly includeSaVersionAndFrameComments?: boolean;
  readonly includeAxisComments?: boolean;
  readonly includeExportFormatInfo?: boolean;
  readonly maximumPrecisionScientificNotation?: boolean;
  readonly decimalPrecision?: number;
  readonly append?: boolean;
}

export interface ExportAsciiPointsInput {
  readonly asciiFilePath: FileReference;
  readonly groupNamesToExport: Iterable<CollectionGroupName>;
  readonly dataDelimiter: ExportDataDelimeterType;
  readonly targetNameFormat: ExportTargetNameFormat;
  readonly desiredCoordinateSystem: CoordinateSystemType;
  readonly includeTargetOffsets?: boolean;
  readonly includeTargetComments?: boolean;
  readonly includeTimestamps?: boolean;
  readonly includeTolerances?: boolean;
  readonly includeCoordinateUncertainties?: boolean;
  readonly includeSaVersionAndFrameComments?: boolean;
  readonly includeAxisComments?: boolean;
  readonly includeExportFormatInfo?: boolean;
  readonly includeWeights?: boolean;
  readonly includeMeasurementDetails?: boolean;
  readonly maximumPrecisionScientificNotation?: boolean;
  readonly decimalPrecision?: number;
  readonly append?: boolean;
}

export interface ExportDxfInput {
  readonly dxfFilePath: FileReference;
  readonly pointNames: Iterable<PointName>;
  readonly cloudNames: Iterable<CollectionObjectName>;
  readonly includePointLabels?: boolean;
}

export interface ExportEmbeddedFileInput {
  readonly embeddedFileCollectionName: CollectionName;
  readonly embeddedFileName?: string;
  readonly externalFileName: FileReference;
  readonly replaceExisting?: boolean;
}

export interface ExportEventRefListInput {
  readonly eventList: Iterable<CollectionItemName>;
  readonly filePath: FileReference;
  readonly decimalPrecision?: number;
  readonly overwriteExistingFile?: boolean;
}

export interface ExportHiddenPointBarXmlFileInput {
  readonly xmlFilePath: FileReference;
}

export interface ExportIgesFileEntireModelInput {
  readonly igesFilePath: FileReference;
}

export interface ExportIgesFilePartialModelInput {
  readonly igesFilePath: FileReference;
  readonly objectNameList: Iterable<CollectionObjectName>;
}

export interface ExportPtxPointCloudsInput {
  readonly ptxFilePath: FileReference;
  readonly pointCloudList: Iterable<CollectionObjectName>;
  readonly overwriteExistingFile?: boolean;
  readonly showProgressDialog?: boolean;
}

export interface ExportQdasCharacteristicsInput {
  readonly qdasExportFilePath: FileReference;
  readonly k1001PartNumber?: string;
  readonly k1002PartDescription?: string;
  readonly k1071SupplierNumber?: string;
  readonly k1072SupplierDescription?: string;
  readonly k1203ReasonForTest?: string;
  readonly k1303Plant?: string;
  readonly k1900PartRemark?: string;
  readonly k0006BatchNumber?: string;
  readonly k0014PartId?: string;
  readonly k0053OrderNumber?: string;
  readonly k0004DateTimeStamp?: string;
  readonly k0008OperatorIdentifier?: number;
  readonly k0010MachineIdentifier?: number;
  readonly k0012GageIdentifier?: number;
  readonly relationshipList: Iterable<CollectionItemName>;
  readonly featureCheckList: Iterable<CollectionItemName>;
  readonly vectorGroupList: Iterable<CollectionObjectName>;
}

export interface ExportQdasDataListInput {
  readonly qdasExportFilePath: FileReference;
}

export interface ExportScanStripeMeshToStlFileInput {
  readonly stlFilePath: FileReference;
  readonly mesh: CollectionObjectName;
}

export interface ExportStepFileEntireModelInput {
  readonly stepFilePath: FileReference;
}

export interface ExportStepFilePartialModelInput {
  readonly stepFilePath: FileReference;
  readonly objectNameList: Iterable<CollectionObjectName>;
}

export interface ExportVdaFsFileEntireModelInput {
  readonly vdaFsFilePath: FileReference;
}

export interface ExportVdaFsFilePartialModelInput {
  readonly vdaFsFilePath: FileReference;
  readonly objectNameList: Iterable<CollectionObjectName>;
}

export interface ExportVectorContainerToAsciiFileInput {
  readonly asciiFilePath: FileReference;
  readonly vectorGroupsToExport: Iterable<CollectionVectorGroupName>;
  readonly overwriteExistingFileFalseAppend?: boolean;
  readonly useFullPrecisionScientificNotation?: boolean;
  readonly vectorNameFormat: ExportVectorNameFormat;
  readonly includeVectorLength?: boolean;
}

export interface FindFilesInDirectoryInput {
  readonly directory?: string;
  readonly fileNamePattern?: string;
  readonly recursive?: boolean;
}

export interface FindSubDirectoriesInDirectoryInput {
  readonly directory?: string;
  readonly recursive?: boolean;
}

export interface FitGeometryToPointGroupInput {
  readonly geometryType: GeometryType;
  readonly groupToFit: CollectionObjectName;
  readonly resultingObjectName: CollectionObjectName;
  readonly fitProfileName?: string;
  readonly reportDeviations?: boolean;
  readonly fitInterfaceTolerance10UseProfile?: number;
  readonly ignoreOutOfTolerancePoints?: boolean;
  readonly startingConditionGeometryOptional: CollectionObjectName;
}

export interface FitGeometryToPointGroupProjectedToPlaneInput {
  readonly geometryType: GeometryType;
  readonly groupToFit: CollectionObjectName;
  readonly planeName: CollectionObjectName;
  readonly resultingObjectName: CollectionObjectName;
  readonly fitProfileName?: string;
  readonly reportDeviations?: boolean;
  readonly fitInterfaceTolerance10UseProfile?: number;
  readonly ignoreOutOfTolerancePoints?: boolean;
  readonly startingConditionGeometryOptional: CollectionObjectName;
}

export interface FitGeometryToPointsInput {
  readonly geometryType: GeometryType;
  readonly pointsToFit: Iterable<PointName>;
  readonly resultingObjectName: CollectionObjectName;
  readonly fitProfileName?: string;
  readonly reportDeviations?: boolean;
  readonly fitInterfaceTolerance10UseProfile?: number;
  readonly ignoreOutOfTolerancePoints?: boolean;
  readonly startingConditionGeometryOptional: CollectionObjectName;
}

export interface GenerateQuickReportFromTabOrderInput {
  readonly reportOutputOptions?: ReportOutputOptions;
  readonly openReport?: boolean;
}

export interface GenerateStandardHtmlReportInput {
  readonly htmlOutputFile: FileReference;
  readonly decimalPrecision?: number;
}

export interface GenerateUpdateTemplatedReportInput {
  readonly reportTemplate: CollectionObjectName;
}

export interface GeomRelationshipIgnoreInputPointsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GeomRelationshipReuseIgnoredInputPointsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetActiveLanguageResult {
  readonly languageFileName: FileReference;
  readonly customLanguage: boolean;
}

export interface GetBSplinePropertiesInput {
  readonly bSplineName: CollectionObjectName;
}

export interface GetBSplinePropertiesResult {
  readonly degree: number;
  readonly knots: number;
  readonly controlPoints: number;
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly length: number;
}

export interface GetBooleanFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly booleanName?: string;
}

export interface GetBooleanVariableInput {
  readonly name?: string;
}

export interface GetCirclePropertiesInput {
  readonly circleName: CollectionObjectName;
}

export interface GetCirclePropertiesResult {
  readonly centerCoordinate: Vector;
  readonly normalDirection: Vector;
  readonly radius: number;
  readonly diameter: number;
}

export interface GetCollectionNotesInput {
  readonly collection: CollectionName;
}

export interface GetCollectionObjectNameVariableInput {
  readonly name?: string;
}

export interface GetCollectionObjectRefListVariableInput {
  readonly name?: string;
}

export interface GetConePropertiesInput {
  readonly coneName: CollectionObjectName;
}

export interface GetConePropertiesResult {
  readonly coneEndPointInWorkingCoordinates: Vector;
  readonly coneAxisInWorkingCoordinates: Vector;
  readonly coneLength: number;
  readonly coneThetaStart: number;
  readonly coneThetaSpan: number;
  readonly coneIncludedAngle: number;
  readonly cutLengthFromApex: number;
}

export interface GetCoordinateForIthPointInPointSetInput {
  readonly pointSet: CollectionObjectName;
  readonly pointSetIndex?: number;
}

export interface GetCoordinateForIthPointInPointSetResult {
  readonly pointName: string;
  readonly pointCoordinates: Vector;
}

export interface GetCustomTableCellDoubleInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
}

export interface GetCustomTableCellStringInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
}

export interface GetCylinderPropertiesInput {
  readonly cylinderName: CollectionObjectName;
}

export interface GetCylinderPropertiesResult {
  readonly beginCoordinate: Vector;
  readonly endCoordinate: Vector;
  readonly axisDirection: Vector;
  readonly length: number;
  readonly radius: number;
  readonly diameter: number;
  readonly nominalsPointInward: boolean;
  readonly facets: number;
  readonly enableThetaExtentDisplayMode: boolean;
  readonly thetaStartInDegrees: number;
  readonly thetaSpanInDegrees: number;
}

export interface GetDimensionValueInput {
  readonly dimensionName: CollectionObjectName;
}

export interface GetDimensionValueResult {
  readonly dimensionsValue: number;
  readonly nominalValueEnabled: boolean;
  readonly highToleranceEnabled: boolean;
  readonly lowToleranceEnabled: boolean;
  readonly nominalValue: number;
  readonly highTolerance: number;
  readonly lowTolerance: number;
}

export interface GetDoubleFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly doubleName?: string;
}

export interface GetDoubleVariableInput {
  readonly name?: string;
}

export interface GetEllipsePropertiesInput {
  readonly ellipseName: CollectionObjectName;
}

export interface GetEllipsePropertiesResult {
  readonly centerCoordinate: Vector;
  readonly normalDirection: Vector;
  readonly majorAxisRadius: number;
  readonly minorAxisRadius: number;
}

export interface GetEulerParametersForFrameInput {
  readonly frame: CollectionObjectName;
}

export interface GetEulerParametersForFrameResult {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly e1: number;
  readonly e2: number;
  readonly e3: number;
  readonly e4: number;
}

export interface GetEulerParametersForIthFrameInFrameSetInput {
  readonly frameSet: CollectionObjectName;
  readonly frameSetIndex?: number;
}

export interface GetEulerParametersForIthFrameInFrameSetResult {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly e1: number;
  readonly e2: number;
  readonly e3: number;
  readonly e4: number;
}

export interface GetFolderCollectionsInput {
  readonly folderPath?: string;
}

export interface GetFolderNotesInput {
  readonly folderPath?: string;
}

export interface GetFoldersByWildcardInput {
  readonly searchString?: string;
  readonly caseSensitiveSearch?: boolean;
}

export interface GetGeomRelationshipAutoVectorsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipAutoVectorsResult {
  readonly autoVectorsNominalAvnEnabled: boolean;
  readonly autoVectorsNominalAvnName: CollectionObjectName;
  readonly autoVectorsFitAvfEnabled: boolean;
  readonly autoVectorsFitAvfName: CollectionObjectName;
  readonly pointsType: string;
}

export interface GetGeomRelationshipCardinalPointsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipCriteriaInput {
  readonly relationshipName: CollectionObjectName;
  readonly criteria?: string;
}

export interface GetGeomRelationshipCriteriaResult {
  readonly nominal: number;
  readonly measured: number;
  readonly delta: number;
  readonly lowTolerance: number;
  readonly highTolerance: number;
  readonly optimizationDeltaWeight: number;
  readonly optimizationOutOfToleranceWeight: number;
  readonly isWithinTolerance: string;
  readonly hasUncertainty: boolean;
  readonly uncertainty: number;
}

export interface GetGeomRelationshipMeasuredAvgPointInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipMeasuredGeometryInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipNominalAvgPointInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipNominalGeometryInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipPointListInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetGeomRelationshipPointListResult {
  readonly allPoints: readonly PointName[];
  readonly usedPoints: readonly PointName[];
  readonly ignoredPoints: readonly PointName[];
}

export interface GetGeomRelationshipProjectionPlaneInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetIntegerFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly integerName?: string;
}

export interface GetIntegerVariableInput {
  readonly name?: string;
}

export interface GetIthCollectionNameInput {
  readonly collectionIndex?: number;
}

export interface GetIthEventFromEventRefListInput {
  readonly eventList: Iterable<CollectionItemName>;
  readonly eventIndex?: number;
}

export interface GetIthPointFromGroupInput {
  readonly groupName: CollectionObjectName;
  readonly pointIndex?: number;
}

export interface GetIthPointFromGroupResult {
  readonly completePointName: PointName;
  readonly pointNameOnly: string;
  readonly vectorInWorking: Vector;
}

export interface GetIthVectorFromVectorGroupInput {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorIndex?: number;
}

export interface GetIthVectorFromVectorGroupResult {
  readonly vectorName: string;
  readonly beginInWorking: Vector;
  readonly endInWorking: Vector;
  readonly totalDeltaInWorking: Vector;
  readonly ijkUnitVectorInWorking: Vector;
  readonly magnitude: number;
}

export interface GetIthVectorFromVectorNameRefListInput {
  readonly vectorNameList: Iterable<VectorName>;
  readonly vectorIndex?: number;
}

export interface GetIthVectorFromVectorNameRefListResult {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorName: string;
  readonly beginInWorking: Vector;
  readonly endInWorking: Vector;
  readonly totalDeltaInWorking: Vector;
  readonly ijkUnitVectorInWorking: Vector;
  readonly magnitude: number;
}

export interface GetLinePropertiesInput {
  readonly lineName: CollectionObjectName;
}

export interface GetLinePropertiesResult {
  readonly beginCoordinate: Vector;
  readonly endCoordinate: Vector;
  readonly deltaComponents: Vector;
  readonly length: number;
  readonly angleAboutXFromYInYzPlane: number;
  readonly angleAboutYFromZInXzPlane: number;
  readonly angleAboutZFromXInXyPlane: number;
}

export interface GetMeasurementAuxiliaryDataInput {
  readonly pointName: PointName;
  readonly auxiliaryName?: string;
}

export interface GetMeasurementAuxiliaryDataResult {
  readonly value: number;
  readonly units: string;
}

export interface GetMeasurementInfoDataInput {
  readonly pointName: PointName;
}

export interface GetMeasurementWeatherDataInput {
  readonly pointName: PointName;
}

export interface GetMeasurementWeatherDataResult {
  readonly temperatureDegF: number;
  readonly pressureInHg: number;
  readonly humidityRh: number;
}

export interface GetNamedDoubleListVariableInput {
  readonly name?: string;
}

export interface GetNamedDoubleListVariableMinMaxInput {
  readonly name?: string;
}

export interface GetNamedDoubleListVariableMinMaxResult {
  readonly minimumValue: number;
  readonly maximumValue: number;
}

export interface GetNumberOfEventsInEventRefListInput {
  readonly eventList: Iterable<CollectionItemName>;
}

export interface GetNumberOfFramesInFrameSetInput {
  readonly frameSetContainer: CollectionObjectName;
}

export interface GetNumberOfPointsInGroupInput {
  readonly groupName: CollectionObjectName;
}

export interface GetNumberOfPointsInPointSetInput {
  readonly pointSetContainer: CollectionObjectName;
}

export interface GetNumberOfVectorsInVectorGroupInput {
  readonly vectorGroupName: CollectionObjectName;
}

export interface GetNumberOfVectorsInVectorNameRefListInput {
  readonly vectorNameList: Iterable<VectorName>;
}

export interface GetObjectNotesInput {
  readonly object: CollectionObjectName;
}

export interface GetObjectReportingFrameInput {
  readonly objectName: CollectionObjectName;
}

export interface GetOpcDaTagValueDoubleInput {
  readonly opcServerDaTagName?: string;
}

export interface GetOpcDaTagValueIntegerInput {
  readonly opcServerDaTagName?: string;
}

export interface GetOpcDaTagValueStringInput {
  readonly opcServerDaTagName?: string;
}

export interface GetPipeRelationshipCutStatusInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetPipeRelationshipCutStatusResult {
  readonly pipe1CutAvailable: boolean;
  readonly pipe1CutActive: boolean;
  readonly pipe2CutAvailable: boolean;
  readonly pipe2CutActive: boolean;
}

export interface GetPipeRelationshipPropertiesInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetPipeRelationshipPropertiesResult {
  readonly pipe1ObjectName: CollectionObjectName;
  readonly pipe1InnerDiameter: number;
  readonly pipe1OuterDiameter: number;
  readonly pipe1CutBegin: number;
  readonly pipe1CutEnd: number;
  readonly pipe2ObjectName: CollectionObjectName;
  readonly pipe2InnerDiameter: number;
  readonly pipe2OuterDiameter: number;
  readonly pipe2CutBegin: number;
  readonly pipe2CutEnd: number;
}

export interface GetPipeRelationshipWeightsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetPipeRelationshipWeightsResult {
  readonly overallWeight: number;
  readonly axisOffset: number;
  readonly axisAlignment: number;
  readonly centerPull: number;
  readonly outOfMaterialWeight: number;
  readonly outOfMaterialStaticOffset: number;
  readonly constrainRegionAtOd: boolean;
  readonly constrainIdOdOverlap: boolean;
}

export interface GetPlanePropertiesInput {
  readonly planeName: CollectionObjectName;
}

export interface GetPlanePropertiesResult {
  readonly normalDirection: Vector;
  readonly pointOnPlane: Vector;
  readonly dParameter: number;
}

export interface GetPointCoordinateCylindricalInput {
  readonly pointName: PointName;
}

export interface GetPointCoordinateCylindricalResult {
  readonly radiusValue: number;
  readonly thetaValue: number;
  readonly zValue: number;
}

export interface GetPointCoordinateInput {
  readonly pointName: PointName;
}

export interface GetPointCoordinatePolarInput {
  readonly pointName: PointName;
}

export interface GetPointCoordinatePolarResult {
  readonly radiusValue: number;
  readonly thetaValue: number;
  readonly phiValue: number;
}

export interface GetPointCoordinateResult {
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
}

export interface GetPointNameRefListVariableInput {
  readonly name?: string;
}

export interface GetPointNameVariableInput {
  readonly name?: string;
}

export interface GetPointNotesInput {
  readonly point: PointName;
}

export interface GetPointOfViewParametersInput {
  readonly viewName: ViewName;
}

export interface GetPointOfViewParametersResult {
  readonly rotationX: number;
  readonly rotationY: number;
  readonly rotationZ: number;
  readonly restoreZoomSettings: boolean;
  readonly scaleFactor: number;
  readonly originX: number;
  readonly originY: number;
  readonly restoreRenderMode: boolean;
}

export interface GetPointPropertiesInput {
  readonly pointName: PointName;
}

export interface GetPointPropertiesResult {
  readonly planarOffset: number;
  readonly radialOffset: number;
  readonly ux: number;
  readonly uy: number;
  readonly uz: number;
  readonly umag: number;
  readonly positionTolerance: ToleranceVectorOptions;
  readonly componentWeights: Vector;
}

export interface GetPointToLineDistanceInput {
  readonly point: PointName;
  readonly line: CollectionObjectName;
}

export interface GetPointToLineDistanceResult {
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
  readonly magnitude: number;
}

export interface GetPointToPointDistanceInput {
  readonly firstPoint: PointName;
  readonly secondPoint: PointName;
}

export interface GetPointToPointDistanceResult {
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
  readonly magnitude: number;
}

export interface GetPointToleranceInput {
  readonly pointName: PointName;
}

export interface GetPointToleranceResult {
  readonly useHighXTolerance: boolean;
  readonly highXTolerance: number;
  readonly useHighYTolerance: boolean;
  readonly highYTolerance: number;
  readonly useHighZTolerance: boolean;
  readonly highZTolerance: number;
  readonly useHighMagTolerance: boolean;
  readonly highMagTolerance: number;
  readonly useLowXTolerance: boolean;
  readonly lowXTolerance: number;
  readonly useLowYTolerance: boolean;
  readonly lowYTolerance: number;
  readonly useLowZTolerance: boolean;
  readonly lowZTolerance: number;
  readonly useLowMagTolerance: boolean;
  readonly lowMagTolerance: number;
  readonly vectorTolerance: ToleranceVectorOptions;
}

export interface GetQdasCatalogEntriesInput {
  readonly kFieldTarget?: string;
}

export interface GetRelationshipFitConstraintsScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipFitConstraintsScalarTypeResult {
  readonly useHighTolerance: boolean;
  readonly highTolerance: number;
  readonly useLowTolerance: boolean;
  readonly lowTolerance: number;
  readonly fitConstraintOptions: FitConstraintScalarOptions;
}

export interface GetRelationshipOutlierRejectionScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipOutlierRejectionScalarTypeResult {
  readonly useHighLimit: boolean;
  readonly highLimit: number;
  readonly useLowLimit: boolean;
  readonly lowLimit: number;
}

export interface GetRelationshipProjectionOptionsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipProjectionOptionsResult {
  readonly ignoreEdgeProjections: boolean;
  readonly probeOffsetsOverrideTargetValues: boolean;
  readonly probeOffsetsOverrideValue: number;
  readonly addExtraMaterial: boolean;
  readonly extraMaterialThickness: number;
}

export interface GetRelationshipRefListVariableInput {
  readonly name?: string;
}

export interface GetRelationshipReportingFrameInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipSubSamplingOptionsInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipSubSamplingOptionsResult {
  readonly useEveryIthPoint: boolean;
  readonly iValue: number;
  readonly useNoMoreThanNPoints: boolean;
  readonly nValue: number;
}

export interface GetRelationshipToleranceScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipToleranceScalarTypeResult {
  readonly useHighTolerance: boolean;
  readonly highTolerance: number;
  readonly useLowTolerance: boolean;
  readonly lowTolerance: number;
  readonly toleranceOptions: ToleranceScalarOptions;
}

export interface GetRelationshipToleranceVectorTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipToleranceVectorTypeResult {
  readonly useHighXTolerance: boolean;
  readonly highXTolerance: number;
  readonly useHighYTolerance: boolean;
  readonly highYTolerance: number;
  readonly useHighZTolerance: boolean;
  readonly highZTolerance: number;
  readonly useHighMagTolerance: boolean;
  readonly highMagTolerance: number;
  readonly useLowXTolerance: boolean;
  readonly lowXTolerance: number;
  readonly useLowYTolerance: boolean;
  readonly lowYTolerance: number;
  readonly useLowZTolerance: boolean;
  readonly lowZTolerance: number;
  readonly useLowMagTolerance: boolean;
  readonly lowMagTolerance: number;
  readonly vectorTolerance: ToleranceVectorOptions;
}

export interface GetRelationshipTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetRelationshipWeightingInput {
  readonly relationshipName: CollectionObjectName;
}

export interface GetReportItemsReferenceListVariableInput {
  readonly name?: string;
}

export interface GetReportTagValueInput {
  readonly tagName?: string;
}

export interface GetReportTagValueResult {
  readonly tagValueAsString: string;
  readonly tagValueAsInteger: number;
  readonly tagValueAsDouble: number;
}

export interface GetScaleBarStatsInput {
  readonly scaleBarName: CollectionObjectName;
}

export interface GetScaleBarStatsResult {
  readonly nominalLength: number;
  readonly actualLength: number;
  readonly deviation: number;
}

export interface GetScreenResolutionInput {
  readonly display1Primary?: number;
}

export interface GetScreenResolutionResult {
  readonly integerWindowTopLeftXPosition: number;
  readonly integerWindowTopLeftYPosition: number;
  readonly integerWidth: number;
  readonly integerHeight: number;
  readonly viewWidth: number;
  readonly viewHeight: number;
}

export interface GetSlotPropertiesInput {
  readonly slotName: CollectionObjectName;
}

export interface GetSlotPropertiesResult {
  readonly slotTransformInWorkingCoordinates: Transform;
  readonly centerInWorkingCoordinates: Vector;
  readonly normalDirectionInWorkingCoordinates: Vector;
  readonly slotLength: number;
  readonly slotWidth: number;
  readonly roundSlotType: boolean;
  readonly centerlinePt1InWorkingCoordinates: Vector;
  readonly centerlinePt2InWorkingCoordinates: Vector;
}

export interface GetSpherePropertiesInput {
  readonly sphereName: CollectionObjectName;
}

export interface GetSpherePropertiesResult {
  readonly centerCoordinate: Vector;
  readonly radius: number;
  readonly diameter: number;
}

export interface GetStringFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly stringName?: string;
}

export interface GetStringRefListVariableInput {
  readonly name?: string;
}

export interface GetStringVariableInput {
  readonly name?: string;
}

export interface GetSurfacePhysicalStatsInput {
  readonly surfaceName: CollectionObjectName;
}

export interface GetSurfacePhysicalStatsResult {
  readonly volume: number;
  readonly area: number;
}

export interface GetTimestampForIthFrameInFrameSetInput {
  readonly frameSet: CollectionObjectName;
  readonly frameSetIndex?: number;
}

export interface GetTimestampForIthPointInPointSetInput {
  readonly pointSet: CollectionObjectName;
  readonly pointSetIndex?: number;
}

export interface GetTorusPropertiesInput {
  readonly torusName: CollectionObjectName;
}

export interface GetTorusPropertiesResult {
  readonly centerCoordinate: Vector;
  readonly normalDirection: Vector;
  readonly majorRadius: number;
  readonly minorRadius: number;
}

export interface GetTransformForIthFrameInFrameSetInput {
  readonly frameSet: CollectionObjectName;
  readonly frameSetIndex?: number;
}

export interface GetTransformFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly transformName?: string;
}

export interface GetTransformVariableInput {
  readonly name?: string;
}

export interface GetVectorFromDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly vectorName?: string;
}

export interface GetVectorFromVectorGroupByNameInput {
  readonly vectorGroupName: CollectionObjectName;
  readonly vectorName?: string;
}

export interface GetVectorFromVectorGroupByNameResult {
  readonly beginInWorking: Vector;
  readonly endInWorking: Vector;
  readonly totalDeltaInWorking: Vector;
  readonly ijkUnitVectorInWorking: Vector;
  readonly magnitude: number;
}

export interface GetVectorGroupPropertiesInput {
  readonly vectorGroupName: CollectionObjectName;
}

export interface GetVectorGroupPropertiesResult {
  readonly totalVectors: number;
  readonly vectorsInTolerance: number;
  readonly vectorsOutOfTolerance: number;
  readonly invalidVectors: number;
  readonly vectorsInTolerance2: number;
  readonly vectorsOutOfTolerance2: number;
  readonly absoluteMaxMagnitude: number;
  readonly absoluteMinMagnitude: number;
  readonly maxMagnitude: number;
  readonly minMagnitude: number;
  readonly standardDeviationFromZero: number;
  readonly standardDeviationFromMean: number;
  readonly avgMagnitude: number;
  readonly avgOfAbsMagnitude: number;
  readonly highToleranceValue: number;
  readonly lowToleranceValue: number;
  readonly rmsValue: number;
}

export interface GetVectorNameRefListVariableInput {
  readonly name?: string;
}

export interface GetVectorVariableInput {
  readonly name?: string;
}

export interface GroupToSurfaceFitInput {
  readonly groupToFit: CollectionObjectName;
  readonly surface: CollectionObjectName;
  readonly doConventionalFit?: boolean;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
}

export interface GroupToSurfaceFitResult {
  readonly optimumTransform: WorldTransform;
  readonly rmsDeviation: number;
  readonly maximumAbsoluteDeviation: number;
}

export interface HideObjectsInput {
  readonly objectsToHide: Iterable<CollectionObjectName>;
}

export interface HighlightObjectsInput {
  readonly objectNamesEmptyToClearAll: Iterable<CollectionObjectName>;
  readonly highLightObjects?: boolean;
}

export interface HighlightPointInput {
  readonly pointNameEmptyToClearAll: PointName;
  readonly showPoint?: boolean;
}

export interface HighlightRelationshipsInput {
  readonly relationshipsEmptyToClearAll: Iterable<CollectionItemName>;
  readonly highLightRelationships?: boolean;
}

export interface HtmlDisplayBoardInput {
  readonly inputHtmlFile: FileReference;
  readonly showBoard?: boolean;
}

export interface ImportAsciiPredefinedFormatsInput {
  readonly asciiFilePath: FileReference;
  readonly fileFormat: AsciiFileFormat;
  readonly units?: DistanceUnits;
  readonly angularUnits?: AngularUnits;
  readonly groupName: CollectionObjectName;
  readonly importAsCloud?: boolean;
  readonly ensureNewPointGroup?: boolean;
  readonly ensureUniqueNames?: boolean;
}

export interface ImportAsciiPredefinedFrameSetFormatsInput {
  readonly asciiFilePath: FileReference;
  readonly fileFormat: AsciiFileFormat;
  readonly units?: DistanceUnits;
  readonly angularUnits?: AngularUnits;
  readonly frameSetContainerName: CollectionObjectName;
  readonly ensureUniqueName?: boolean;
}

export interface ImportE57FileInput {
  readonly e57FilePath: FileReference;
  readonly saveConvertedFile?: boolean;
  readonly useSquareRootOfIntensity?: boolean;
  readonly automaticallyCloseConverter?: boolean;
  readonly prioritizeColorOverIntensity?: boolean;
  readonly importScanBlocksAsSeparateClouds?: boolean;
  readonly units?: DistanceUnits;
}

export interface ImportFileAsEmbeddedFileInput {
  readonly externalFileName: FileReference;
  readonly replaceExisting?: boolean;
}

export interface ImportFileAsPictureInput {
  readonly externalFileName: FileReference;
  readonly replaceExisting?: boolean;
}

export interface ImportGeometryFitProfilesInput {
  readonly geometryFitProfilesFilePath: FileReference;
  readonly overwriteProfilesWithSameName?: boolean;
}

export interface ImportHiddenPointBarXmlFileInput {
  readonly xmlFilePath: FileReference;
  readonly replaceExistingEntries?: boolean;
}

export interface ImportIgesFileInput {
  readonly igesFilePath: FileReference;
}

export interface ImportLeicaGsiFileInput {
  readonly instrumentId: CollectionInstrumentId;
  readonly groupName: CollectionObjectName;
  readonly filePath: FileReference;
}

export interface ImportLeicaSdbFileInput {
  readonly instrumentId: CollectionInstrumentId;
  readonly scanCloudName: CollectionObjectName;
  readonly filePath: FileReference;
}

export interface ImportMpFileAsEmbeddedMpInput {
  readonly externalMpFileName: FileReference;
  readonly replaceExisting?: boolean;
}

export interface ImportNominalsFromXmlFileInput {
  readonly filePath: FileReference;
}

export interface ImportPolyworksFileInput {
  readonly cloudName: CollectionObjectName;
  readonly filePath: FileReference;
}

export interface ImportQdasCatalogFileInput {
  readonly qdasDfdFilePath: FileReference;
}

export interface ImportSaFileInput {
  readonly saFileName: FileReference;
  readonly allowOperatorSelections?: boolean;
  readonly selectedCollectionsOptional: Iterable<string>;
}

export interface ImportSaWindowsPlacementInput {
  readonly filePath: FileReference;
}

export interface ImportSatFileInput {
  readonly satFilePath: FileReference;
}

export interface ImportStepFileInput {
  readonly stepFilePath: FileReference;
  readonly displayEntityFilters?: boolean;
  readonly displayResiduals?: boolean;
}

export interface ImportStlFileInput {
  readonly stlFilePath: FileReference;
  readonly units?: DistanceUnits;
  readonly importMesh?: boolean;
  readonly importPointCloud?: boolean;
}

export interface ImportVdaFsFileInput {
  readonly vdaFsFilePath: FileReference;
}

export interface ImportVstarsCamerasInput {
  readonly filePath: FileReference;
}

export interface ImportVstarsXyzFileInput {
  readonly filePath: FileReference;
}

export interface IncrementPointNameInput {
  readonly basePointName: PointName;
  readonly increment?: number;
}

export interface IsObjectOfTypeInput {
  readonly objectName: CollectionObjectName;
  readonly objectType?: ObjectType;
}

export interface LoadHtmlFormInEdgeBrowserInput {
  readonly inputHtmlFormPath: FileReference;
  readonly windowWidth?: number;
  readonly windowHeight?: number;
  readonly inputDataShareFilePath: FileReference;
  readonly outputDataShareFilePath: FileReference;
  readonly saveInBinaryFormat?: boolean;
}

export interface LoadHtmlFormInput {
  readonly inputHtmlFormPath: FileReference;
  readonly windowWidth?: number;
  readonly windowHeight?: number;
  readonly inputDataShareFilePath: FileReference;
  readonly outputDataShareFilePath: FileReference;
  readonly saveInBinaryFormat?: boolean;
  readonly saveButtonText?: string;
  readonly cancelButtonText?: string;
  readonly hideSaveAndCancelButtons?: boolean;
}

export interface LoadRibbonBarFromXmlFileInput {
  readonly filePath: FileReference;
}

export interface LockImportedItemsInput {
  readonly lockItems?: boolean;
}

export interface LockUnlockSelectedItemsInput {
  readonly itemList: Iterable<CollectionItemName>;
  readonly instruments: Iterable<CollectionInstrumentId>;
  readonly lockItems?: boolean;
}

export interface LockUnlockTrappingControlInput {
  readonly relationshipRefList: Iterable<CollectionItemName>;
  readonly featureCheckRefList: Iterable<CollectionItemName>;
  readonly datumRefList: Iterable<CollectionObjectName>;
  readonly lockOutTrapping?: boolean;
}

export interface MakeCircleFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly measuredSideForPlanarOffset?: MeasuredSideForPlanarOffset;
  readonly overridePlanarOffset10UseCurrent?: number;
  readonly planarOffsetDirection?: NormalDirection;
  readonly lockRadius10DoNotLock?: number;
  readonly circleComputationTechnique?: CompTechnique;
  readonly reverseNormalVectorAfterFit?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Center?: boolean;
  readonly cardinalPt2PointOnNormal?: boolean;
}

export interface MakeConeFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly lockAngleInDegrees10DoNotLock?: number;
  readonly useExhaustiveSearch?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Vertex?: boolean;
  readonly cardinalPt2PointOnAxis?: boolean;
  readonly cardinalPt3CutPointOnAxis?: boolean;
}

export interface MakeCustomTableInput {
  readonly tableName: CollectionObjectName;
  readonly decimalPrecision?: number;
}

export interface MakeCylinderFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly lockRadius10DoNotLock?: number;
  readonly lockedRadiusFitMethod?: FitMethod;
  readonly constrainToNominalAxis?: boolean;
  readonly constrainToNominalOrientation?: boolean;
  readonly alignWithNominal?: boolean;
  readonly reverseAxis?: boolean;
  readonly setAxisFirstToLastPoint?: boolean;
  readonly cylinderComputationTechnique?: CompTechnique;
  readonly useExhaustiveSearch?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1BeginPt?: boolean;
  readonly cardinalPt2EndPt?: boolean;
  readonly cardinalPt3Center?: boolean;
}

export interface MakeEllipseFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly measuredSideForPlanarOffset?: MeasuredSideForPlanarOffset;
  readonly overridePlanarOffset10UseCurrent?: number;
  readonly planarOffsetDirection?: NormalDirection;
  readonly reverseNormalVectorAfterFit?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Center?: boolean;
  readonly cardinalPt2PointOnNormal?: boolean;
  readonly cardinalPt3FocalPt1?: boolean;
  readonly cardinalPt4FocalPt2?: boolean;
}

export interface MakeEmbeddedFileNameListInput {
  readonly collectionWildcardCriteria?: string;
  readonly fileNamePattern?: string;
}

export interface MakeLineFitProfileInput {
  readonly fitProfileName?: string;
  readonly reverseNormalVectorAfterFit?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1PointA?: boolean;
  readonly cardinalPt2PointB?: boolean;
  readonly cardinalPt3MidPoint?: boolean;
}

export interface MakeNewSaReportInput {
  readonly newSaReportName: CollectionObjectName;
  readonly saReportTemplateOptional: CollectionObjectName;
}

export interface MakeParaboloidFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly lockFocalLength10DoNotLock?: number;
  readonly degreeOfFreedom?: DegreeOfFreedom;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Vertex?: boolean;
  readonly cardinalPt2FocalPoint?: boolean;
}

export interface MakePipeFittingRelationshipInput {
  readonly relationshipName: CollectionObjectName;
  readonly pipe1ObjectName: CollectionObjectName;
  readonly pipe2ObjectName: CollectionObjectName;
}

export interface MakePipeRelationshipCutInput {
  readonly relationshipName: CollectionObjectName;
  readonly pipe1MakeCut?: boolean;
  readonly pipe1CreateFrame?: boolean;
  readonly pipe1FrameName: CollectionObjectName;
  readonly pipe2MakeCut?: boolean;
  readonly pipe2CreateFrame?: boolean;
  readonly pipe2FrameName: CollectionObjectName;
}

export interface MakePlaneFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForPlanarOffset?: MeasuredSideForPlanarOffset;
  readonly overridePlanarOffset10UseCurrent?: number;
  readonly planarOffsetDirection?: NormalDirection;
  readonly reverseNormalVectorAfterFit?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Centroid?: boolean;
  readonly cardinalPt2PointOnNormal?: boolean;
}

export interface MakeSlotFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly measuredSideForPlanarOffset?: MeasuredSideForPlanarOffset;
  readonly overridePlanarOffset10UseCurrent?: number;
  readonly planarOffsetDirection?: NormalDirection;
  readonly slotType?: SlotType;
  readonly slotComputationTechnique?: CompTechnique;
  readonly reverseNormalVectorAfterFit?: boolean;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Center?: boolean;
  readonly cardinalPt2PointOnNormal?: boolean;
  readonly cardinalPt3CenterlinePt1?: boolean;
  readonly cardinalPt4CenterlinePt2?: boolean;
}

export interface MakeSphereFitProfileInput {
  readonly fitProfileName?: string;
  readonly measuredSideForRadialOffset?: MeasuredSideForRadialOffset;
  readonly overrideRadialOffset10UseCurrent?: number;
  readonly lockRadius10DoNotLock?: number;
  readonly makeCardinalPoints?: boolean;
  readonly cardinalPt1Center?: boolean;
  readonly computationMethod?: SphereFitComputationMode;
}

export interface MakeUtilityChartInput {
  readonly asciiFilePath: FileReference;
  readonly chartTitleOverride?: string;
  readonly outputPictureName: CollectionItemName;
  readonly showChartDialog?: boolean;
  readonly plotAdditionalXyValue?: boolean;
  readonly xValue?: number;
  readonly yValue?: number;
}

export interface MergeMeasurementsIntoXmlFileInput {
  readonly filePath: FileReference;
  readonly groupName: CollectionObjectName;
}

export interface MoveCollectionToFolderInput {
  readonly collection: CollectionName;
  readonly folderPath?: string;
}

export interface MoveFolderToFolderInput {
  readonly sourceFolderPath?: string;
  readonly destinationFolderPath?: string;
}

export interface MoveInstrumentsDragGraphicallyInput {
  readonly instruments: Iterable<CollectionInstrumentId>;
}

export interface MoveObjectsDragGraphicallyInput {
  readonly objects: Iterable<CollectionObjectName>;
}

export interface MushroomTargetHoleInspectionInput {
  readonly namePrefixForIntermediateConstructions?: string;
  readonly spherePointsGroupName: CollectionObjectName;
  readonly sphereTargetRadius?: number;
  readonly targetContactPlane: CollectionObjectName;
  readonly pointToCreateAtHole: PointName;
}

export interface MushroomTargetHoleInspectionResult {
  readonly sphereFitRmsError: number;
  readonly sphereFitMaxError: number;
}

export interface NotifyUserDoubleInput {
  readonly leadingText?: string;
  readonly font?: Font;
  readonly reportedValue?: number;
  readonly decimalPrecision?: number;
  readonly displayTimeout?: number;
}

export interface NotifyUserHtmlInput {
  readonly htmlFile: FileReference;
}

export interface NotifyUserIntegerInput {
  readonly leadingText?: string;
  readonly font?: Font;
  readonly reportedValue?: number;
  readonly displayTimeout?: number;
}

export interface NotifyUserTextArrayInput {
  readonly notificationText: Iterable<string>;
  readonly font?: Font;
  readonly autoExpandToFitText?: boolean;
  readonly displayTimeout?: number;
}

export interface ObjectExistenceTestCheckOnlyInput {
  readonly objectName: CollectionObjectName;
}

export interface OpenSaFileInput {
  readonly saFileName: FileReference;
}

export interface OpenTemplateFileInput {
  readonly templateFileName: FileReference;
}

export interface OutputSaReportToExcelInput {
  readonly reportName: CollectionObjectName;
  readonly fileName: FileReference;
  readonly showFile?: boolean;
}

export interface OutputSaReportToPdfInput {
  readonly reportName: CollectionObjectName;
  readonly fileName: FileReference;
  readonly showPdf?: boolean;
}

export interface PatchNormalShiftHolePinInput {
  readonly planePointsGroupName: CollectionObjectName;
  readonly perimeterPointsGroupName: CollectionObjectName;
  readonly resultingPointName: PointName;
  readonly additionalMaterialThickness?: number;
}

export interface PatchNormalShiftPointInput {
  readonly planePointsGroupName: CollectionObjectName;
  readonly pointToShift: PointName;
  readonly resultingPointName: PointName;
  readonly additionalMaterialThickness?: number;
}

export interface PipeRelationshipForceCutToFrameInput {
  readonly relationshipName: CollectionObjectName;
  readonly pipe1ForceCutToFrame?: boolean;
  readonly pipe1FrameName: CollectionObjectName;
  readonly pipe2ForceCutToFrame?: boolean;
  readonly pipe2FrameName: CollectionObjectName;
}

export interface PopPolyBayAnalysisWindowInput {
  readonly materialsFilePath?: string;
  readonly bayFilePath?: string;
}

export interface PrepareQdasDataListInput {
  readonly k1001PartNumber?: string;
  readonly k1002PartDescription?: string;
  readonly k1071SupplierNumber?: string;
  readonly k1072SupplierDescription?: string;
  readonly k1203ReasonForTest?: string;
  readonly k1303Plant?: string;
  readonly k1900PartRemark?: string;
  readonly k0006BatchNumber?: string;
  readonly k0014PartId?: string;
  readonly k0053OrderNumber?: string;
  readonly k0004DateTimeStamp?: string;
  readonly k0008OperatorIdentifier?: number;
  readonly k0010MachineIdentifier?: number;
  readonly k0012GageIdentifier?: number;
  readonly relationshipList: Iterable<CollectionItemName>;
  readonly featureCheckList: Iterable<CollectionItemName>;
  readonly vectorGroupList: Iterable<CollectionObjectName>;
}

export interface QueryCloudsToObjectsInput {
  readonly cloudNames: Iterable<CollectionObjectName>;
  readonly objectNames: Iterable<CollectionObjectName>;
  readonly resultingObjectName: CollectionObjectName;
  readonly projectionOptions?: ProjectionOptions;
  readonly proximity?: number;
  readonly skipFactor?: number;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
}

export interface QueryCloudsToObjectsResult {
  readonly rmsDeviation: number;
  readonly maximumAbsoluteDeviation: number;
}

export interface QueryCloudsToSurfaceInput {
  readonly cloudNames: Iterable<CollectionObjectName>;
  readonly filterSurfaceName: CollectionObjectName;
  readonly resultingObjectName: CollectionObjectName;
  readonly projectionOptions?: ProjectionOptions;
  readonly proximity?: number;
  readonly skipFactor?: number;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
}

export interface QueryCloudsToSurfaceResult {
  readonly rmsDeviation: number;
  readonly maximumAbsoluteDeviation: number;
}

export interface QueryFrameToFrameInput {
  readonly referenceFrameName: CollectionObjectName;
  readonly correspondingFrameName: CollectionObjectName;
}

export interface QueryFrameToFrameResult {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rxRoll: number;
  readonly ryPitch: number;
  readonly rzYaw: number;
}

export interface QueryGroupsToObjectsInput {
  readonly groupNameListGroupsToProject: Iterable<CollectionObjectName>;
  readonly objectNameListObjectsToProjectTo: Iterable<CollectionObjectName>;
  readonly resultingObjectName: CollectionObjectName;
  readonly projectionOptions?: ProjectionOptions;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
  readonly showResultsDialog?: boolean;
}

export interface QueryGroupsToObjectsResult {
  readonly rmsDeviation: number;
  readonly maxAbsoluteDeviation: number;
  readonly averageDeviation: number;
  readonly standardDeviation: number;
}

export interface QueryPointToObjectsInput {
  readonly pointName: PointName;
  readonly objects: Iterable<CollectionObjectName>;
  readonly ignoreTargetOffset?: boolean;
}

export interface QueryPointToObjectsResult {
  readonly dX: number;
  readonly dY: number;
  readonly dZ: number;
  readonly dMag: number;
  readonly resultantObject: CollectionObjectName;
}

export interface QueryPointToPointAlongCurveInput {
  readonly value1stPoint: PointName;
  readonly value2ndPoint: PointName;
  readonly curve: CollectionObjectName;
}

export interface QueryPointsToCircleInput {
  readonly circleName: CollectionObjectName;
  readonly pointGroupName: CollectionObjectName;
  readonly isInsideMeasurement?: boolean;
  readonly autoScaleVectorsToOfRadius?: number;
  readonly vectorGroupNameForRadial: CollectionObjectName;
  readonly vectorGroupNameForPlanar: CollectionObjectName;
  readonly vectorGroupNameForCombined: CollectionObjectName;
}

export interface QueryPointsToObjectsInput {
  readonly pointNames: Iterable<PointName>;
  readonly objectNameListObjectsToProjectTo: Iterable<CollectionObjectName>;
  readonly resultingObjectName: CollectionObjectName;
  readonly projectionOptions?: ProjectionOptions;
  readonly rmsTolerance00ForNone?: number;
  readonly maximumAbsoluteTolerance00ForNone?: number;
  readonly showResultsDialog?: boolean;
}

export interface QueryPointsToObjectsResult {
  readonly rmsDeviation: number;
  readonly maxAbsoluteDeviation: number;
  readonly averageDeviation: number;
  readonly standardDeviation: number;
}

export interface QueryPointsToSinglePointInput {
  readonly pointNames: Iterable<PointName>;
  readonly singlePoint: PointName;
  readonly showVectorProperties?: boolean;
}

export interface QuickReportInput {
  readonly itemName: CollectionObjectName;
  readonly reportNameOptional?: string;
  readonly openReport?: boolean;
}

export interface ReComputeCalculatedItemsInput {
  readonly targetsFromShots?: boolean;
  readonly hiddenPoints?: boolean;
  readonly relationships?: boolean;
  readonly refreshFilteredCloudData?: boolean;
}

export interface RefreshCalloutViewsInSaReportInput {
  readonly reportName: CollectionItemName;
}

export interface RemoveReportTagInput {
  readonly tagName?: string;
}

export interface RenameEventInput {
  readonly originalEventName: CollectionObjectName;
  readonly newEventName: CollectionObjectName;
  readonly overwriteIfExists?: boolean;
}

export interface RenameGeneralFileInput {
  readonly sourceFileName: FileReference;
  readonly destinationFileName: FileReference;
  readonly overwrite?: boolean;
}

export interface RenamePictureInput {
  readonly originalPictureName: CollectionItemName;
  readonly newPictureName: CollectionItemName;
  readonly overwriteIfExists?: boolean;
}

export interface RenamePointsBasedOnInterPointDistanceToReferencePointsInput {
  readonly referenceGroupName: CollectionObjectName;
  readonly groupToRenamePoints: CollectionObjectName;
  readonly distanceThreshold?: number;
  readonly verifyResults?: boolean;
}

export interface RenamePointsBasedOnProximityToReferencePointsInput {
  readonly referenceGroupName: CollectionObjectName;
  readonly groupToRenamePoints: CollectionObjectName;
  readonly proximityThreshold?: number;
  readonly verifyResults?: boolean;
  readonly renameAllProximatePoints?: boolean;
}

export interface ReverseBSplinesInput {
  readonly bSplineList: Iterable<CollectionObjectName>;
}

export interface ReversePlaneNormalsInput {
  readonly planeList: Iterable<CollectionObjectName>;
}

export interface ReverseSurfaceNormalsInput {
  readonly surfaceList: Iterable<CollectionObjectName>;
}

export interface RunSubroutineInput {
  readonly mpSubroutineFilePath: FileReference;
  readonly shareParentVariables?: boolean;
}

export interface SaveAsInput {
  readonly fileName: FileReference;
  readonly addSerialNumber?: boolean;
  readonly optionalNumber?: number;
}

export interface SaveAsReadOnlyTemplateInput {
  readonly templateFileName: FileReference;
}

export interface SaveChartToJPegFileInput {
  readonly chartToSave: ChartName;
  readonly fileToSaveTo: FileReference;
}

export interface SaveCurrentViewBmpJpgPngGifTiffInput {
  readonly fileToSaveTo: FileReference;
  readonly renderScaleFactor10UsesWindowSize?: number;
}

export interface SavePointOfViewInput {
  readonly viewName: ViewName;
  readonly restoreZoomSettings?: boolean;
}

export interface ScaleBarCheckInput {
  readonly scaleBarPointA: PointName;
  readonly scaleBarPointB: PointName;
  readonly currentTemperatureF?: number;
  readonly lengthOfBarAt68F?: number;
  readonly materialCtePpmF?: number;
  readonly tolerance?: number;
}

export interface ScaleObjectsInput {
  readonly objects: Iterable<CollectionObjectName>;
  readonly scaleFactor?: number;
}

export interface SetActiveCustomLanguageInput {
  readonly languageFileName: FileReference;
  readonly font?: Font;
}

export interface SetActiveUnitsInput {
  readonly length?: DistanceUnits;
  readonly displayInchFractions?: boolean;
  readonly inchFractionDenominator?: number;
  readonly simplifyInchFraction?: boolean;
  readonly temperature?: TemperatureUnits;
  readonly angular?: AngularUnits;
}

export interface SetAngularRepresentationInput {
  readonly value0360False180?: boolean;
}

export interface SetAutoEventCreationInput {
  readonly active?: boolean;
}

export interface SetAutomaticBackupStateInput {
  readonly autoJobFileRestorePointsActive?: boolean;
  readonly autoMeasurementsBackupActive?: boolean;
}

export interface SetAutomaticRelationshipConstructionStateInput {
  readonly active?: boolean;
}

export interface SetBackgroundColorInput {
  readonly solidColorName?: Color;
  readonly gradientStartColorName?: Color;
  readonly gradientEndColorName?: Color;
  readonly highlightColor?: Color;
}

export interface SetBooleanInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly booleanName?: string;
  readonly booleanValue?: boolean;
}

export interface SetBooleanVariableInput {
  readonly name?: string;
  readonly value?: boolean;
}

export interface SetCirclePropertiesInput {
  readonly circleName: CollectionObjectName;
  readonly centerCoordinate: Vector;
  readonly normalDirection: Vector;
  readonly radius?: number;
}

export interface SetCollectionNotesInput {
  readonly collection: CollectionName;
  readonly notes: Iterable<string>;
  readonly appendFalseOverwrite?: boolean;
}

export interface SetCollectionObjectNameVariableInput {
  readonly name?: string;
  readonly value: CollectionObjectName;
}

export interface SetCollectionObjectRefListVariableInput {
  readonly name?: string;
  readonly value: Iterable<CollectionObjectName>;
}

export interface SetConePropertiesInput {
  readonly coneName: CollectionObjectName;
  readonly coneEndPointInWorkingCoordinates: Vector;
  readonly coneAxisInWorkingCoordinates: Vector;
  readonly coneLength?: number;
  readonly coneThetaStart?: number;
  readonly coneThetaSpan?: number;
  readonly coneIncludedAngle?: number;
  readonly cutLengthFromApex?: number;
}

export interface SetCurrentTaskInput {
  readonly taskIndex?: number;
}

export interface SetCustomTableCellColorInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
  readonly foregroundColorName?: Color;
  readonly backgroundColorName?: Color;
}

export interface SetCustomTableCellDoubleInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
  readonly value?: number;
  readonly span?: number;
  readonly decimalPrecision?: number;
}

export interface SetCustomTableCellFontInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
  readonly font?: Font;
}

export interface SetCustomTableCellStringInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
  readonly value?: string;
  readonly span?: number;
}

export interface SetCustomTableHeaderCellInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly column?: number;
  readonly headerText?: string;
  readonly span?: number;
}

export interface SetCustomTableHeaderRowInput {
  readonly tableName: CollectionObjectName;
  readonly row?: number;
  readonly value?: string;
}

export interface SetCustomTableTitleInput {
  readonly tableName: CollectionObjectName;
  readonly titleLine1?: string;
  readonly titleLine2?: string;
}

export interface SetCylinderPropertiesInput {
  readonly cylinderName: CollectionObjectName;
  readonly beginCoordinate: Vector;
  readonly axisDirection: Vector;
  readonly length?: number;
  readonly diameter?: number;
  readonly nominalsPointInward?: boolean;
  readonly facets?: number;
  readonly enableThetaExtentDisplayMode?: boolean;
  readonly thetaStartInDegrees?: number;
  readonly thetaSpanInDegrees?: number;
}

export interface SetDecimalDigitsForDisplayInput {
  readonly length?: number;
  readonly angle?: number;
  readonly scale?: number;
  readonly unitVector?: number;
  readonly weight?: number;
}

export interface SetDefaultColorizationOptionsInput {
  readonly colorizationOptions?: ColorizationOptions;
}

export interface SetDimensionToleranceInput {
  readonly dimensionName: CollectionItemName;
  readonly enableNominal?: boolean;
  readonly enableHigh?: boolean;
  readonly enableLow?: boolean;
  readonly nominal?: number;
  readonly highTolerance?: number;
  readonly lowTolerance?: number;
}

export interface SetDoubleInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly doubleName?: string;
  readonly doubleValue?: number;
}

export interface SetDoubleVariableInput {
  readonly name?: string;
  readonly value?: number;
}

export interface SetEllipsePropertiesInput {
  readonly ellipseName: CollectionObjectName;
  readonly centerCoordinate: Vector;
  readonly normalDirection: Vector;
  readonly majorAxisRadius?: number;
  readonly minorAxisRadius?: number;
}

export interface SetFolderNotesInput {
  readonly folderPath?: string;
  readonly notes: Iterable<string>;
  readonly appendFalseOverwrite?: boolean;
}

export interface SetFontVariableInput {
  readonly name?: string;
  readonly value?: Font;
}

export interface SetGeomRelationshipAutoMeasureNominalFeatureInput {
  readonly relationshipName: CollectionObjectName;
  readonly trapCloudsFalseGeometry?: boolean;
  readonly instrumentId: CollectionInstrumentId;
  readonly measurementMode?: string;
}

export interface SetGeomRelationshipAutoVectorsNominalAvnInput {
  readonly relationshipName: CollectionObjectName;
  readonly createAutoVectorsAvn?: boolean;
  readonly pointsType?: PointFilterInputType;
  readonly useVectorGroupCustomPrefix?: boolean;
  readonly vectorGroupCustomPrefix?: string;
}

export interface SetGeomRelationshipCardinalPointsInput {
  readonly relationshipName: CollectionObjectName;
  readonly createCardinalPtsWhenFitting?: boolean;
  readonly prefixCardinalPtsNameWithRelName?: boolean;
  readonly cardinalPtsGroupName?: string;
}

export interface SetGeomRelationshipCriteriaInput {
  readonly relationshipName: CollectionObjectName;
  readonly criteria?: string;
  readonly showInReport?: boolean;
  readonly toleranceOptions?: ToleranceScalarOptions;
  readonly optimizationDeltaWeight?: number;
  readonly optimizationOutOfToleranceWeight?: number;
}

export interface SetGeomRelationshipMeasuredGeometryInput {
  readonly relationshipName: CollectionObjectName;
  readonly measuredGeometry: CollectionObjectName;
}

export interface SetGeomRelationshipNominalAvgPointInput {
  readonly relationshipName: CollectionObjectName;
  readonly compareToNominal?: boolean;
  readonly nominalAveragePoint: PointName;
}

export interface SetGeomRelationshipNominalGeometryInput {
  readonly relationshipName: CollectionObjectName;
  readonly compareToNominal?: boolean;
  readonly nominalGeometry: CollectionObjectName;
}

export interface SetGeomRelationshipProjectionPlaneInput {
  readonly relationshipName: CollectionObjectName;
  readonly projectToPlane?: boolean;
  readonly projectionPlaneName: CollectionObjectName;
}

export interface SetGeometryRelationshipFitProfileInput {
  readonly geometryType: GeometryType;
  readonly relationshipRefList: Iterable<CollectionItemName>;
  readonly fitProfileName?: string;
  readonly applyCardinalPointSettings?: boolean;
}

export interface SetIntegerInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly integerName?: string;
  readonly integerValue?: number;
}

export interface SetIntegerVariableInput {
  readonly name?: string;
  readonly value?: number;
}

export interface SetInteractionModeInput {
  readonly saInteractionMode: SaInteractionMode;
  readonly measurementPlanInteractionMode: MpInteractionMode;
  readonly measurementPlanDialogInteractionMode: MpDialogInteractionMode;
}

export interface SetInwardPositiveNormalInput {
  readonly objectName: CollectionObjectName;
  readonly inwardPositive?: boolean;
}

export interface SetLinePropertiesInput {
  readonly lineName: CollectionObjectName;
  readonly beginCoordinate: Vector;
  readonly endCoordinate: Vector;
  readonly lengthOptional?: number;
}

export interface SetLoggingStateInput {
  readonly active?: boolean;
}

export interface SetMeasurementAuxiliaryDataInput {
  readonly pointName: PointName;
  readonly auxiliaryName?: string;
  readonly value?: number;
  readonly units?: string;
}

export interface SetMpWindowStateInput {
  readonly mpWindowState: WindowState;
}

export interface SetNamedDoubleListVariableInput {
  readonly name?: string;
  readonly doubleListVariable: Iterable<number>;
}

export interface SetNotificationCancelOverrideInput {
  readonly prohibitCancel?: boolean;
}

export interface SetObjectNotesInput {
  readonly object: CollectionObjectName;
  readonly notes: Iterable<string>;
  readonly appendFalseOverwrite?: boolean;
}

export interface SetObjectReportingFrameInput {
  readonly objectName: CollectionObjectName;
  readonly reportingFrame: CollectionObjectName;
}

export interface SetObjectToObjectDirectionRelationshipFitConstraintsInput {
  readonly relationshipName: CollectionObjectName;
  readonly angleBetweenVectorsFitConstraints?: FitConstraintScalarOptions;
  readonly mutualPerpendicularLengthFitConstraints?: FitConstraintScalarOptions;
}

export interface SetObjectsColorInput {
  readonly objectsToChange: Iterable<CollectionObjectName>;
  readonly newWorkingColorName?: Color;
  readonly autoIncrement?: boolean;
}

export interface SetObjectsTranslucencyInput {
  readonly objectsToChange: Iterable<CollectionObjectName>;
  readonly renderingType: TranslucencyType;
  readonly opacityValue?: number;
}

export interface SetOpcDaTagValueDoubleInput {
  readonly opcServerDaTagName?: string;
  readonly value?: number;
}

export interface SetOpcDaTagValueIntegerInput {
  readonly opcServerDaTagName?: string;
  readonly value?: number;
}

export interface SetOpcDaTagValueStringInput {
  readonly opcServerDaTagName?: string;
  readonly value?: string;
}

export interface SetOverviewImageInput {
  readonly imagePath: FileReference;
}

export interface SetOverviewTitleInput {
  readonly overviewTitle?: string;
}

export interface SetPipeRelationshipSegmentPropertiesInput {
  readonly relationshipName: CollectionObjectName;
  readonly pipe1InnerDiameter?: number;
  readonly pipe1OuterDiameter?: number;
  readonly pipe1CutBegin?: number;
  readonly pipe1CutEnd?: number;
  readonly pipe2InnerDiameter?: number;
  readonly pipe2OuterDiameter?: number;
  readonly pipe2CutBegin?: number;
  readonly pipe2CutEnd?: number;
}

export interface SetPipeRelationshipWeightsInput {
  readonly relationshipName: CollectionObjectName;
  readonly overallWeight?: number;
  readonly axisOffset?: number;
  readonly axisAlignment?: number;
  readonly centerPull?: number;
  readonly outOfMaterialWeight?: number;
  readonly outOfMaterialOffset?: number;
  readonly constrainRegionAtOd?: boolean;
  readonly constrainIdOdOverlap?: boolean;
}

export interface SetPointGroupReportOptionsInput {
  readonly pointGroup: CollectionObjectName;
  readonly coordinateSystem?: CoordinateSystemType;
  readonly showXComponent?: boolean;
  readonly showYComponent?: boolean;
  readonly showZComponent?: boolean;
  readonly showOffsets?: boolean;
  readonly showUncertainty?: boolean;
  readonly showNotes?: boolean;
  readonly showMeasurements?: boolean;
  readonly showMeasurementDetails?: boolean;
  readonly showPointingErrorWorstAngle?: boolean;
  readonly sortByPointNames?: boolean;
  readonly makeDefault?: boolean;
  readonly applyToAll?: boolean;
}

export interface SetPointNameRefListVariableInput {
  readonly name?: string;
  readonly value: Iterable<PointName>;
}

export interface SetPointNameVariableInput {
  readonly name?: string;
  readonly value: PointName;
}

export interface SetPointNotesInput {
  readonly point: PointName;
  readonly notes: Iterable<string>;
  readonly appendFalseOverwrite?: boolean;
}

export interface SetPointOfViewFromFrameInput {
  readonly frame: CollectionObjectName;
}

export interface SetPointOfViewFromInstrumentUpdatesInput {
  readonly instrumentId: CollectionInstrumentId;
  readonly displayViewControl?: boolean;
  readonly enableSetViewpointFromInstrumentUpdates?: boolean;
  readonly updateViewPercent?: number;
  readonly clipBehindProbe?: boolean;
  readonly automaticZoomWhenTrapping?: boolean;
  readonly enableDirectionalCloudPoints?: boolean;
  readonly angleResetThreshold?: number;
  readonly animationSteps?: number;
  readonly referenceFrameObject: CollectionObjectName;
  readonly useScanStripeForViewFocus?: boolean;
  readonly zoomFactor?: number;
}

export interface SetPointOfViewInput {
  readonly viewName: ViewName;
}

export interface SetPointPropertiesInput {
  readonly pointNameList: Iterable<PointName>;
  readonly planarOffset?: number;
  readonly radialOffset?: number;
  readonly positionTolerance: ToleranceVectorOptions;
  readonly componentWeights: Vector;
}

export interface SetPointWeightsFromUncertaintiesInput {
  readonly pointNameList: Iterable<PointName>;
  readonly uncertaintyReferenceFrameMode?: string;
  readonly reportingFrame: CollectionObjectName;
  readonly weightNormalizationMode?: string;
  readonly fixedWeightValue?: number;
  readonly outputWeightedPointGroup: CollectionObjectName;
}

export interface SetRelationshipAutoVectorsFitAvfInput {
  readonly relationshipName: CollectionObjectName;
  readonly createAutoVectorsAvf?: boolean;
  readonly useVectorGroupCustomPrefix?: boolean;
  readonly vectorGroupCustomPrefix?: string;
}

export interface SetRelationshipAutoVectorsGroupDefaultPrefixInput {
  readonly geomRelAvnVgDefaultPrefix?: string;
  readonly geomRelAvfVgDefaultPrefix?: string;
  readonly nonGeomRelVgDefaultPrefix?: string;
}

export interface SetRelationshipDesiredMeasCountInput {
  readonly relationshipName: CollectionObjectName;
  readonly desiredMeasurementCount?: number;
}

export interface SetRelationshipDormantStatusInput {
  readonly relationships: Iterable<CollectionItemName>;
  readonly dormantStatus?: boolean;
}

export interface SetRelationshipFitConstraintsScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
  readonly fitConstraintOptions?: FitConstraintScalarOptions;
}

export interface SetRelationshipOrientationFitConstraintsVectorTypeInput {
  readonly relationshipName: CollectionObjectName;
  readonly orientationVectorConstraint: ToleranceVectorOptions;
}

export interface SetRelationshipOutlierRejectionScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
}

export interface SetRelationshipPositionFitConstraintsVectorTypeInput {
  readonly relationshipName: CollectionObjectName;
  readonly positionVectorConstraint: ToleranceVectorOptions;
}

export interface SetRelationshipProjectionOptionsInput {
  readonly relationshipName: CollectionObjectName;
  readonly projectionOptions?: ProjectionOptions;
}

export interface SetRelationshipRefListVariableInput {
  readonly name?: string;
  readonly value: Iterable<CollectionItemName>;
}

export interface SetRelationshipReportOptionsInput {
  readonly relationshipName: CollectionObjectName;
  readonly reportOptions?: PointDeltaReportOptions;
}

export interface SetRelationshipReportingFrameInput {
  readonly relationshipName: CollectionObjectName;
  readonly reportingFrame: CollectionObjectName;
}

export interface SetRelationshipSigmoidalGapFitConstraintsInput {
  readonly relationshipName: CollectionObjectName;
  readonly useSigmoidalGapConstraints?: boolean;
}

export interface SetRelationshipSubSamplingOptionsInput {
  readonly relationshipName: CollectionObjectName;
  readonly useEveryIthPoint?: boolean;
  readonly iValue?: number;
  readonly useNoMoreThanNPoints?: boolean;
  readonly nValue?: number;
}

export interface SetRelationshipToleranceScalarTypeInput {
  readonly relationshipName: CollectionObjectName;
  readonly toleranceOptions?: ToleranceScalarOptions;
}

export interface SetRelationshipToleranceVectorTypeInput {
  readonly relationshipName: CollectionObjectName;
  readonly vectorTolerance: ToleranceVectorOptions;
}

export interface SetRelationshipVoxelCloudDisplayInput {
  readonly relationshipName: CollectionObjectName;
  readonly enableVoxelCloudDisplay?: boolean;
  readonly voxelSize10Autodetect?: number;
  readonly minPtsCountPerVoxel?: number;
  readonly voxelRenderingDiameter10Fast?: number;
  readonly surfaceAnalysisMode?: SurfaceAnalysisMode;
  readonly colorizationOptions?: ColorizationOptions;
  readonly showColorBarInView?: boolean;
}

export interface SetRelationshipWeightingInput {
  readonly relationshipName: CollectionObjectName;
  readonly weight?: number;
}

export interface SetRelationshipWeightsNormalizedInput {
  readonly collectionName: CollectionName;
  readonly pickWeightingMode?: RelWeightingMode;
}

export interface SetRenderModeTypeInput {
  readonly renderingMode: RenderModeType;
}

export interface SetReportBarVisibilityInput {
  readonly showReportBar?: boolean;
}

export interface SetReportItemsReferenceListVariableInput {
  readonly name?: string;
  readonly value: Iterable<CollectionItemName>;
}

export interface SetReportOptionsForObjectInput {
  readonly object: CollectionObjectName;
}

export interface SetReportTagValueFromDoubleInput {
  readonly tagName?: string;
  readonly tagValue?: number;
}

export interface SetReportTagValueFromIntegerInput {
  readonly tagName?: string;
  readonly tagValue?: number;
}

export interface SetReportTagValueFromStringInput {
  readonly tagName?: string;
  readonly tagValue?: string;
}

export interface SetSaWindowPosInput {
  readonly posX?: number;
  readonly posY?: number;
}

export interface SetSaWindowSizeInput {
  readonly width?: number;
  readonly height?: number;
}

export interface SetSaWindowStateInput {
  readonly saWindowState: WindowState;
}

export interface SetScaleForPictureInput {
  readonly pictureName: CollectionItemName;
  readonly scale?: number;
}

export interface SetStringInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly stringName?: string;
  readonly stringValue?: string;
}

export interface SetStringRefListVariableInput {
  readonly name?: string;
  readonly value: Iterable<string>;
}

export interface SetStringVariableInput {
  readonly name?: string;
  readonly value?: string;
}

export interface SetTargetLabelsUseFullNamesInput {
  readonly useFullNames?: boolean;
}

export interface SetTaskItemCommentInput {
  readonly taskIndex?: number;
  readonly taskComment?: string;
}

export interface SetTaskItemCompletionValuesInput {
  readonly taskIndex?: number;
  readonly incrementsCompleted?: number;
  readonly totalIncrements?: number;
}

export interface SetTaskItemNameInput {
  readonly taskItemIndex?: number;
  readonly taskName?: string;
}

export interface SetToolkitVisibilityInput {
  readonly showToolkit?: boolean;
}

export interface SetTransformForIthFrameInFrameSetInput {
  readonly frameSet: CollectionObjectName;
  readonly frameSetIndex?: number;
  readonly transformInWorking: Transform;
}

export interface SetTransformInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly transformName?: string;
  readonly transformValue: Transform;
}

export interface SetTransformVariableInput {
  readonly name?: string;
  readonly value: Transform;
}

export interface SetUserInterfaceProfileInput {
  readonly profileName?: string;
  readonly profileFileNameOptional: FileReference;
}

export interface SetVectorGroupColorizationOptionsAllInput {
  readonly colorizationOptions?: ColorizationOptions;
}

export interface SetVectorGroupColorizationOptionsSelectedInput {
  readonly vectorGroupsToBeSet: Iterable<CollectionVectorGroupName>;
  readonly colorizationOptions?: ColorizationOptions;
}

export interface SetVectorGroupReportOptionsInput {
  readonly vectorGroup: CollectionObjectName;
  readonly reportOptions?: PointDeltaReportOptions;
}

export interface SetVectorInDataShareFileInput {
  readonly dataShareFilePath: FileReference;
  readonly vectorName?: string;
  readonly vectorValue: Vector;
}

export interface SetVectorNameRefListVariableInput {
  readonly name?: string;
  readonly value: Iterable<VectorName>;
}

export interface SetVectorVariableInput {
  readonly name?: string;
  readonly value: Vector;
}

export interface SetViewClippingPlaneInput {
  readonly object: CollectionObjectName;
  readonly removeClippingPlane?: boolean;
}

export interface SetViewIdleUpdateFrequencyInput {
  readonly idleCount?: number;
}

export interface SetWildCardAsteriskModeInput {
  readonly autoWrapSearchString?: boolean;
}

export interface SetWorkingColorAutoIncrementInput {
  readonly autoIncrement?: boolean;
}

export interface SetWorkingColorInput {
  readonly newWorkingColorName?: Color;
}

export interface SetWorkingFrameInput {
  readonly newWorkingFrameName: CollectionObjectName;
}

export interface ShowByObjectTypeInput {
  readonly objectTypeToShow: CollectionObjectName;
  readonly allCollections?: boolean;
}

export interface ShowHideAnnotationsForDatumsInput {
  readonly datumNameList: Iterable<CollectionObjectName>;
  readonly show?: boolean;
  readonly highlight?: boolean;
  readonly setInspectionView?: boolean;
}

export interface ShowHideAnnotationsForFeatureChecksInput {
  readonly featureCheckNameList: Iterable<CollectionItemName>;
  readonly show?: boolean;
  readonly highlight?: boolean;
  readonly setInspectionView?: boolean;
}

export interface ShowHideByObjectTypeInput {
  readonly allCollections?: boolean;
  readonly specificCollection: CollectionName;
  readonly objectTypeToShowHide?: ObjectType;
  readonly hideShowFalse?: boolean;
}

export interface ShowHideCalloutViewInput {
  readonly calloutViewToShow: CollectionItemName;
  readonly showCalloutView?: boolean;
}

export interface ShowHideDimensionInput {
  readonly dimensionName: CollectionItemName;
  readonly showDimension?: boolean;
}

export interface ShowHideInspectionBarInput {
  readonly showInspectionBar?: boolean;
}

export interface ShowHideInstrumentInterfaceInput {
  readonly instrumentId: CollectionInstrumentId;
  readonly minimizeInterface?: boolean;
  readonly hideInterface?: boolean;
}

export interface ShowHideInstrumentProbeTipInput {
  readonly showInstrumentProbeTip?: boolean;
}

export interface ShowHideInstrumentsInput {
  readonly instrumentIDs: Iterable<CollectionInstrumentId>;
  readonly showInstruments?: boolean;
}

export interface ShowHidePointsInput {
  readonly pointNames: Iterable<PointName>;
  readonly showHideFalse?: boolean;
}

export interface ShowHideRelationshipReportInput {
  readonly collectionName: CollectionName;
  readonly showRelationshipReport?: boolean;
}

export interface ShowHideRelationshipWatchInput {
  readonly relationshipName: CollectionObjectName;
  readonly showRelationshipWatch?: boolean;
  readonly relationshipWatchWindowProperties: CollectionObjectName;
  readonly windowTopLeftXPosition?: number;
  readonly windowTopLeftYPosition?: number;
  readonly windowWidth?: number;
  readonly windowHeight?: number;
}

export interface ShowItemsInTreeInput {
  readonly collapseAllOtherItems?: boolean;
  readonly points: Iterable<PointName>;
  readonly objects: Iterable<CollectionObjectName>;
  readonly instruments: Iterable<CollectionInstrumentId>;
  readonly featureChecks: Iterable<CollectionItemName>;
  readonly datums: Iterable<CollectionObjectName>;
  readonly collections: Iterable<string>;
}

export interface ShowLabelsInput {
  readonly pointLabelsOn?: boolean;
  readonly objectsLabelsOn?: boolean;
}

export interface ShowObjectsInput {
  readonly objectsToShow: Iterable<CollectionObjectName>;
}

export interface ShowProgressForTaskItemInput {
  readonly taskIndex?: number;
  readonly showProgress?: boolean;
}

export interface ShowTaskOverviewListInput {
  readonly show?: boolean;
}

export interface SortVectorsInput {
  readonly sourceVectors: Iterable<VectorName>;
  readonly sortMethod?: string;
  readonly coordinateSystem?: CoordinateSystemType;
  readonly primarySortCoordinate?: string;
  readonly secondarySortCoordinate?: string;
  readonly tertiarySortCoordinate?: string;
  readonly primaryCoordinateGranularity?: number;
  readonly secondaryCoordinateGranularity?: number;
  readonly tertiaryCoordinateGranularity?: number;
  readonly ascending?: boolean;
}

export interface SphereAxisCheckInput {
  readonly spherePointsGroupName: CollectionObjectName;
  readonly sphereTargetRadius?: number;
  readonly pointToCreateAtSphereCenter: PointName;
  readonly lineDefiningTheAxis: CollectionObjectName;
}

export interface SphereAxisCheckResult {
  readonly sphereFitRmsError: number;
  readonly sphereFitMaxError: number;
  readonly vectorRepresentation: Vector;
  readonly xValue: number;
  readonly yValue: number;
  readonly zValue: number;
  readonly magnitude: number;
}

export interface StatusDialogInput {
  readonly dialogTitle?: string;
  readonly textMessage?: string;
  readonly currentPosition?: number;
  readonly upperLimit?: number;
  readonly suppressTimeRemaining?: boolean;
  readonly closeDialog?: boolean;
}

export interface TemperatureCompensateAGroupInput {
  readonly originalGroup: CollectionObjectName;
  readonly scalingOriginCoordinateFrame: FrameName;
  readonly materialCte1DegF?: number;
  readonly initialTemperatureF?: number;
  readonly finalTemperatureF?: number;
  readonly scaledGroupName: CollectionObjectName;
}

export interface TransformObjectsByDeltaAboutWorkingFrameInput {
  readonly objectsToTransform: Iterable<CollectionObjectName>;
  readonly deltaTransform: Transform;
}

export interface TransformObjectsByDeltaWorldTransformOperatorInput {
  readonly objectsToTransform: Iterable<CollectionObjectName>;
  readonly deltaTransform: WorldTransform;
}

export interface TransformObjectsFrameToFrameInput {
  readonly objectNameList: Iterable<CollectionObjectName>;
  readonly initialFrameName: CollectionObjectName;
  readonly destinationFrameName: CollectionObjectName;
  readonly numberOfSteps?: number;
}

export interface TranslateObjectsByDeltaInput {
  readonly objectsToTranslate: Iterable<CollectionObjectName>;
  readonly deltaTranslation: Vector;
}

export interface TrimLogFileInput {
  readonly numberOfEntriesToKeep?: number;
}

export interface UseNrkxmlLibraryInput {
  readonly useLibrary?: boolean;
}

export interface VerifyGeneralFileExistsInput {
  readonly fileName: FileReference;
}

export interface VerifyMpFileExistsInput {
  readonly mpFileName: FileReference;
}

export interface WorkingFrameProperties {
  readonly frameName: string;
  readonly collectionName: string;
  readonly workingFrame: CollectionObjectName;
}

export interface WriteToLogInput {
  readonly logEntry?: string;
}

export async function angleBetweenLineAndPlane(
  briosa: BriosaClient,
  input: AngleBetweenLineAndPlaneInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.AngleBetweenLineAndPlaneRequest.fromPartial({
      selectedLine: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.selectedLine, 'selectedLine'),
      ),
      selectedPlane: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.selectedPlane, 'selectedPlane'),
      ),
      nominalAngle: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.nominalAngle, 0, 'nominalAngle'),
      ),
      angleTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.angleTolerance00ForNone,
          0,
          'angleTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'AngleBetweenLineAndPlane',
    request,
    AnalysisOperationsProtocol.AngleBetweenLineAndPlaneRequest,
    AnalysisOperationsProtocol.AngleBetweenLineAndPlaneResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['angle', operationScalarSchemas.number, 'angle']],
  );
  return mapped as number;
}

export async function angleBetweenTwoLines(
  briosa: BriosaClient,
  input: AngleBetweenTwoLinesInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.AngleBetweenTwoLinesRequest.fromPartial({
      line1: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.line1, 'line1'),
      ),
      line2: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.line2, 'line2'),
      ),
      nominalAngle: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.nominalAngle, 0, 'nominalAngle'),
      ),
      angleTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.angleTolerance00ForNone,
          0,
          'angleTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'AngleBetweenTwoLines',
    request,
    AnalysisOperationsProtocol.AngleBetweenTwoLinesRequest,
    AnalysisOperationsProtocol.AngleBetweenTwoLinesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['angle', operationScalarSchemas.number, 'angle']],
  );
  return mapped as number;
}

export async function angleBetweenTwoPlanesNormals(
  briosa: BriosaClient,
  input: AngleBetweenTwoPlanesNormalsInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.AngleBetweenTwoPlanesNormalsRequest.fromPartial({
      planeA: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.planeA, 'planeA'),
      ),
      planeB: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.planeB, 'planeB'),
      ),
      nominalAngle: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.nominalAngle, 0, 'nominalAngle'),
      ),
      angleTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.angleTolerance00ForNone,
          0,
          'angleTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'AngleBetweenTwoPlanesNormals',
    request,
    AnalysisOperationsProtocol.AngleBetweenTwoPlanesNormalsRequest,
    AnalysisOperationsProtocol.AngleBetweenTwoPlanesNormalsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['angle', operationScalarSchemas.number, 'angle']],
  );
  return mapped as number;
}

export async function bestFitTransformationGroupToGroup(
  briosa: BriosaClient,
  input: BestFitTransformationGroupToGroupInput,
  options: BriosaCallOptions = {},
): Promise<BestFitTransformationGroupToGroupResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.BestFitTransformationGroupToGroupRequest.fromPartial(
      {
        referenceGroup: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.referenceGroup, 'referenceGroup'),
        ),
        correspondingGroup: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.correspondingGroup, 'correspondingGroup'),
        ),
        showInterface: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.showInterface, false, 'showInterface'),
        ),
        rmsTolerance00ForNone: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.rmsTolerance00ForNone,
            0,
            'rmsTolerance00ForNone',
          ),
        ),
        maximumAbsoluteTolerance00ForNone: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.maximumAbsoluteTolerance00ForNone,
            0,
            'maximumAbsoluteTolerance00ForNone',
          ),
        ),
        allowScale: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowScale, false, 'allowScale'),
        ),
        allowX: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowX, true, 'allowX'),
        ),
        allowY: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowY, true, 'allowY'),
        ),
        allowZ: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowZ, true, 'allowZ'),
        ),
        allowRx: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowRx, true, 'allowRx'),
        ),
        allowRy: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowRy, true, 'allowRy'),
        ),
        allowRz: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.allowRz, true, 'allowRz'),
        ),
        lockDegreesOfFreedom: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.lockDegreesOfFreedom,
            false,
            'lockDegreesOfFreedom',
          ),
        ),
        generateEvent: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.generateEvent, false, 'generateEvent'),
        ),
        filePathForCsvTextReportRequiresShowInterfaceTrue: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(
            input.filePathForCsvTextReportRequiresShowInterfaceTrue,
            'filePathForCsvTextReportRequiresShowInterfaceTrue',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'BestFitTransformationGroupToGroup',
    request,
    AnalysisOperationsProtocol.BestFitTransformationGroupToGroupRequest,
    AnalysisOperationsProtocol.BestFitTransformationGroupToGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'transformInWorking',
        getOperationValueSchema('transform'),
        'transformInWorking',
      ],
      [
        'optimumTransform',
        getOperationValueSchema('worldTransform'),
        'optimumTransform',
      ],
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maximumAbsoluteDeviation',
        operationScalarSchemas.number,
        'maximumAbsoluteDeviation',
      ],
      ['numberOfUnknowns', operationScalarSchemas.integer, 'numberOfUnknowns'],
      [
        'numberOfEquations',
        operationScalarSchemas.integer,
        'numberOfEquations',
      ],
      ['robustness', operationScalarSchemas.number, 'robustness'],
    ],
  );
  return mapped as BestFitTransformationGroupToGroupResult;
}

export async function computeGroupToGroupOrientationRxRyRz(
  briosa: BriosaClient,
  input: ComputeGroupToGroupOrientationRxRyRzInput,
  options: BriosaCallOptions = {},
): Promise<ComputeGroupToGroupOrientationRxRyRzResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.ComputeGroupToGroupOrientationRxRyRzRequest.fromPartial(
      {
        referenceGroup: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.referenceGroup, 'referenceGroup'),
        ),
        correspondingGroup: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.correspondingGroup, 'correspondingGroup'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ComputeGroupToGroupOrientationRxRyRz',
    request,
    AnalysisOperationsProtocol.ComputeGroupToGroupOrientationRxRyRzRequest,
    AnalysisOperationsProtocol.ComputeGroupToGroupOrientationRxRyRzResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rx', operationScalarSchemas.number, 'rx'],
      ['ry', operationScalarSchemas.number, 'ry'],
      ['rz', operationScalarSchemas.number, 'rz'],
    ],
  );
  return mapped as ComputeGroupToGroupOrientationRxRyRzResult;
}

export async function createPointUncertaintyCloudPointSets(
  briosa: BriosaClient,
  input: CreatePointUncertaintyCloudPointSetsInput,
  options: BriosaCallOptions = {},
): Promise<CreatePointUncertaintyCloudPointSetsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.CreatePointUncertaintyCloudPointSetsRequest.fromPartial(
      {
        pointNameList: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('pointName')),
          requireOperationInput(input.pointNameList, 'pointNameList'),
        ),
        numberOfSamples: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(
            input.numberOfSamples,
            1000,
            'numberOfSamples',
          ),
        ),
        uncertaintyReferenceFrameMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.uncertaintyReferenceFrameMode,
            'With respect to WORLD',
            'uncertaintyReferenceFrameMode',
          ),
        ),
        groupingMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.groupingMode,
            'Group per point',
            'groupingMode',
          ),
        ),
        pointSetMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.pointSetMode,
            'Point clouds',
            'pointSetMode',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'CreatePointUncertaintyCloudPointSets',
    request,
    AnalysisOperationsProtocol.CreatePointUncertaintyCloudPointSetsRequest,
    AnalysisOperationsProtocol.CreatePointUncertaintyCloudPointSetsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'pointGroups',
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        'pointGroups',
      ],
      [
        'pointSets',
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        'pointSets',
      ],
      [
        'pointClouds',
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        'pointClouds',
      ],
    ],
  );
  return mapped as CreatePointUncertaintyCloudPointSetsResult;
}

export async function createPointUncertaintyFields(
  briosa: BriosaClient,
  input: CreatePointUncertaintyFieldsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.CreatePointUncertaintyFieldsRequest.fromPartial({
      pointNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.pointNameList, 'pointNameList'),
      ),
      numberOfSamples: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.numberOfSamples, 1000, 'numberOfSamples'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'CreatePointUncertaintyFields',
    request,
    AnalysisOperationsProtocol.CreatePointUncertaintyFieldsRequest,
    AnalysisOperationsProtocol.CreatePointUncertaintyFieldsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function fitGeometryToPointGroup(
  briosa: BriosaClient,
  input: FitGeometryToPointGroupInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.FitGeometryToPointGroupRequest.fromPartial({
      geometryType: toWireOperationValue(
        getOperationValueSchema('geometryType'),
        requireOperationInput(input.geometryType, 'geometryType'),
      ),
      groupToFit: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupToFit, 'groupToFit'),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      reportDeviations: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reportDeviations,
          false,
          'reportDeviations',
        ),
      ),
      fitInterfaceTolerance10UseProfile: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.fitInterfaceTolerance10UseProfile,
          -1,
          'fitInterfaceTolerance10UseProfile',
        ),
      ),
      ignoreOutOfTolerancePoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.ignoreOutOfTolerancePoints,
          false,
          'ignoreOutOfTolerancePoints',
        ),
      ),
      startingConditionGeometryOptional: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.startingConditionGeometryOptional,
          'startingConditionGeometryOptional',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'FitGeometryToPointGroup',
    request,
    AnalysisOperationsProtocol.FitGeometryToPointGroupRequest,
    AnalysisOperationsProtocol.FitGeometryToPointGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function fitGeometryToPointGroupProjectedToPlane(
  briosa: BriosaClient,
  input: FitGeometryToPointGroupProjectedToPlaneInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.FitGeometryToPointGroupProjectedToPlaneRequest.fromPartial(
      {
        geometryType: toWireOperationValue(
          getOperationValueSchema('geometryType'),
          requireOperationInput(input.geometryType, 'geometryType'),
        ),
        groupToFit: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.groupToFit, 'groupToFit'),
        ),
        planeName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.planeName, 'planeName'),
        ),
        resultingObjectName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.resultingObjectName,
            'resultingObjectName',
          ),
        ),
        fitProfileName: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
        ),
        reportDeviations: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.reportDeviations,
            false,
            'reportDeviations',
          ),
        ),
        fitInterfaceTolerance10UseProfile: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.fitInterfaceTolerance10UseProfile,
            -1,
            'fitInterfaceTolerance10UseProfile',
          ),
        ),
        ignoreOutOfTolerancePoints: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.ignoreOutOfTolerancePoints,
            false,
            'ignoreOutOfTolerancePoints',
          ),
        ),
        startingConditionGeometryOptional: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.startingConditionGeometryOptional,
            'startingConditionGeometryOptional',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'FitGeometryToPointGroupProjectedToPlane',
    request,
    AnalysisOperationsProtocol.FitGeometryToPointGroupProjectedToPlaneRequest,
    AnalysisOperationsProtocol.FitGeometryToPointGroupProjectedToPlaneResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function fitGeometryToPoints(
  briosa: BriosaClient,
  input: FitGeometryToPointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.FitGeometryToPointsRequest.fromPartial({
      geometryType: toWireOperationValue(
        getOperationValueSchema('geometryType'),
        requireOperationInput(input.geometryType, 'geometryType'),
      ),
      pointsToFit: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.pointsToFit, 'pointsToFit'),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      reportDeviations: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reportDeviations,
          false,
          'reportDeviations',
        ),
      ),
      fitInterfaceTolerance10UseProfile: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.fitInterfaceTolerance10UseProfile,
          -1,
          'fitInterfaceTolerance10UseProfile',
        ),
      ),
      ignoreOutOfTolerancePoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.ignoreOutOfTolerancePoints,
          false,
          'ignoreOutOfTolerancePoints',
        ),
      ),
      startingConditionGeometryOptional: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.startingConditionGeometryOptional,
          'startingConditionGeometryOptional',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'FitGeometryToPoints',
    request,
    AnalysisOperationsProtocol.FitGeometryToPointsRequest,
    AnalysisOperationsProtocol.FitGeometryToPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getBSplineProperties(
  briosa: BriosaClient,
  input: GetBSplinePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetBSplinePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetBSplinePropertiesRequest.fromPartial({
      bSplineName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.bSplineName, 'bSplineName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetBSplineProperties',
    request,
    AnalysisOperationsProtocol.GetBSplinePropertiesRequest,
    AnalysisOperationsProtocol.GetBSplinePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['degree', operationScalarSchemas.integer, 'degree'],
      ['knots', operationScalarSchemas.integer, 'knots'],
      ['controlPoints', operationScalarSchemas.integer, 'controlPoints'],
      ['rangeMin', operationScalarSchemas.number, 'rangeMin'],
      ['rangeMax', operationScalarSchemas.number, 'rangeMax'],
      ['length', operationScalarSchemas.number, 'length'],
    ],
  );
  return mapped as GetBSplinePropertiesResult;
}

export async function getCircleProperties(
  briosa: BriosaClient,
  input: GetCirclePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetCirclePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetCirclePropertiesRequest.fromPartial({
      circleName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.circleName, 'circleName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetCircleProperties',
    request,
    AnalysisOperationsProtocol.GetCirclePropertiesRequest,
    AnalysisOperationsProtocol.GetCirclePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'centerCoordinate',
        getOperationValueSchema('vector'),
        'centerCoordinate',
      ],
      ['normalDirection', getOperationValueSchema('vector'), 'normalDirection'],
      ['radius', operationScalarSchemas.number, 'radius'],
      ['diameter', operationScalarSchemas.number, 'diameter'],
    ],
  );
  return mapped as GetCirclePropertiesResult;
}

export async function getConeProperties(
  briosa: BriosaClient,
  input: GetConePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetConePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetConePropertiesRequest.fromPartial({
      coneName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.coneName, 'coneName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetConeProperties',
    request,
    AnalysisOperationsProtocol.GetConePropertiesRequest,
    AnalysisOperationsProtocol.GetConePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'coneEndPointInWorkingCoordinates',
        getOperationValueSchema('vector'),
        'coneEndPointInWorkingCoordinates',
      ],
      [
        'coneAxisInWorkingCoordinates',
        getOperationValueSchema('vector'),
        'coneAxisInWorkingCoordinates',
      ],
      ['coneLength', operationScalarSchemas.number, 'coneLength'],
      ['coneThetaStart', operationScalarSchemas.number, 'coneThetaStart'],
      ['coneThetaSpan', operationScalarSchemas.number, 'coneThetaSpan'],
      ['coneIncludedAngle', operationScalarSchemas.number, 'coneIncludedAngle'],
      ['cutLengthFromApex', operationScalarSchemas.number, 'cutLengthFromApex'],
    ],
  );
  return mapped as GetConePropertiesResult;
}

export async function getCoordinateForIthPointInPointSet(
  briosa: BriosaClient,
  input: GetCoordinateForIthPointInPointSetInput,
  options: BriosaCallOptions = {},
): Promise<GetCoordinateForIthPointInPointSetResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetCoordinateForIthPointInPointSetRequest.fromPartial(
      {
        pointSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pointSet, 'pointSet'),
        ),
        pointSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.pointSetIndex, 0, 'pointSetIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetCoordinateForIthPointInPointSet',
    request,
    AnalysisOperationsProtocol.GetCoordinateForIthPointInPointSetRequest,
    AnalysisOperationsProtocol.GetCoordinateForIthPointInPointSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['pointName', operationScalarSchemas.string, 'pointName'],
      [
        'pointCoordinates',
        getOperationValueSchema('vector'),
        'pointCoordinates',
      ],
    ],
  );
  return mapped as GetCoordinateForIthPointInPointSetResult;
}

export async function getCylinderProperties(
  briosa: BriosaClient,
  input: GetCylinderPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetCylinderPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetCylinderPropertiesRequest.fromPartial({
      cylinderName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.cylinderName, 'cylinderName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetCylinderProperties',
    request,
    AnalysisOperationsProtocol.GetCylinderPropertiesRequest,
    AnalysisOperationsProtocol.GetCylinderPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['beginCoordinate', getOperationValueSchema('vector'), 'beginCoordinate'],
      ['endCoordinate', getOperationValueSchema('vector'), 'endCoordinate'],
      ['axisDirection', getOperationValueSchema('vector'), 'axisDirection'],
      ['length', operationScalarSchemas.number, 'length'],
      ['radius', operationScalarSchemas.number, 'radius'],
      ['diameter', operationScalarSchemas.number, 'diameter'],
      [
        'nominalsPointInward',
        operationScalarSchemas.boolean,
        'nominalsPointInward',
      ],
      ['facets', operationScalarSchemas.integer, 'facets'],
      [
        'enableThetaExtentDisplayMode',
        operationScalarSchemas.boolean,
        'enableThetaExtentDisplayMode',
      ],
      [
        'thetaStartInDegrees',
        operationScalarSchemas.number,
        'thetaStartInDegrees',
      ],
      [
        'thetaSpanInDegrees',
        operationScalarSchemas.number,
        'thetaSpanInDegrees',
      ],
    ],
  );
  return mapped as GetCylinderPropertiesResult;
}

export async function getEllipseProperties(
  briosa: BriosaClient,
  input: GetEllipsePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetEllipsePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetEllipsePropertiesRequest.fromPartial({
      ellipseName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.ellipseName, 'ellipseName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetEllipseProperties',
    request,
    AnalysisOperationsProtocol.GetEllipsePropertiesRequest,
    AnalysisOperationsProtocol.GetEllipsePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'centerCoordinate',
        getOperationValueSchema('vector'),
        'centerCoordinate',
      ],
      ['normalDirection', getOperationValueSchema('vector'), 'normalDirection'],
      ['majorAxisRadius', operationScalarSchemas.number, 'majorAxisRadius'],
      ['minorAxisRadius', operationScalarSchemas.number, 'minorAxisRadius'],
    ],
  );
  return mapped as GetEllipsePropertiesResult;
}

export async function getEulerParametersForFrame(
  briosa: BriosaClient,
  input: GetEulerParametersForFrameInput,
  options: BriosaCallOptions = {},
): Promise<GetEulerParametersForFrameResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetEulerParametersForFrameRequest.fromPartial({
      frame: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.frame, 'frame'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetEulerParametersForFrame',
    request,
    AnalysisOperationsProtocol.GetEulerParametersForFrameRequest,
    AnalysisOperationsProtocol.GetEulerParametersForFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['x', operationScalarSchemas.number, 'x'],
      ['y', operationScalarSchemas.number, 'y'],
      ['z', operationScalarSchemas.number, 'z'],
      ['e1', operationScalarSchemas.number, 'e1'],
      ['e2', operationScalarSchemas.number, 'e2'],
      ['e3', operationScalarSchemas.number, 'e3'],
      ['e4', operationScalarSchemas.number, 'e4'],
    ],
  );
  return mapped as GetEulerParametersForFrameResult;
}

export async function getEulerParametersForIthFrameInFrameSet(
  briosa: BriosaClient,
  input: GetEulerParametersForIthFrameInFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<GetEulerParametersForIthFrameInFrameSetResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetEulerParametersForIthFrameInFrameSetRequest.fromPartial(
      {
        frameSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.frameSet, 'frameSet'),
        ),
        frameSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.frameSetIndex, 0, 'frameSetIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetEulerParametersForIthFrameInFrameSet',
    request,
    AnalysisOperationsProtocol.GetEulerParametersForIthFrameInFrameSetRequest,
    AnalysisOperationsProtocol.GetEulerParametersForIthFrameInFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['x', operationScalarSchemas.number, 'x'],
      ['y', operationScalarSchemas.number, 'y'],
      ['z', operationScalarSchemas.number, 'z'],
      ['e1', operationScalarSchemas.number, 'e1'],
      ['e2', operationScalarSchemas.number, 'e2'],
      ['e3', operationScalarSchemas.number, 'e3'],
      ['e4', operationScalarSchemas.number, 'e4'],
    ],
  );
  return mapped as GetEulerParametersForIthFrameInFrameSetResult;
}

export async function getIthCollectionName(
  briosa: BriosaClient,
  input: GetIthCollectionNameInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetIthCollectionNameRequest.fromPartial({
      collectionIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.collectionIndex, 0, 'collectionIndex'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetIthCollectionName',
    request,
    AnalysisOperationsProtocol.GetIthCollectionNameRequest,
    AnalysisOperationsProtocol.GetIthCollectionNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['resultantName', operationScalarSchemas.string, 'resultantName']],
  );
  return mapped as string;
}

export async function getIthPointFromGroup(
  briosa: BriosaClient,
  input: GetIthPointFromGroupInput,
  options: BriosaCallOptions = {},
): Promise<GetIthPointFromGroupResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetIthPointFromGroupRequest.fromPartial({
      groupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupName, 'groupName'),
      ),
      pointIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.pointIndex, 0, 'pointIndex'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetIthPointFromGroup',
    request,
    AnalysisOperationsProtocol.GetIthPointFromGroupRequest,
    AnalysisOperationsProtocol.GetIthPointFromGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'completePointName',
        getOperationValueSchema('pointName'),
        'completePointName',
      ],
      ['pointNameOnly', operationScalarSchemas.string, 'pointNameOnly'],
      ['vectorInWorking', getOperationValueSchema('vector'), 'vectorInWorking'],
    ],
  );
  return mapped as GetIthPointFromGroupResult;
}

export async function getLineProperties(
  briosa: BriosaClient,
  input: GetLinePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetLinePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetLinePropertiesRequest.fromPartial({
      lineName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.lineName, 'lineName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetLineProperties',
    request,
    AnalysisOperationsProtocol.GetLinePropertiesRequest,
    AnalysisOperationsProtocol.GetLinePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['beginCoordinate', getOperationValueSchema('vector'), 'beginCoordinate'],
      ['endCoordinate', getOperationValueSchema('vector'), 'endCoordinate'],
      ['deltaComponents', getOperationValueSchema('vector'), 'deltaComponents'],
      ['length', operationScalarSchemas.number, 'length'],
      [
        'angleAboutXFromYInYzPlane',
        operationScalarSchemas.number,
        'angleAboutXFromYInYzPlane',
      ],
      [
        'angleAboutYFromZInXzPlane',
        operationScalarSchemas.number,
        'angleAboutYFromZInXzPlane',
      ],
      [
        'angleAboutZFromXInXyPlane',
        operationScalarSchemas.number,
        'angleAboutZFromXInXyPlane',
      ],
    ],
  );
  return mapped as GetLinePropertiesResult;
}

export async function getMeasurementAuxiliaryData(
  briosa: BriosaClient,
  input: GetMeasurementAuxiliaryDataInput,
  options: BriosaCallOptions = {},
): Promise<GetMeasurementAuxiliaryDataResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetMeasurementAuxiliaryDataRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
      auxiliaryName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.auxiliaryName, '', 'auxiliaryName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetMeasurementAuxiliaryData',
    request,
    AnalysisOperationsProtocol.GetMeasurementAuxiliaryDataRequest,
    AnalysisOperationsProtocol.GetMeasurementAuxiliaryDataResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['value', operationScalarSchemas.number, 'value'],
      ['units', operationScalarSchemas.string, 'units'],
    ],
  );
  return mapped as GetMeasurementAuxiliaryDataResult;
}

export async function getMeasurementInfoData(
  briosa: BriosaClient,
  input: GetMeasurementInfoDataInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetMeasurementInfoDataRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetMeasurementInfoData',
    request,
    AnalysisOperationsProtocol.GetMeasurementInfoDataRequest,
    AnalysisOperationsProtocol.GetMeasurementInfoDataResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['infoData', operationScalarSchemas.string, 'infoData']],
  );
  return mapped as string;
}

export async function getMeasurementWeatherData(
  briosa: BriosaClient,
  input: GetMeasurementWeatherDataInput,
  options: BriosaCallOptions = {},
): Promise<GetMeasurementWeatherDataResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetMeasurementWeatherDataRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetMeasurementWeatherData',
    request,
    AnalysisOperationsProtocol.GetMeasurementWeatherDataRequest,
    AnalysisOperationsProtocol.GetMeasurementWeatherDataResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['temperatureDegF', operationScalarSchemas.number, 'temperatureDegF'],
      ['pressureInHg', operationScalarSchemas.number, 'pressureInHg'],
      ['humidityRh', operationScalarSchemas.number, 'humidityRh'],
    ],
  );
  return mapped as GetMeasurementWeatherDataResult;
}

export async function getNumberOfCollections(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<number> {
  const request =
    AnalysisOperationsProtocol.GetNumberOfCollectionsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetNumberOfCollections',
    request,
    AnalysisOperationsProtocol.GetNumberOfCollectionsRequest,
    AnalysisOperationsProtocol.GetNumberOfCollectionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getNumberOfFramesInFrameSet(
  briosa: BriosaClient,
  input: GetNumberOfFramesInFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetNumberOfFramesInFrameSetRequest.fromPartial({
      frameSetContainer: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.frameSetContainer, 'frameSetContainer'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetNumberOfFramesInFrameSet',
    request,
    AnalysisOperationsProtocol.GetNumberOfFramesInFrameSetRequest,
    AnalysisOperationsProtocol.GetNumberOfFramesInFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getNumberOfPointsInGroup(
  briosa: BriosaClient,
  input: GetNumberOfPointsInGroupInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetNumberOfPointsInGroupRequest.fromPartial({
      groupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupName, 'groupName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetNumberOfPointsInGroup',
    request,
    AnalysisOperationsProtocol.GetNumberOfPointsInGroupRequest,
    AnalysisOperationsProtocol.GetNumberOfPointsInGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getNumberOfPointsInPointSet(
  briosa: BriosaClient,
  input: GetNumberOfPointsInPointSetInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetNumberOfPointsInPointSetRequest.fromPartial({
      pointSetContainer: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pointSetContainer, 'pointSetContainer'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetNumberOfPointsInPointSet',
    request,
    AnalysisOperationsProtocol.GetNumberOfPointsInPointSetRequest,
    AnalysisOperationsProtocol.GetNumberOfPointsInPointSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getObjectReportingFrame(
  briosa: BriosaClient,
  input: GetObjectReportingFrameInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetObjectReportingFrameRequest.fromPartial({
      objectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.objectName, 'objectName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetObjectReportingFrame',
    request,
    AnalysisOperationsProtocol.GetObjectReportingFrameRequest,
    AnalysisOperationsProtocol.GetObjectReportingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'reportingFrame',
        getOperationValueSchema('collectionObjectName'),
        'reportingFrame',
      ],
    ],
  );
  return mapped as CollectionObjectName;
}

export async function getPlaneProperties(
  briosa: BriosaClient,
  input: GetPlanePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetPlanePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPlanePropertiesRequest.fromPartial({
      planeName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.planeName, 'planeName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPlaneProperties',
    request,
    AnalysisOperationsProtocol.GetPlanePropertiesRequest,
    AnalysisOperationsProtocol.GetPlanePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['normalDirection', getOperationValueSchema('vector'), 'normalDirection'],
      ['pointOnPlane', getOperationValueSchema('vector'), 'pointOnPlane'],
      ['dParameter', operationScalarSchemas.number, 'dParameter'],
    ],
  );
  return mapped as GetPlanePropertiesResult;
}

export async function getPointCoordinate(
  briosa: BriosaClient,
  input: GetPointCoordinateInput,
  options: BriosaCallOptions = {},
): Promise<GetPointCoordinateResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointCoordinateRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointCoordinate',
    request,
    AnalysisOperationsProtocol.GetPointCoordinateRequest,
    AnalysisOperationsProtocol.GetPointCoordinateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'vectorRepresentation',
        getOperationValueSchema('vector'),
        'vectorRepresentation',
      ],
      ['xValue', operationScalarSchemas.number, 'xValue'],
      ['yValue', operationScalarSchemas.number, 'yValue'],
      ['zValue', operationScalarSchemas.number, 'zValue'],
    ],
  );
  return mapped as GetPointCoordinateResult;
}

export async function getPointCoordinateCylindrical(
  briosa: BriosaClient,
  input: GetPointCoordinateCylindricalInput,
  options: BriosaCallOptions = {},
): Promise<GetPointCoordinateCylindricalResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointCoordinateCylindricalRequest.fromPartial(
      {
        pointName: toWireOperationValue(
          getOperationValueSchema('pointName'),
          requireOperationInput(input.pointName, 'pointName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointCoordinateCylindrical',
    request,
    AnalysisOperationsProtocol.GetPointCoordinateCylindricalRequest,
    AnalysisOperationsProtocol.GetPointCoordinateCylindricalResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['radiusValue', operationScalarSchemas.number, 'radiusValue'],
      ['thetaValue', operationScalarSchemas.number, 'thetaValue'],
      ['zValue', operationScalarSchemas.number, 'zValue'],
    ],
  );
  return mapped as GetPointCoordinateCylindricalResult;
}

export async function getPointCoordinatePolar(
  briosa: BriosaClient,
  input: GetPointCoordinatePolarInput,
  options: BriosaCallOptions = {},
): Promise<GetPointCoordinatePolarResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointCoordinatePolarRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointCoordinatePolar',
    request,
    AnalysisOperationsProtocol.GetPointCoordinatePolarRequest,
    AnalysisOperationsProtocol.GetPointCoordinatePolarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['radiusValue', operationScalarSchemas.number, 'radiusValue'],
      ['thetaValue', operationScalarSchemas.number, 'thetaValue'],
      ['phiValue', operationScalarSchemas.number, 'phiValue'],
    ],
  );
  return mapped as GetPointCoordinatePolarResult;
}

export async function getPointProperties(
  briosa: BriosaClient,
  input: GetPointPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetPointPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointPropertiesRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointProperties',
    request,
    AnalysisOperationsProtocol.GetPointPropertiesRequest,
    AnalysisOperationsProtocol.GetPointPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['planarOffset', operationScalarSchemas.number, 'planarOffset'],
      ['radialOffset', operationScalarSchemas.number, 'radialOffset'],
      ['ux', operationScalarSchemas.number, 'ux'],
      ['uy', operationScalarSchemas.number, 'uy'],
      ['uz', operationScalarSchemas.number, 'uz'],
      ['umag', operationScalarSchemas.number, 'umag'],
      [
        'positionTolerance',
        getOperationValueSchema('toleranceVectorOptions'),
        'positionTolerance',
      ],
      [
        'componentWeights',
        getOperationValueSchema('vector'),
        'componentWeights',
      ],
    ],
  );
  return mapped as GetPointPropertiesResult;
}

export async function getPointToLineDistance(
  briosa: BriosaClient,
  input: GetPointToLineDistanceInput,
  options: BriosaCallOptions = {},
): Promise<GetPointToLineDistanceResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointToLineDistanceRequest.fromPartial({
      point: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.point, 'point'),
      ),
      line: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.line, 'line'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointToLineDistance',
    request,
    AnalysisOperationsProtocol.GetPointToLineDistanceRequest,
    AnalysisOperationsProtocol.GetPointToLineDistanceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'vectorRepresentation',
        getOperationValueSchema('vector'),
        'vectorRepresentation',
      ],
      ['xValue', operationScalarSchemas.number, 'xValue'],
      ['yValue', operationScalarSchemas.number, 'yValue'],
      ['zValue', operationScalarSchemas.number, 'zValue'],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as GetPointToLineDistanceResult;
}

export async function getPointToPointDistance(
  briosa: BriosaClient,
  input: GetPointToPointDistanceInput,
  options: BriosaCallOptions = {},
): Promise<GetPointToPointDistanceResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointToPointDistanceRequest.fromPartial({
      firstPoint: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.firstPoint, 'firstPoint'),
      ),
      secondPoint: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.secondPoint, 'secondPoint'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointToPointDistance',
    request,
    AnalysisOperationsProtocol.GetPointToPointDistanceRequest,
    AnalysisOperationsProtocol.GetPointToPointDistanceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'vectorRepresentation',
        getOperationValueSchema('vector'),
        'vectorRepresentation',
      ],
      ['xValue', operationScalarSchemas.number, 'xValue'],
      ['yValue', operationScalarSchemas.number, 'yValue'],
      ['zValue', operationScalarSchemas.number, 'zValue'],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as GetPointToPointDistanceResult;
}

export async function getPointTolerance(
  briosa: BriosaClient,
  input: GetPointToleranceInput,
  options: BriosaCallOptions = {},
): Promise<GetPointToleranceResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetPointToleranceRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetPointTolerance',
    request,
    AnalysisOperationsProtocol.GetPointToleranceRequest,
    AnalysisOperationsProtocol.GetPointToleranceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'useHighXTolerance',
        operationScalarSchemas.boolean,
        'useHighXTolerance',
      ],
      ['highXTolerance', operationScalarSchemas.number, 'highXTolerance'],
      [
        'useHighYTolerance',
        operationScalarSchemas.boolean,
        'useHighYTolerance',
      ],
      ['highYTolerance', operationScalarSchemas.number, 'highYTolerance'],
      [
        'useHighZTolerance',
        operationScalarSchemas.boolean,
        'useHighZTolerance',
      ],
      ['highZTolerance', operationScalarSchemas.number, 'highZTolerance'],
      [
        'useHighMagTolerance',
        operationScalarSchemas.boolean,
        'useHighMagTolerance',
      ],
      ['highMagTolerance', operationScalarSchemas.number, 'highMagTolerance'],
      ['useLowXTolerance', operationScalarSchemas.boolean, 'useLowXTolerance'],
      ['lowXTolerance', operationScalarSchemas.number, 'lowXTolerance'],
      ['useLowYTolerance', operationScalarSchemas.boolean, 'useLowYTolerance'],
      ['lowYTolerance', operationScalarSchemas.number, 'lowYTolerance'],
      ['useLowZTolerance', operationScalarSchemas.boolean, 'useLowZTolerance'],
      ['lowZTolerance', operationScalarSchemas.number, 'lowZTolerance'],
      [
        'useLowMagTolerance',
        operationScalarSchemas.boolean,
        'useLowMagTolerance',
      ],
      ['lowMagTolerance', operationScalarSchemas.number, 'lowMagTolerance'],
      [
        'vectorTolerance',
        getOperationValueSchema('toleranceVectorOptions'),
        'vectorTolerance',
      ],
    ],
  );
  return mapped as GetPointToleranceResult;
}

export async function getSlotProperties(
  briosa: BriosaClient,
  input: GetSlotPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetSlotPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetSlotPropertiesRequest.fromPartial({
      slotName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.slotName, 'slotName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetSlotProperties',
    request,
    AnalysisOperationsProtocol.GetSlotPropertiesRequest,
    AnalysisOperationsProtocol.GetSlotPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'slotTransformInWorkingCoordinates',
        getOperationValueSchema('transform'),
        'slotTransformInWorkingCoordinates',
      ],
      [
        'centerInWorkingCoordinates',
        getOperationValueSchema('vector'),
        'centerInWorkingCoordinates',
      ],
      [
        'normalDirectionInWorkingCoordinates',
        getOperationValueSchema('vector'),
        'normalDirectionInWorkingCoordinates',
      ],
      ['slotLength', operationScalarSchemas.number, 'slotLength'],
      ['slotWidth', operationScalarSchemas.number, 'slotWidth'],
      ['roundSlotType', operationScalarSchemas.boolean, 'roundSlotType'],
      [
        'centerlinePt1InWorkingCoordinates',
        getOperationValueSchema('vector'),
        'centerlinePt1InWorkingCoordinates',
      ],
      [
        'centerlinePt2InWorkingCoordinates',
        getOperationValueSchema('vector'),
        'centerlinePt2InWorkingCoordinates',
      ],
    ],
  );
  return mapped as GetSlotPropertiesResult;
}

export async function getSphereProperties(
  briosa: BriosaClient,
  input: GetSpherePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetSpherePropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetSpherePropertiesRequest.fromPartial({
      sphereName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.sphereName, 'sphereName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetSphereProperties',
    request,
    AnalysisOperationsProtocol.GetSpherePropertiesRequest,
    AnalysisOperationsProtocol.GetSpherePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'centerCoordinate',
        getOperationValueSchema('vector'),
        'centerCoordinate',
      ],
      ['radius', operationScalarSchemas.number, 'radius'],
      ['diameter', operationScalarSchemas.number, 'diameter'],
    ],
  );
  return mapped as GetSpherePropertiesResult;
}

export async function getSurfacePhysicalStats(
  briosa: BriosaClient,
  input: GetSurfacePhysicalStatsInput,
  options: BriosaCallOptions = {},
): Promise<GetSurfacePhysicalStatsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetSurfacePhysicalStatsRequest.fromPartial({
      surfaceName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.surfaceName, 'surfaceName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetSurfacePhysicalStats',
    request,
    AnalysisOperationsProtocol.GetSurfacePhysicalStatsRequest,
    AnalysisOperationsProtocol.GetSurfacePhysicalStatsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['volume', operationScalarSchemas.number, 'volume'],
      ['area', operationScalarSchemas.number, 'area'],
    ],
  );
  return mapped as GetSurfacePhysicalStatsResult;
}

export async function getTimestampForIthFrameInFrameSet(
  briosa: BriosaClient,
  input: GetTimestampForIthFrameInFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetTimestampForIthFrameInFrameSetRequest.fromPartial(
      {
        frameSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.frameSet, 'frameSet'),
        ),
        frameSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.frameSetIndex, 0, 'frameSetIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetTimestampForIthFrameInFrameSet',
    request,
    AnalysisOperationsProtocol.GetTimestampForIthFrameInFrameSetRequest,
    AnalysisOperationsProtocol.GetTimestampForIthFrameInFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['timestamp', operationScalarSchemas.number, 'timestamp']],
  );
  return mapped as number;
}

export async function getTimestampForIthPointInPointSet(
  briosa: BriosaClient,
  input: GetTimestampForIthPointInPointSetInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetTimestampForIthPointInPointSetRequest.fromPartial(
      {
        pointSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pointSet, 'pointSet'),
        ),
        pointSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.pointSetIndex, 0, 'pointSetIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetTimestampForIthPointInPointSet',
    request,
    AnalysisOperationsProtocol.GetTimestampForIthPointInPointSetRequest,
    AnalysisOperationsProtocol.GetTimestampForIthPointInPointSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['timestamp', operationScalarSchemas.number, 'timestamp']],
  );
  return mapped as number;
}

export async function getTorusProperties(
  briosa: BriosaClient,
  input: GetTorusPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetTorusPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetTorusPropertiesRequest.fromPartial({
      torusName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.torusName, 'torusName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetTorusProperties',
    request,
    AnalysisOperationsProtocol.GetTorusPropertiesRequest,
    AnalysisOperationsProtocol.GetTorusPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'centerCoordinate',
        getOperationValueSchema('vector'),
        'centerCoordinate',
      ],
      ['normalDirection', getOperationValueSchema('vector'), 'normalDirection'],
      ['majorRadius', operationScalarSchemas.number, 'majorRadius'],
      ['minorRadius', operationScalarSchemas.number, 'minorRadius'],
    ],
  );
  return mapped as GetTorusPropertiesResult;
}

export async function getTransformForIthFrameInFrameSet(
  briosa: BriosaClient,
  input: GetTransformForIthFrameInFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<Transform> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GetTransformForIthFrameInFrameSetRequest.fromPartial(
      {
        frameSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.frameSet, 'frameSet'),
        ),
        frameSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.frameSetIndex, 0, 'frameSetIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GetTransformForIthFrameInFrameSet',
    request,
    AnalysisOperationsProtocol.GetTransformForIthFrameInFrameSetRequest,
    AnalysisOperationsProtocol.GetTransformForIthFrameInFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'transformInWorking',
        getOperationValueSchema('transform'),
        'transformInWorking',
      ],
    ],
  );
  return mapped as Transform;
}

export async function groupToSurfaceFit(
  briosa: BriosaClient,
  input: GroupToSurfaceFitInput,
  options: BriosaCallOptions = {},
): Promise<GroupToSurfaceFitResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.GroupToSurfaceFitRequest.fromPartial({
      groupToFit: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupToFit, 'groupToFit'),
      ),
      surface: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.surface, 'surface'),
      ),
      doConventionalFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.doConventionalFit,
          false,
          'doConventionalFit',
        ),
      ),
      rmsTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.rmsTolerance00ForNone,
          0,
          'rmsTolerance00ForNone',
        ),
      ),
      maximumAbsoluteTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.maximumAbsoluteTolerance00ForNone,
          0,
          'maximumAbsoluteTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'GroupToSurfaceFit',
    request,
    AnalysisOperationsProtocol.GroupToSurfaceFitRequest,
    AnalysisOperationsProtocol.GroupToSurfaceFitResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'optimumTransform',
        getOperationValueSchema('worldTransform'),
        'optimumTransform',
      ],
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maximumAbsoluteDeviation',
        operationScalarSchemas.number,
        'maximumAbsoluteDeviation',
      ],
    ],
  );
  return mapped as GroupToSurfaceFitResult;
}

export async function importGeometryFitProfiles(
  briosa: BriosaClient,
  input: ImportGeometryFitProfilesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.ImportGeometryFitProfilesRequest.fromPartial({
      geometryFitProfilesFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(
          input.geometryFitProfilesFilePath,
          'geometryFitProfilesFilePath',
        ),
      ),
      overwriteProfilesWithSameName: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.overwriteProfilesWithSameName,
          false,
          'overwriteProfilesWithSameName',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ImportGeometryFitProfiles',
    request,
    AnalysisOperationsProtocol.ImportGeometryFitProfilesRequest,
    AnalysisOperationsProtocol.ImportGeometryFitProfilesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function isObjectOfType(
  briosa: BriosaClient,
  input: IsObjectOfTypeInput,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = AnalysisOperationsProtocol.IsObjectOfTypeRequest.fromPartial({
    objectName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.objectName, 'objectName'),
    ),
    objectType: toWireOperationValue(
      getOperationValueSchema('objectType'),
      resolveOperationDefault(input.objectType, ObjectType.any, 'objectType'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'IsObjectOfType',
    request,
    AnalysisOperationsProtocol.IsObjectOfTypeRequest,
    AnalysisOperationsProtocol.IsObjectOfTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['resultant', operationScalarSchemas.boolean, 'resultant']],
  );
  return mapped as boolean;
}

export async function makeCircleFitProfile(
  briosa: BriosaClient,
  input: MakeCircleFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeCircleFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      measuredSideForPlanarOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForPlanarOffset'),
        resolveOperationDefault(
          input.measuredSideForPlanarOffset,
          MeasuredSideForPlanarOffset.abovePlane,
          'measuredSideForPlanarOffset',
        ),
      ),
      overridePlanarOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overridePlanarOffset10UseCurrent,
          -1,
          'overridePlanarOffset10UseCurrent',
        ),
      ),
      planarOffsetDirection: toWireOperationValue(
        getOperationValueSchema('normalDirection'),
        resolveOperationDefault(
          input.planarOffsetDirection,
          NormalDirection.probingDirection,
          'planarOffsetDirection',
        ),
      ),
      lockRadius10DoNotLock: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.lockRadius10DoNotLock,
          -1,
          'lockRadius10DoNotLock',
        ),
      ),
      circleComputationTechnique: toWireOperationValue(
        getOperationValueSchema('compTechnique'),
        resolveOperationDefault(
          input.circleComputationTechnique,
          CompTechnique.standard,
          'circleComputationTechnique',
        ),
      ),
      reverseNormalVectorAfterFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reverseNormalVectorAfterFit,
          false,
          'reverseNormalVectorAfterFit',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Center: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Center,
          true,
          'cardinalPt1Center',
        ),
      ),
      cardinalPt2PointOnNormal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointOnNormal,
          true,
          'cardinalPt2PointOnNormal',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeCircleFitProfile',
    request,
    AnalysisOperationsProtocol.MakeCircleFitProfileRequest,
    AnalysisOperationsProtocol.MakeCircleFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeConeFitProfile(
  briosa: BriosaClient,
  input: MakeConeFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeConeFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      lockAngleInDegrees10DoNotLock: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.lockAngleInDegrees10DoNotLock,
          -1,
          'lockAngleInDegrees10DoNotLock',
        ),
      ),
      useExhaustiveSearch: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.useExhaustiveSearch,
          true,
          'useExhaustiveSearch',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Vertex: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Vertex,
          true,
          'cardinalPt1Vertex',
        ),
      ),
      cardinalPt2PointOnAxis: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointOnAxis,
          true,
          'cardinalPt2PointOnAxis',
        ),
      ),
      cardinalPt3CutPointOnAxis: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt3CutPointOnAxis,
          true,
          'cardinalPt3CutPointOnAxis',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeConeFitProfile',
    request,
    AnalysisOperationsProtocol.MakeConeFitProfileRequest,
    AnalysisOperationsProtocol.MakeConeFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeCylinderFitProfile(
  briosa: BriosaClient,
  input: MakeCylinderFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeCylinderFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      lockRadius10DoNotLock: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.lockRadius10DoNotLock,
          -1,
          'lockRadius10DoNotLock',
        ),
      ),
      lockedRadiusFitMethod: toWireOperationValue(
        getOperationValueSchema('fitMethod'),
        resolveOperationDefault(
          input.lockedRadiusFitMethod,
          FitMethod.minimumRms,
          'lockedRadiusFitMethod',
        ),
      ),
      constrainToNominalAxis: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.constrainToNominalAxis,
          false,
          'constrainToNominalAxis',
        ),
      ),
      constrainToNominalOrientation: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.constrainToNominalOrientation,
          false,
          'constrainToNominalOrientation',
        ),
      ),
      alignWithNominal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.alignWithNominal,
          false,
          'alignWithNominal',
        ),
      ),
      reverseAxis: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.reverseAxis, false, 'reverseAxis'),
      ),
      setAxisFirstToLastPoint: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.setAxisFirstToLastPoint,
          false,
          'setAxisFirstToLastPoint',
        ),
      ),
      cylinderComputationTechnique: toWireOperationValue(
        getOperationValueSchema('compTechnique'),
        resolveOperationDefault(
          input.cylinderComputationTechnique,
          CompTechnique.standard,
          'cylinderComputationTechnique',
        ),
      ),
      useExhaustiveSearch: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.useExhaustiveSearch,
          false,
          'useExhaustiveSearch',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1BeginPt: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1BeginPt,
          true,
          'cardinalPt1BeginPt',
        ),
      ),
      cardinalPt2EndPt: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2EndPt,
          true,
          'cardinalPt2EndPt',
        ),
      ),
      cardinalPt3Center: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt3Center,
          true,
          'cardinalPt3Center',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeCylinderFitProfile',
    request,
    AnalysisOperationsProtocol.MakeCylinderFitProfileRequest,
    AnalysisOperationsProtocol.MakeCylinderFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeEllipseFitProfile(
  briosa: BriosaClient,
  input: MakeEllipseFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeEllipseFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      measuredSideForPlanarOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForPlanarOffset'),
        resolveOperationDefault(
          input.measuredSideForPlanarOffset,
          MeasuredSideForPlanarOffset.abovePlane,
          'measuredSideForPlanarOffset',
        ),
      ),
      overridePlanarOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overridePlanarOffset10UseCurrent,
          -1,
          'overridePlanarOffset10UseCurrent',
        ),
      ),
      planarOffsetDirection: toWireOperationValue(
        getOperationValueSchema('normalDirection'),
        resolveOperationDefault(
          input.planarOffsetDirection,
          NormalDirection.probingDirection,
          'planarOffsetDirection',
        ),
      ),
      reverseNormalVectorAfterFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reverseNormalVectorAfterFit,
          false,
          'reverseNormalVectorAfterFit',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Center: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Center,
          true,
          'cardinalPt1Center',
        ),
      ),
      cardinalPt2PointOnNormal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointOnNormal,
          true,
          'cardinalPt2PointOnNormal',
        ),
      ),
      cardinalPt3FocalPt1: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt3FocalPt1,
          true,
          'cardinalPt3FocalPt1',
        ),
      ),
      cardinalPt4FocalPt2: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt4FocalPt2,
          true,
          'cardinalPt4FocalPt2',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeEllipseFitProfile',
    request,
    AnalysisOperationsProtocol.MakeEllipseFitProfileRequest,
    AnalysisOperationsProtocol.MakeEllipseFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeLineFitProfile(
  briosa: BriosaClient,
  input: MakeLineFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeLineFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      reverseNormalVectorAfterFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reverseNormalVectorAfterFit,
          false,
          'reverseNormalVectorAfterFit',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1PointA: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1PointA,
          true,
          'cardinalPt1PointA',
        ),
      ),
      cardinalPt2PointB: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointB,
          true,
          'cardinalPt2PointB',
        ),
      ),
      cardinalPt3MidPoint: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt3MidPoint,
          true,
          'cardinalPt3MidPoint',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeLineFitProfile',
    request,
    AnalysisOperationsProtocol.MakeLineFitProfileRequest,
    AnalysisOperationsProtocol.MakeLineFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeParaboloidFitProfile(
  briosa: BriosaClient,
  input: MakeParaboloidFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeParaboloidFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      lockFocalLength10DoNotLock: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.lockFocalLength10DoNotLock,
          -1,
          'lockFocalLength10DoNotLock',
        ),
      ),
      degreeOfFreedom: toWireOperationValue(
        getOperationValueSchema('degreeOfFreedom'),
        resolveOperationDefault(
          input.degreeOfFreedom,
          DegreeOfFreedom.any,
          'degreeOfFreedom',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Vertex: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Vertex,
          true,
          'cardinalPt1Vertex',
        ),
      ),
      cardinalPt2FocalPoint: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2FocalPoint,
          true,
          'cardinalPt2FocalPoint',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeParaboloidFitProfile',
    request,
    AnalysisOperationsProtocol.MakeParaboloidFitProfileRequest,
    AnalysisOperationsProtocol.MakeParaboloidFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makePlaneFitProfile(
  briosa: BriosaClient,
  input: MakePlaneFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakePlaneFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForPlanarOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForPlanarOffset'),
        resolveOperationDefault(
          input.measuredSideForPlanarOffset,
          MeasuredSideForPlanarOffset.abovePlane,
          'measuredSideForPlanarOffset',
        ),
      ),
      overridePlanarOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overridePlanarOffset10UseCurrent,
          -1,
          'overridePlanarOffset10UseCurrent',
        ),
      ),
      planarOffsetDirection: toWireOperationValue(
        getOperationValueSchema('normalDirection'),
        resolveOperationDefault(
          input.planarOffsetDirection,
          NormalDirection.probingDirection,
          'planarOffsetDirection',
        ),
      ),
      reverseNormalVectorAfterFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reverseNormalVectorAfterFit,
          false,
          'reverseNormalVectorAfterFit',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Centroid: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Centroid,
          true,
          'cardinalPt1Centroid',
        ),
      ),
      cardinalPt2PointOnNormal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointOnNormal,
          true,
          'cardinalPt2PointOnNormal',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakePlaneFitProfile',
    request,
    AnalysisOperationsProtocol.MakePlaneFitProfileRequest,
    AnalysisOperationsProtocol.MakePlaneFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeSlotFitProfile(
  briosa: BriosaClient,
  input: MakeSlotFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeSlotFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      measuredSideForPlanarOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForPlanarOffset'),
        resolveOperationDefault(
          input.measuredSideForPlanarOffset,
          MeasuredSideForPlanarOffset.abovePlane,
          'measuredSideForPlanarOffset',
        ),
      ),
      overridePlanarOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overridePlanarOffset10UseCurrent,
          -1,
          'overridePlanarOffset10UseCurrent',
        ),
      ),
      planarOffsetDirection: toWireOperationValue(
        getOperationValueSchema('normalDirection'),
        resolveOperationDefault(
          input.planarOffsetDirection,
          NormalDirection.probingDirection,
          'planarOffsetDirection',
        ),
      ),
      slotType: toWireOperationValue(
        getOperationValueSchema('slotType'),
        resolveOperationDefault(input.slotType, SlotType.round, 'slotType'),
      ),
      slotComputationTechnique: toWireOperationValue(
        getOperationValueSchema('compTechnique'),
        resolveOperationDefault(
          input.slotComputationTechnique,
          CompTechnique.standard,
          'slotComputationTechnique',
        ),
      ),
      reverseNormalVectorAfterFit: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.reverseNormalVectorAfterFit,
          false,
          'reverseNormalVectorAfterFit',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Center: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Center,
          true,
          'cardinalPt1Center',
        ),
      ),
      cardinalPt2PointOnNormal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt2PointOnNormal,
          true,
          'cardinalPt2PointOnNormal',
        ),
      ),
      cardinalPt3CenterlinePt1: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt3CenterlinePt1,
          true,
          'cardinalPt3CenterlinePt1',
        ),
      ),
      cardinalPt4CenterlinePt2: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt4CenterlinePt2,
          true,
          'cardinalPt4CenterlinePt2',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeSlotFitProfile',
    request,
    AnalysisOperationsProtocol.MakeSlotFitProfileRequest,
    AnalysisOperationsProtocol.MakeSlotFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeSphereFitProfile(
  briosa: BriosaClient,
  input: MakeSphereFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MakeSphereFitProfileRequest.fromPartial({
      fitProfileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
      ),
      measuredSideForRadialOffset: toWireOperationValue(
        getOperationValueSchema('measuredSideForRadialOffset'),
        resolveOperationDefault(
          input.measuredSideForRadialOffset,
          MeasuredSideForRadialOffset.outside,
          'measuredSideForRadialOffset',
        ),
      ),
      overrideRadialOffset10UseCurrent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.overrideRadialOffset10UseCurrent,
          -1,
          'overrideRadialOffset10UseCurrent',
        ),
      ),
      lockRadius10DoNotLock: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.lockRadius10DoNotLock,
          -1,
          'lockRadius10DoNotLock',
        ),
      ),
      makeCardinalPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.makeCardinalPoints,
          true,
          'makeCardinalPoints',
        ),
      ),
      cardinalPt1Center: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.cardinalPt1Center,
          true,
          'cardinalPt1Center',
        ),
      ),
      computationMethod: toWireOperationValue(
        getOperationValueSchema('sphereFitComputationMode'),
        resolveOperationDefault(
          input.computationMethod,
          SphereFitComputationMode.standard,
          'computationMethod',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MakeSphereFitProfile',
    request,
    AnalysisOperationsProtocol.MakeSphereFitProfileRequest,
    AnalysisOperationsProtocol.MakeSphereFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function mushroomTargetHoleInspection(
  briosa: BriosaClient,
  input: MushroomTargetHoleInspectionInput,
  options: BriosaCallOptions = {},
): Promise<MushroomTargetHoleInspectionResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.MushroomTargetHoleInspectionRequest.fromPartial({
      namePrefixForIntermediateConstructions: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.namePrefixForIntermediateConstructions,
          '',
          'namePrefixForIntermediateConstructions',
        ),
      ),
      spherePointsGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.spherePointsGroupName,
          'spherePointsGroupName',
        ),
      ),
      sphereTargetRadius: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.sphereTargetRadius,
          0,
          'sphereTargetRadius',
        ),
      ),
      targetContactPlane: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.targetContactPlane, 'targetContactPlane'),
      ),
      pointToCreateAtHole: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointToCreateAtHole, 'pointToCreateAtHole'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'MushroomTargetHoleInspection',
    request,
    AnalysisOperationsProtocol.MushroomTargetHoleInspectionRequest,
    AnalysisOperationsProtocol.MushroomTargetHoleInspectionResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['sphereFitRmsError', operationScalarSchemas.number, 'sphereFitRmsError'],
      ['sphereFitMaxError', operationScalarSchemas.number, 'sphereFitMaxError'],
    ],
  );
  return mapped as MushroomTargetHoleInspectionResult;
}

export async function patchNormalShiftHolePin(
  briosa: BriosaClient,
  input: PatchNormalShiftHolePinInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.PatchNormalShiftHolePinRequest.fromPartial({
      planePointsGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.planePointsGroupName,
          'planePointsGroupName',
        ),
      ),
      perimeterPointsGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.perimeterPointsGroupName,
          'perimeterPointsGroupName',
        ),
      ),
      resultingPointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.resultingPointName, 'resultingPointName'),
      ),
      additionalMaterialThickness: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.additionalMaterialThickness,
          0,
          'additionalMaterialThickness',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'PatchNormalShiftHolePin',
    request,
    AnalysisOperationsProtocol.PatchNormalShiftHolePinRequest,
    AnalysisOperationsProtocol.PatchNormalShiftHolePinResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function patchNormalShiftPoint(
  briosa: BriosaClient,
  input: PatchNormalShiftPointInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.PatchNormalShiftPointRequest.fromPartial({
      planePointsGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.planePointsGroupName,
          'planePointsGroupName',
        ),
      ),
      pointToShift: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointToShift, 'pointToShift'),
      ),
      resultingPointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.resultingPointName, 'resultingPointName'),
      ),
      additionalMaterialThickness: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.additionalMaterialThickness,
          0,
          'additionalMaterialThickness',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'PatchNormalShiftPoint',
    request,
    AnalysisOperationsProtocol.PatchNormalShiftPointRequest,
    AnalysisOperationsProtocol.PatchNormalShiftPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function queryCloudsToObjects(
  briosa: BriosaClient,
  input: QueryCloudsToObjectsInput,
  options: BriosaCallOptions = {},
): Promise<QueryCloudsToObjectsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryCloudsToObjectsRequest.fromPartial({
      cloudNames: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.cloudNames, 'cloudNames'),
      ),
      objectNames: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectNames, 'objectNames'),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      projectionOptions: toWireOperationValue(
        getOperationValueSchema('projectionOptions'),
        resolveOperationDefault(
          input.projectionOptions,
          ProjectionOptions.default,
          'projectionOptions',
        ),
      ),
      proximity: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.proximity, 0, 'proximity'),
      ),
      skipFactor: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.skipFactor, 0, 'skipFactor'),
      ),
      rmsTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.rmsTolerance00ForNone,
          0,
          'rmsTolerance00ForNone',
        ),
      ),
      maximumAbsoluteTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.maximumAbsoluteTolerance00ForNone,
          0,
          'maximumAbsoluteTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryCloudsToObjects',
    request,
    AnalysisOperationsProtocol.QueryCloudsToObjectsRequest,
    AnalysisOperationsProtocol.QueryCloudsToObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maximumAbsoluteDeviation',
        operationScalarSchemas.number,
        'maximumAbsoluteDeviation',
      ],
    ],
  );
  return mapped as QueryCloudsToObjectsResult;
}

export async function queryCloudsToSurface(
  briosa: BriosaClient,
  input: QueryCloudsToSurfaceInput,
  options: BriosaCallOptions = {},
): Promise<QueryCloudsToSurfaceResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryCloudsToSurfaceRequest.fromPartial({
      cloudNames: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.cloudNames, 'cloudNames'),
      ),
      filterSurfaceName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.filterSurfaceName, 'filterSurfaceName'),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      projectionOptions: toWireOperationValue(
        getOperationValueSchema('projectionOptions'),
        resolveOperationDefault(
          input.projectionOptions,
          ProjectionOptions.default,
          'projectionOptions',
        ),
      ),
      proximity: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.proximity, 0, 'proximity'),
      ),
      skipFactor: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.skipFactor, 0, 'skipFactor'),
      ),
      rmsTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.rmsTolerance00ForNone,
          0,
          'rmsTolerance00ForNone',
        ),
      ),
      maximumAbsoluteTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.maximumAbsoluteTolerance00ForNone,
          0,
          'maximumAbsoluteTolerance00ForNone',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryCloudsToSurface',
    request,
    AnalysisOperationsProtocol.QueryCloudsToSurfaceRequest,
    AnalysisOperationsProtocol.QueryCloudsToSurfaceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maximumAbsoluteDeviation',
        operationScalarSchemas.number,
        'maximumAbsoluteDeviation',
      ],
    ],
  );
  return mapped as QueryCloudsToSurfaceResult;
}

export async function queryFrameToFrame(
  briosa: BriosaClient,
  input: QueryFrameToFrameInput,
  options: BriosaCallOptions = {},
): Promise<QueryFrameToFrameResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryFrameToFrameRequest.fromPartial({
      referenceFrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.referenceFrameName, 'referenceFrameName'),
      ),
      correspondingFrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.correspondingFrameName,
          'correspondingFrameName',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryFrameToFrame',
    request,
    AnalysisOperationsProtocol.QueryFrameToFrameRequest,
    AnalysisOperationsProtocol.QueryFrameToFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['x', operationScalarSchemas.number, 'x'],
      ['y', operationScalarSchemas.number, 'y'],
      ['z', operationScalarSchemas.number, 'z'],
      ['rxRoll', operationScalarSchemas.number, 'rxRoll'],
      ['ryPitch', operationScalarSchemas.number, 'ryPitch'],
      ['rzYaw', operationScalarSchemas.number, 'rzYaw'],
    ],
  );
  return mapped as QueryFrameToFrameResult;
}

export async function queryGroupsToObjects(
  briosa: BriosaClient,
  input: QueryGroupsToObjectsInput,
  options: BriosaCallOptions = {},
): Promise<QueryGroupsToObjectsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryGroupsToObjectsRequest.fromPartial({
      groupNameListGroupsToProject: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(
          input.groupNameListGroupsToProject,
          'groupNameListGroupsToProject',
        ),
      ),
      objectNameListObjectsToProjectTo: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(
          input.objectNameListObjectsToProjectTo,
          'objectNameListObjectsToProjectTo',
        ),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      projectionOptions: toWireOperationValue(
        getOperationValueSchema('projectionOptions'),
        resolveOperationDefault(
          input.projectionOptions,
          ProjectionOptions.default,
          'projectionOptions',
        ),
      ),
      rmsTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.rmsTolerance00ForNone,
          0,
          'rmsTolerance00ForNone',
        ),
      ),
      maximumAbsoluteTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.maximumAbsoluteTolerance00ForNone,
          0,
          'maximumAbsoluteTolerance00ForNone',
        ),
      ),
      showResultsDialog: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showResultsDialog,
          false,
          'showResultsDialog',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryGroupsToObjects',
    request,
    AnalysisOperationsProtocol.QueryGroupsToObjectsRequest,
    AnalysisOperationsProtocol.QueryGroupsToObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maxAbsoluteDeviation',
        operationScalarSchemas.number,
        'maxAbsoluteDeviation',
      ],
      ['averageDeviation', operationScalarSchemas.number, 'averageDeviation'],
      ['standardDeviation', operationScalarSchemas.number, 'standardDeviation'],
    ],
  );
  return mapped as QueryGroupsToObjectsResult;
}

export async function queryPointToObjects(
  briosa: BriosaClient,
  input: QueryPointToObjectsInput,
  options: BriosaCallOptions = {},
): Promise<QueryPointToObjectsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryPointToObjectsRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
      objects: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objects, 'objects'),
      ),
      ignoreTargetOffset: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.ignoreTargetOffset,
          false,
          'ignoreTargetOffset',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryPointToObjects',
    request,
    AnalysisOperationsProtocol.QueryPointToObjectsRequest,
    AnalysisOperationsProtocol.QueryPointToObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['dX', operationScalarSchemas.number, 'dX'],
      ['dY', operationScalarSchemas.number, 'dY'],
      ['dZ', operationScalarSchemas.number, 'dZ'],
      ['dMag', operationScalarSchemas.number, 'dMag'],
      [
        'resultantObject',
        getOperationValueSchema('collectionObjectName'),
        'resultantObject',
      ],
    ],
  );
  return mapped as QueryPointToObjectsResult;
}

export async function queryPointToPointAlongCurve(
  briosa: BriosaClient,
  input: QueryPointToPointAlongCurveInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryPointToPointAlongCurveRequest.fromPartial({
      value1stPoint: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.value1stPoint, 'value1stPoint'),
      ),
      value2ndPoint: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.value2ndPoint, 'value2ndPoint'),
      ),
      curve: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.curve, 'curve'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryPointToPointAlongCurve',
    request,
    AnalysisOperationsProtocol.QueryPointToPointAlongCurveRequest,
    AnalysisOperationsProtocol.QueryPointToPointAlongCurveResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'distanceAlongCurve',
        operationScalarSchemas.number,
        'distanceAlongCurve',
      ],
    ],
  );
  return mapped as number;
}

export async function queryPointsToCircle(
  briosa: BriosaClient,
  input: QueryPointsToCircleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryPointsToCircleRequest.fromPartial({
      circleName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.circleName, 'circleName'),
      ),
      pointGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pointGroupName, 'pointGroupName'),
      ),
      isInsideMeasurement: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.isInsideMeasurement,
          true,
          'isInsideMeasurement',
        ),
      ),
      autoScaleVectorsToOfRadius: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.autoScaleVectorsToOfRadius,
          40,
          'autoScaleVectorsToOfRadius',
        ),
      ),
      vectorGroupNameForRadial: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.vectorGroupNameForRadial,
          'vectorGroupNameForRadial',
        ),
      ),
      vectorGroupNameForPlanar: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.vectorGroupNameForPlanar,
          'vectorGroupNameForPlanar',
        ),
      ),
      vectorGroupNameForCombined: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.vectorGroupNameForCombined,
          'vectorGroupNameForCombined',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryPointsToCircle',
    request,
    AnalysisOperationsProtocol.QueryPointsToCircleRequest,
    AnalysisOperationsProtocol.QueryPointsToCircleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function queryPointsToObjects(
  briosa: BriosaClient,
  input: QueryPointsToObjectsInput,
  options: BriosaCallOptions = {},
): Promise<QueryPointsToObjectsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryPointsToObjectsRequest.fromPartial({
      pointNames: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.pointNames, 'pointNames'),
      ),
      objectNameListObjectsToProjectTo: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(
          input.objectNameListObjectsToProjectTo,
          'objectNameListObjectsToProjectTo',
        ),
      ),
      resultingObjectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.resultingObjectName, 'resultingObjectName'),
      ),
      projectionOptions: toWireOperationValue(
        getOperationValueSchema('projectionOptions'),
        resolveOperationDefault(
          input.projectionOptions,
          ProjectionOptions.default,
          'projectionOptions',
        ),
      ),
      rmsTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.rmsTolerance00ForNone,
          0,
          'rmsTolerance00ForNone',
        ),
      ),
      maximumAbsoluteTolerance00ForNone: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.maximumAbsoluteTolerance00ForNone,
          0,
          'maximumAbsoluteTolerance00ForNone',
        ),
      ),
      showResultsDialog: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showResultsDialog,
          false,
          'showResultsDialog',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryPointsToObjects',
    request,
    AnalysisOperationsProtocol.QueryPointsToObjectsRequest,
    AnalysisOperationsProtocol.QueryPointsToObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rmsDeviation', operationScalarSchemas.number, 'rmsDeviation'],
      [
        'maxAbsoluteDeviation',
        operationScalarSchemas.number,
        'maxAbsoluteDeviation',
      ],
      ['averageDeviation', operationScalarSchemas.number, 'averageDeviation'],
      ['standardDeviation', operationScalarSchemas.number, 'standardDeviation'],
    ],
  );
  return mapped as QueryPointsToObjectsResult;
}

export async function queryPointsToSinglePoint(
  briosa: BriosaClient,
  input: QueryPointsToSinglePointInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.QueryPointsToSinglePointRequest.fromPartial({
      pointNames: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.pointNames, 'pointNames'),
      ),
      singlePoint: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.singlePoint, 'singlePoint'),
      ),
      showVectorProperties: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showVectorProperties,
          false,
          'showVectorProperties',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'QueryPointsToSinglePoint',
    request,
    AnalysisOperationsProtocol.QueryPointsToSinglePointRequest,
    AnalysisOperationsProtocol.QueryPointsToSinglePointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function reComputeCalculatedItems(
  briosa: BriosaClient,
  input: ReComputeCalculatedItemsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.ReComputeCalculatedItemsRequest.fromPartial({
      targetsFromShots: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.targetsFromShots,
          false,
          'targetsFromShots',
        ),
      ),
      hiddenPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.hiddenPoints, false, 'hiddenPoints'),
      ),
      relationships: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.relationships, false, 'relationships'),
      ),
      refreshFilteredCloudData: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.refreshFilteredCloudData,
          false,
          'refreshFilteredCloudData',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ReComputeCalculatedItems',
    request,
    AnalysisOperationsProtocol.ReComputeCalculatedItemsRequest,
    AnalysisOperationsProtocol.ReComputeCalculatedItemsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function renamePointsBasedOnInterPointDistanceToReferencePoints(
  briosa: BriosaClient,
  input: RenamePointsBasedOnInterPointDistanceToReferencePointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.RenamePointsBasedOnInterPointDistanceToReferencePointsRequest.fromPartial(
      {
        referenceGroupName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.referenceGroupName, 'referenceGroupName'),
        ),
        groupToRenamePoints: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.groupToRenamePoints,
            'groupToRenamePoints',
          ),
        ),
        distanceThreshold: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.distanceThreshold,
            0,
            'distanceThreshold',
          ),
        ),
        verifyResults: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.verifyResults, false, 'verifyResults'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'RenamePointsBasedOnInterPointDistanceToReferencePoints',
    request,
    AnalysisOperationsProtocol.RenamePointsBasedOnInterPointDistanceToReferencePointsRequest,
    AnalysisOperationsProtocol.RenamePointsBasedOnInterPointDistanceToReferencePointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function renamePointsBasedOnProximityToReferencePoints(
  briosa: BriosaClient,
  input: RenamePointsBasedOnProximityToReferencePointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.RenamePointsBasedOnProximityToReferencePointsRequest.fromPartial(
      {
        referenceGroupName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.referenceGroupName, 'referenceGroupName'),
        ),
        groupToRenamePoints: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.groupToRenamePoints,
            'groupToRenamePoints',
          ),
        ),
        proximityThreshold: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.proximityThreshold,
            0,
            'proximityThreshold',
          ),
        ),
        verifyResults: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.verifyResults, false, 'verifyResults'),
        ),
        renameAllProximatePoints: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.renameAllProximatePoints,
            false,
            'renameAllProximatePoints',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'RenamePointsBasedOnProximityToReferencePoints',
    request,
    AnalysisOperationsProtocol.RenamePointsBasedOnProximityToReferencePointsRequest,
    AnalysisOperationsProtocol.RenamePointsBasedOnProximityToReferencePointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function reverseBSplines(
  briosa: BriosaClient,
  input: ReverseBSplinesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = AnalysisOperationsProtocol.ReverseBSplinesRequest.fromPartial(
    {
      bSplineList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.bSplineList, 'bSplineList'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ReverseBSplines',
    request,
    AnalysisOperationsProtocol.ReverseBSplinesRequest,
    AnalysisOperationsProtocol.ReverseBSplinesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function reversePlaneNormals(
  briosa: BriosaClient,
  input: ReversePlaneNormalsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.ReversePlaneNormalsRequest.fromPartial({
      planeList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.planeList, 'planeList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ReversePlaneNormals',
    request,
    AnalysisOperationsProtocol.ReversePlaneNormalsRequest,
    AnalysisOperationsProtocol.ReversePlaneNormalsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function reverseSurfaceNormals(
  briosa: BriosaClient,
  input: ReverseSurfaceNormalsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.ReverseSurfaceNormalsRequest.fromPartial({
      surfaceList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.surfaceList, 'surfaceList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'ReverseSurfaceNormals',
    request,
    AnalysisOperationsProtocol.ReverseSurfaceNormalsRequest,
    AnalysisOperationsProtocol.ReverseSurfaceNormalsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCircleProperties(
  briosa: BriosaClient,
  input: SetCirclePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetCirclePropertiesRequest.fromPartial({
      circleName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.circleName, 'circleName'),
      ),
      centerCoordinate: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.centerCoordinate, 'centerCoordinate'),
      ),
      normalDirection: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.normalDirection, 'normalDirection'),
      ),
      radius: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.radius, 0, 'radius'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetCircleProperties',
    request,
    AnalysisOperationsProtocol.SetCirclePropertiesRequest,
    AnalysisOperationsProtocol.SetCirclePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setConeProperties(
  briosa: BriosaClient,
  input: SetConePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetConePropertiesRequest.fromPartial({
      coneName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.coneName, 'coneName'),
      ),
      coneEndPointInWorkingCoordinates: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(
          input.coneEndPointInWorkingCoordinates,
          'coneEndPointInWorkingCoordinates',
        ),
      ),
      coneAxisInWorkingCoordinates: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(
          input.coneAxisInWorkingCoordinates,
          'coneAxisInWorkingCoordinates',
        ),
      ),
      coneLength: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.coneLength, 0, 'coneLength'),
      ),
      coneThetaStart: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.coneThetaStart, 0, 'coneThetaStart'),
      ),
      coneThetaSpan: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.coneThetaSpan, 0, 'coneThetaSpan'),
      ),
      coneIncludedAngle: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.coneIncludedAngle,
          0,
          'coneIncludedAngle',
        ),
      ),
      cutLengthFromApex: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.cutLengthFromApex,
          0,
          'cutLengthFromApex',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetConeProperties',
    request,
    AnalysisOperationsProtocol.SetConePropertiesRequest,
    AnalysisOperationsProtocol.SetConePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCylinderProperties(
  briosa: BriosaClient,
  input: SetCylinderPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetCylinderPropertiesRequest.fromPartial({
      cylinderName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.cylinderName, 'cylinderName'),
      ),
      beginCoordinate: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.beginCoordinate, 'beginCoordinate'),
      ),
      axisDirection: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.axisDirection, 'axisDirection'),
      ),
      length: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.length, 0, 'length'),
      ),
      diameter: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.diameter, 0, 'diameter'),
      ),
      nominalsPointInward: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.nominalsPointInward,
          true,
          'nominalsPointInward',
        ),
      ),
      facets: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.facets, 32, 'facets'),
      ),
      enableThetaExtentDisplayMode: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.enableThetaExtentDisplayMode,
          true,
          'enableThetaExtentDisplayMode',
        ),
      ),
      thetaStartInDegrees: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.thetaStartInDegrees,
          0,
          'thetaStartInDegrees',
        ),
      ),
      thetaSpanInDegrees: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.thetaSpanInDegrees,
          360,
          'thetaSpanInDegrees',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetCylinderProperties',
    request,
    AnalysisOperationsProtocol.SetCylinderPropertiesRequest,
    AnalysisOperationsProtocol.SetCylinderPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setDefaultColorizationOptions(
  briosa: BriosaClient,
  input: SetDefaultColorizationOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetDefaultColorizationOptionsRequest.fromPartial(
      {
        colorizationOptions: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptions,
            ColorizationOptions.default,
            'colorizationOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetDefaultColorizationOptions',
    request,
    AnalysisOperationsProtocol.SetDefaultColorizationOptionsRequest,
    AnalysisOperationsProtocol.SetDefaultColorizationOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setEllipseProperties(
  briosa: BriosaClient,
  input: SetEllipsePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetEllipsePropertiesRequest.fromPartial({
      ellipseName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.ellipseName, 'ellipseName'),
      ),
      centerCoordinate: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.centerCoordinate, 'centerCoordinate'),
      ),
      normalDirection: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.normalDirection, 'normalDirection'),
      ),
      majorAxisRadius: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.majorAxisRadius, 0, 'majorAxisRadius'),
      ),
      minorAxisRadius: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.minorAxisRadius, 0, 'minorAxisRadius'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetEllipseProperties',
    request,
    AnalysisOperationsProtocol.SetEllipsePropertiesRequest,
    AnalysisOperationsProtocol.SetEllipsePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeometryRelationshipFitProfile(
  briosa: BriosaClient,
  input: SetGeometryRelationshipFitProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetGeometryRelationshipFitProfileRequest.fromPartial(
      {
        geometryType: toWireOperationValue(
          getOperationValueSchema('geometryType'),
          requireOperationInput(input.geometryType, 'geometryType'),
        ),
        relationshipRefList: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('collectionItemName')),
          requireOperationInput(
            input.relationshipRefList,
            'relationshipRefList',
          ),
        ),
        fitProfileName: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.fitProfileName, '', 'fitProfileName'),
        ),
        applyCardinalPointSettings: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.applyCardinalPointSettings,
            false,
            'applyCardinalPointSettings',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetGeometryRelationshipFitProfile',
    request,
    AnalysisOperationsProtocol.SetGeometryRelationshipFitProfileRequest,
    AnalysisOperationsProtocol.SetGeometryRelationshipFitProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setLineProperties(
  briosa: BriosaClient,
  input: SetLinePropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetLinePropertiesRequest.fromPartial({
      lineName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.lineName, 'lineName'),
      ),
      beginCoordinate: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.beginCoordinate, 'beginCoordinate'),
      ),
      endCoordinate: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.endCoordinate, 'endCoordinate'),
      ),
      lengthOptional: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.lengthOptional, 0, 'lengthOptional'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetLineProperties',
    request,
    AnalysisOperationsProtocol.SetLinePropertiesRequest,
    AnalysisOperationsProtocol.SetLinePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setMeasurementAuxiliaryData(
  briosa: BriosaClient,
  input: SetMeasurementAuxiliaryDataInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetMeasurementAuxiliaryDataRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
      auxiliaryName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.auxiliaryName, '', 'auxiliaryName'),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.value, 0, 'value'),
      ),
      units: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.units, '', 'units'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetMeasurementAuxiliaryData',
    request,
    AnalysisOperationsProtocol.SetMeasurementAuxiliaryDataRequest,
    AnalysisOperationsProtocol.SetMeasurementAuxiliaryDataResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setObjectReportingFrame(
  briosa: BriosaClient,
  input: SetObjectReportingFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetObjectReportingFrameRequest.fromPartial({
      objectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.objectName, 'objectName'),
      ),
      reportingFrame: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportingFrame, 'reportingFrame'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetObjectReportingFrame',
    request,
    AnalysisOperationsProtocol.SetObjectReportingFrameRequest,
    AnalysisOperationsProtocol.SetObjectReportingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointProperties(
  briosa: BriosaClient,
  input: SetPointPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetPointPropertiesRequest.fromPartial({
      pointNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.pointNameList, 'pointNameList'),
      ),
      planarOffset: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.planarOffset, 0, 'planarOffset'),
      ),
      radialOffset: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.radialOffset, 0, 'radialOffset'),
      ),
      positionTolerance: toWireOperationValue(
        getOperationValueSchema('toleranceVectorOptions'),
        requireOperationInput(input.positionTolerance, 'positionTolerance'),
      ),
      componentWeights: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.componentWeights, 'componentWeights'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetPointProperties',
    request,
    AnalysisOperationsProtocol.SetPointPropertiesRequest,
    AnalysisOperationsProtocol.SetPointPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointWeightsFromUncertainties(
  briosa: BriosaClient,
  input: SetPointWeightsFromUncertaintiesInput,
  options: BriosaCallOptions = {},
): Promise<readonly PointName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetPointWeightsFromUncertaintiesRequest.fromPartial(
      {
        pointNameList: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('pointName')),
          requireOperationInput(input.pointNameList, 'pointNameList'),
        ),
        uncertaintyReferenceFrameMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.uncertaintyReferenceFrameMode,
            'With respect to WORLD',
            'uncertaintyReferenceFrameMode',
          ),
        ),
        reportingFrame: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.reportingFrame, 'reportingFrame'),
        ),
        weightNormalizationMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.weightNormalizationMode,
            'Set to fixed value',
            'weightNormalizationMode',
          ),
        ),
        fixedWeightValue: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.fixedWeightValue,
            1,
            'fixedWeightValue',
          ),
        ),
        outputWeightedPointGroup: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.outputWeightedPointGroup,
            'outputWeightedPointGroup',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetPointWeightsFromUncertainties',
    request,
    AnalysisOperationsProtocol.SetPointWeightsFromUncertaintiesRequest,
    AnalysisOperationsProtocol.SetPointWeightsFromUncertaintiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'outputWeightedPointList',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'outputWeightedPointList',
      ],
    ],
  );
  return mapped as readonly PointName[];
}

export async function setTransformForIthFrameInFrameSet(
  briosa: BriosaClient,
  input: SetTransformForIthFrameInFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.SetTransformForIthFrameInFrameSetRequest.fromPartial(
      {
        frameSet: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.frameSet, 'frameSet'),
        ),
        frameSetIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.frameSetIndex, 0, 'frameSetIndex'),
        ),
        transformInWorking: toWireOperationValue(
          getOperationValueSchema('transform'),
          requireOperationInput(input.transformInWorking, 'transformInWorking'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SetTransformForIthFrameInFrameSet',
    request,
    AnalysisOperationsProtocol.SetTransformForIthFrameInFrameSetRequest,
    AnalysisOperationsProtocol.SetTransformForIthFrameInFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function sphereAxisCheck(
  briosa: BriosaClient,
  input: SphereAxisCheckInput,
  options: BriosaCallOptions = {},
): Promise<SphereAxisCheckResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = AnalysisOperationsProtocol.SphereAxisCheckRequest.fromPartial(
    {
      spherePointsGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.spherePointsGroupName,
          'spherePointsGroupName',
        ),
      ),
      sphereTargetRadius: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.sphereTargetRadius,
          0,
          'sphereTargetRadius',
        ),
      ),
      pointToCreateAtSphereCenter: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(
          input.pointToCreateAtSphereCenter,
          'pointToCreateAtSphereCenter',
        ),
      ),
      lineDefiningTheAxis: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.lineDefiningTheAxis, 'lineDefiningTheAxis'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'SphereAxisCheck',
    request,
    AnalysisOperationsProtocol.SphereAxisCheckRequest,
    AnalysisOperationsProtocol.SphereAxisCheckResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['sphereFitRmsError', operationScalarSchemas.number, 'sphereFitRmsError'],
      ['sphereFitMaxError', operationScalarSchemas.number, 'sphereFitMaxError'],
      [
        'vectorRepresentation',
        getOperationValueSchema('vector'),
        'vectorRepresentation',
      ],
      ['xValue', operationScalarSchemas.number, 'xValue'],
      ['yValue', operationScalarSchemas.number, 'yValue'],
      ['zValue', operationScalarSchemas.number, 'zValue'],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as SphereAxisCheckResult;
}

export async function temperatureCompensateAGroup(
  briosa: BriosaClient,
  input: TemperatureCompensateAGroupInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.TemperatureCompensateAGroupRequest.fromPartial({
      originalGroup: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.originalGroup, 'originalGroup'),
      ),
      scalingOriginCoordinateFrame: toWireOperationValue(
        getOperationValueSchema('frameName'),
        requireOperationInput(
          input.scalingOriginCoordinateFrame,
          'scalingOriginCoordinateFrame',
        ),
      ),
      materialCte1DegF: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.materialCte1DegF, 0, 'materialCte1DegF'),
      ),
      initialTemperatureF: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.initialTemperatureF,
          0,
          'initialTemperatureF',
        ),
      ),
      finalTemperatureF: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.finalTemperatureF,
          0,
          'finalTemperatureF',
        ),
      ),
      scaledGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.scaledGroupName, 'scaledGroupName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'TemperatureCompensateAGroup',
    request,
    AnalysisOperationsProtocol.TemperatureCompensateAGroupRequest,
    AnalysisOperationsProtocol.TemperatureCompensateAGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function transformObjectsFrameToFrame(
  briosa: BriosaClient,
  input: TransformObjectsFrameToFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.TransformObjectsFrameToFrameRequest.fromPartial({
      objectNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectNameList, 'objectNameList'),
      ),
      initialFrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.initialFrameName, 'initialFrameName'),
      ),
      destinationFrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.destinationFrameName,
          'destinationFrameName',
        ),
      ),
      numberOfSteps: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.numberOfSteps, 0, 'numberOfSteps'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'TransformObjectsFrameToFrame',
    request,
    AnalysisOperationsProtocol.TransformObjectsFrameToFrameRequest,
    AnalysisOperationsProtocol.TransformObjectsFrameToFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function transformObjectsByDeltaAboutWorkingFrame(
  briosa: BriosaClient,
  input: TransformObjectsByDeltaAboutWorkingFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.TransformObjectsByDeltaAboutWorkingFrameRequest.fromPartial(
      {
        objectsToTransform: toWireOperationValue(
          repeatedOperationValue(
            getOperationValueSchema('collectionObjectName'),
          ),
          requireOperationInput(input.objectsToTransform, 'objectsToTransform'),
        ),
        deltaTransform: toWireOperationValue(
          getOperationValueSchema('transform'),
          requireOperationInput(input.deltaTransform, 'deltaTransform'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'TransformObjectsByDeltaAboutWorkingFrame',
    request,
    AnalysisOperationsProtocol.TransformObjectsByDeltaAboutWorkingFrameRequest,
    AnalysisOperationsProtocol.TransformObjectsByDeltaAboutWorkingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function transformObjectsByDeltaWorldTransformOperator(
  briosa: BriosaClient,
  input: TransformObjectsByDeltaWorldTransformOperatorInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.TransformObjectsByDeltaWorldTransformOperatorRequest.fromPartial(
      {
        objectsToTransform: toWireOperationValue(
          repeatedOperationValue(
            getOperationValueSchema('collectionObjectName'),
          ),
          requireOperationInput(input.objectsToTransform, 'objectsToTransform'),
        ),
        deltaTransform: toWireOperationValue(
          getOperationValueSchema('worldTransform'),
          requireOperationInput(input.deltaTransform, 'deltaTransform'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'TransformObjectsByDeltaWorldTransformOperator',
    request,
    AnalysisOperationsProtocol.TransformObjectsByDeltaWorldTransformOperatorRequest,
    AnalysisOperationsProtocol.TransformObjectsByDeltaWorldTransformOperatorResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function translateObjectsByDelta(
  briosa: BriosaClient,
  input: TranslateObjectsByDeltaInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    AnalysisOperationsProtocol.TranslateObjectsByDeltaRequest.fromPartial({
      objectsToTranslate: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectsToTranslate, 'objectsToTranslate'),
      ),
      deltaTranslation: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.deltaTranslation, 'deltaTranslation'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'AnalysisOperations',
    'TranslateObjectsByDelta',
    request,
    AnalysisOperationsProtocol.TranslateObjectsByDeltaRequest,
    AnalysisOperationsProtocol.TranslateObjectsByDeltaResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteDimension(
  briosa: BriosaClient,
  input: DeleteDimensionInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    DimensionOperationsProtocol.DeleteDimensionRequest.fromPartial({
      dimensionName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.dimensionName, 'dimensionName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'DimensionOperations',
    'DeleteDimension',
    request,
    DimensionOperationsProtocol.DeleteDimensionRequest,
    DimensionOperationsProtocol.DeleteDimensionResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getDimensionValue(
  briosa: BriosaClient,
  input: GetDimensionValueInput,
  options: BriosaCallOptions = {},
): Promise<GetDimensionValueResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    DimensionOperationsProtocol.GetDimensionValueRequest.fromPartial({
      dimensionName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.dimensionName, 'dimensionName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'DimensionOperations',
    'GetDimensionValue',
    request,
    DimensionOperationsProtocol.GetDimensionValueRequest,
    DimensionOperationsProtocol.GetDimensionValueResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['dimensionsValue', operationScalarSchemas.number, 'dimensionsValue'],
      [
        'nominalValueEnabled',
        operationScalarSchemas.boolean,
        'nominalValueEnabled',
      ],
      [
        'highToleranceEnabled',
        operationScalarSchemas.boolean,
        'highToleranceEnabled',
      ],
      [
        'lowToleranceEnabled',
        operationScalarSchemas.boolean,
        'lowToleranceEnabled',
      ],
      ['nominalValue', operationScalarSchemas.number, 'nominalValue'],
      ['highTolerance', operationScalarSchemas.number, 'highTolerance'],
      ['lowTolerance', operationScalarSchemas.number, 'lowTolerance'],
    ],
  );
  return mapped as GetDimensionValueResult;
}

export async function setDimensionTolerance(
  briosa: BriosaClient,
  input: SetDimensionToleranceInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    DimensionOperationsProtocol.SetDimensionToleranceRequest.fromPartial({
      dimensionName: toWireOperationValue(
        getOperationValueSchema('collectionItemName'),
        requireOperationInput(input.dimensionName, 'dimensionName'),
      ),
      enableNominal: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.enableNominal, false, 'enableNominal'),
      ),
      enableHigh: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.enableHigh, false, 'enableHigh'),
      ),
      enableLow: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.enableLow, false, 'enableLow'),
      ),
      nominal: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.nominal, 0, 'nominal'),
      ),
      highTolerance: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.highTolerance, 0, 'highTolerance'),
      ),
      lowTolerance: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.lowTolerance, 0, 'lowTolerance'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'DimensionOperations',
    'SetDimensionTolerance',
    request,
    DimensionOperationsProtocol.SetDimensionToleranceRequest,
    DimensionOperationsProtocol.SetDimensionToleranceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteEvent(
  briosa: BriosaClient,
  input: DeleteEventInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = EventOperationsProtocol.DeleteEventRequest.fromPartial({
    eventName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.eventName, 'eventName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'EventOperations',
    'DeleteEvent',
    request,
    EventOperationsProtocol.DeleteEventRequest,
    EventOperationsProtocol.DeleteEventResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportEventRefList(
  briosa: BriosaClient,
  input: ExportEventRefListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = EventOperationsProtocol.ExportEventRefListRequest.fromPartial(
    {
      eventList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.eventList, 'eventList'),
      ),
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 6, 'decimalPrecision'),
      ),
      overwriteExistingFile: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.overwriteExistingFile,
          false,
          'overwriteExistingFile',
        ),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'EventOperations',
    'ExportEventRefList',
    request,
    EventOperationsProtocol.ExportEventRefListRequest,
    EventOperationsProtocol.ExportEventRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getIthEventFromEventRefList(
  briosa: BriosaClient,
  input: GetIthEventFromEventRefListInput,
  options: BriosaCallOptions = {},
): Promise<CollectionItemName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    EventOperationsProtocol.GetIthEventFromEventRefListRequest.fromPartial({
      eventList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.eventList, 'eventList'),
      ),
      eventIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.eventIndex, 0, 'eventIndex'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'EventOperations',
    'GetIthEventFromEventRefList',
    request,
    EventOperationsProtocol.GetIthEventFromEventRefListRequest,
    EventOperationsProtocol.GetIthEventFromEventRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'resultantItem',
        getOperationValueSchema('collectionItemName'),
        'resultantItem',
      ],
    ],
  );
  return mapped as CollectionItemName;
}

export async function getNumberOfEventsInEventRefList(
  briosa: BriosaClient,
  input: GetNumberOfEventsInEventRefListInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    EventOperationsProtocol.GetNumberOfEventsInEventRefListRequest.fromPartial({
      eventList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.eventList, 'eventList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'EventOperations',
    'GetNumberOfEventsInEventRefList',
    request,
    EventOperationsProtocol.GetNumberOfEventsInEventRefListRequest,
    EventOperationsProtocol.GetNumberOfEventsInEventRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function renameEvent(
  briosa: BriosaClient,
  input: RenameEventInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = EventOperationsProtocol.RenameEventRequest.fromPartial({
    originalEventName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.originalEventName, 'originalEventName'),
    ),
    newEventName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.newEventName, 'newEventName'),
    ),
    overwriteIfExists: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.overwriteIfExists,
        false,
        'overwriteIfExists',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'EventOperations',
    'RenameEvent',
    request,
    EventOperationsProtocol.RenameEventRequest,
    EventOperationsProtocol.RenameEventResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function backupNow(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = FileOperationsProtocol.BackupNowRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'BackupNow',
    request,
    FileOperationsProtocol.BackupNowRequest,
    FileOperationsProtocol.BackupNowResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function copyGeneralFile(
  briosa: BriosaClient,
  input: CopyGeneralFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.CopyGeneralFileRequest.fromPartial({
    sourceFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.sourceFileName, 'sourceFileName'),
    ),
    destinationFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.destinationFileName, 'destinationFileName'),
    ),
    overwrite: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.overwrite, false, 'overwrite'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'CopyGeneralFile',
    request,
    FileOperationsProtocol.CopyGeneralFileRequest,
    FileOperationsProtocol.CopyGeneralFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteGeneralFile(
  briosa: BriosaClient,
  input: DeleteGeneralFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.DeleteGeneralFileRequest.fromPartial({
    fileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.fileName, 'fileName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'DeleteGeneralFile',
    request,
    FileOperationsProtocol.DeleteGeneralFileRequest,
    FileOperationsProtocol.DeleteGeneralFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function directCadAccess(
  briosa: BriosaClient,
  input: DirectCadAccessInput,
  options: BriosaCallOptions = {},
): Promise<DirectCadAccessResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.DirectCadAccessRequest.fromPartial({
    cadFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.cadFileName, 'cadFileName'),
    ),
    importSolids: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importSolids, true, 'importSolids'),
    ),
    importSurfaces: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importSurfaces, true, 'importSurfaces'),
    ),
    importPolygonizedSurfaces: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importPolygonizedSurfaces,
        true,
        'importPolygonizedSurfaces',
      ),
    ),
    importAnnotations: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importAnnotations,
        true,
        'importAnnotations',
      ),
    ),
    importVectors: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importVectors, true, 'importVectors'),
    ),
    importPoints: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importPoints, true, 'importPoints'),
    ),
    pointGroupName: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.pointGroupName,
        'CAD pts',
        'pointGroupName',
      ),
    ),
    importAttributesMetadata: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importAttributesMetadata,
        true,
        'importAttributesMetadata',
      ),
    ),
    importCooordinateFrames: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importCooordinateFrames,
        true,
        'importCooordinateFrames',
      ),
    ),
    importPlanes: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importPlanes, true, 'importPlanes'),
    ),
    import3dCurvesLines: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.import3DCurvesLines,
        true,
        'import3DCurvesLines',
      ),
    ),
    import3dCurvesCircles: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.import3DCurvesCircles,
        true,
        'import3DCurvesCircles',
      ),
    ),
    import3dCurvesGeneralCurves: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.import3DCurvesGeneralCurves,
        true,
        'import3DCurvesGeneralCurves',
      ),
    ),
    importConstructionGeometry: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importConstructionGeometry,
        false,
        'importConstructionGeometry',
      ),
    ),
    importHiddenEntities: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importHiddenEntities,
        false,
        'importHiddenEntities',
      ),
    ),
    importAllSurfacesAsMeshGraphicalEntities: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importAllSurfacesAsMeshGraphicalEntities,
        false,
        'importAllSurfacesAsMeshGraphicalEntities',
      ),
    ),
    doNotImportFillets: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.doNotImportFillets,
        false,
        'doNotImportFillets',
      ),
    ),
    doNotImportDittos: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.doNotImportDittos,
        false,
        'doNotImportDittos',
      ),
    ),
    dittoThreshold: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.dittoThreshold, 1, 'dittoThreshold'),
    ),
    centerViewOnImportedObjects: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.centerViewOnImportedObjects,
        true,
        'centerViewOnImportedObjects',
      ),
    ),
    importIntoFoldersMatchingCadFileHierarchy: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importIntoFoldersMatchingCadFileHierarchy,
        false,
        'importIntoFoldersMatchingCadFileHierarchy',
      ),
    ),
    removeEmptyFolders: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.removeEmptyFolders,
        true,
        'removeEmptyFolders',
      ),
    ),
    surfaceNormalsMode1Or2: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(
        input.surfaceNormalsMode1Or2,
        1,
        'surfaceNormalsMode1Or2',
      ),
    ),
    promptOnMissingComponents: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.promptOnMissingComponents,
        true,
        'promptOnMissingComponents',
      ),
    ),
    selectiveImport: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.selectiveImport, false, 'selectiveImport'),
    ),
    surfaceCompatibilityMode: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.surfaceCompatibilityMode,
        true,
        'surfaceCompatibilityMode',
      ),
    ),
    explodeSurfaces: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.explodeSurfaces, false, 'explodeSurfaces'),
    ),
    cadFileUnitsLeaveBlankToUseTheUnitsSpecifiedInTheFile: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.cadFileUnitsLeaveBlankToUseTheUnitsSpecifiedInTheFile,
        '',
        'cadFileUnitsLeaveBlankToUseTheUnitsSpecifiedInTheFile',
      ),
    ),
    buildCalloutViews: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.buildCalloutViews,
        true,
        'buildCalloutViews',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'DirectCadAccess',
    request,
    FileOperationsProtocol.DirectCadAccessRequest,
    FileOperationsProtocol.DirectCadAccessResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['importWarnings', operationScalarSchemas.boolean, 'importWarnings'],
      [
        'importWarningMessages',
        operationScalarSchemas.string,
        'importWarningMessages',
      ],
      ['extentsMin', getOperationValueSchema('vector'), 'extentsMin'],
      ['extentsMax', getOperationValueSchema('vector'), 'extentsMax'],
    ],
  );
  return mapped as DirectCadAccessResult;
}

export async function exportAsciiFrameSet(
  briosa: BriosaClient,
  input: ExportAsciiFrameSetInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportAsciiFrameSetRequest.fromPartial(
    {
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      frameSetContainer: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.frameSetContainer, 'frameSetContainer'),
      ),
      dataDelimiter: toWireOperationValue(
        getOperationValueSchema('exportDataDelimeterType'),
        requireOperationInput(input.dataDelimiter, 'dataDelimiter'),
      ),
      fileFormat: toWireOperationValue(
        getOperationValueSchema('asciiFileFormat'),
        requireOperationInput(input.fileFormat, 'fileFormat'),
      ),
      includeExportFormatInfo: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeExportFormatInfo,
          false,
          'includeExportFormatInfo',
        ),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 6, 'decimalPrecision'),
      ),
      append: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.append, false, 'append'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportAsciiFrameSet',
    request,
    FileOperationsProtocol.ExportAsciiFrameSetRequest,
    FileOperationsProtocol.ExportAsciiFrameSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportAsciiFrames(
  briosa: BriosaClient,
  input: ExportAsciiFramesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportAsciiFramesRequest.fromPartial({
    asciiFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
    ),
    objectList: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectList, 'objectList'),
    ),
    exportFrameMode: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.exportFrameMode,
        'Fixed XYZ',
        'exportFrameMode',
      ),
    ),
    overwriteExistingFile: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.overwriteExistingFile,
        false,
        'overwriteExistingFile',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportAsciiFrames',
    request,
    FileOperationsProtocol.ExportAsciiFramesRequest,
    FileOperationsProtocol.ExportAsciiFramesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportAsciiPointClouds(
  briosa: BriosaClient,
  input: ExportAsciiPointCloudsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportAsciiPointCloudsRequest.fromPartial({
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      pointCloudList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.pointCloudList, 'pointCloudList'),
      ),
      dataDelimiter: toWireOperationValue(
        getOperationValueSchema('exportDataDelimeterType'),
        requireOperationInput(input.dataDelimiter, 'dataDelimiter'),
      ),
      overwriteExistingFile: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.overwriteExistingFile,
          false,
          'overwriteExistingFile',
        ),
      ),
      showProgressDialog: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showProgressDialog,
          false,
          'showProgressDialog',
        ),
      ),
      includeCloudPointLabeling: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeCloudPointLabeling,
          false,
          'includeCloudPointLabeling',
        ),
      ),
      includeScanDirectionVector: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeScanDirectionVector,
          false,
          'includeScanDirectionVector',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportAsciiPointClouds',
    request,
    FileOperationsProtocol.ExportAsciiPointCloudsRequest,
    FileOperationsProtocol.ExportAsciiPointCloudsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportAsciiPointSet(
  briosa: BriosaClient,
  input: ExportAsciiPointSetInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportAsciiPointSetRequest.fromPartial(
    {
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      pointSetContainer: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pointSetContainer, 'pointSetContainer'),
      ),
      dataDelimiter: toWireOperationValue(
        getOperationValueSchema('exportDataDelimeterType'),
        requireOperationInput(input.dataDelimiter, 'dataDelimiter'),
      ),
      targetNameFormat: toWireOperationValue(
        getOperationValueSchema('exportTargetNameFormat'),
        requireOperationInput(input.targetNameFormat, 'targetNameFormat'),
      ),
      desiredCoordinateSystem: toWireOperationValue(
        getOperationValueSchema('coordinateSystemType'),
        requireOperationInput(
          input.desiredCoordinateSystem,
          'desiredCoordinateSystem',
        ),
      ),
      includeTargetOffsets: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeTargetOffsets,
          false,
          'includeTargetOffsets',
        ),
      ),
      includeTimestamps: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeTimestamps,
          false,
          'includeTimestamps',
        ),
      ),
      includeSaVersionAndFrameComments: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeSaVersionAndFrameComments,
          false,
          'includeSaVersionAndFrameComments',
        ),
      ),
      includeAxisComments: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeAxisComments,
          false,
          'includeAxisComments',
        ),
      ),
      includeExportFormatInfo: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeExportFormatInfo,
          false,
          'includeExportFormatInfo',
        ),
      ),
      maximumPrecisionScientificNotation: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.maximumPrecisionScientificNotation,
          false,
          'maximumPrecisionScientificNotation',
        ),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 6, 'decimalPrecision'),
      ),
      append: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.append, false, 'append'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportAsciiPointSet',
    request,
    FileOperationsProtocol.ExportAsciiPointSetRequest,
    FileOperationsProtocol.ExportAsciiPointSetResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportAsciiPoints(
  briosa: BriosaClient,
  input: ExportAsciiPointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportAsciiPointsRequest.fromPartial({
    asciiFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
    ),
    groupNamesToExport: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionGroupName')),
      requireOperationInput(input.groupNamesToExport, 'groupNamesToExport'),
    ),
    dataDelimiter: toWireOperationValue(
      getOperationValueSchema('exportDataDelimeterType'),
      requireOperationInput(input.dataDelimiter, 'dataDelimiter'),
    ),
    targetNameFormat: toWireOperationValue(
      getOperationValueSchema('exportTargetNameFormat'),
      requireOperationInput(input.targetNameFormat, 'targetNameFormat'),
    ),
    desiredCoordinateSystem: toWireOperationValue(
      getOperationValueSchema('coordinateSystemType'),
      requireOperationInput(
        input.desiredCoordinateSystem,
        'desiredCoordinateSystem',
      ),
    ),
    includeTargetOffsets: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeTargetOffsets,
        false,
        'includeTargetOffsets',
      ),
    ),
    includeTargetComments: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeTargetComments,
        false,
        'includeTargetComments',
      ),
    ),
    includeTimestamps: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeTimestamps,
        false,
        'includeTimestamps',
      ),
    ),
    includeTolerances: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeTolerances,
        false,
        'includeTolerances',
      ),
    ),
    includeCoordinateUncertainties: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeCoordinateUncertainties,
        false,
        'includeCoordinateUncertainties',
      ),
    ),
    includeSaVersionAndFrameComments: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeSaVersionAndFrameComments,
        false,
        'includeSaVersionAndFrameComments',
      ),
    ),
    includeAxisComments: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeAxisComments,
        false,
        'includeAxisComments',
      ),
    ),
    includeExportFormatInfo: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeExportFormatInfo,
        false,
        'includeExportFormatInfo',
      ),
    ),
    includeWeights: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.includeWeights, false, 'includeWeights'),
    ),
    includeMeasurementDetails: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includeMeasurementDetails,
        false,
        'includeMeasurementDetails',
      ),
    ),
    maximumPrecisionScientificNotation: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.maximumPrecisionScientificNotation,
        false,
        'maximumPrecisionScientificNotation',
      ),
    ),
    decimalPrecision: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.decimalPrecision, 6, 'decimalPrecision'),
    ),
    append: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.append, false, 'append'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportAsciiPoints',
    request,
    FileOperationsProtocol.ExportAsciiPointsRequest,
    FileOperationsProtocol.ExportAsciiPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportDxf(
  briosa: BriosaClient,
  input: ExportDxfInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportDxfRequest.fromPartial({
    dxfFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.dxfFilePath, 'dxfFilePath'),
    ),
    pointNames: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('pointName')),
      requireOperationInput(input.pointNames, 'pointNames'),
    ),
    cloudNames: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.cloudNames, 'cloudNames'),
    ),
    includePointLabels: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.includePointLabels,
        true,
        'includePointLabels',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportDxf',
    request,
    FileOperationsProtocol.ExportDxfRequest,
    FileOperationsProtocol.ExportDxfResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportEmbeddedFile(
  briosa: BriosaClient,
  input: ExportEmbeddedFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportEmbeddedFileRequest.fromPartial({
    embeddedFileCollectionName: toWireOperationValue(
      getOperationValueSchema('collectionName'),
      requireOperationInput(
        input.embeddedFileCollectionName,
        'embeddedFileCollectionName',
      ),
    ),
    embeddedFileName: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.embeddedFileName, '', 'embeddedFileName'),
    ),
    externalFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.externalFileName, 'externalFileName'),
    ),
    replaceExisting: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.replaceExisting, false, 'replaceExisting'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportEmbeddedFile',
    request,
    FileOperationsProtocol.ExportEmbeddedFileRequest,
    FileOperationsProtocol.ExportEmbeddedFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportHiddenPointBarXmlFile(
  briosa: BriosaClient,
  input: ExportHiddenPointBarXmlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportHiddenPointBarXmlFileRequest.fromPartial({
      xmlFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.xmlFilePath, 'xmlFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportHiddenPointBarXmlFile',
    request,
    FileOperationsProtocol.ExportHiddenPointBarXmlFileRequest,
    FileOperationsProtocol.ExportHiddenPointBarXmlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportIgesFileEntireModel(
  briosa: BriosaClient,
  input: ExportIgesFileEntireModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportIgesFileEntireModelRequest.fromPartial({
      igesFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.igesFilePath, 'igesFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportIgesFileEntireModel',
    request,
    FileOperationsProtocol.ExportIgesFileEntireModelRequest,
    FileOperationsProtocol.ExportIgesFileEntireModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportIgesFilePartialModel(
  briosa: BriosaClient,
  input: ExportIgesFilePartialModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportIgesFilePartialModelRequest.fromPartial({
      igesFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.igesFilePath, 'igesFilePath'),
      ),
      objectNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectNameList, 'objectNameList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportIgesFilePartialModel',
    request,
    FileOperationsProtocol.ExportIgesFilePartialModelRequest,
    FileOperationsProtocol.ExportIgesFilePartialModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportPtxPointClouds(
  briosa: BriosaClient,
  input: ExportPtxPointCloudsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportPtxPointCloudsRequest.fromPartial({
      ptxFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.ptxFilePath, 'ptxFilePath'),
      ),
      pointCloudList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.pointCloudList, 'pointCloudList'),
      ),
      overwriteExistingFile: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.overwriteExistingFile,
          false,
          'overwriteExistingFile',
        ),
      ),
      showProgressDialog: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showProgressDialog,
          false,
          'showProgressDialog',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportPtxPointClouds',
    request,
    FileOperationsProtocol.ExportPtxPointCloudsRequest,
    FileOperationsProtocol.ExportPtxPointCloudsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportQdasCharacteristics(
  briosa: BriosaClient,
  input: ExportQdasCharacteristicsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportQdasCharacteristicsRequest.fromPartial({
      qdasExportFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.qdasExportFilePath, 'qdasExportFilePath'),
      ),
      k1001PartNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1001PartNumber, '', 'k1001PartNumber'),
      ),
      k1002PartDescription: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1002PartDescription,
          '',
          'k1002PartDescription',
        ),
      ),
      k1071SupplierNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1071SupplierNumber,
          '',
          'k1071SupplierNumber',
        ),
      ),
      k1072SupplierDescription: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1072SupplierDescription,
          '',
          'k1072SupplierDescription',
        ),
      ),
      k1203ReasonForTest: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1203ReasonForTest,
          '',
          'k1203ReasonForTest',
        ),
      ),
      k1303Plant: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1303Plant, '', 'k1303Plant'),
      ),
      k1900PartRemark: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1900PartRemark, '', 'k1900PartRemark'),
      ),
      k0006BatchNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0006BatchNumber, '', 'k0006BatchNumber'),
      ),
      k0014PartId: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0014PartId, '', 'k0014PartId'),
      ),
      k0053OrderNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0053OrderNumber, '', 'k0053OrderNumber'),
      ),
      k0004DateTimeStamp: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k0004DateTimeStamp,
          '2026-07-20/16:32:22',
          'k0004DateTimeStamp',
        ),
      ),
      k0008OperatorIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0008OperatorIdentifier,
          -1,
          'k0008OperatorIdentifier',
        ),
      ),
      k0010MachineIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0010MachineIdentifier,
          -1,
          'k0010MachineIdentifier',
        ),
      ),
      k0012GageIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0012GageIdentifier,
          -1,
          'k0012GageIdentifier',
        ),
      ),
      relationshipList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.relationshipList, 'relationshipList'),
      ),
      featureCheckList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.featureCheckList, 'featureCheckList'),
      ),
      vectorGroupList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.vectorGroupList, 'vectorGroupList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportQdasCharacteristics',
    request,
    FileOperationsProtocol.ExportQdasCharacteristicsRequest,
    FileOperationsProtocol.ExportQdasCharacteristicsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportQdasDataList(
  briosa: BriosaClient,
  input: ExportQdasDataListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ExportQdasDataListRequest.fromPartial({
    qdasExportFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.qdasExportFilePath, 'qdasExportFilePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportQdasDataList',
    request,
    FileOperationsProtocol.ExportQdasDataListRequest,
    FileOperationsProtocol.ExportQdasDataListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportScanStripeMeshToStlFile(
  briosa: BriosaClient,
  input: ExportScanStripeMeshToStlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportScanStripeMeshToStlFileRequest.fromPartial({
      stlFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.stlFilePath, 'stlFilePath'),
      ),
      mesh: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.mesh, 'mesh'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportScanStripeMeshToStlFile',
    request,
    FileOperationsProtocol.ExportScanStripeMeshToStlFileRequest,
    FileOperationsProtocol.ExportScanStripeMeshToStlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportStepFileEntireModel(
  briosa: BriosaClient,
  input: ExportStepFileEntireModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportStepFileEntireModelRequest.fromPartial({
      stepFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.stepFilePath, 'stepFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportStepFileEntireModel',
    request,
    FileOperationsProtocol.ExportStepFileEntireModelRequest,
    FileOperationsProtocol.ExportStepFileEntireModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportStepFilePartialModel(
  briosa: BriosaClient,
  input: ExportStepFilePartialModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportStepFilePartialModelRequest.fromPartial({
      stepFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.stepFilePath, 'stepFilePath'),
      ),
      objectNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectNameList, 'objectNameList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportStepFilePartialModel',
    request,
    FileOperationsProtocol.ExportStepFilePartialModelRequest,
    FileOperationsProtocol.ExportStepFilePartialModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportVdaFsFileEntireModel(
  briosa: BriosaClient,
  input: ExportVdaFsFileEntireModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportVdaFsFileEntireModelRequest.fromPartial({
      vdaFsFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.vdaFsFilePath, 'vdaFsFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportVdaFsFileEntireModel',
    request,
    FileOperationsProtocol.ExportVdaFsFileEntireModelRequest,
    FileOperationsProtocol.ExportVdaFsFileEntireModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportVdaFsFilePartialModel(
  briosa: BriosaClient,
  input: ExportVdaFsFilePartialModelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportVdaFsFilePartialModelRequest.fromPartial({
      vdaFsFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.vdaFsFilePath, 'vdaFsFilePath'),
      ),
      objectNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectNameList, 'objectNameList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportVdaFsFilePartialModel',
    request,
    FileOperationsProtocol.ExportVdaFsFilePartialModelRequest,
    FileOperationsProtocol.ExportVdaFsFilePartialModelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function exportVectorContainerToAsciiFile(
  briosa: BriosaClient,
  input: ExportVectorContainerToAsciiFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ExportVectorContainerToAsciiFileRequest.fromPartial({
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      vectorGroupsToExport: toWireOperationValue(
        repeatedOperationValue(
          getOperationValueSchema('collectionVectorGroupName'),
        ),
        requireOperationInput(
          input.vectorGroupsToExport,
          'vectorGroupsToExport',
        ),
      ),
      overwriteExistingFileFalseAppend: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.overwriteExistingFileFalseAppend,
          true,
          'overwriteExistingFileFalseAppend',
        ),
      ),
      useFullPrecisionScientificNotation: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.useFullPrecisionScientificNotation,
          false,
          'useFullPrecisionScientificNotation',
        ),
      ),
      vectorNameFormat: toWireOperationValue(
        getOperationValueSchema('exportVectorNameFormat'),
        requireOperationInput(input.vectorNameFormat, 'vectorNameFormat'),
      ),
      includeVectorLength: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.includeVectorLength,
          true,
          'includeVectorLength',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ExportVectorContainerToAsciiFile',
    request,
    FileOperationsProtocol.ExportVectorContainerToAsciiFileRequest,
    FileOperationsProtocol.ExportVectorContainerToAsciiFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function findFilesInDirectory(
  briosa: BriosaClient,
  input: FindFilesInDirectoryInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.FindFilesInDirectoryRequest.fromPartial({
      directory: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.directory, '', 'directory'),
      ),
      fileNamePattern: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.fileNamePattern,
          '*.*',
          'fileNamePattern',
        ),
      ),
      recursive: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.recursive, false, 'recursive'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'FindFilesInDirectory',
    request,
    FileOperationsProtocol.FindFilesInDirectoryRequest,
    FileOperationsProtocol.FindFilesInDirectoryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['files', repeatedOperationValue(operationScalarSchemas.string), 'files']],
  );
  return mapped as readonly string[];
}

export async function findSubDirectoriesInDirectory(
  briosa: BriosaClient,
  input: FindSubDirectoriesInDirectoryInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.FindSubDirectoriesInDirectoryRequest.fromPartial({
      directory: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.directory, '', 'directory'),
      ),
      recursive: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.recursive, false, 'recursive'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'FindSubDirectoriesInDirectory',
    request,
    FileOperationsProtocol.FindSubDirectoriesInDirectoryRequest,
    FileOperationsProtocol.FindSubDirectoriesInDirectoryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'subDirectories',
        repeatedOperationValue(operationScalarSchemas.string),
        'subDirectories',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function getBooleanFromDataShareFile(
  briosa: BriosaClient,
  input: GetBooleanFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetBooleanFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      booleanName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.booleanName, '', 'booleanName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetBooleanFromDataShareFile',
    request,
    FileOperationsProtocol.GetBooleanFromDataShareFileRequest,
    FileOperationsProtocol.GetBooleanFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['booleanValue', operationScalarSchemas.boolean, 'booleanValue']],
  );
  return mapped as boolean;
}

export async function getDoubleFromDataShareFile(
  briosa: BriosaClient,
  input: GetDoubleFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetDoubleFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      doubleName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.doubleName, '', 'doubleName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetDoubleFromDataShareFile',
    request,
    FileOperationsProtocol.GetDoubleFromDataShareFileRequest,
    FileOperationsProtocol.GetDoubleFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['doubleValue', operationScalarSchemas.number, 'doubleValue']],
  );
  return mapped as number;
}

export async function getIntegerFromDataShareFile(
  briosa: BriosaClient,
  input: GetIntegerFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetIntegerFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      integerName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.integerName, '', 'integerName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetIntegerFromDataShareFile',
    request,
    FileOperationsProtocol.GetIntegerFromDataShareFileRequest,
    FileOperationsProtocol.GetIntegerFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['integerValue', operationScalarSchemas.integer, 'integerValue']],
  );
  return mapped as number;
}

export async function getQdasCatalogEntries(
  briosa: BriosaClient,
  input: GetQdasCatalogEntriesInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetQdasCatalogEntriesRequest.fromPartial({
      kFieldTarget: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.kFieldTarget, '', 'kFieldTarget'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetQdasCatalogEntries',
    request,
    FileOperationsProtocol.GetQdasCatalogEntriesRequest,
    FileOperationsProtocol.GetQdasCatalogEntriesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'catalogEntries',
        repeatedOperationValue(operationScalarSchemas.string),
        'catalogEntries',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function getStringFromDataShareFile(
  briosa: BriosaClient,
  input: GetStringFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetStringFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      stringName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.stringName, '', 'stringName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetStringFromDataShareFile',
    request,
    FileOperationsProtocol.GetStringFromDataShareFileRequest,
    FileOperationsProtocol.GetStringFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['stringValue', operationScalarSchemas.string, 'stringValue']],
  );
  return mapped as string;
}

export async function getTransformFromDataShareFile(
  briosa: BriosaClient,
  input: GetTransformFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<Transform> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetTransformFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      transformName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.transformName, '', 'transformName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetTransformFromDataShareFile',
    request,
    FileOperationsProtocol.GetTransformFromDataShareFileRequest,
    FileOperationsProtocol.GetTransformFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'transformValue',
        getOperationValueSchema('transform'),
        'transformValue',
      ],
    ],
  );
  return mapped as Transform;
}

export async function getVectorFromDataShareFile(
  briosa: BriosaClient,
  input: GetVectorFromDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<Vector> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.GetVectorFromDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      vectorName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.vectorName, '', 'vectorName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'GetVectorFromDataShareFile',
    request,
    FileOperationsProtocol.GetVectorFromDataShareFileRequest,
    FileOperationsProtocol.GetVectorFromDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['vectorValue', getOperationValueSchema('vector'), 'vectorValue']],
  );
  return mapped as Vector;
}

export async function importAsciiPredefinedFormats(
  briosa: BriosaClient,
  input: ImportAsciiPredefinedFormatsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportAsciiPredefinedFormatsRequest.fromPartial({
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      fileFormat: toWireOperationValue(
        getOperationValueSchema('asciiFileFormat'),
        requireOperationInput(input.fileFormat, 'fileFormat'),
      ),
      units: toWireOperationValue(
        getOperationValueSchema('distanceUnits'),
        resolveOperationDefault(input.units, DistanceUnits.inches, 'units'),
      ),
      angularUnits: toWireOperationValue(
        getOperationValueSchema('angularUnits'),
        resolveOperationDefault(
          input.angularUnits,
          AngularUnits.degrees,
          'angularUnits',
        ),
      ),
      groupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupName, 'groupName'),
      ),
      importAsCloud: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.importAsCloud, false, 'importAsCloud'),
      ),
      ensureNewPointGroup: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.ensureNewPointGroup,
          true,
          'ensureNewPointGroup',
        ),
      ),
      ensureUniqueNames: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.ensureUniqueNames,
          true,
          'ensureUniqueNames',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportAsciiPredefinedFormats',
    request,
    FileOperationsProtocol.ImportAsciiPredefinedFormatsRequest,
    FileOperationsProtocol.ImportAsciiPredefinedFormatsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importAsciiPredefinedFrameSetFormats(
  briosa: BriosaClient,
  input: ImportAsciiPredefinedFrameSetFormatsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportAsciiPredefinedFrameSetFormatsRequest.fromPartial(
      {
        asciiFilePath: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
        ),
        fileFormat: toWireOperationValue(
          getOperationValueSchema('asciiFileFormat'),
          requireOperationInput(input.fileFormat, 'fileFormat'),
        ),
        units: toWireOperationValue(
          getOperationValueSchema('distanceUnits'),
          resolveOperationDefault(input.units, DistanceUnits.inches, 'units'),
        ),
        angularUnits: toWireOperationValue(
          getOperationValueSchema('angularUnits'),
          resolveOperationDefault(
            input.angularUnits,
            AngularUnits.degrees,
            'angularUnits',
          ),
        ),
        frameSetContainerName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.frameSetContainerName,
            'frameSetContainerName',
          ),
        ),
        ensureUniqueName: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.ensureUniqueName,
            true,
            'ensureUniqueName',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportAsciiPredefinedFrameSetFormats',
    request,
    FileOperationsProtocol.ImportAsciiPredefinedFrameSetFormatsRequest,
    FileOperationsProtocol.ImportAsciiPredefinedFrameSetFormatsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importE57File(
  briosa: BriosaClient,
  input: ImportE57FileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportE57FileRequest.fromPartial({
    e57FilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.e57FilePath, 'e57FilePath'),
    ),
    saveConvertedFile: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.saveConvertedFile,
        false,
        'saveConvertedFile',
      ),
    ),
    useSquareRootOfIntensity: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.useSquareRootOfIntensity,
        true,
        'useSquareRootOfIntensity',
      ),
    ),
    automaticallyCloseConverter: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.automaticallyCloseConverter,
        true,
        'automaticallyCloseConverter',
      ),
    ),
    prioritizeColorOverIntensity: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.prioritizeColorOverIntensity,
        true,
        'prioritizeColorOverIntensity',
      ),
    ),
    importScanBlocksAsSeparateClouds: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importScanBlocksAsSeparateClouds,
        false,
        'importScanBlocksAsSeparateClouds',
      ),
    ),
    units: toWireOperationValue(
      getOperationValueSchema('distanceUnits'),
      resolveOperationDefault(input.units, DistanceUnits.inches, 'units'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportE57File',
    request,
    FileOperationsProtocol.ImportE57FileRequest,
    FileOperationsProtocol.ImportE57FileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importFileAsEmbeddedFile(
  briosa: BriosaClient,
  input: ImportFileAsEmbeddedFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportFileAsEmbeddedFileRequest.fromPartial({
      externalFileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.externalFileName, 'externalFileName'),
      ),
      replaceExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.replaceExisting,
          false,
          'replaceExisting',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportFileAsEmbeddedFile',
    request,
    FileOperationsProtocol.ImportFileAsEmbeddedFileRequest,
    FileOperationsProtocol.ImportFileAsEmbeddedFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importFileAsPicture(
  briosa: BriosaClient,
  input: ImportFileAsPictureInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportFileAsPictureRequest.fromPartial(
    {
      externalFileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.externalFileName, 'externalFileName'),
      ),
      replaceExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.replaceExisting,
          false,
          'replaceExisting',
        ),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportFileAsPicture',
    request,
    FileOperationsProtocol.ImportFileAsPictureRequest,
    FileOperationsProtocol.ImportFileAsPictureResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importHiddenPointBarXmlFile(
  briosa: BriosaClient,
  input: ImportHiddenPointBarXmlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportHiddenPointBarXmlFileRequest.fromPartial({
      xmlFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.xmlFilePath, 'xmlFilePath'),
      ),
      replaceExistingEntries: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.replaceExistingEntries,
          false,
          'replaceExistingEntries',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportHiddenPointBarXmlFile',
    request,
    FileOperationsProtocol.ImportHiddenPointBarXmlFileRequest,
    FileOperationsProtocol.ImportHiddenPointBarXmlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importIgesFile(
  briosa: BriosaClient,
  input: ImportIgesFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportIgesFileRequest.fromPartial({
    igesFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.igesFilePath, 'igesFilePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportIgesFile',
    request,
    FileOperationsProtocol.ImportIgesFileRequest,
    FileOperationsProtocol.ImportIgesFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importLeicaGsiFile(
  briosa: BriosaClient,
  input: ImportLeicaGsiFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportLeicaGsiFileRequest.fromPartial({
    instrumentId: toWireOperationValue(
      getOperationValueSchema('collectionInstrumentId'),
      requireOperationInput(input.instrumentId, 'instrumentId'),
    ),
    groupName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.groupName, 'groupName'),
    ),
    filePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.filePath, 'filePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportLeicaGsiFile',
    request,
    FileOperationsProtocol.ImportLeicaGsiFileRequest,
    FileOperationsProtocol.ImportLeicaGsiFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importLeicaSdbFile(
  briosa: BriosaClient,
  input: ImportLeicaSdbFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportLeicaSdbFileRequest.fromPartial({
    instrumentId: toWireOperationValue(
      getOperationValueSchema('collectionInstrumentId'),
      requireOperationInput(input.instrumentId, 'instrumentId'),
    ),
    scanCloudName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.scanCloudName, 'scanCloudName'),
    ),
    filePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.filePath, 'filePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportLeicaSdbFile',
    request,
    FileOperationsProtocol.ImportLeicaSdbFileRequest,
    FileOperationsProtocol.ImportLeicaSdbFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importMpFileAsEmbeddedMp(
  briosa: BriosaClient,
  input: ImportMpFileAsEmbeddedMpInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportMpFileAsEmbeddedMpRequest.fromPartial({
      externalMpFileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.externalMpFileName, 'externalMpFileName'),
      ),
      replaceExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.replaceExisting,
          false,
          'replaceExisting',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportMpFileAsEmbeddedMp',
    request,
    FileOperationsProtocol.ImportMpFileAsEmbeddedMpRequest,
    FileOperationsProtocol.ImportMpFileAsEmbeddedMpResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importNominalsFromXmlFile(
  briosa: BriosaClient,
  input: ImportNominalsFromXmlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportNominalsFromXmlFileRequest.fromPartial({
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportNominalsFromXmlFile',
    request,
    FileOperationsProtocol.ImportNominalsFromXmlFileRequest,
    FileOperationsProtocol.ImportNominalsFromXmlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importPolyworksFile(
  briosa: BriosaClient,
  input: ImportPolyworksFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportPolyworksFileRequest.fromPartial(
    {
      cloudName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.cloudName, 'cloudName'),
      ),
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportPolyworksFile',
    request,
    FileOperationsProtocol.ImportPolyworksFileRequest,
    FileOperationsProtocol.ImportPolyworksFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importQdasCatalogFile(
  briosa: BriosaClient,
  input: ImportQdasCatalogFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportQdasCatalogFileRequest.fromPartial({
      qdasDfdFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.qdasDfdFilePath, 'qdasDfdFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportQdasCatalogFile',
    request,
    FileOperationsProtocol.ImportQdasCatalogFileRequest,
    FileOperationsProtocol.ImportQdasCatalogFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importSaFile(
  briosa: BriosaClient,
  input: ImportSaFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportSaFileRequest.fromPartial({
    saFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.saFileName, 'saFileName'),
    ),
    allowOperatorSelections: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.allowOperatorSelections,
        false,
        'allowOperatorSelections',
      ),
    ),
    selectedCollectionsOptional: toWireOperationValue(
      repeatedOperationValue(operationScalarSchemas.string),
      requireOperationInput(
        input.selectedCollectionsOptional,
        'selectedCollectionsOptional',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportSaFile',
    request,
    FileOperationsProtocol.ImportSaFileRequest,
    FileOperationsProtocol.ImportSaFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importSaWindowsPlacement(
  briosa: BriosaClient,
  input: ImportSaWindowsPlacementInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.ImportSaWindowsPlacementRequest.fromPartial({
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportSaWindowsPlacement',
    request,
    FileOperationsProtocol.ImportSaWindowsPlacementRequest,
    FileOperationsProtocol.ImportSaWindowsPlacementResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importSatFile(
  briosa: BriosaClient,
  input: ImportSatFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportSatFileRequest.fromPartial({
    satFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.satFilePath, 'satFilePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportSatFile',
    request,
    FileOperationsProtocol.ImportSatFileRequest,
    FileOperationsProtocol.ImportSatFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importStepFile(
  briosa: BriosaClient,
  input: ImportStepFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportStepFileRequest.fromPartial({
    stepFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.stepFilePath, 'stepFilePath'),
    ),
    displayEntityFilters: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.displayEntityFilters,
        false,
        'displayEntityFilters',
      ),
    ),
    displayResiduals: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.displayResiduals,
        false,
        'displayResiduals',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportStepFile',
    request,
    FileOperationsProtocol.ImportStepFileRequest,
    FileOperationsProtocol.ImportStepFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importStlFile(
  briosa: BriosaClient,
  input: ImportStlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportStlFileRequest.fromPartial({
    stlFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.stlFilePath, 'stlFilePath'),
    ),
    units: toWireOperationValue(
      getOperationValueSchema('distanceUnits'),
      resolveOperationDefault(input.units, DistanceUnits.millimeters, 'units'),
    ),
    importMesh: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.importMesh, true, 'importMesh'),
    ),
    importPointCloud: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.importPointCloud,
        false,
        'importPointCloud',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportStlFile',
    request,
    FileOperationsProtocol.ImportStlFileRequest,
    FileOperationsProtocol.ImportStlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importVdaFsFile(
  briosa: BriosaClient,
  input: ImportVdaFsFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportVdaFsFileRequest.fromPartial({
    vdaFsFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.vdaFsFilePath, 'vdaFsFilePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportVdaFsFile',
    request,
    FileOperationsProtocol.ImportVdaFsFileRequest,
    FileOperationsProtocol.ImportVdaFsFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importVstarsXyzFile(
  briosa: BriosaClient,
  input: ImportVstarsXyzFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportVstarsXyzFileRequest.fromPartial(
    {
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportVstarsXyzFile',
    request,
    FileOperationsProtocol.ImportVstarsXyzFileRequest,
    FileOperationsProtocol.ImportVstarsXyzFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function importVstarsCameras(
  briosa: BriosaClient,
  input: ImportVstarsCamerasInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.ImportVstarsCamerasRequest.fromPartial(
    {
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'ImportVstarsCameras',
    request,
    FileOperationsProtocol.ImportVstarsCamerasRequest,
    FileOperationsProtocol.ImportVstarsCamerasResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function loadHtmlForm(
  briosa: BriosaClient,
  input: LoadHtmlFormInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.LoadHtmlFormRequest.fromPartial({
    inputHtmlFormPath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.inputHtmlFormPath, 'inputHtmlFormPath'),
    ),
    windowWidth: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.windowWidth, 1000, 'windowWidth'),
    ),
    windowHeight: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.windowHeight, 800, 'windowHeight'),
    ),
    inputDataShareFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(
        input.inputDataShareFilePath,
        'inputDataShareFilePath',
      ),
    ),
    outputDataShareFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(
        input.outputDataShareFilePath,
        'outputDataShareFilePath',
      ),
    ),
    saveInBinaryFormat: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.saveInBinaryFormat,
        false,
        'saveInBinaryFormat',
      ),
    ),
    saveButtonText: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.saveButtonText, 'Save', 'saveButtonText'),
    ),
    cancelButtonText: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.cancelButtonText,
        'Cancel',
        'cancelButtonText',
      ),
    ),
    hideSaveAndCancelButtons: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.hideSaveAndCancelButtons,
        false,
        'hideSaveAndCancelButtons',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'LoadHtmlForm',
    request,
    FileOperationsProtocol.LoadHtmlFormRequest,
    FileOperationsProtocol.LoadHtmlFormResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function loadHtmlFormInEdgeBrowser(
  briosa: BriosaClient,
  input: LoadHtmlFormInEdgeBrowserInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.LoadHtmlFormInEdgeBrowserRequest.fromPartial({
      inputHtmlFormPath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.inputHtmlFormPath, 'inputHtmlFormPath'),
      ),
      windowWidth: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.windowWidth, 1000, 'windowWidth'),
      ),
      windowHeight: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.windowHeight, 800, 'windowHeight'),
      ),
      inputDataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(
          input.inputDataShareFilePath,
          'inputDataShareFilePath',
        ),
      ),
      outputDataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(
          input.outputDataShareFilePath,
          'outputDataShareFilePath',
        ),
      ),
      saveInBinaryFormat: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.saveInBinaryFormat,
          false,
          'saveInBinaryFormat',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'LoadHtmlFormInEdgeBrowser',
    request,
    FileOperationsProtocol.LoadHtmlFormInEdgeBrowserRequest,
    FileOperationsProtocol.LoadHtmlFormInEdgeBrowserResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeEmbeddedFileNameList(
  briosa: BriosaClient,
  input: MakeEmbeddedFileNameListInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.MakeEmbeddedFileNameListRequest.fromPartial({
      collectionWildcardCriteria: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.collectionWildcardCriteria,
          '*',
          'collectionWildcardCriteria',
        ),
      ),
      fileNamePattern: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.fileNamePattern,
          '*.*',
          'fileNamePattern',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'MakeEmbeddedFileNameList',
    request,
    FileOperationsProtocol.MakeEmbeddedFileNameListRequest,
    FileOperationsProtocol.MakeEmbeddedFileNameListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'embeddedFiles',
        repeatedOperationValue(operationScalarSchemas.string),
        'embeddedFiles',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function mergeMeasurementsIntoXmlFile(
  briosa: BriosaClient,
  input: MergeMeasurementsIntoXmlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.MergeMeasurementsIntoXmlFileRequest.fromPartial({
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
      groupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.groupName, 'groupName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'MergeMeasurementsIntoXmlFile',
    request,
    FileOperationsProtocol.MergeMeasurementsIntoXmlFileRequest,
    FileOperationsProtocol.MergeMeasurementsIntoXmlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function newSaFile(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = FileOperationsProtocol.NewSaFileRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'NewSaFile',
    request,
    FileOperationsProtocol.NewSaFileRequest,
    FileOperationsProtocol.NewSaFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function openSaFile(
  briosa: BriosaClient,
  input: OpenSaFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.OpenSaFileRequest.fromPartial({
    saFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.saFileName, 'saFileName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'OpenSaFile',
    request,
    FileOperationsProtocol.OpenSaFileRequest,
    FileOperationsProtocol.OpenSaFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function openTemplateFile(
  briosa: BriosaClient,
  input: OpenTemplateFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.OpenTemplateFileRequest.fromPartial({
    templateFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.templateFileName, 'templateFileName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'OpenTemplateFile',
    request,
    FileOperationsProtocol.OpenTemplateFileRequest,
    FileOperationsProtocol.OpenTemplateFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function popPolyBayAnalysisWindow(
  briosa: BriosaClient,
  input: PopPolyBayAnalysisWindowInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.PopPolyBayAnalysisWindowRequest.fromPartial({
      materialsFilePath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.materialsFilePath,
          '',
          'materialsFilePath',
        ),
      ),
      bayFilePath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.bayFilePath, '', 'bayFilePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'PopPolyBayAnalysisWindow',
    request,
    FileOperationsProtocol.PopPolyBayAnalysisWindowRequest,
    FileOperationsProtocol.PopPolyBayAnalysisWindowResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function prepareQdasDataList(
  briosa: BriosaClient,
  input: PrepareQdasDataListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.PrepareQdasDataListRequest.fromPartial(
    {
      k1001PartNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1001PartNumber, '', 'k1001PartNumber'),
      ),
      k1002PartDescription: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1002PartDescription,
          '',
          'k1002PartDescription',
        ),
      ),
      k1071SupplierNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1071SupplierNumber,
          '',
          'k1071SupplierNumber',
        ),
      ),
      k1072SupplierDescription: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1072SupplierDescription,
          '',
          'k1072SupplierDescription',
        ),
      ),
      k1203ReasonForTest: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k1203ReasonForTest,
          '',
          'k1203ReasonForTest',
        ),
      ),
      k1303Plant: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1303Plant, '', 'k1303Plant'),
      ),
      k1900PartRemark: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k1900PartRemark, '', 'k1900PartRemark'),
      ),
      k0006BatchNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0006BatchNumber, '', 'k0006BatchNumber'),
      ),
      k0014PartId: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0014PartId, '', 'k0014PartId'),
      ),
      k0053OrderNumber: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.k0053OrderNumber, '', 'k0053OrderNumber'),
      ),
      k0004DateTimeStamp: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.k0004DateTimeStamp,
          '2026-07-20/16:32:22',
          'k0004DateTimeStamp',
        ),
      ),
      k0008OperatorIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0008OperatorIdentifier,
          -1,
          'k0008OperatorIdentifier',
        ),
      ),
      k0010MachineIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0010MachineIdentifier,
          -1,
          'k0010MachineIdentifier',
        ),
      ),
      k0012GageIdentifier: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.k0012GageIdentifier,
          -1,
          'k0012GageIdentifier',
        ),
      ),
      relationshipList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.relationshipList, 'relationshipList'),
      ),
      featureCheckList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.featureCheckList, 'featureCheckList'),
      ),
      vectorGroupList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.vectorGroupList, 'vectorGroupList'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'PrepareQdasDataList',
    request,
    FileOperationsProtocol.PrepareQdasDataListRequest,
    FileOperationsProtocol.PrepareQdasDataListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function renameGeneralFile(
  briosa: BriosaClient,
  input: RenameGeneralFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.RenameGeneralFileRequest.fromPartial({
    sourceFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.sourceFileName, 'sourceFileName'),
    ),
    destinationFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.destinationFileName, 'destinationFileName'),
    ),
    overwrite: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.overwrite, false, 'overwrite'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'RenameGeneralFile',
    request,
    FileOperationsProtocol.RenameGeneralFileRequest,
    FileOperationsProtocol.RenameGeneralFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function save(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = FileOperationsProtocol.SaveRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'Save',
    request,
    FileOperationsProtocol.SaveRequest,
    FileOperationsProtocol.SaveResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function saveAsReadOnlyTemplate(
  briosa: BriosaClient,
  input: SaveAsReadOnlyTemplateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SaveAsReadOnlyTemplateRequest.fromPartial({
      templateFileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.templateFileName, 'templateFileName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SaveAsReadOnlyTemplate',
    request,
    FileOperationsProtocol.SaveAsReadOnlyTemplateRequest,
    FileOperationsProtocol.SaveAsReadOnlyTemplateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function saveAs(
  briosa: BriosaClient,
  input: SaveAsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.SaveAsRequest.fromPartial({
    fileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.fileName, 'fileName'),
    ),
    addSerialNumber: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.addSerialNumber, false, 'addSerialNumber'),
    ),
    optionalNumber: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.optionalNumber, 0, 'optionalNumber'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SaveAs',
    request,
    FileOperationsProtocol.SaveAsRequest,
    FileOperationsProtocol.SaveAsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setBooleanInDataShareFile(
  briosa: BriosaClient,
  input: SetBooleanInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetBooleanInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      booleanName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.booleanName, '', 'booleanName'),
      ),
      booleanValue: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.booleanValue, false, 'booleanValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetBooleanInDataShareFile',
    request,
    FileOperationsProtocol.SetBooleanInDataShareFileRequest,
    FileOperationsProtocol.SetBooleanInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setDoubleInDataShareFile(
  briosa: BriosaClient,
  input: SetDoubleInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetDoubleInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      doubleName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.doubleName, '', 'doubleName'),
      ),
      doubleValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.doubleValue, 0, 'doubleValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetDoubleInDataShareFile',
    request,
    FileOperationsProtocol.SetDoubleInDataShareFileRequest,
    FileOperationsProtocol.SetDoubleInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setIntegerInDataShareFile(
  briosa: BriosaClient,
  input: SetIntegerInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetIntegerInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      integerName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.integerName, '', 'integerName'),
      ),
      integerValue: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.integerValue, 0, 'integerValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetIntegerInDataShareFile',
    request,
    FileOperationsProtocol.SetIntegerInDataShareFileRequest,
    FileOperationsProtocol.SetIntegerInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setStringInDataShareFile(
  briosa: BriosaClient,
  input: SetStringInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetStringInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      stringName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.stringName, '', 'stringName'),
      ),
      stringValue: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.stringValue, '', 'stringValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetStringInDataShareFile',
    request,
    FileOperationsProtocol.SetStringInDataShareFileRequest,
    FileOperationsProtocol.SetStringInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTransformInDataShareFile(
  briosa: BriosaClient,
  input: SetTransformInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetTransformInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      transformName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.transformName, '', 'transformName'),
      ),
      transformValue: toWireOperationValue(
        getOperationValueSchema('transform'),
        requireOperationInput(input.transformValue, 'transformValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetTransformInDataShareFile',
    request,
    FileOperationsProtocol.SetTransformInDataShareFileRequest,
    FileOperationsProtocol.SetTransformInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setVectorInDataShareFile(
  briosa: BriosaClient,
  input: SetVectorInDataShareFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.SetVectorInDataShareFileRequest.fromPartial({
      dataShareFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.dataShareFilePath, 'dataShareFilePath'),
      ),
      vectorName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.vectorName, '', 'vectorName'),
      ),
      vectorValue: toWireOperationValue(
        getOperationValueSchema('vector'),
        requireOperationInput(input.vectorValue, 'vectorValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'SetVectorInDataShareFile',
    request,
    FileOperationsProtocol.SetVectorInDataShareFileRequest,
    FileOperationsProtocol.SetVectorInDataShareFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function terminateAllRunningMPs(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    FileOperationsProtocol.TerminateAllRunningMPsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'TerminateAllRunningMPs',
    request,
    FileOperationsProtocol.TerminateAllRunningMPsRequest,
    FileOperationsProtocol.TerminateAllRunningMPsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function useNrkxmlLibrary(
  briosa: BriosaClient,
  input: UseNrkxmlLibraryInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.UseNrkxmlLibraryRequest.fromPartial({
    useLibrary: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.useLibrary, true, 'useLibrary'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'UseNrkxmlLibrary',
    request,
    FileOperationsProtocol.UseNrkxmlLibraryRequest,
    FileOperationsProtocol.UseNrkxmlLibraryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function verifyGeneralFileExists(
  briosa: BriosaClient,
  input: VerifyGeneralFileExistsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    FileOperationsProtocol.VerifyGeneralFileExistsRequest.fromPartial({
      fileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.fileName, 'fileName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'VerifyGeneralFileExists',
    request,
    FileOperationsProtocol.VerifyGeneralFileExistsRequest,
    FileOperationsProtocol.VerifyGeneralFileExistsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function verifyMpFileExists(
  briosa: BriosaClient,
  input: VerifyMpFileExistsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = FileOperationsProtocol.VerifyMpFileExistsRequest.fromPartial({
    mpFileName: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.mpFileName, 'mpFileName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'FileOperations',
    'VerifyMpFileExists',
    request,
    FileOperationsProtocol.VerifyMpFileExistsRequest,
    FileOperationsProtocol.VerifyMpFileExistsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function runSubroutine(
  briosa: BriosaClient,
  input: RunSubroutineInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpSubroutinesProtocol.RunSubroutineRequest.fromPartial({
    mpSubroutineFilePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.mpSubroutineFilePath, 'mpSubroutineFilePath'),
    ),
    shareParentVariables: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.shareParentVariables,
        false,
        'shareParentVariables',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpSubroutines',
    'RunSubroutine',
    request,
    MpSubroutinesProtocol.RunSubroutineRequest,
    MpSubroutinesProtocol.RunSubroutineResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addTaskOverviewItem(
  briosa: BriosaClient,
  input: AddTaskOverviewItemInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.AddTaskOverviewItemRequest.fromPartial(
    {
      taskName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.taskName, '', 'taskName'),
      ),
      commentText: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.commentText, '', 'commentText'),
      ),
      effortIndex: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.effortIndex, 0, 'effortIndex'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'AddTaskOverviewItem',
    request,
    MpTaskOverviewProtocol.AddTaskOverviewItemRequest,
    MpTaskOverviewProtocol.AddTaskOverviewItemResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function createClearTaskOverviewList(
  briosa: BriosaClient,
  input: CreateClearTaskOverviewListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    MpTaskOverviewProtocol.CreateClearTaskOverviewListRequest.fromPartial({
      taskNameFont: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(
          input.taskNameFont,
          Font.default,
          'taskNameFont',
        ),
      ),
      taskCommentFont: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(
          input.taskCommentFont,
          Font.default,
          'taskCommentFont',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'CreateClearTaskOverviewList',
    request,
    MpTaskOverviewProtocol.CreateClearTaskOverviewListRequest,
    MpTaskOverviewProtocol.CreateClearTaskOverviewListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCurrentTask(
  briosa: BriosaClient,
  input: SetCurrentTaskInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.SetCurrentTaskRequest.fromPartial({
    taskIndex: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.taskIndex, 0, 'taskIndex'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetCurrentTask',
    request,
    MpTaskOverviewProtocol.SetCurrentTaskRequest,
    MpTaskOverviewProtocol.SetCurrentTaskResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setOverviewImage(
  briosa: BriosaClient,
  input: SetOverviewImageInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.SetOverviewImageRequest.fromPartial({
    imagePath: toWireOperationValue(
      getOperationValueSchema('fileReference'),
      requireOperationInput(input.imagePath, 'imagePath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetOverviewImage',
    request,
    MpTaskOverviewProtocol.SetOverviewImageRequest,
    MpTaskOverviewProtocol.SetOverviewImageResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setOverviewTitle(
  briosa: BriosaClient,
  input: SetOverviewTitleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.SetOverviewTitleRequest.fromPartial({
    overviewTitle: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.overviewTitle, '', 'overviewTitle'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetOverviewTitle',
    request,
    MpTaskOverviewProtocol.SetOverviewTitleRequest,
    MpTaskOverviewProtocol.SetOverviewTitleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTaskItemComment(
  briosa: BriosaClient,
  input: SetTaskItemCommentInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.SetTaskItemCommentRequest.fromPartial({
    taskIndex: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.taskIndex, 0, 'taskIndex'),
    ),
    taskComment: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.taskComment, '', 'taskComment'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetTaskItemComment',
    request,
    MpTaskOverviewProtocol.SetTaskItemCommentRequest,
    MpTaskOverviewProtocol.SetTaskItemCommentResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTaskItemCompletionValues(
  briosa: BriosaClient,
  input: SetTaskItemCompletionValuesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    MpTaskOverviewProtocol.SetTaskItemCompletionValuesRequest.fromPartial({
      taskIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.taskIndex, 0, 'taskIndex'),
      ),
      incrementsCompleted: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.incrementsCompleted,
          0,
          'incrementsCompleted',
        ),
      ),
      totalIncrements: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.totalIncrements, 0, 'totalIncrements'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetTaskItemCompletionValues',
    request,
    MpTaskOverviewProtocol.SetTaskItemCompletionValuesRequest,
    MpTaskOverviewProtocol.SetTaskItemCompletionValuesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTaskItemName(
  briosa: BriosaClient,
  input: SetTaskItemNameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = MpTaskOverviewProtocol.SetTaskItemNameRequest.fromPartial({
    taskItemIndex: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.taskItemIndex, 0, 'taskItemIndex'),
    ),
    taskName: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.taskName, '', 'taskName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'SetTaskItemName',
    request,
    MpTaskOverviewProtocol.SetTaskItemNameRequest,
    MpTaskOverviewProtocol.SetTaskItemNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showProgressForTaskItem(
  briosa: BriosaClient,
  input: ShowProgressForTaskItemInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    MpTaskOverviewProtocol.ShowProgressForTaskItemRequest.fromPartial({
      taskIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.taskIndex, 0, 'taskIndex'),
      ),
      showProgress: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showProgress, false, 'showProgress'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'ShowProgressForTaskItem',
    request,
    MpTaskOverviewProtocol.ShowProgressForTaskItemRequest,
    MpTaskOverviewProtocol.ShowProgressForTaskItemResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showTaskOverviewList(
  briosa: BriosaClient,
  input: ShowTaskOverviewListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    MpTaskOverviewProtocol.ShowTaskOverviewListRequest.fromPartial({
      show: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.show, false, 'show'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'MpTaskOverview',
    'ShowTaskOverviewList',
    request,
    MpTaskOverviewProtocol.ShowTaskOverviewListRequest,
    MpTaskOverviewProtocol.ShowTaskOverviewListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function askForDouble(
  briosa: BriosaClient,
  input: AskForDoubleInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ProcessFlowOperationsProtocol.AskForDoubleRequest.fromPartial(
    {
      questionToAsk: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.questionToAsk, '', 'questionToAsk'),
      ),
      initialValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.initialValue, 0, 'initialValue'),
      ),
      enforceMinMaxValues: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.enforceMinMaxValues,
          false,
          'enforceMinMaxValues',
        ),
      ),
      minValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.minValue, 0, 'minValue'),
      ),
      maxValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.maxValue, 0, 'maxValue'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForDouble',
    request,
    ProcessFlowOperationsProtocol.AskForDoubleRequest,
    ProcessFlowOperationsProtocol.AskForDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['answer', operationScalarSchemas.number, 'answer']],
  );
  return mapped as number;
}

export async function askForInteger(
  briosa: BriosaClient,
  input: AskForIntegerInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.AskForIntegerRequest.fromPartial({
      questionToAsk: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.questionToAsk, '', 'questionToAsk'),
      ),
      initialValue: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.initialValue, 0, 'initialValue'),
      ),
      enforceMinMaxValues: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.enforceMinMaxValues,
          false,
          'enforceMinMaxValues',
        ),
      ),
      minValue: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.minValue, 0, 'minValue'),
      ),
      maxValue: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.maxValue, 0, 'maxValue'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForInteger',
    request,
    ProcessFlowOperationsProtocol.AskForIntegerRequest,
    ProcessFlowOperationsProtocol.AskForIntegerResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['answer', operationScalarSchemas.integer, 'answer']],
  );
  return mapped as number;
}

export async function askForPointName(
  briosa: BriosaClient,
  input: AskForPointNameInput,
  options: BriosaCallOptions = {},
): Promise<PointName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.AskForPointNameRequest.fromPartial({
      questionToAsk: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.questionToAsk, '', 'questionToAsk'),
      ),
      initialValue: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.initialValue, 'initialValue'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForPointName',
    request,
    ProcessFlowOperationsProtocol.AskForPointNameRequest,
    ProcessFlowOperationsProtocol.AskForPointNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['answer', getOperationValueSchema('pointName'), 'answer']],
  );
  return mapped as PointName;
}

export async function askForString(
  briosa: BriosaClient,
  input: AskForStringInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ProcessFlowOperationsProtocol.AskForStringRequest.fromPartial(
    {
      questionToAsk: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.questionToAsk, '', 'questionToAsk'),
      ),
      passwordEntry: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.passwordEntry, false, 'passwordEntry'),
      ),
      initialAnswer: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.initialAnswer, '', 'initialAnswer'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForString',
    request,
    ProcessFlowOperationsProtocol.AskForStringRequest,
    ProcessFlowOperationsProtocol.AskForStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['answer', operationScalarSchemas.string, 'answer']],
  );
  return mapped as string;
}

export async function askForStringPullDownVersion(
  briosa: BriosaClient,
  input: AskForStringPullDownVersionInput,
  options: BriosaCallOptions = {},
): Promise<AskForStringPullDownVersionResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.AskForStringPullDownVersionRequest.fromPartial(
      {
        questionOrStatement: toWireOperationValue(
          repeatedOperationValue(operationScalarSchemas.string),
          requireOperationInput(
            input.questionOrStatement,
            'questionOrStatement',
          ),
        ),
        possibleAnswers: toWireOperationValue(
          repeatedOperationValue(operationScalarSchemas.string),
          requireOperationInput(input.possibleAnswers, 'possibleAnswers'),
        ),
        font: toWireOperationValue(
          getOperationValueSchema('font'),
          resolveOperationDefault(input.font, Font.default, 'font'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForStringPullDownVersion',
    request,
    ProcessFlowOperationsProtocol.AskForStringPullDownVersionRequest,
    ProcessFlowOperationsProtocol.AskForStringPullDownVersionResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['answer', operationScalarSchemas.string, 'answer'],
      ['answerIndex', operationScalarSchemas.integer, 'answerIndex'],
    ],
  );
  return mapped as AskForStringPullDownVersionResult;
}

export async function askForUserDecisionFromImage(
  briosa: BriosaClient,
  input: AskForUserDecisionFromImageInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.AskForUserDecisionFromImageRequest.fromPartial(
      {
        imageFile: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(input.imageFile, 'imageFile'),
        ),
        imageMapXmlFile: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(input.imageMapXmlFile, 'imageMapXmlFile'),
        ),
        windowCaption: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.windowCaption, '', 'windowCaption'),
        ),
        windowWidth0Default: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(
            input.windowWidth0Default,
            0,
            'windowWidth0Default',
          ),
        ),
        windowHeight0Default: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(
            input.windowHeight0Default,
            0,
            'windowHeight0Default',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForUserDecisionFromImage',
    request,
    ProcessFlowOperationsProtocol.AskForUserDecisionFromImageRequest,
    ProcessFlowOperationsProtocol.AskForUserDecisionFromImageResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['userChoice', operationScalarSchemas.string, 'userChoice']],
  );
  return mapped as string;
}

export async function askForUserDecisionFromStrings(
  briosa: BriosaClient,
  input: AskForUserDecisionFromStringsInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.AskForUserDecisionFromStringsRequest.fromPartial(
      {
        questionOrStatement: toWireOperationValue(
          repeatedOperationValue(operationScalarSchemas.string),
          requireOperationInput(
            input.questionOrStatement,
            'questionOrStatement',
          ),
        ),
        font: toWireOperationValue(
          getOperationValueSchema('font'),
          resolveOperationDefault(input.font, Font.default, 'font'),
        ),
        button1TextEmptyToHideButton: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.button1TextEmptyToHideButton,
            '',
            'button1TextEmptyToHideButton',
          ),
        ),
        button2TextEmptyToHideButton: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.button2TextEmptyToHideButton,
            '',
            'button2TextEmptyToHideButton',
          ),
        ),
        button3TextEmptyToHideButton: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.button3TextEmptyToHideButton,
            '',
            'button3TextEmptyToHideButton',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'AskForUserDecisionFromStrings',
    request,
    ProcessFlowOperationsProtocol.AskForUserDecisionFromStringsRequest,
    ProcessFlowOperationsProtocol.AskForUserDecisionFromStringsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['answer', operationScalarSchemas.string, 'answer']],
  );
  return mapped as string;
}

export async function objectExistenceTestCheckOnly(
  briosa: BriosaClient,
  input: ObjectExistenceTestCheckOnlyInput,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ProcessFlowOperationsProtocol.ObjectExistenceTestCheckOnlyRequest.fromPartial(
      {
        objectName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.objectName, 'objectName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ProcessFlowOperations',
    'ObjectExistenceTestCheckOnly',
    request,
    ProcessFlowOperationsProtocol.ObjectExistenceTestCheckOnlyRequest,
    ProcessFlowOperationsProtocol.ObjectExistenceTestCheckOnlyResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['exists', operationScalarSchemas.boolean, 'exists']],
  );
  return mapped as boolean;
}

export async function enableDisableRelationshipsForOptimization(
  briosa: BriosaClient,
  input: EnableDisableRelationshipsForOptimizationInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.EnableDisableRelationshipsForOptimizationRequest.fromPartial(
      {
        relationships: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('collectionItemName')),
          requireOperationInput(input.relationships, 'relationships'),
        ),
        enable: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.enable, false, 'enable'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'EnableDisableRelationshipsForOptimization',
    request,
    RelationshipOperationsProtocol.EnableDisableRelationshipsForOptimizationRequest,
    RelationshipOperationsProtocol.EnableDisableRelationshipsForOptimizationResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function geomRelationshipIgnoreInputPoints(
  briosa: BriosaClient,
  input: GeomRelationshipIgnoreInputPointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GeomRelationshipIgnoreInputPointsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GeomRelationshipIgnoreInputPoints',
    request,
    RelationshipOperationsProtocol.GeomRelationshipIgnoreInputPointsRequest,
    RelationshipOperationsProtocol.GeomRelationshipIgnoreInputPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function geomRelationshipReuseIgnoredInputPoints(
  briosa: BriosaClient,
  input: GeomRelationshipReuseIgnoredInputPointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GeomRelationshipReuseIgnoredInputPointsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GeomRelationshipReuseIgnoredInputPoints',
    request,
    RelationshipOperationsProtocol.GeomRelationshipReuseIgnoredInputPointsRequest,
    RelationshipOperationsProtocol.GeomRelationshipReuseIgnoredInputPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getGeomRelationshipAutoVectors(
  briosa: BriosaClient,
  input: GetGeomRelationshipAutoVectorsInput,
  options: BriosaCallOptions = {},
): Promise<GetGeomRelationshipAutoVectorsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipAutoVectorsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipAutoVectors',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipAutoVectorsRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipAutoVectorsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'autoVectorsNominalAvnEnabled',
        operationScalarSchemas.boolean,
        'autoVectorsNominalAvnEnabled',
      ],
      [
        'autoVectorsNominalAvnName',
        getOperationValueSchema('collectionObjectName'),
        'autoVectorsNominalAvnName',
      ],
      [
        'autoVectorsFitAvfEnabled',
        operationScalarSchemas.boolean,
        'autoVectorsFitAvfEnabled',
      ],
      [
        'autoVectorsFitAvfName',
        getOperationValueSchema('collectionObjectName'),
        'autoVectorsFitAvfName',
      ],
      ['pointsType', operationScalarSchemas.string, 'pointsType'],
    ],
  );
  return mapped as GetGeomRelationshipAutoVectorsResult;
}

export async function getGeomRelationshipCardinalPoints(
  briosa: BriosaClient,
  input: GetGeomRelationshipCardinalPointsInput,
  options: BriosaCallOptions = {},
): Promise<readonly PointName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipCardinalPointsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipCardinalPoints',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipCardinalPointsRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipCardinalPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'cardinalPointNameList',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'cardinalPointNameList',
      ],
    ],
  );
  return mapped as readonly PointName[];
}

export async function getGeomRelationshipCriteria(
  briosa: BriosaClient,
  input: GetGeomRelationshipCriteriaInput,
  options: BriosaCallOptions = {},
): Promise<GetGeomRelationshipCriteriaResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipCriteriaRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        criteria: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.criteria, '', 'criteria'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipCriteria',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipCriteriaRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipCriteriaResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['nominal', operationScalarSchemas.number, 'nominal'],
      ['measured', operationScalarSchemas.number, 'measured'],
      ['delta', operationScalarSchemas.number, 'delta'],
      ['lowTolerance', operationScalarSchemas.number, 'lowTolerance'],
      ['highTolerance', operationScalarSchemas.number, 'highTolerance'],
      [
        'optimizationDeltaWeight',
        operationScalarSchemas.number,
        'optimizationDeltaWeight',
      ],
      [
        'optimizationOutOfToleranceWeight',
        operationScalarSchemas.number,
        'optimizationOutOfToleranceWeight',
      ],
      ['isWithinTolerance', operationScalarSchemas.string, 'isWithinTolerance'],
      ['hasUncertainty', operationScalarSchemas.boolean, 'hasUncertainty'],
      ['uncertainty', operationScalarSchemas.number, 'uncertainty'],
    ],
  );
  return mapped as GetGeomRelationshipCriteriaResult;
}

export async function getGeomRelationshipMeasuredAvgPoint(
  briosa: BriosaClient,
  input: GetGeomRelationshipMeasuredAvgPointInput,
  options: BriosaCallOptions = {},
): Promise<PointName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredAvgPointRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipMeasuredAvgPoint',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredAvgPointRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredAvgPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'measuredAveragePoint',
        getOperationValueSchema('pointName'),
        'measuredAveragePoint',
      ],
    ],
  );
  return mapped as PointName;
}

export async function getGeomRelationshipMeasuredGeometry(
  briosa: BriosaClient,
  input: GetGeomRelationshipMeasuredGeometryInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredGeometryRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipMeasuredGeometry',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredGeometryRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipMeasuredGeometryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'measuredGeometry',
        getOperationValueSchema('collectionObjectName'),
        'measuredGeometry',
      ],
    ],
  );
  return mapped as CollectionObjectName;
}

export async function getGeomRelationshipNominalAvgPoint(
  briosa: BriosaClient,
  input: GetGeomRelationshipNominalAvgPointInput,
  options: BriosaCallOptions = {},
): Promise<PointName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipNominalAvgPointRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipNominalAvgPoint',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipNominalAvgPointRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipNominalAvgPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'nominalAveragePoint',
        getOperationValueSchema('pointName'),
        'nominalAveragePoint',
      ],
    ],
  );
  return mapped as PointName;
}

export async function getGeomRelationshipNominalGeometry(
  briosa: BriosaClient,
  input: GetGeomRelationshipNominalGeometryInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipNominalGeometryRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipNominalGeometry',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipNominalGeometryRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipNominalGeometryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'nominalGeometry',
        getOperationValueSchema('collectionObjectName'),
        'nominalGeometry',
      ],
    ],
  );
  return mapped as CollectionObjectName;
}

export async function getGeomRelationshipPointList(
  briosa: BriosaClient,
  input: GetGeomRelationshipPointListInput,
  options: BriosaCallOptions = {},
): Promise<GetGeomRelationshipPointListResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipPointListRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipPointList',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipPointListRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipPointListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'allPoints',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'allPoints',
      ],
      [
        'usedPoints',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'usedPoints',
      ],
      [
        'ignoredPoints',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'ignoredPoints',
      ],
    ],
  );
  return mapped as GetGeomRelationshipPointListResult;
}

export async function getGeomRelationshipProjectionPlane(
  briosa: BriosaClient,
  input: GetGeomRelationshipProjectionPlaneInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetGeomRelationshipProjectionPlaneRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetGeomRelationshipProjectionPlane',
    request,
    RelationshipOperationsProtocol.GetGeomRelationshipProjectionPlaneRequest,
    RelationshipOperationsProtocol.GetGeomRelationshipProjectionPlaneResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'projectionPlaneName',
        getOperationValueSchema('collectionObjectName'),
        'projectionPlaneName',
      ],
    ],
  );
  return mapped as CollectionObjectName;
}

export async function getPipeRelationshipCutStatus(
  briosa: BriosaClient,
  input: GetPipeRelationshipCutStatusInput,
  options: BriosaCallOptions = {},
): Promise<GetPipeRelationshipCutStatusResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetPipeRelationshipCutStatusRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetPipeRelationshipCutStatus',
    request,
    RelationshipOperationsProtocol.GetPipeRelationshipCutStatusRequest,
    RelationshipOperationsProtocol.GetPipeRelationshipCutStatusResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'pipe1CutAvailable',
        operationScalarSchemas.boolean,
        'pipe1CutAvailable',
      ],
      ['pipe1CutActive', operationScalarSchemas.boolean, 'pipe1CutActive'],
      [
        'pipe2CutAvailable',
        operationScalarSchemas.boolean,
        'pipe2CutAvailable',
      ],
      ['pipe2CutActive', operationScalarSchemas.boolean, 'pipe2CutActive'],
    ],
  );
  return mapped as GetPipeRelationshipCutStatusResult;
}

export async function getPipeRelationshipProperties(
  briosa: BriosaClient,
  input: GetPipeRelationshipPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetPipeRelationshipPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetPipeRelationshipPropertiesRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetPipeRelationshipProperties',
    request,
    RelationshipOperationsProtocol.GetPipeRelationshipPropertiesRequest,
    RelationshipOperationsProtocol.GetPipeRelationshipPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'pipe1ObjectName',
        getOperationValueSchema('collectionObjectName'),
        'pipe1ObjectName',
      ],
      [
        'pipe1InnerDiameter',
        operationScalarSchemas.number,
        'pipe1InnerDiameter',
      ],
      [
        'pipe1OuterDiameter',
        operationScalarSchemas.number,
        'pipe1OuterDiameter',
      ],
      ['pipe1CutBegin', operationScalarSchemas.number, 'pipe1CutBegin'],
      ['pipe1CutEnd', operationScalarSchemas.number, 'pipe1CutEnd'],
      [
        'pipe2ObjectName',
        getOperationValueSchema('collectionObjectName'),
        'pipe2ObjectName',
      ],
      [
        'pipe2InnerDiameter',
        operationScalarSchemas.number,
        'pipe2InnerDiameter',
      ],
      [
        'pipe2OuterDiameter',
        operationScalarSchemas.number,
        'pipe2OuterDiameter',
      ],
      ['pipe2CutBegin', operationScalarSchemas.number, 'pipe2CutBegin'],
      ['pipe2CutEnd', operationScalarSchemas.number, 'pipe2CutEnd'],
    ],
  );
  return mapped as GetPipeRelationshipPropertiesResult;
}

export async function getPipeRelationshipWeights(
  briosa: BriosaClient,
  input: GetPipeRelationshipWeightsInput,
  options: BriosaCallOptions = {},
): Promise<GetPipeRelationshipWeightsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetPipeRelationshipWeightsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetPipeRelationshipWeights',
    request,
    RelationshipOperationsProtocol.GetPipeRelationshipWeightsRequest,
    RelationshipOperationsProtocol.GetPipeRelationshipWeightsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['overallWeight', operationScalarSchemas.number, 'overallWeight'],
      ['axisOffset', operationScalarSchemas.number, 'axisOffset'],
      ['axisAlignment', operationScalarSchemas.number, 'axisAlignment'],
      ['centerPull', operationScalarSchemas.number, 'centerPull'],
      [
        'outOfMaterialWeight',
        operationScalarSchemas.number,
        'outOfMaterialWeight',
      ],
      [
        'outOfMaterialStaticOffset',
        operationScalarSchemas.number,
        'outOfMaterialStaticOffset',
      ],
      [
        'constrainRegionAtOd',
        operationScalarSchemas.boolean,
        'constrainRegionAtOd',
      ],
      [
        'constrainIdOdOverlap',
        operationScalarSchemas.boolean,
        'constrainIdOdOverlap',
      ],
    ],
  );
  return mapped as GetPipeRelationshipWeightsResult;
}

export async function getRelationshipFitConstraintsScalarType(
  briosa: BriosaClient,
  input: GetRelationshipFitConstraintsScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipFitConstraintsScalarTypeResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipFitConstraintsScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipFitConstraintsScalarType',
    request,
    RelationshipOperationsProtocol.GetRelationshipFitConstraintsScalarTypeRequest,
    RelationshipOperationsProtocol.GetRelationshipFitConstraintsScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['useHighTolerance', operationScalarSchemas.boolean, 'useHighTolerance'],
      ['highTolerance', operationScalarSchemas.number, 'highTolerance'],
      ['useLowTolerance', operationScalarSchemas.boolean, 'useLowTolerance'],
      ['lowTolerance', operationScalarSchemas.number, 'lowTolerance'],
      [
        'fitConstraintOptions',
        getOperationValueSchema('fitConstraintScalarOptions'),
        'fitConstraintOptions',
      ],
    ],
  );
  return mapped as GetRelationshipFitConstraintsScalarTypeResult;
}

export async function getRelationshipOutlierRejectionScalarType(
  briosa: BriosaClient,
  input: GetRelationshipOutlierRejectionScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipOutlierRejectionScalarTypeResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipOutlierRejectionScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipOutlierRejectionScalarType',
    request,
    RelationshipOperationsProtocol.GetRelationshipOutlierRejectionScalarTypeRequest,
    RelationshipOperationsProtocol.GetRelationshipOutlierRejectionScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['useHighLimit', operationScalarSchemas.boolean, 'useHighLimit'],
      ['highLimit', operationScalarSchemas.number, 'highLimit'],
      ['useLowLimit', operationScalarSchemas.boolean, 'useLowLimit'],
      ['lowLimit', operationScalarSchemas.number, 'lowLimit'],
    ],
  );
  return mapped as GetRelationshipOutlierRejectionScalarTypeResult;
}

export async function getRelationshipProjectionOptions(
  briosa: BriosaClient,
  input: GetRelationshipProjectionOptionsInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipProjectionOptionsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipProjectionOptionsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipProjectionOptions',
    request,
    RelationshipOperationsProtocol.GetRelationshipProjectionOptionsRequest,
    RelationshipOperationsProtocol.GetRelationshipProjectionOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'ignoreEdgeProjections',
        operationScalarSchemas.boolean,
        'ignoreEdgeProjections',
      ],
      [
        'probeOffsetsOverrideTargetValues',
        operationScalarSchemas.boolean,
        'probeOffsetsOverrideTargetValues',
      ],
      [
        'probeOffsetsOverrideValue',
        operationScalarSchemas.number,
        'probeOffsetsOverrideValue',
      ],
      ['addExtraMaterial', operationScalarSchemas.boolean, 'addExtraMaterial'],
      [
        'extraMaterialThickness',
        operationScalarSchemas.number,
        'extraMaterialThickness',
      ],
    ],
  );
  return mapped as GetRelationshipProjectionOptionsResult;
}

export async function getRelationshipReportingFrame(
  briosa: BriosaClient,
  input: GetRelationshipReportingFrameInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipReportingFrameRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipReportingFrame',
    request,
    RelationshipOperationsProtocol.GetRelationshipReportingFrameRequest,
    RelationshipOperationsProtocol.GetRelationshipReportingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'reportingFrame',
        getOperationValueSchema('collectionObjectName'),
        'reportingFrame',
      ],
    ],
  );
  return mapped as CollectionObjectName;
}

export async function getRelationshipSubSamplingOptions(
  briosa: BriosaClient,
  input: GetRelationshipSubSamplingOptionsInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipSubSamplingOptionsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipSubSamplingOptionsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipSubSamplingOptions',
    request,
    RelationshipOperationsProtocol.GetRelationshipSubSamplingOptionsRequest,
    RelationshipOperationsProtocol.GetRelationshipSubSamplingOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['useEveryIthPoint', operationScalarSchemas.boolean, 'useEveryIthPoint'],
      ['iValue', operationScalarSchemas.integer, 'iValue'],
      [
        'useNoMoreThanNPoints',
        operationScalarSchemas.boolean,
        'useNoMoreThanNPoints',
      ],
      ['nValue', operationScalarSchemas.integer, 'nValue'],
    ],
  );
  return mapped as GetRelationshipSubSamplingOptionsResult;
}

export async function getRelationshipToleranceScalarType(
  briosa: BriosaClient,
  input: GetRelationshipToleranceScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipToleranceScalarTypeResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipToleranceScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipToleranceScalarType',
    request,
    RelationshipOperationsProtocol.GetRelationshipToleranceScalarTypeRequest,
    RelationshipOperationsProtocol.GetRelationshipToleranceScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['useHighTolerance', operationScalarSchemas.boolean, 'useHighTolerance'],
      ['highTolerance', operationScalarSchemas.number, 'highTolerance'],
      ['useLowTolerance', operationScalarSchemas.boolean, 'useLowTolerance'],
      ['lowTolerance', operationScalarSchemas.number, 'lowTolerance'],
      [
        'toleranceOptions',
        getOperationValueSchema('toleranceScalarOptions'),
        'toleranceOptions',
      ],
    ],
  );
  return mapped as GetRelationshipToleranceScalarTypeResult;
}

export async function getRelationshipToleranceVectorType(
  briosa: BriosaClient,
  input: GetRelationshipToleranceVectorTypeInput,
  options: BriosaCallOptions = {},
): Promise<GetRelationshipToleranceVectorTypeResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipToleranceVectorTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipToleranceVectorType',
    request,
    RelationshipOperationsProtocol.GetRelationshipToleranceVectorTypeRequest,
    RelationshipOperationsProtocol.GetRelationshipToleranceVectorTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'useHighXTolerance',
        operationScalarSchemas.boolean,
        'useHighXTolerance',
      ],
      ['highXTolerance', operationScalarSchemas.number, 'highXTolerance'],
      [
        'useHighYTolerance',
        operationScalarSchemas.boolean,
        'useHighYTolerance',
      ],
      ['highYTolerance', operationScalarSchemas.number, 'highYTolerance'],
      [
        'useHighZTolerance',
        operationScalarSchemas.boolean,
        'useHighZTolerance',
      ],
      ['highZTolerance', operationScalarSchemas.number, 'highZTolerance'],
      [
        'useHighMagTolerance',
        operationScalarSchemas.boolean,
        'useHighMagTolerance',
      ],
      ['highMagTolerance', operationScalarSchemas.number, 'highMagTolerance'],
      ['useLowXTolerance', operationScalarSchemas.boolean, 'useLowXTolerance'],
      ['lowXTolerance', operationScalarSchemas.number, 'lowXTolerance'],
      ['useLowYTolerance', operationScalarSchemas.boolean, 'useLowYTolerance'],
      ['lowYTolerance', operationScalarSchemas.number, 'lowYTolerance'],
      ['useLowZTolerance', operationScalarSchemas.boolean, 'useLowZTolerance'],
      ['lowZTolerance', operationScalarSchemas.number, 'lowZTolerance'],
      [
        'useLowMagTolerance',
        operationScalarSchemas.boolean,
        'useLowMagTolerance',
      ],
      ['lowMagTolerance', operationScalarSchemas.number, 'lowMagTolerance'],
      [
        'vectorTolerance',
        getOperationValueSchema('toleranceVectorOptions'),
        'vectorTolerance',
      ],
    ],
  );
  return mapped as GetRelationshipToleranceVectorTypeResult;
}

export async function getRelationshipType(
  briosa: BriosaClient,
  input: GetRelationshipTypeInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipTypeRequest.fromPartial({
      relationshipName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.relationshipName, 'relationshipName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipType',
    request,
    RelationshipOperationsProtocol.GetRelationshipTypeRequest,
    RelationshipOperationsProtocol.GetRelationshipTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['relationshipType', operationScalarSchemas.string, 'relationshipType']],
  );
  return mapped as string;
}

export async function getRelationshipWeighting(
  briosa: BriosaClient,
  input: GetRelationshipWeightingInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.GetRelationshipWeightingRequest.fromPartial({
      relationshipName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.relationshipName, 'relationshipName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'GetRelationshipWeighting',
    request,
    RelationshipOperationsProtocol.GetRelationshipWeightingRequest,
    RelationshipOperationsProtocol.GetRelationshipWeightingResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['weight', operationScalarSchemas.number, 'weight']],
  );
  return mapped as number;
}

export async function makePipeFittingRelationship(
  briosa: BriosaClient,
  input: MakePipeFittingRelationshipInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.MakePipeFittingRelationshipRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        pipe1ObjectName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pipe1ObjectName, 'pipe1ObjectName'),
        ),
        pipe2ObjectName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pipe2ObjectName, 'pipe2ObjectName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'MakePipeFittingRelationship',
    request,
    RelationshipOperationsProtocol.MakePipeFittingRelationshipRequest,
    RelationshipOperationsProtocol.MakePipeFittingRelationshipResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makePipeRelationshipCut(
  briosa: BriosaClient,
  input: MakePipeRelationshipCutInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.MakePipeRelationshipCutRequest.fromPartial({
      relationshipName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.relationshipName, 'relationshipName'),
      ),
      pipe1MakeCut: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.pipe1MakeCut, true, 'pipe1MakeCut'),
      ),
      pipe1CreateFrame: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.pipe1CreateFrame,
          false,
          'pipe1CreateFrame',
        ),
      ),
      pipe1FrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pipe1FrameName, 'pipe1FrameName'),
      ),
      pipe2MakeCut: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.pipe2MakeCut, true, 'pipe2MakeCut'),
      ),
      pipe2CreateFrame: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.pipe2CreateFrame,
          false,
          'pipe2CreateFrame',
        ),
      ),
      pipe2FrameName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pipe2FrameName, 'pipe2FrameName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'MakePipeRelationshipCut',
    request,
    RelationshipOperationsProtocol.MakePipeRelationshipCutRequest,
    RelationshipOperationsProtocol.MakePipeRelationshipCutResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function pipeRelationshipForceCutToFrame(
  briosa: BriosaClient,
  input: PipeRelationshipForceCutToFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.PipeRelationshipForceCutToFrameRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        pipe1ForceCutToFrame: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.pipe1ForceCutToFrame,
            true,
            'pipe1ForceCutToFrame',
          ),
        ),
        pipe1FrameName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pipe1FrameName, 'pipe1FrameName'),
        ),
        pipe2ForceCutToFrame: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.pipe2ForceCutToFrame,
            true,
            'pipe2ForceCutToFrame',
          ),
        ),
        pipe2FrameName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.pipe2FrameName, 'pipe2FrameName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'PipeRelationshipForceCutToFrame',
    request,
    RelationshipOperationsProtocol.PipeRelationshipForceCutToFrameRequest,
    RelationshipOperationsProtocol.PipeRelationshipForceCutToFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipAutoMeasureNominalFeature(
  briosa: BriosaClient,
  input: SetGeomRelationshipAutoMeasureNominalFeatureInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipAutoMeasureNominalFeatureRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        trapCloudsFalseGeometry: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.trapCloudsFalseGeometry,
            true,
            'trapCloudsFalseGeometry',
          ),
        ),
        instrumentId: toWireOperationValue(
          getOperationValueSchema('collectionInstrumentId'),
          requireOperationInput(input.instrumentId, 'instrumentId'),
        ),
        measurementMode: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.measurementMode, '', 'measurementMode'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipAutoMeasureNominalFeature',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipAutoMeasureNominalFeatureRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipAutoMeasureNominalFeatureResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipAutoVectorsNominalAvn(
  briosa: BriosaClient,
  input: SetGeomRelationshipAutoVectorsNominalAvnInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipAutoVectorsNominalAvnRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        createAutoVectorsAvn: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.createAutoVectorsAvn,
            false,
            'createAutoVectorsAvn',
          ),
        ),
        pointsType: toWireOperationValue(
          getOperationValueSchema('pointFilterInputType'),
          resolveOperationDefault(
            input.pointsType,
            PointFilterInputType.cardinalPoints,
            'pointsType',
          ),
        ),
        useVectorGroupCustomPrefix: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.useVectorGroupCustomPrefix,
            false,
            'useVectorGroupCustomPrefix',
          ),
        ),
        vectorGroupCustomPrefix: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.vectorGroupCustomPrefix,
            '',
            'vectorGroupCustomPrefix',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipAutoVectorsNominalAvn',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipAutoVectorsNominalAvnRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipAutoVectorsNominalAvnResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipCardinalPoints(
  briosa: BriosaClient,
  input: SetGeomRelationshipCardinalPointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipCardinalPointsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        createCardinalPtsWhenFitting: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.createCardinalPtsWhenFitting,
            true,
            'createCardinalPtsWhenFitting',
          ),
        ),
        prefixCardinalPtsNameWithRelName: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.prefixCardinalPtsNameWithRelName,
            true,
            'prefixCardinalPtsNameWithRelName',
          ),
        ),
        cardinalPtsGroupName: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.cardinalPtsGroupName,
            'GR-Cardinal Pts',
            'cardinalPtsGroupName',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipCardinalPoints',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipCardinalPointsRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipCardinalPointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipCriteria(
  briosa: BriosaClient,
  input: SetGeomRelationshipCriteriaInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipCriteriaRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        criteria: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.criteria, '', 'criteria'),
        ),
        showInReport: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.showInReport, true, 'showInReport'),
        ),
        toleranceOptions: toWireOperationValue(
          getOperationValueSchema('toleranceScalarOptions'),
          resolveOperationDefault(
            input.toleranceOptions,
            ToleranceScalarOptions.default,
            'toleranceOptions',
          ),
        ),
        optimizationDeltaWeight: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.optimizationDeltaWeight,
            0,
            'optimizationDeltaWeight',
          ),
        ),
        optimizationOutOfToleranceWeight: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.optimizationOutOfToleranceWeight,
            0,
            'optimizationOutOfToleranceWeight',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipCriteria',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipCriteriaRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipCriteriaResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipMeasuredGeometry(
  briosa: BriosaClient,
  input: SetGeomRelationshipMeasuredGeometryInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipMeasuredGeometryRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        measuredGeometry: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.measuredGeometry, 'measuredGeometry'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipMeasuredGeometry',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipMeasuredGeometryRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipMeasuredGeometryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipNominalAvgPoint(
  briosa: BriosaClient,
  input: SetGeomRelationshipNominalAvgPointInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipNominalAvgPointRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        compareToNominal: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.compareToNominal,
            true,
            'compareToNominal',
          ),
        ),
        nominalAveragePoint: toWireOperationValue(
          getOperationValueSchema('pointName'),
          requireOperationInput(
            input.nominalAveragePoint,
            'nominalAveragePoint',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipNominalAvgPoint',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipNominalAvgPointRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipNominalAvgPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipNominalGeometry(
  briosa: BriosaClient,
  input: SetGeomRelationshipNominalGeometryInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipNominalGeometryRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        compareToNominal: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.compareToNominal,
            true,
            'compareToNominal',
          ),
        ),
        nominalGeometry: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.nominalGeometry, 'nominalGeometry'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipNominalGeometry',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipNominalGeometryRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipNominalGeometryResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setGeomRelationshipProjectionPlane(
  briosa: BriosaClient,
  input: SetGeomRelationshipProjectionPlaneInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetGeomRelationshipProjectionPlaneRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        projectToPlane: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.projectToPlane, true, 'projectToPlane'),
        ),
        projectionPlaneName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(
            input.projectionPlaneName,
            'projectionPlaneName',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetGeomRelationshipProjectionPlane',
    request,
    RelationshipOperationsProtocol.SetGeomRelationshipProjectionPlaneRequest,
    RelationshipOperationsProtocol.SetGeomRelationshipProjectionPlaneResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setObjectToObjectDirectionRelationshipFitConstraints(
  briosa: BriosaClient,
  input: SetObjectToObjectDirectionRelationshipFitConstraintsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetObjectToObjectDirectionRelationshipFitConstraintsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        angleBetweenVectorsFitConstraints: toWireOperationValue(
          getOperationValueSchema('fitConstraintScalarOptions'),
          resolveOperationDefault(
            input.angleBetweenVectorsFitConstraints,
            FitConstraintScalarOptions.default,
            'angleBetweenVectorsFitConstraints',
          ),
        ),
        mutualPerpendicularLengthFitConstraints: toWireOperationValue(
          getOperationValueSchema('fitConstraintScalarOptions'),
          resolveOperationDefault(
            input.mutualPerpendicularLengthFitConstraints,
            FitConstraintScalarOptions.default,
            'mutualPerpendicularLengthFitConstraints',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetObjectToObjectDirectionRelationshipFitConstraints',
    request,
    RelationshipOperationsProtocol.SetObjectToObjectDirectionRelationshipFitConstraintsRequest,
    RelationshipOperationsProtocol.SetObjectToObjectDirectionRelationshipFitConstraintsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPipeRelationshipSegmentProperties(
  briosa: BriosaClient,
  input: SetPipeRelationshipSegmentPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetPipeRelationshipSegmentPropertiesRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        pipe1InnerDiameter: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.pipe1InnerDiameter,
            0,
            'pipe1InnerDiameter',
          ),
        ),
        pipe1OuterDiameter: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.pipe1OuterDiameter,
            0,
            'pipe1OuterDiameter',
          ),
        ),
        pipe1CutBegin: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.pipe1CutBegin, 0, 'pipe1CutBegin'),
        ),
        pipe1CutEnd: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.pipe1CutEnd, 0, 'pipe1CutEnd'),
        ),
        pipe2InnerDiameter: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.pipe2InnerDiameter,
            0,
            'pipe2InnerDiameter',
          ),
        ),
        pipe2OuterDiameter: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.pipe2OuterDiameter,
            0,
            'pipe2OuterDiameter',
          ),
        ),
        pipe2CutBegin: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.pipe2CutBegin, 0, 'pipe2CutBegin'),
        ),
        pipe2CutEnd: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.pipe2CutEnd, 0, 'pipe2CutEnd'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetPipeRelationshipSegmentProperties',
    request,
    RelationshipOperationsProtocol.SetPipeRelationshipSegmentPropertiesRequest,
    RelationshipOperationsProtocol.SetPipeRelationshipSegmentPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPipeRelationshipWeights(
  briosa: BriosaClient,
  input: SetPipeRelationshipWeightsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetPipeRelationshipWeightsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        overallWeight: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.overallWeight, 1, 'overallWeight'),
        ),
        axisOffset: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.axisOffset, 2, 'axisOffset'),
        ),
        axisAlignment: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.axisAlignment, 1, 'axisAlignment'),
        ),
        centerPull: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(input.centerPull, 0.1, 'centerPull'),
        ),
        outOfMaterialWeight: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.outOfMaterialWeight,
            10,
            'outOfMaterialWeight',
          ),
        ),
        outOfMaterialOffset: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.outOfMaterialOffset,
            1,
            'outOfMaterialOffset',
          ),
        ),
        constrainRegionAtOd: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.constrainRegionAtOd,
            false,
            'constrainRegionAtOd',
          ),
        ),
        constrainIdOdOverlap: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.constrainIdOdOverlap,
            false,
            'constrainIdOdOverlap',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetPipeRelationshipWeights',
    request,
    RelationshipOperationsProtocol.SetPipeRelationshipWeightsRequest,
    RelationshipOperationsProtocol.SetPipeRelationshipWeightsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipAutoVectorsFitAvf(
  briosa: BriosaClient,
  input: SetRelationshipAutoVectorsFitAvfInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsFitAvfRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        createAutoVectorsAvf: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.createAutoVectorsAvf,
            false,
            'createAutoVectorsAvf',
          ),
        ),
        useVectorGroupCustomPrefix: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.useVectorGroupCustomPrefix,
            false,
            'useVectorGroupCustomPrefix',
          ),
        ),
        vectorGroupCustomPrefix: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.vectorGroupCustomPrefix,
            '',
            'vectorGroupCustomPrefix',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipAutoVectorsFitAvf',
    request,
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsFitAvfRequest,
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsFitAvfResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipAutoVectorsGroupDefaultPrefix(
  briosa: BriosaClient,
  input: SetRelationshipAutoVectorsGroupDefaultPrefixInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsGroupDefaultPrefixRequest.fromPartial(
      {
        geomRelAvnVgDefaultPrefix: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.geomRelAvnVgDefaultPrefix,
            'GR-AVN-',
            'geomRelAvnVgDefaultPrefix',
          ),
        ),
        geomRelAvfVgDefaultPrefix: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.geomRelAvfVgDefaultPrefix,
            'GR-AVF-',
            'geomRelAvfVgDefaultPrefix',
          ),
        ),
        nonGeomRelVgDefaultPrefix: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(
            input.nonGeomRelVgDefaultPrefix,
            'Auto Vectors: ',
            'nonGeomRelVgDefaultPrefix',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipAutoVectorsGroupDefaultPrefix',
    request,
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsGroupDefaultPrefixRequest,
    RelationshipOperationsProtocol.SetRelationshipAutoVectorsGroupDefaultPrefixResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipDesiredMeasCount(
  briosa: BriosaClient,
  input: SetRelationshipDesiredMeasCountInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipDesiredMeasCountRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        desiredMeasurementCount: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(
            input.desiredMeasurementCount,
            0,
            'desiredMeasurementCount',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipDesiredMeasCount',
    request,
    RelationshipOperationsProtocol.SetRelationshipDesiredMeasCountRequest,
    RelationshipOperationsProtocol.SetRelationshipDesiredMeasCountResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipDormantStatus(
  briosa: BriosaClient,
  input: SetRelationshipDormantStatusInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipDormantStatusRequest.fromPartial(
      {
        relationships: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('collectionItemName')),
          requireOperationInput(input.relationships, 'relationships'),
        ),
        dormantStatus: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.dormantStatus, false, 'dormantStatus'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipDormantStatus',
    request,
    RelationshipOperationsProtocol.SetRelationshipDormantStatusRequest,
    RelationshipOperationsProtocol.SetRelationshipDormantStatusResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipFitConstraintsScalarType(
  briosa: BriosaClient,
  input: SetRelationshipFitConstraintsScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipFitConstraintsScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        fitConstraintOptions: toWireOperationValue(
          getOperationValueSchema('fitConstraintScalarOptions'),
          resolveOperationDefault(
            input.fitConstraintOptions,
            FitConstraintScalarOptions.default,
            'fitConstraintOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipFitConstraintsScalarType',
    request,
    RelationshipOperationsProtocol.SetRelationshipFitConstraintsScalarTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipFitConstraintsScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipOrientationFitConstraintsVectorType(
  briosa: BriosaClient,
  input: SetRelationshipOrientationFitConstraintsVectorTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipOrientationFitConstraintsVectorTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        orientationVectorConstraint: toWireOperationValue(
          getOperationValueSchema('toleranceVectorOptions'),
          requireOperationInput(
            input.orientationVectorConstraint,
            'orientationVectorConstraint',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipOrientationFitConstraintsVectorType',
    request,
    RelationshipOperationsProtocol.SetRelationshipOrientationFitConstraintsVectorTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipOrientationFitConstraintsVectorTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipOutlierRejectionScalarType(
  briosa: BriosaClient,
  input: SetRelationshipOutlierRejectionScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipOutlierRejectionScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipOutlierRejectionScalarType',
    request,
    RelationshipOperationsProtocol.SetRelationshipOutlierRejectionScalarTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipOutlierRejectionScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipPositionFitConstraintsVectorType(
  briosa: BriosaClient,
  input: SetRelationshipPositionFitConstraintsVectorTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipPositionFitConstraintsVectorTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        positionVectorConstraint: toWireOperationValue(
          getOperationValueSchema('toleranceVectorOptions'),
          requireOperationInput(
            input.positionVectorConstraint,
            'positionVectorConstraint',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipPositionFitConstraintsVectorType',
    request,
    RelationshipOperationsProtocol.SetRelationshipPositionFitConstraintsVectorTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipPositionFitConstraintsVectorTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipProjectionOptions(
  briosa: BriosaClient,
  input: SetRelationshipProjectionOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipProjectionOptionsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        projectionOptions: toWireOperationValue(
          getOperationValueSchema('projectionOptions'),
          resolveOperationDefault(
            input.projectionOptions,
            ProjectionOptions.default,
            'projectionOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipProjectionOptions',
    request,
    RelationshipOperationsProtocol.SetRelationshipProjectionOptionsRequest,
    RelationshipOperationsProtocol.SetRelationshipProjectionOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipReportingFrame(
  briosa: BriosaClient,
  input: SetRelationshipReportingFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipReportingFrameRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        reportingFrame: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.reportingFrame, 'reportingFrame'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipReportingFrame',
    request,
    RelationshipOperationsProtocol.SetRelationshipReportingFrameRequest,
    RelationshipOperationsProtocol.SetRelationshipReportingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipSigmoidalGapFitConstraints(
  briosa: BriosaClient,
  input: SetRelationshipSigmoidalGapFitConstraintsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipSigmoidalGapFitConstraintsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        useSigmoidalGapConstraints: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.useSigmoidalGapConstraints,
            true,
            'useSigmoidalGapConstraints',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipSigmoidalGapFitConstraints',
    request,
    RelationshipOperationsProtocol.SetRelationshipSigmoidalGapFitConstraintsRequest,
    RelationshipOperationsProtocol.SetRelationshipSigmoidalGapFitConstraintsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipSubSamplingOptions(
  briosa: BriosaClient,
  input: SetRelationshipSubSamplingOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipSubSamplingOptionsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        useEveryIthPoint: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.useEveryIthPoint,
            false,
            'useEveryIthPoint',
          ),
        ),
        iValue: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.iValue, 20, 'iValue'),
        ),
        useNoMoreThanNPoints: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.useNoMoreThanNPoints,
            true,
            'useNoMoreThanNPoints',
          ),
        ),
        nValue: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.nValue, 10000, 'nValue'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipSubSamplingOptions',
    request,
    RelationshipOperationsProtocol.SetRelationshipSubSamplingOptionsRequest,
    RelationshipOperationsProtocol.SetRelationshipSubSamplingOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipToleranceScalarType(
  briosa: BriosaClient,
  input: SetRelationshipToleranceScalarTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipToleranceScalarTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        toleranceOptions: toWireOperationValue(
          getOperationValueSchema('toleranceScalarOptions'),
          resolveOperationDefault(
            input.toleranceOptions,
            ToleranceScalarOptions.default,
            'toleranceOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipToleranceScalarType',
    request,
    RelationshipOperationsProtocol.SetRelationshipToleranceScalarTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipToleranceScalarTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipToleranceVectorType(
  briosa: BriosaClient,
  input: SetRelationshipToleranceVectorTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipToleranceVectorTypeRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        vectorTolerance: toWireOperationValue(
          getOperationValueSchema('toleranceVectorOptions'),
          requireOperationInput(input.vectorTolerance, 'vectorTolerance'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipToleranceVectorType',
    request,
    RelationshipOperationsProtocol.SetRelationshipToleranceVectorTypeRequest,
    RelationshipOperationsProtocol.SetRelationshipToleranceVectorTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipVoxelCloudDisplay(
  briosa: BriosaClient,
  input: SetRelationshipVoxelCloudDisplayInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipVoxelCloudDisplayRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        enableVoxelCloudDisplay: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.enableVoxelCloudDisplay,
            true,
            'enableVoxelCloudDisplay',
          ),
        ),
        voxelSize10Autodetect: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.voxelSize10Autodetect,
            -1,
            'voxelSize10Autodetect',
          ),
        ),
        minPtsCountPerVoxel: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(
            input.minPtsCountPerVoxel,
            3,
            'minPtsCountPerVoxel',
          ),
        ),
        voxelRenderingDiameter10Fast: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.voxelRenderingDiameter10Fast,
            125,
            'voxelRenderingDiameter10Fast',
          ),
        ),
        surfaceAnalysisMode: toWireOperationValue(
          getOperationValueSchema('surfaceAnalysisMode'),
          resolveOperationDefault(
            input.surfaceAnalysisMode,
            SurfaceAnalysisMode.relationship,
            'surfaceAnalysisMode',
          ),
        ),
        colorizationOptions: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptions,
            ColorizationOptions.default,
            'colorizationOptions',
          ),
        ),
        showColorBarInView: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.showColorBarInView,
            false,
            'showColorBarInView',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipVoxelCloudDisplay',
    request,
    RelationshipOperationsProtocol.SetRelationshipVoxelCloudDisplayRequest,
    RelationshipOperationsProtocol.SetRelationshipVoxelCloudDisplayResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipWeighting(
  briosa: BriosaClient,
  input: SetRelationshipWeightingInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipWeightingRequest.fromPartial({
      relationshipName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.relationshipName, 'relationshipName'),
      ),
      weight: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.weight, 0, 'weight'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipWeighting',
    request,
    RelationshipOperationsProtocol.SetRelationshipWeightingRequest,
    RelationshipOperationsProtocol.SetRelationshipWeightingResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipWeightsNormalized(
  briosa: BriosaClient,
  input: SetRelationshipWeightsNormalizedInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    RelationshipOperationsProtocol.SetRelationshipWeightsNormalizedRequest.fromPartial(
      {
        collectionName: toWireOperationValue(
          getOperationValueSchema('collectionName'),
          requireOperationInput(input.collectionName, 'collectionName'),
        ),
        pickWeightingMode: toWireOperationValue(
          getOperationValueSchema('relWeightingMode'),
          resolveOperationDefault(
            input.pickWeightingMode,
            RelWeightingMode.normalizeEquationCount,
            'pickWeightingMode',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'RelationshipOperations',
    'SetRelationshipWeightsNormalized',
    request,
    RelationshipOperationsProtocol.SetRelationshipWeightsNormalizedRequest,
    RelationshipOperationsProtocol.SetRelationshipWeightsNormalizedResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addChartsToReportBar(
  briosa: BriosaClient,
  input: AddChartsToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddChartsToReportBarRequest.fromPartial({
      charts: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.charts, 'charts'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddChartsToReportBar',
    request,
    ReportingOperationsProtocol.AddChartsToReportBarRequest,
    ReportingOperationsProtocol.AddChartsToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addCustomTableToSaReport(
  briosa: BriosaClient,
  input: AddCustomTableToSaReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddCustomTableToSaReportRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
      showReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showReport, false, 'showReport'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddCustomTableToSaReport',
    request,
    ReportingOperationsProtocol.AddCustomTableToSaReportRequest,
    ReportingOperationsProtocol.AddCustomTableToSaReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addCustomTablesToReportBar(
  briosa: BriosaClient,
  input: AddCustomTablesToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddCustomTablesToReportBarRequest.fromPartial({
      customTablesToReport: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(
          input.customTablesToReport,
          'customTablesToReport',
        ),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddCustomTablesToReportBar',
    request,
    ReportingOperationsProtocol.AddCustomTablesToReportBarRequest,
    ReportingOperationsProtocol.AddCustomTablesToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addDatumsToReportBar(
  briosa: BriosaClient,
  input: AddDatumsToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddDatumsToReportBarRequest.fromPartial({
      datums: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.datums, 'datums'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddDatumsToReportBar',
    request,
    ReportingOperationsProtocol.AddDatumsToReportBarRequest,
    ReportingOperationsProtocol.AddDatumsToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addEventsToReportBar(
  briosa: BriosaClient,
  input: AddEventsToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddEventsToReportBarRequest.fromPartial({
      events: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.events, 'events'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddEventsToReportBar',
    request,
    ReportingOperationsProtocol.AddEventsToReportBarRequest,
    ReportingOperationsProtocol.AddEventsToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addFeatureChecksToReportBar(
  briosa: BriosaClient,
  input: AddFeatureChecksToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddFeatureChecksToReportBarRequest.fromPartial({
      featureChecks: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.featureChecks, 'featureChecks'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddFeatureChecksToReportBar',
    request,
    ReportingOperationsProtocol.AddFeatureChecksToReportBarRequest,
    ReportingOperationsProtocol.AddFeatureChecksToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addItemToSaReportAtLocation(
  briosa: BriosaClient,
  input: AddItemToSaReportAtLocationInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddItemToSaReportAtLocationRequest.fromPartial({
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
      itemName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.itemName, 'itemName'),
      ),
      pageNumber: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.pageNumber, 0, 'pageNumber'),
      ),
      horizontalLocation: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.horizontalLocation,
          1,
          'horizontalLocation',
        ),
      ),
      verticalLocation: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.verticalLocation, 1, 'verticalLocation'),
      ),
      showReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showReport, false, 'showReport'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddItemToSaReportAtLocation',
    request,
    ReportingOperationsProtocol.AddItemToSaReportAtLocationRequest,
    ReportingOperationsProtocol.AddItemToSaReportAtLocationResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addObjectsToReportBar(
  briosa: BriosaClient,
  input: AddObjectsToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddObjectsToReportBarRequest.fromPartial({
      objects: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objects, 'objects'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, true, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddObjectsToReportBar',
    request,
    ReportingOperationsProtocol.AddObjectsToReportBarRequest,
    ReportingOperationsProtocol.AddObjectsToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addPicturesToReportBar(
  briosa: BriosaClient,
  input: AddPicturesToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddPicturesToReportBarRequest.fromPartial({
      pictures: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.pictures, 'pictures'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddPicturesToReportBar',
    request,
    ReportingOperationsProtocol.AddPicturesToReportBarRequest,
    ReportingOperationsProtocol.AddPicturesToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addRelationshipsToReportBar(
  briosa: BriosaClient,
  input: AddRelationshipsToReportBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AddRelationshipsToReportBarRequest.fromPartial({
      relationships: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.relationships, 'relationships'),
      ),
      clearExisting: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.clearExisting, false, 'clearExisting'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AddRelationshipsToReportBar',
    request,
    ReportingOperationsProtocol.AddRelationshipsToReportBarRequest,
    ReportingOperationsProtocol.AddRelationshipsToReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function appendItemsToSaReport(
  briosa: BriosaClient,
  input: AppendItemsToSaReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.AppendItemsToSaReportRequest.fromPartial({
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
      itemsToReport: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.itemsToReport, 'itemsToReport'),
      ),
      showReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showReport, false, 'showReport'),
      ),
      beginOnNewPage: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.beginOnNewPage, false, 'beginOnNewPage'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'AppendItemsToSaReport',
    request,
    ReportingOperationsProtocol.AppendItemsToSaReportRequest,
    ReportingOperationsProtocol.AppendItemsToSaReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function captureCurrentView(
  briosa: BriosaClient,
  input: CaptureCurrentViewInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.CaptureCurrentViewRequest.fromPartial({
      pictureName: toWireOperationValue(
        getOperationValueSchema('collectionItemName'),
        requireOperationInput(input.pictureName, 'pictureName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CaptureCurrentView',
    request,
    ReportingOperationsProtocol.CaptureCurrentViewRequest,
    ReportingOperationsProtocol.CaptureCurrentViewResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function captureScreenToFileBmpJpgPngGifTiff(
  briosa: BriosaClient,
  input: CaptureScreenToFileBmpJpgPngGifTiffInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.CaptureScreenToFileBmpJpgPngGifTiffRequest.fromPartial(
      {
        fileToSaveTo: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(input.fileToSaveTo, 'fileToSaveTo'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CaptureScreenToFileBmpJpgPngGifTiff',
    request,
    ReportingOperationsProtocol.CaptureScreenToFileBmpJpgPngGifTiffRequest,
    ReportingOperationsProtocol.CaptureScreenToFileBmpJpgPngGifTiffResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function clearCustomTable(
  briosa: BriosaClient,
  input: ClearCustomTableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.ClearCustomTableRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'ClearCustomTable',
    request,
    ReportingOperationsProtocol.ClearCustomTableRequest,
    ReportingOperationsProtocol.ClearCustomTableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function closeAllReports(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    ReportingOperationsProtocol.CloseAllReportsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CloseAllReports',
    request,
    ReportingOperationsProtocol.CloseAllReportsRequest,
    ReportingOperationsProtocol.CloseAllReportsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function closeHtmlDisplayBoard(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    ReportingOperationsProtocol.CloseHtmlDisplayBoardRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CloseHtmlDisplayBoard',
    request,
    ReportingOperationsProtocol.CloseHtmlDisplayBoardRequest,
    ReportingOperationsProtocol.CloseHtmlDisplayBoardResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function combineSaReports(
  briosa: BriosaClient,
  input: CombineSaReportsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.CombineSaReportsRequest.fromPartial({
      saReportsToCombine: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.saReportsToCombine, 'saReportsToCombine'),
      ),
      outputSaReportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.outputSaReportName, 'outputSaReportName'),
      ),
      showReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showReport, false, 'showReport'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CombineSaReports',
    request,
    ReportingOperationsProtocol.CombineSaReportsRequest,
    ReportingOperationsProtocol.CombineSaReportsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function createChartFromVectorGroup(
  briosa: BriosaClient,
  input: CreateChartFromVectorGroupInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.CreateChartFromVectorGroupRequest.fromPartial({
      newChartName: toWireOperationValue(
        getOperationValueSchema('chartName'),
        requireOperationInput(input.newChartName, 'newChartName'),
      ),
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      chartType: toWireOperationValue(
        getOperationValueSchema('chartType'),
        requireOperationInput(input.chartType, 'chartType'),
      ),
      dataSetToChart: toWireOperationValue(
        getOperationValueSchema('datasetType'),
        requireOperationInput(input.dataSetToChart, 'dataSetToChart'),
      ),
      auxDataSetToChart: toWireOperationValue(
        getOperationValueSchema('datasetType'),
        requireOperationInput(input.auxDataSetToChart, 'auxDataSetToChart'),
      ),
      templateChartNameOptional: toWireOperationValue(
        getOperationValueSchema('chartName'),
        requireOperationInput(
          input.templateChartNameOptional,
          'templateChartNameOptional',
        ),
      ),
      showInterface: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showInterface, false, 'showInterface'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'CreateChartFromVectorGroup',
    request,
    ReportingOperationsProtocol.CreateChartFromVectorGroupRequest,
    ReportingOperationsProtocol.CreateChartFromVectorGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function defineReportTemplate(
  briosa: BriosaClient,
  input: DefineReportTemplateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.DefineReportTemplateRequest.fromPartial({
      reportTemplateName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportTemplateName, 'reportTemplateName'),
      ),
      title: toWireOperationValue(
        repeatedOperationValue(operationScalarSchemas.string),
        requireOperationInput(input.title, 'title'),
      ),
      graphicalViewOptions: toWireOperationValue(
        getOperationValueSchema('reportViewOptions'),
        requireOperationInput(
          input.graphicalViewOptions,
          'graphicalViewOptions',
        ),
      ),
      itemsToReport: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.itemsToReport, 'itemsToReport'),
      ),
      relationshipsToReport: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(
          input.relationshipsToReport,
          'relationshipsToReport',
        ),
      ),
      eventsToReport: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.eventsToReport, 'eventsToReport'),
      ),
      reportOutputOptions: toWireOperationValue(
        getOperationValueSchema('reportOutputOptions'),
        resolveOperationDefault(
          input.reportOutputOptions,
          ReportOutputOptions.default,
          'reportOutputOptions',
        ),
      ),
      reportPageSettingsSaReportOnly: toWireOperationValue(
        getOperationValueSchema('reportPageSettings'),
        resolveOperationDefault(
          input.reportPageSettingsSaReportOnly,
          ReportPageSettings.portrait,
          'reportPageSettingsSaReportOnly',
        ),
      ),
      generateNow: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.generateNow, false, 'generateNow'),
      ),
      showGeneratedReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showGeneratedReport,
          false,
          'showGeneratedReport',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DefineReportTemplate',
    request,
    ReportingOperationsProtocol.DefineReportTemplateRequest,
    ReportingOperationsProtocol.DefineReportTemplateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteChart(
  briosa: BriosaClient,
  input: DeleteChartInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.DeleteChartRequest.fromPartial({
    chartName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.chartName, 'chartName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeleteChart',
    request,
    ReportingOperationsProtocol.DeleteChartRequest,
    ReportingOperationsProtocol.DeleteChartResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteCustomTable(
  briosa: BriosaClient,
  input: DeleteCustomTableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.DeleteCustomTableRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeleteCustomTable',
    request,
    ReportingOperationsProtocol.DeleteCustomTableRequest,
    ReportingOperationsProtocol.DeleteCustomTableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deletePicture(
  briosa: BriosaClient,
  input: DeletePictureInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.DeletePictureRequest.fromPartial({
    pictureName: toWireOperationValue(
      getOperationValueSchema('collectionItemName'),
      requireOperationInput(input.pictureName, 'pictureName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeletePicture',
    request,
    ReportingOperationsProtocol.DeletePictureRequest,
    ReportingOperationsProtocol.DeletePictureResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteSaDoc(
  briosa: BriosaClient,
  input: DeleteSaDocInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.DeleteSaDocRequest.fromPartial({
    docName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.docName, 'docName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeleteSaDoc',
    request,
    ReportingOperationsProtocol.DeleteSaDocRequest,
    ReportingOperationsProtocol.DeleteSaDocResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteSaReport(
  briosa: BriosaClient,
  input: DeleteSaReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.DeleteSaReportRequest.fromPartial(
    {
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeleteSaReport',
    request,
    ReportingOperationsProtocol.DeleteSaReportRequest,
    ReportingOperationsProtocol.DeleteSaReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteSaReportTemplate(
  briosa: BriosaClient,
  input: DeleteSaReportTemplateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.DeleteSaReportTemplateRequest.fromPartial({
      reportTemplateName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportTemplateName, 'reportTemplateName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'DeleteSaReportTemplate',
    request,
    ReportingOperationsProtocol.DeleteSaReportTemplateRequest,
    ReportingOperationsProtocol.DeleteSaReportTemplateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function generateQuickReportFromTabOrder(
  briosa: BriosaClient,
  input: GenerateQuickReportFromTabOrderInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GenerateQuickReportFromTabOrderRequest.fromPartial(
      {
        reportOutputOptions: toWireOperationValue(
          getOperationValueSchema('reportOutputOptions'),
          resolveOperationDefault(
            input.reportOutputOptions,
            ReportOutputOptions.default,
            'reportOutputOptions',
          ),
        ),
        openReport: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.openReport, false, 'openReport'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GenerateQuickReportFromTabOrder',
    request,
    ReportingOperationsProtocol.GenerateQuickReportFromTabOrderRequest,
    ReportingOperationsProtocol.GenerateQuickReportFromTabOrderResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function generateStandardHtmlReport(
  briosa: BriosaClient,
  input: GenerateStandardHtmlReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GenerateStandardHtmlReportRequest.fromPartial({
      htmlOutputFile: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.htmlOutputFile, 'htmlOutputFile'),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 0, 'decimalPrecision'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GenerateStandardHtmlReport',
    request,
    ReportingOperationsProtocol.GenerateStandardHtmlReportRequest,
    ReportingOperationsProtocol.GenerateStandardHtmlReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function generateUpdateTemplatedReport(
  briosa: BriosaClient,
  input: GenerateUpdateTemplatedReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GenerateUpdateTemplatedReportRequest.fromPartial(
      {
        reportTemplate: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.reportTemplate, 'reportTemplate'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GenerateUpdateTemplatedReport',
    request,
    ReportingOperationsProtocol.GenerateUpdateTemplatedReportRequest,
    ReportingOperationsProtocol.GenerateUpdateTemplatedReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getCustomTableCellDouble(
  briosa: BriosaClient,
  input: GetCustomTableCellDoubleInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GetCustomTableCellDoubleRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GetCustomTableCellDouble',
    request,
    ReportingOperationsProtocol.GetCustomTableCellDoubleRequest,
    ReportingOperationsProtocol.GetCustomTableCellDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.number, 'value']],
  );
  return mapped as number;
}

export async function getCustomTableCellString(
  briosa: BriosaClient,
  input: GetCustomTableCellStringInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GetCustomTableCellStringRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GetCustomTableCellString',
    request,
    ReportingOperationsProtocol.GetCustomTableCellStringRequest,
    ReportingOperationsProtocol.GetCustomTableCellStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.string, 'value']],
  );
  return mapped as string;
}

export async function getDefinedReportTags(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  const request =
    ReportingOperationsProtocol.GetDefinedReportTagsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GetDefinedReportTags',
    request,
    ReportingOperationsProtocol.GetDefinedReportTagsRequest,
    ReportingOperationsProtocol.GetDefinedReportTagsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'definedTags',
        repeatedOperationValue(operationScalarSchemas.string),
        'definedTags',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function getReportTagValue(
  briosa: BriosaClient,
  input: GetReportTagValueInput,
  options: BriosaCallOptions = {},
): Promise<GetReportTagValueResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.GetReportTagValueRequest.fromPartial({
      tagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.tagName, '', 'tagName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'GetReportTagValue',
    request,
    ReportingOperationsProtocol.GetReportTagValueRequest,
    ReportingOperationsProtocol.GetReportTagValueResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['tagValueAsString', operationScalarSchemas.string, 'tagValueAsString'],
      [
        'tagValueAsInteger',
        operationScalarSchemas.integer,
        'tagValueAsInteger',
      ],
      ['tagValueAsDouble', operationScalarSchemas.number, 'tagValueAsDouble'],
    ],
  );
  return mapped as GetReportTagValueResult;
}

export async function htmlDisplayBoard(
  briosa: BriosaClient,
  input: HtmlDisplayBoardInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.HtmlDisplayBoardRequest.fromPartial({
      inputHtmlFile: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.inputHtmlFile, 'inputHtmlFile'),
      ),
      showBoard: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showBoard, true, 'showBoard'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'HtmlDisplayBoard',
    request,
    ReportingOperationsProtocol.HtmlDisplayBoardRequest,
    ReportingOperationsProtocol.HtmlDisplayBoardResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeCustomTable(
  briosa: BriosaClient,
  input: MakeCustomTableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.MakeCustomTableRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 6, 'decimalPrecision'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'MakeCustomTable',
    request,
    ReportingOperationsProtocol.MakeCustomTableRequest,
    ReportingOperationsProtocol.MakeCustomTableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeNewSaReport(
  briosa: BriosaClient,
  input: MakeNewSaReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.MakeNewSaReportRequest.fromPartial({
      newSaReportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.newSaReportName, 'newSaReportName'),
      ),
      saReportTemplateOptional: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.saReportTemplateOptional,
          'saReportTemplateOptional',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'MakeNewSaReport',
    request,
    ReportingOperationsProtocol.MakeNewSaReportRequest,
    ReportingOperationsProtocol.MakeNewSaReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function makeUtilityChart(
  briosa: BriosaClient,
  input: MakeUtilityChartInput,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.MakeUtilityChartRequest.fromPartial({
      asciiFilePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.asciiFilePath, 'asciiFilePath'),
      ),
      chartTitleOverride: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.chartTitleOverride,
          '',
          'chartTitleOverride',
        ),
      ),
      outputPictureName: toWireOperationValue(
        getOperationValueSchema('collectionItemName'),
        requireOperationInput(input.outputPictureName, 'outputPictureName'),
      ),
      showChartDialog: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showChartDialog,
          false,
          'showChartDialog',
        ),
      ),
      plotAdditionalXyValue: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.plotAdditionalXyValue,
          false,
          'plotAdditionalXyValue',
        ),
      ),
      xValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.xValue, 0, 'xValue'),
      ),
      yValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.yValue, 0, 'yValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'MakeUtilityChart',
    request,
    ReportingOperationsProtocol.MakeUtilityChartRequest,
    ReportingOperationsProtocol.MakeUtilityChartResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['isPointInside', operationScalarSchemas.boolean, 'isPointInside']],
  );
  return mapped as boolean;
}

export async function notifyUserDouble(
  briosa: BriosaClient,
  input: NotifyUserDoubleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.NotifyUserDoubleRequest.fromPartial({
      leadingText: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.leadingText, '', 'leadingText'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
      reportedValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.reportedValue, 0, 'reportedValue'),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, 0, 'decimalPrecision'),
      ),
      displayTimeout: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.displayTimeout, 0, 'displayTimeout'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'NotifyUserDouble',
    request,
    ReportingOperationsProtocol.NotifyUserDoubleRequest,
    ReportingOperationsProtocol.NotifyUserDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function notifyUserHtml(
  briosa: BriosaClient,
  input: NotifyUserHtmlInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.NotifyUserHtmlRequest.fromPartial(
    {
      htmlFile: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.htmlFile, 'htmlFile'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'NotifyUserHtml',
    request,
    ReportingOperationsProtocol.NotifyUserHtmlRequest,
    ReportingOperationsProtocol.NotifyUserHtmlResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function notifyUserInteger(
  briosa: BriosaClient,
  input: NotifyUserIntegerInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.NotifyUserIntegerRequest.fromPartial({
      leadingText: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.leadingText, '', 'leadingText'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
      reportedValue: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.reportedValue, 0, 'reportedValue'),
      ),
      displayTimeout: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.displayTimeout, 0, 'displayTimeout'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'NotifyUserInteger',
    request,
    ReportingOperationsProtocol.NotifyUserIntegerRequest,
    ReportingOperationsProtocol.NotifyUserIntegerResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function notifyUserTextArray(
  briosa: BriosaClient,
  input: NotifyUserTextArrayInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.NotifyUserTextArrayRequest.fromPartial({
      notificationText: toWireOperationValue(
        repeatedOperationValue(operationScalarSchemas.string),
        requireOperationInput(input.notificationText, 'notificationText'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
      autoExpandToFitText: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.autoExpandToFitText,
          false,
          'autoExpandToFitText',
        ),
      ),
      displayTimeout: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.displayTimeout, 0, 'displayTimeout'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'NotifyUserTextArray',
    request,
    ReportingOperationsProtocol.NotifyUserTextArrayRequest,
    ReportingOperationsProtocol.NotifyUserTextArrayResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function outputSaReportToExcel(
  briosa: BriosaClient,
  input: OutputSaReportToExcelInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.OutputSaReportToExcelRequest.fromPartial({
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
      fileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.fileName, 'fileName'),
      ),
      showFile: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showFile, false, 'showFile'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'OutputSaReportToExcel',
    request,
    ReportingOperationsProtocol.OutputSaReportToExcelRequest,
    ReportingOperationsProtocol.OutputSaReportToExcelResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function outputSaReportToPdf(
  briosa: BriosaClient,
  input: OutputSaReportToPdfInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.OutputSaReportToPdfRequest.fromPartial({
      reportName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.reportName, 'reportName'),
      ),
      fileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.fileName, 'fileName'),
      ),
      showPdf: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showPdf, false, 'showPdf'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'OutputSaReportToPdf',
    request,
    ReportingOperationsProtocol.OutputSaReportToPdfRequest,
    ReportingOperationsProtocol.OutputSaReportToPdfResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function quickReport(
  briosa: BriosaClient,
  input: QuickReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.QuickReportRequest.fromPartial({
    itemName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.itemName, 'itemName'),
    ),
    reportNameOptional: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.reportNameOptional,
        '',
        'reportNameOptional',
      ),
    ),
    openReport: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.openReport, false, 'openReport'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'QuickReport',
    request,
    ReportingOperationsProtocol.QuickReportRequest,
    ReportingOperationsProtocol.QuickReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function refreshCalloutViewsInSaReport(
  briosa: BriosaClient,
  input: RefreshCalloutViewsInSaReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.RefreshCalloutViewsInSaReportRequest.fromPartial(
      {
        reportName: toWireOperationValue(
          getOperationValueSchema('collectionItemName'),
          requireOperationInput(input.reportName, 'reportName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'RefreshCalloutViewsInSaReport',
    request,
    ReportingOperationsProtocol.RefreshCalloutViewsInSaReportRequest,
    ReportingOperationsProtocol.RefreshCalloutViewsInSaReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function refreshReportBar(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    ReportingOperationsProtocol.RefreshReportBarRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'RefreshReportBar',
    request,
    ReportingOperationsProtocol.RefreshReportBarRequest,
    ReportingOperationsProtocol.RefreshReportBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function removeReportTag(
  briosa: BriosaClient,
  input: RemoveReportTagInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.RemoveReportTagRequest.fromPartial({
      tagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.tagName, '', 'tagName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'RemoveReportTag',
    request,
    ReportingOperationsProtocol.RemoveReportTagRequest,
    ReportingOperationsProtocol.RemoveReportTagResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function renamePicture(
  briosa: BriosaClient,
  input: RenamePictureInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ReportingOperationsProtocol.RenamePictureRequest.fromPartial({
    originalPictureName: toWireOperationValue(
      getOperationValueSchema('collectionItemName'),
      requireOperationInput(input.originalPictureName, 'originalPictureName'),
    ),
    newPictureName: toWireOperationValue(
      getOperationValueSchema('collectionItemName'),
      requireOperationInput(input.newPictureName, 'newPictureName'),
    ),
    overwriteIfExists: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.overwriteIfExists,
        false,
        'overwriteIfExists',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'RenamePicture',
    request,
    ReportingOperationsProtocol.RenamePictureRequest,
    ReportingOperationsProtocol.RenamePictureResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function saveChartToJPegFile(
  briosa: BriosaClient,
  input: SaveChartToJPegFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SaveChartToJPegFileRequest.fromPartial({
      chartToSave: toWireOperationValue(
        getOperationValueSchema('chartName'),
        requireOperationInput(input.chartToSave, 'chartToSave'),
      ),
      fileToSaveTo: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.fileToSaveTo, 'fileToSaveTo'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SaveChartToJPegFile',
    request,
    ReportingOperationsProtocol.SaveChartToJPegFileRequest,
    ReportingOperationsProtocol.SaveChartToJPegFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function saveCurrentViewBmpJpgPngGifTiff(
  briosa: BriosaClient,
  input: SaveCurrentViewBmpJpgPngGifTiffInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SaveCurrentViewBmpJpgPngGifTiffRequest.fromPartial(
      {
        fileToSaveTo: toWireOperationValue(
          getOperationValueSchema('fileReference'),
          requireOperationInput(input.fileToSaveTo, 'fileToSaveTo'),
        ),
        renderScaleFactor10UsesWindowSize: toWireOperationValue(
          operationScalarSchemas.number,
          resolveOperationDefault(
            input.renderScaleFactor10UsesWindowSize,
            1,
            'renderScaleFactor10UsesWindowSize',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SaveCurrentViewBmpJpgPngGifTiff',
    request,
    ReportingOperationsProtocol.SaveCurrentViewBmpJpgPngGifTiffRequest,
    ReportingOperationsProtocol.SaveCurrentViewBmpJpgPngGifTiffResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableCellColor(
  briosa: BriosaClient,
  input: SetCustomTableCellColorInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableCellColorRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
      foregroundColorName: toWireOperationValue(
        getOperationValueSchema('color'),
        requireOperationInput(input.foregroundColorName, 'foregroundColorName'),
      ),
      backgroundColorName: toWireOperationValue(
        getOperationValueSchema('color'),
        requireOperationInput(input.backgroundColorName, 'backgroundColorName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableCellColor',
    request,
    ReportingOperationsProtocol.SetCustomTableCellColorRequest,
    ReportingOperationsProtocol.SetCustomTableCellColorResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableCellDouble(
  briosa: BriosaClient,
  input: SetCustomTableCellDoubleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableCellDoubleRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.value, 0, 'value'),
      ),
      span: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.span, 1, 'span'),
      ),
      decimalPrecision: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.decimalPrecision, -1, 'decimalPrecision'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableCellDouble',
    request,
    ReportingOperationsProtocol.SetCustomTableCellDoubleRequest,
    ReportingOperationsProtocol.SetCustomTableCellDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableCellFont(
  briosa: BriosaClient,
  input: SetCustomTableCellFontInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableCellFontRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableCellFont',
    request,
    ReportingOperationsProtocol.SetCustomTableCellFontRequest,
    ReportingOperationsProtocol.SetCustomTableCellFontResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableCellString(
  briosa: BriosaClient,
  input: SetCustomTableCellStringInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableCellStringRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.value, '', 'value'),
      ),
      span: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.span, 1, 'span'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableCellString',
    request,
    ReportingOperationsProtocol.SetCustomTableCellStringRequest,
    ReportingOperationsProtocol.SetCustomTableCellStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableHeaderCell(
  briosa: BriosaClient,
  input: SetCustomTableHeaderCellInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableHeaderCellRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      column: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.column, 0, 'column'),
      ),
      headerText: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.headerText, '', 'headerText'),
      ),
      span: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.span, 1, 'span'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableHeaderCell',
    request,
    ReportingOperationsProtocol.SetCustomTableHeaderCellRequest,
    ReportingOperationsProtocol.SetCustomTableHeaderCellResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableHeaderRow(
  briosa: BriosaClient,
  input: SetCustomTableHeaderRowInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableHeaderRowRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      row: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.row, 0, 'row'),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.value, '', 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableHeaderRow',
    request,
    ReportingOperationsProtocol.SetCustomTableHeaderRowRequest,
    ReportingOperationsProtocol.SetCustomTableHeaderRowResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCustomTableTitle(
  briosa: BriosaClient,
  input: SetCustomTableTitleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetCustomTableTitleRequest.fromPartial({
      tableName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.tableName, 'tableName'),
      ),
      titleLine1: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.titleLine1, '', 'titleLine1'),
      ),
      titleLine2: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.titleLine2, '', 'titleLine2'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetCustomTableTitle',
    request,
    ReportingOperationsProtocol.SetCustomTableTitleRequest,
    ReportingOperationsProtocol.SetCustomTableTitleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointGroupReportOptions(
  briosa: BriosaClient,
  input: SetPointGroupReportOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetPointGroupReportOptionsRequest.fromPartial({
      pointGroup: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.pointGroup, 'pointGroup'),
      ),
      coordinateSystem: toWireOperationValue(
        getOperationValueSchema('coordinateSystemType'),
        resolveOperationDefault(
          input.coordinateSystem,
          CoordinateSystemType.cartesian,
          'coordinateSystem',
        ),
      ),
      showXComponent: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showXComponent, true, 'showXComponent'),
      ),
      showYComponent: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showYComponent, true, 'showYComponent'),
      ),
      showZComponent: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showZComponent, true, 'showZComponent'),
      ),
      showOffsets: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showOffsets, false, 'showOffsets'),
      ),
      showUncertainty: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showUncertainty, true, 'showUncertainty'),
      ),
      showNotes: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showNotes, false, 'showNotes'),
      ),
      showMeasurements: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showMeasurements,
          false,
          'showMeasurements',
        ),
      ),
      showMeasurementDetails: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showMeasurementDetails,
          false,
          'showMeasurementDetails',
        ),
      ),
      showPointingErrorWorstAngle: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showPointingErrorWorstAngle,
          false,
          'showPointingErrorWorstAngle',
        ),
      ),
      sortByPointNames: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.sortByPointNames,
          true,
          'sortByPointNames',
        ),
      ),
      makeDefault: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.makeDefault, false, 'makeDefault'),
      ),
      applyToAll: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.applyToAll, false, 'applyToAll'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetPointGroupReportOptions',
    request,
    ReportingOperationsProtocol.SetPointGroupReportOptionsRequest,
    ReportingOperationsProtocol.SetPointGroupReportOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipReportOptions(
  briosa: BriosaClient,
  input: SetRelationshipReportOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetRelationshipReportOptionsRequest.fromPartial(
      {
        relationshipName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.relationshipName, 'relationshipName'),
        ),
        reportOptions: toWireOperationValue(
          getOperationValueSchema('pointDeltaReportOptions'),
          resolveOperationDefault(
            input.reportOptions,
            PointDeltaReportOptions.default,
            'reportOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetRelationshipReportOptions',
    request,
    ReportingOperationsProtocol.SetRelationshipReportOptionsRequest,
    ReportingOperationsProtocol.SetRelationshipReportOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportBarVisibility(
  briosa: BriosaClient,
  input: SetReportBarVisibilityInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetReportBarVisibilityRequest.fromPartial({
      showReportBar: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.showReportBar, false, 'showReportBar'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetReportBarVisibility',
    request,
    ReportingOperationsProtocol.SetReportBarVisibilityRequest,
    ReportingOperationsProtocol.SetReportBarVisibilityResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportOptionsForObject(
  briosa: BriosaClient,
  input: SetReportOptionsForObjectInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetReportOptionsForObjectRequest.fromPartial({
      object: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.object, 'object'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetReportOptionsForObject',
    request,
    ReportingOperationsProtocol.SetReportOptionsForObjectRequest,
    ReportingOperationsProtocol.SetReportOptionsForObjectResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportTagValueFromDouble(
  briosa: BriosaClient,
  input: SetReportTagValueFromDoubleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetReportTagValueFromDoubleRequest.fromPartial({
      tagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.tagName, '', 'tagName'),
      ),
      tagValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.tagValue, 0, 'tagValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetReportTagValueFromDouble',
    request,
    ReportingOperationsProtocol.SetReportTagValueFromDoubleRequest,
    ReportingOperationsProtocol.SetReportTagValueFromDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportTagValueFromInteger(
  briosa: BriosaClient,
  input: SetReportTagValueFromIntegerInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetReportTagValueFromIntegerRequest.fromPartial(
      {
        tagName: toWireOperationValue(
          operationScalarSchemas.string,
          resolveOperationDefault(input.tagName, '', 'tagName'),
        ),
        tagValue: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.tagValue, 0, 'tagValue'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetReportTagValueFromInteger',
    request,
    ReportingOperationsProtocol.SetReportTagValueFromIntegerRequest,
    ReportingOperationsProtocol.SetReportTagValueFromIntegerResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportTagValueFromString(
  briosa: BriosaClient,
  input: SetReportTagValueFromStringInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetReportTagValueFromStringRequest.fromPartial({
      tagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.tagName, '', 'tagName'),
      ),
      tagValue: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.tagValue, '', 'tagValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetReportTagValueFromString',
    request,
    ReportingOperationsProtocol.SetReportTagValueFromStringRequest,
    ReportingOperationsProtocol.SetReportTagValueFromStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setScaleForPicture(
  briosa: BriosaClient,
  input: SetScaleForPictureInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetScaleForPictureRequest.fromPartial({
      pictureName: toWireOperationValue(
        getOperationValueSchema('collectionItemName'),
        requireOperationInput(input.pictureName, 'pictureName'),
      ),
      scale: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.scale, 100, 'scale'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetScaleForPicture',
    request,
    ReportingOperationsProtocol.SetScaleForPictureRequest,
    ReportingOperationsProtocol.SetScaleForPictureResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setVectorGroupReportOptions(
  briosa: BriosaClient,
  input: SetVectorGroupReportOptionsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ReportingOperationsProtocol.SetVectorGroupReportOptionsRequest.fromPartial({
      vectorGroup: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroup, 'vectorGroup'),
      ),
      reportOptions: toWireOperationValue(
        getOperationValueSchema('pointDeltaReportOptions'),
        resolveOperationDefault(
          input.reportOptions,
          PointDeltaReportOptions.default,
          'reportOptions',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ReportingOperations',
    'SetVectorGroupReportOptions',
    request,
    ReportingOperationsProtocol.SetVectorGroupReportOptionsRequest,
    ReportingOperationsProtocol.SetVectorGroupReportOptionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteScaleBar(
  briosa: BriosaClient,
  input: DeleteScaleBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ScaleBarOperationsProtocol.DeleteScaleBarRequest.fromPartial({
    scaleBarName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.scaleBarName, 'scaleBarName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ScaleBarOperations',
    'DeleteScaleBar',
    request,
    ScaleBarOperationsProtocol.DeleteScaleBarRequest,
    ScaleBarOperationsProtocol.DeleteScaleBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getScaleBarStats(
  briosa: BriosaClient,
  input: GetScaleBarStatsInput,
  options: BriosaCallOptions = {},
): Promise<GetScaleBarStatsResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ScaleBarOperationsProtocol.GetScaleBarStatsRequest.fromPartial({
      scaleBarName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.scaleBarName, 'scaleBarName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ScaleBarOperations',
    'GetScaleBarStats',
    request,
    ScaleBarOperationsProtocol.GetScaleBarStatsRequest,
    ScaleBarOperationsProtocol.GetScaleBarStatsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['nominalLength', operationScalarSchemas.number, 'nominalLength'],
      ['actualLength', operationScalarSchemas.number, 'actualLength'],
      ['deviation', operationScalarSchemas.number, 'deviation'],
    ],
  );
  return mapped as GetScaleBarStatsResult;
}

export async function scaleBarCheck(
  briosa: BriosaClient,
  input: ScaleBarCheckInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ScaleBarOperationsProtocol.ScaleBarCheckRequest.fromPartial({
    scaleBarPointA: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(input.scaleBarPointA, 'scaleBarPointA'),
    ),
    scaleBarPointB: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(input.scaleBarPointB, 'scaleBarPointB'),
    ),
    currentTemperatureF: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(
        input.currentTemperatureF,
        0,
        'currentTemperatureF',
      ),
    ),
    lengthOfBarAt68f: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.lengthOfBarAt68F, 0, 'lengthOfBarAt68F'),
    ),
    materialCtePpmF: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.materialCtePpmF, 0, 'materialCtePpmF'),
    ),
    tolerance: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.tolerance, 0, 'tolerance'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ScaleBarOperations',
    'ScaleBarCheck',
    request,
    ScaleBarOperationsProtocol.ScaleBarCheckRequest,
    ScaleBarOperationsProtocol.ScaleBarCheckResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['deviationAt68f', operationScalarSchemas.number, 'deviationAt68f']],
  );
  return mapped as number;
}

export async function setInwardPositiveNormal(
  briosa: BriosaClient,
  input: SetInwardPositiveNormalInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ScaleBarOperationsProtocol.SetInwardPositiveNormalRequest.fromPartial({
      objectName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.objectName, 'objectName'),
      ),
      inwardPositive: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.inwardPositive, true, 'inwardPositive'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ScaleBarOperations',
    'SetInwardPositiveNormal',
    request,
    ScaleBarOperationsProtocol.SetInwardPositiveNormalRequest,
    ScaleBarOperationsProtocol.SetInwardPositiveNormalResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function closeAllWatchWindows(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    UtilityOperationsProtocol.CloseAllWatchWindowsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'CloseAllWatchWindows',
    request,
    UtilityOperationsProtocol.CloseAllWatchWindowsRequest,
    UtilityOperationsProtocol.CloseAllWatchWindowsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteFolder(
  briosa: BriosaClient,
  input: DeleteFolderInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.DeleteFolderRequest.fromPartial({
    folderPath: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.folderPath, '', 'folderPath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'DeleteFolder',
    request,
    UtilityOperationsProtocol.DeleteFolderRequest,
    UtilityOperationsProtocol.DeleteFolderResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteItems(
  briosa: BriosaClient,
  input: DeleteItemsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.DeleteItemsRequest.fromPartial({
    itemList: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionItemName')),
      requireOperationInput(input.itemList, 'itemList'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'DeleteItems',
    request,
    UtilityOperationsProtocol.DeleteItemsRequest,
    UtilityOperationsProtocol.DeleteItemsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteObjects(
  briosa: BriosaClient,
  input: DeleteObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.DeleteObjectsRequest.fromPartial({
    objectNames: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectNames, 'objectNames'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'DeleteObjects',
    request,
    UtilityOperationsProtocol.DeleteObjectsRequest,
    UtilityOperationsProtocol.DeleteObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getActiveLanguage(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<GetActiveLanguageResult> {
  const request =
    UtilityOperationsProtocol.GetActiveLanguageRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetActiveLanguage',
    request,
    UtilityOperationsProtocol.GetActiveLanguageRequest,
    UtilityOperationsProtocol.GetActiveLanguageResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'languageFileName',
        getOperationValueSchema('fileReference'),
        'languageFileName',
      ],
      ['customLanguage', operationScalarSchemas.boolean, 'customLanguage'],
    ],
  );
  return mapped as GetActiveLanguageResult;
}

export async function getActiveUnits(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<ActiveUnits> {
  const request = UtilityOperationsProtocol.GetActiveUnitsRequest.fromPartial(
    {},
  );
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetActiveUnits',
    request,
    UtilityOperationsProtocol.GetActiveUnitsRequest,
    UtilityOperationsProtocol.GetActiveUnitsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['length', operationScalarSchemas.string, 'length'],
      ['angular', operationScalarSchemas.string, 'angular'],
      ['temperature', operationScalarSchemas.string, 'temperature'],
    ],
  );
  return mapped as ActiveUnits;
}

export async function getAngularRepresentation(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  const request =
    UtilityOperationsProtocol.GetAngularRepresentationRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetAngularRepresentation',
    request,
    UtilityOperationsProtocol.GetAngularRepresentationRequest,
    UtilityOperationsProtocol.GetAngularRepresentationResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value0360False180',
        operationScalarSchemas.boolean,
        'value0360False180',
      ],
    ],
  );
  return mapped as boolean;
}

export async function getCollectionNotes(
  briosa: BriosaClient,
  input: GetCollectionNotesInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetCollectionNotesRequest.fromPartial({
      collection: toWireOperationValue(
        getOperationValueSchema('collectionName'),
        requireOperationInput(input.collection, 'collection'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetCollectionNotes',
    request,
    UtilityOperationsProtocol.GetCollectionNotesRequest,
    UtilityOperationsProtocol.GetCollectionNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['notes', repeatedOperationValue(operationScalarSchemas.string), 'notes']],
  );
  return mapped as readonly string[];
}

export async function getFolderCollections(
  briosa: BriosaClient,
  input: GetFolderCollectionsInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetFolderCollectionsRequest.fromPartial({
      folderPath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.folderPath, '', 'folderPath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetFolderCollections',
    request,
    UtilityOperationsProtocol.GetFolderCollectionsRequest,
    UtilityOperationsProtocol.GetFolderCollectionsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'collectionList',
        repeatedOperationValue(operationScalarSchemas.string),
        'collectionList',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function getFolderNotes(
  briosa: BriosaClient,
  input: GetFolderNotesInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.GetFolderNotesRequest.fromPartial({
    folderPath: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.folderPath, '', 'folderPath'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetFolderNotes',
    request,
    UtilityOperationsProtocol.GetFolderNotesRequest,
    UtilityOperationsProtocol.GetFolderNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['notes', repeatedOperationValue(operationScalarSchemas.string), 'notes']],
  );
  return mapped as readonly string[];
}

export async function getFoldersByWildcard(
  briosa: BriosaClient,
  input: GetFoldersByWildcardInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetFoldersByWildcardRequest.fromPartial({
      searchString: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.searchString, '', 'searchString'),
      ),
      caseSensitiveSearch: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.caseSensitiveSearch,
          true,
          'caseSensitiveSearch',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetFoldersByWildcard',
    request,
    UtilityOperationsProtocol.GetFoldersByWildcardRequest,
    UtilityOperationsProtocol.GetFoldersByWildcardResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'folderList',
        repeatedOperationValue(operationScalarSchemas.string),
        'folderList',
      ],
    ],
  );
  return mapped as readonly string[];
}

export async function getObjectNotes(
  briosa: BriosaClient,
  input: GetObjectNotesInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.GetObjectNotesRequest.fromPartial({
    object: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.object, 'object'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetObjectNotes',
    request,
    UtilityOperationsProtocol.GetObjectNotesRequest,
    UtilityOperationsProtocol.GetObjectNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['notes', repeatedOperationValue(operationScalarSchemas.string), 'notes']],
  );
  return mapped as readonly string[];
}

export async function getOpcDaTagValueDouble(
  briosa: BriosaClient,
  input: GetOpcDaTagValueDoubleInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetOpcDaTagValueDoubleRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetOpcDaTagValueDouble',
    request,
    UtilityOperationsProtocol.GetOpcDaTagValueDoubleRequest,
    UtilityOperationsProtocol.GetOpcDaTagValueDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.number, 'value']],
  );
  return mapped as number;
}

export async function getOpcDaTagValueInteger(
  briosa: BriosaClient,
  input: GetOpcDaTagValueIntegerInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetOpcDaTagValueIntegerRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetOpcDaTagValueInteger',
    request,
    UtilityOperationsProtocol.GetOpcDaTagValueIntegerRequest,
    UtilityOperationsProtocol.GetOpcDaTagValueIntegerResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.integer, 'value']],
  );
  return mapped as number;
}

export async function getOpcDaTagValueString(
  briosa: BriosaClient,
  input: GetOpcDaTagValueStringInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetOpcDaTagValueStringRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetOpcDaTagValueString',
    request,
    UtilityOperationsProtocol.GetOpcDaTagValueStringRequest,
    UtilityOperationsProtocol.GetOpcDaTagValueStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.string, 'value']],
  );
  return mapped as string;
}

export async function getPointNotes(
  briosa: BriosaClient,
  input: GetPointNotesInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.GetPointNotesRequest.fromPartial({
    point: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(input.point, 'point'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetPointNotes',
    request,
    UtilityOperationsProtocol.GetPointNotesRequest,
    UtilityOperationsProtocol.GetPointNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['notes', repeatedOperationValue(operationScalarSchemas.string), 'notes']],
  );
  return mapped as readonly string[];
}

export async function getScreenResolution(
  briosa: BriosaClient,
  input: GetScreenResolutionInput,
  options: BriosaCallOptions = {},
): Promise<GetScreenResolutionResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.GetScreenResolutionRequest.fromPartial({
      display1Primary: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.display1Primary, -1, 'display1Primary'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetScreenResolution',
    request,
    UtilityOperationsProtocol.GetScreenResolutionRequest,
    UtilityOperationsProtocol.GetScreenResolutionResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'integerWindowTopLeftXPosition',
        operationScalarSchemas.integer,
        'integerWindowTopLeftXPosition',
      ],
      [
        'integerWindowTopLeftYPosition',
        operationScalarSchemas.integer,
        'integerWindowTopLeftYPosition',
      ],
      ['integerWidth', operationScalarSchemas.integer, 'integerWidth'],
      ['integerHeight', operationScalarSchemas.integer, 'integerHeight'],
      ['viewWidth', operationScalarSchemas.integer, 'viewWidth'],
      ['viewHeight', operationScalarSchemas.integer, 'viewHeight'],
    ],
  );
  return mapped as GetScreenResolutionResult;
}

export async function getWorkingFrameProperties(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<WorkingFrameProperties> {
  const request =
    UtilityOperationsProtocol.GetWorkingFramePropertiesRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'GetWorkingFrameProperties',
    request,
    UtilityOperationsProtocol.GetWorkingFramePropertiesRequest,
    UtilityOperationsProtocol.GetWorkingFramePropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['frameName', operationScalarSchemas.string, 'frameName'],
      ['collectionName', operationScalarSchemas.string, 'collectionName'],
      [
        'workingFrame',
        getOperationValueSchema('collectionObjectName'),
        'workingFrame',
      ],
    ],
  );
  return mapped as WorkingFrameProperties;
}

export async function incrementPointName(
  briosa: BriosaClient,
  input: IncrementPointNameInput,
  options: BriosaCallOptions = {},
): Promise<PointName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.IncrementPointNameRequest.fromPartial({
      basePointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.basePointName, 'basePointName'),
      ),
      increment: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.increment, 0, 'increment'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'IncrementPointName',
    request,
    UtilityOperationsProtocol.IncrementPointNameRequest,
    UtilityOperationsProtocol.IncrementPointNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'resultantPointName',
        getOperationValueSchema('pointName'),
        'resultantPointName',
      ],
    ],
  );
  return mapped as PointName;
}

export async function lockImportedItems(
  briosa: BriosaClient,
  input: LockImportedItemsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.LockImportedItemsRequest.fromPartial({
      lockItems: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.lockItems, false, 'lockItems'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'LockImportedItems',
    request,
    UtilityOperationsProtocol.LockImportedItemsRequest,
    UtilityOperationsProtocol.LockImportedItemsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function lockUnlockSelectedItems(
  briosa: BriosaClient,
  input: LockUnlockSelectedItemsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.LockUnlockSelectedItemsRequest.fromPartial({
      itemList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.itemList, 'itemList'),
      ),
      instruments: toWireOperationValue(
        repeatedOperationValue(
          getOperationValueSchema('collectionInstrumentId'),
        ),
        requireOperationInput(input.instruments, 'instruments'),
      ),
      lockItems: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.lockItems, false, 'lockItems'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'LockUnlockSelectedItems',
    request,
    UtilityOperationsProtocol.LockUnlockSelectedItemsRequest,
    UtilityOperationsProtocol.LockUnlockSelectedItemsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function lockUnlockTrappingControl(
  briosa: BriosaClient,
  input: LockUnlockTrappingControlInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.LockUnlockTrappingControlRequest.fromPartial({
      relationshipRefList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.relationshipRefList, 'relationshipRefList'),
      ),
      featureCheckRefList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.featureCheckRefList, 'featureCheckRefList'),
      ),
      datumRefList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.datumRefList, 'datumRefList'),
      ),
      lockOutTrapping: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.lockOutTrapping,
          false,
          'lockOutTrapping',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'LockUnlockTrappingControl',
    request,
    UtilityOperationsProtocol.LockUnlockTrappingControlRequest,
    UtilityOperationsProtocol.LockUnlockTrappingControlResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function moveCollectionToFolder(
  briosa: BriosaClient,
  input: MoveCollectionToFolderInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.MoveCollectionToFolderRequest.fromPartial({
      collection: toWireOperationValue(
        getOperationValueSchema('collectionName'),
        requireOperationInput(input.collection, 'collection'),
      ),
      folderPath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.folderPath, '', 'folderPath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'MoveCollectionToFolder',
    request,
    UtilityOperationsProtocol.MoveCollectionToFolderRequest,
    UtilityOperationsProtocol.MoveCollectionToFolderResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function moveFolderToFolder(
  briosa: BriosaClient,
  input: MoveFolderToFolderInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.MoveFolderToFolderRequest.fromPartial({
      sourceFolderPath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.sourceFolderPath, '', 'sourceFolderPath'),
      ),
      destinationFolderPath: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.destinationFolderPath,
          '',
          'destinationFolderPath',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'MoveFolderToFolder',
    request,
    UtilityOperationsProtocol.MoveFolderToFolderRequest,
    UtilityOperationsProtocol.MoveFolderToFolderResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function moveInstrumentsDragGraphically(
  briosa: BriosaClient,
  input: MoveInstrumentsDragGraphicallyInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.MoveInstrumentsDragGraphicallyRequest.fromPartial(
      {
        instruments: toWireOperationValue(
          repeatedOperationValue(
            getOperationValueSchema('collectionInstrumentId'),
          ),
          requireOperationInput(input.instruments, 'instruments'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'MoveInstrumentsDragGraphically',
    request,
    UtilityOperationsProtocol.MoveInstrumentsDragGraphicallyRequest,
    UtilityOperationsProtocol.MoveInstrumentsDragGraphicallyResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function moveObjectsDragGraphically(
  briosa: BriosaClient,
  input: MoveObjectsDragGraphicallyInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.MoveObjectsDragGraphicallyRequest.fromPartial({
      objects: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objects, 'objects'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'MoveObjectsDragGraphically',
    request,
    UtilityOperationsProtocol.MoveObjectsDragGraphicallyRequest,
    UtilityOperationsProtocol.MoveObjectsDragGraphicallyResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function scaleObjects(
  briosa: BriosaClient,
  input: ScaleObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.ScaleObjectsRequest.fromPartial({
    objects: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objects, 'objects'),
    ),
    scaleFactor: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.scaleFactor, 0, 'scaleFactor'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'ScaleObjects',
    request,
    UtilityOperationsProtocol.ScaleObjectsRequest,
    UtilityOperationsProtocol.ScaleObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setActiveCustomLanguage(
  briosa: BriosaClient,
  input: SetActiveCustomLanguageInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetActiveCustomLanguageRequest.fromPartial({
      languageFileName: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.languageFileName, 'languageFileName'),
      ),
      font: toWireOperationValue(
        getOperationValueSchema('font'),
        resolveOperationDefault(input.font, Font.default, 'font'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetActiveCustomLanguage',
    request,
    UtilityOperationsProtocol.SetActiveCustomLanguageRequest,
    UtilityOperationsProtocol.SetActiveCustomLanguageResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setActiveUnits(
  briosa: BriosaClient,
  input: SetActiveUnitsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetActiveUnitsRequest.fromPartial({
    length: toWireOperationValue(
      getOperationValueSchema('distanceUnits'),
      resolveOperationDefault(input.length, DistanceUnits.inches, 'length'),
    ),
    displayInchFractions: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.displayInchFractions,
        false,
        'displayInchFractions',
      ),
    ),
    inchFractionDenominator: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(
        input.inchFractionDenominator,
        16,
        'inchFractionDenominator',
      ),
    ),
    simplifyInchFraction: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.simplifyInchFraction,
        true,
        'simplifyInchFraction',
      ),
    ),
    temperature: toWireOperationValue(
      getOperationValueSchema('temperatureUnits'),
      resolveOperationDefault(
        input.temperature,
        TemperatureUnits.fahrenheit,
        'temperature',
      ),
    ),
    angular: toWireOperationValue(
      getOperationValueSchema('angularUnits'),
      resolveOperationDefault(input.angular, AngularUnits.degrees, 'angular'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetActiveUnits',
    request,
    UtilityOperationsProtocol.SetActiveUnitsRequest,
    UtilityOperationsProtocol.SetActiveUnitsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setAngularRepresentation(
  briosa: BriosaClient,
  input: SetAngularRepresentationInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetAngularRepresentationRequest.fromPartial({
      value0360False180: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.value0360False180,
          false,
          'value0360False180',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetAngularRepresentation',
    request,
    UtilityOperationsProtocol.SetAngularRepresentationRequest,
    UtilityOperationsProtocol.SetAngularRepresentationResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setAutoEventCreation(
  briosa: BriosaClient,
  input: SetAutoEventCreationInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetAutoEventCreationRequest.fromPartial({
      active: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.active, false, 'active'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetAutoEventCreation',
    request,
    UtilityOperationsProtocol.SetAutoEventCreationRequest,
    UtilityOperationsProtocol.SetAutoEventCreationResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setAutomaticBackupState(
  briosa: BriosaClient,
  input: SetAutomaticBackupStateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetAutomaticBackupStateRequest.fromPartial({
      autoJobFileRestorePointsActive: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.autoJobFileRestorePointsActive,
          true,
          'autoJobFileRestorePointsActive',
        ),
      ),
      autoMeasurementsBackupActive: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.autoMeasurementsBackupActive,
          true,
          'autoMeasurementsBackupActive',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetAutomaticBackupState',
    request,
    UtilityOperationsProtocol.SetAutomaticBackupStateRequest,
    UtilityOperationsProtocol.SetAutomaticBackupStateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setAutomaticRelationshipConstructionState(
  briosa: BriosaClient,
  input: SetAutomaticRelationshipConstructionStateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetAutomaticRelationshipConstructionStateRequest.fromPartial(
      {
        active: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(input.active, false, 'active'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetAutomaticRelationshipConstructionState',
    request,
    UtilityOperationsProtocol.SetAutomaticRelationshipConstructionStateRequest,
    UtilityOperationsProtocol.SetAutomaticRelationshipConstructionStateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCollectionNotes(
  briosa: BriosaClient,
  input: SetCollectionNotesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetCollectionNotesRequest.fromPartial({
      collection: toWireOperationValue(
        getOperationValueSchema('collectionName'),
        requireOperationInput(input.collection, 'collection'),
      ),
      notes: toWireOperationValue(
        repeatedOperationValue(operationScalarSchemas.string),
        requireOperationInput(input.notes, 'notes'),
      ),
      appendFalseOverwrite: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.appendFalseOverwrite,
          true,
          'appendFalseOverwrite',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetCollectionNotes',
    request,
    UtilityOperationsProtocol.SetCollectionNotesRequest,
    UtilityOperationsProtocol.SetCollectionNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setDecimalDigitsForDisplay(
  briosa: BriosaClient,
  input: SetDecimalDigitsForDisplayInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetDecimalDigitsForDisplayRequest.fromPartial({
      length: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.length, 4, 'length'),
      ),
      angle: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.angle, 4, 'angle'),
      ),
      scale: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.scale, 6, 'scale'),
      ),
      unitVector: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.unitVector, 6, 'unitVector'),
      ),
      weight: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.weight, 3, 'weight'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetDecimalDigitsForDisplay',
    request,
    UtilityOperationsProtocol.SetDecimalDigitsForDisplayRequest,
    UtilityOperationsProtocol.SetDecimalDigitsForDisplayResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setFolderNotes(
  briosa: BriosaClient,
  input: SetFolderNotesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetFolderNotesRequest.fromPartial({
    folderPath: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.folderPath, '', 'folderPath'),
    ),
    notes: toWireOperationValue(
      repeatedOperationValue(operationScalarSchemas.string),
      requireOperationInput(input.notes, 'notes'),
    ),
    appendFalseOverwrite: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.appendFalseOverwrite,
        true,
        'appendFalseOverwrite',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetFolderNotes',
    request,
    UtilityOperationsProtocol.SetFolderNotesRequest,
    UtilityOperationsProtocol.SetFolderNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setInteractionMode(
  briosa: BriosaClient,
  input: SetInteractionModeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetInteractionModeRequest.fromPartial({
      saInteractionMode: toWireOperationValue(
        getOperationValueSchema('saInteractionMode'),
        requireOperationInput(input.saInteractionMode, 'saInteractionMode'),
      ),
      measurementPlanInteractionMode: toWireOperationValue(
        getOperationValueSchema('mpInteractionMode'),
        requireOperationInput(
          input.measurementPlanInteractionMode,
          'measurementPlanInteractionMode',
        ),
      ),
      measurementPlanDialogInteractionMode: toWireOperationValue(
        getOperationValueSchema('mpDialogInteractionMode'),
        requireOperationInput(
          input.measurementPlanDialogInteractionMode,
          'measurementPlanDialogInteractionMode',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetInteractionMode',
    request,
    UtilityOperationsProtocol.SetInteractionModeRequest,
    UtilityOperationsProtocol.SetInteractionModeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setLoggingState(
  briosa: BriosaClient,
  input: SetLoggingStateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetLoggingStateRequest.fromPartial({
    active: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.active, false, 'active'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetLoggingState',
    request,
    UtilityOperationsProtocol.SetLoggingStateRequest,
    UtilityOperationsProtocol.SetLoggingStateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setNotificationCancelOverride(
  briosa: BriosaClient,
  input: SetNotificationCancelOverrideInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetNotificationCancelOverrideRequest.fromPartial({
      prohibitCancel: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.prohibitCancel, true, 'prohibitCancel'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetNotificationCancelOverride',
    request,
    UtilityOperationsProtocol.SetNotificationCancelOverrideRequest,
    UtilityOperationsProtocol.SetNotificationCancelOverrideResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setObjectNotes(
  briosa: BriosaClient,
  input: SetObjectNotesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetObjectNotesRequest.fromPartial({
    object: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.object, 'object'),
    ),
    notes: toWireOperationValue(
      repeatedOperationValue(operationScalarSchemas.string),
      requireOperationInput(input.notes, 'notes'),
    ),
    appendFalseOverwrite: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.appendFalseOverwrite,
        true,
        'appendFalseOverwrite',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetObjectNotes',
    request,
    UtilityOperationsProtocol.SetObjectNotesRequest,
    UtilityOperationsProtocol.SetObjectNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setOpcDaTagValueDouble(
  briosa: BriosaClient,
  input: SetOpcDaTagValueDoubleInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetOpcDaTagValueDoubleRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.value, 0, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetOpcDaTagValueDouble',
    request,
    UtilityOperationsProtocol.SetOpcDaTagValueDoubleRequest,
    UtilityOperationsProtocol.SetOpcDaTagValueDoubleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setOpcDaTagValueInteger(
  briosa: BriosaClient,
  input: SetOpcDaTagValueIntegerInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetOpcDaTagValueIntegerRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.value, 0, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetOpcDaTagValueInteger',
    request,
    UtilityOperationsProtocol.SetOpcDaTagValueIntegerRequest,
    UtilityOperationsProtocol.SetOpcDaTagValueIntegerResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setOpcDaTagValueString(
  briosa: BriosaClient,
  input: SetOpcDaTagValueStringInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetOpcDaTagValueStringRequest.fromPartial({
      opcServerDaTagName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.opcServerDaTagName,
          '',
          'opcServerDaTagName',
        ),
      ),
      value: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.value, '', 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetOpcDaTagValueString',
    request,
    UtilityOperationsProtocol.SetOpcDaTagValueStringRequest,
    UtilityOperationsProtocol.SetOpcDaTagValueStringResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointNotes(
  briosa: BriosaClient,
  input: SetPointNotesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetPointNotesRequest.fromPartial({
    point: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(input.point, 'point'),
    ),
    notes: toWireOperationValue(
      repeatedOperationValue(operationScalarSchemas.string),
      requireOperationInput(input.notes, 'notes'),
    ),
    appendFalseOverwrite: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.appendFalseOverwrite,
        true,
        'appendFalseOverwrite',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetPointNotes',
    request,
    UtilityOperationsProtocol.SetPointNotesRequest,
    UtilityOperationsProtocol.SetPointNotesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setUserInterfaceProfile(
  briosa: BriosaClient,
  input: SetUserInterfaceProfileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetUserInterfaceProfileRequest.fromPartial({
      profileName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.profileName, 'Default', 'profileName'),
      ),
      profileFileNameOptional: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(
          input.profileFileNameOptional,
          'profileFileNameOptional',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetUserInterfaceProfile',
    request,
    UtilityOperationsProtocol.SetUserInterfaceProfileRequest,
    UtilityOperationsProtocol.SetUserInterfaceProfileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setViewIdleUpdateFrequency(
  briosa: BriosaClient,
  input: SetViewIdleUpdateFrequencyInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetViewIdleUpdateFrequencyRequest.fromPartial({
      idleCount: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.idleCount, 0, 'idleCount'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetViewIdleUpdateFrequency',
    request,
    UtilityOperationsProtocol.SetViewIdleUpdateFrequencyRequest,
    UtilityOperationsProtocol.SetViewIdleUpdateFrequencyResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setWildCardAsteriskMode(
  briosa: BriosaClient,
  input: SetWildCardAsteriskModeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    UtilityOperationsProtocol.SetWildCardAsteriskModeRequest.fromPartial({
      autoWrapSearchString: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.autoWrapSearchString,
          true,
          'autoWrapSearchString',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetWildCardAsteriskMode',
    request,
    UtilityOperationsProtocol.SetWildCardAsteriskModeRequest,
    UtilityOperationsProtocol.SetWildCardAsteriskModeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setWorkingFrame(
  briosa: BriosaClient,
  input: SetWorkingFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.SetWorkingFrameRequest.fromPartial({
    newWorkingFrameName: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.newWorkingFrameName, 'newWorkingFrameName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'SetWorkingFrame',
    request,
    UtilityOperationsProtocol.SetWorkingFrameRequest,
    UtilityOperationsProtocol.SetWorkingFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function statusDialog(
  briosa: BriosaClient,
  input: StatusDialogInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.StatusDialogRequest.fromPartial({
    dialogTitle: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.dialogTitle, '', 'dialogTitle'),
    ),
    textMessage: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.textMessage, '', 'textMessage'),
    ),
    currentPosition: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.currentPosition, 0, 'currentPosition'),
    ),
    upperLimit: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.upperLimit, 0, 'upperLimit'),
    ),
    suppressTimeRemaining: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.suppressTimeRemaining,
        true,
        'suppressTimeRemaining',
      ),
    ),
    closeDialog: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.closeDialog, false, 'closeDialog'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'StatusDialog',
    request,
    UtilityOperationsProtocol.StatusDialogRequest,
    UtilityOperationsProtocol.StatusDialogResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function trimLogFile(
  briosa: BriosaClient,
  input: TrimLogFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.TrimLogFileRequest.fromPartial({
    numberOfEntriesToKeep: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(
        input.numberOfEntriesToKeep,
        10,
        'numberOfEntriesToKeep',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'TrimLogFile',
    request,
    UtilityOperationsProtocol.TrimLogFileRequest,
    UtilityOperationsProtocol.TrimLogFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function writeToLog(
  briosa: BriosaClient,
  input: WriteToLogInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = UtilityOperationsProtocol.WriteToLogRequest.fromPartial({
    logEntry: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.logEntry, '', 'logEntry'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'UtilityOperations',
    'WriteToLog',
    request,
    UtilityOperationsProtocol.WriteToLogRequest,
    UtilityOperationsProtocol.WriteToLogResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addDoubleToNamedDoubleListVariable(
  briosa: BriosaClient,
  input: AddDoubleToNamedDoubleListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.AddDoubleToNamedDoubleListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      doubleValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.doubleValue, 0, 'doubleValue'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'AddDoubleToNamedDoubleListVariable',
    request,
    VariablesProtocol.AddDoubleToNamedDoubleListVariableRequest,
    VariablesProtocol.AddDoubleToNamedDoubleListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function clearNamedDoubleListVariable(
  briosa: BriosaClient,
  input: ClearNamedDoubleListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.ClearNamedDoubleListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'ClearNamedDoubleListVariable',
    request,
    VariablesProtocol.ClearNamedDoubleListVariableRequest,
    VariablesProtocol.ClearNamedDoubleListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteVariable(
  briosa: BriosaClient,
  input: DeleteVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.DeleteVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'DeleteVariable',
    request,
    VariablesProtocol.DeleteVariableRequest,
    VariablesProtocol.DeleteVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteVariablesWildcardMatch(
  briosa: BriosaClient,
  input: DeleteVariablesWildcardMatchInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.DeleteVariablesWildcardMatchRequest.fromPartial({
      variableWildcardCriteria: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.variableWildcardCriteria,
          '',
          'variableWildcardCriteria',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'DeleteVariablesWildcardMatch',
    request,
    VariablesProtocol.DeleteVariablesWildcardMatchRequest,
    VariablesProtocol.DeleteVariablesWildcardMatchResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getBooleanVariable(
  briosa: BriosaClient,
  input: GetBooleanVariableInput,
  options: BriosaCallOptions = {},
): Promise<boolean> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetBooleanVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetBooleanVariable',
    request,
    VariablesProtocol.GetBooleanVariableRequest,
    VariablesProtocol.GetBooleanVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.boolean, 'value']],
  );
  return mapped as boolean;
}

export async function getCollectionObjectNameVariable(
  briosa: BriosaClient,
  input: GetCollectionObjectNameVariableInput,
  options: BriosaCallOptions = {},
): Promise<CollectionObjectName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetCollectionObjectNameVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetCollectionObjectNameVariable',
    request,
    VariablesProtocol.GetCollectionObjectNameVariableRequest,
    VariablesProtocol.GetCollectionObjectNameVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', getOperationValueSchema('collectionObjectName'), 'value']],
  );
  return mapped as CollectionObjectName;
}

export async function getCollectionObjectRefListVariable(
  briosa: BriosaClient,
  input: GetCollectionObjectRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly CollectionObjectName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetCollectionObjectRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetCollectionObjectRefListVariable',
    request,
    VariablesProtocol.GetCollectionObjectRefListVariableRequest,
    VariablesProtocol.GetCollectionObjectRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value',
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        'value',
      ],
    ],
  );
  return mapped as readonly CollectionObjectName[];
}

export async function getDoubleVariable(
  briosa: BriosaClient,
  input: GetDoubleVariableInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetDoubleVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetDoubleVariable',
    request,
    VariablesProtocol.GetDoubleVariableRequest,
    VariablesProtocol.GetDoubleVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.number, 'value']],
  );
  return mapped as number;
}

export async function getIntegerVariable(
  briosa: BriosaClient,
  input: GetIntegerVariableInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetIntegerVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetIntegerVariable',
    request,
    VariablesProtocol.GetIntegerVariableRequest,
    VariablesProtocol.GetIntegerVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.integer, 'value']],
  );
  return mapped as number;
}

export async function getNamedDoubleListVariable(
  briosa: BriosaClient,
  input: GetNamedDoubleListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly number[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetNamedDoubleListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetNamedDoubleListVariable',
    request,
    VariablesProtocol.GetNamedDoubleListVariableRequest,
    VariablesProtocol.GetNamedDoubleListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'doubleListVariable',
        repeatedOperationValue(operationScalarSchemas.number),
        'doubleListVariable',
      ],
    ],
  );
  return mapped as readonly number[];
}

export async function getNamedDoubleListVariableMinMax(
  briosa: BriosaClient,
  input: GetNamedDoubleListVariableMinMaxInput,
  options: BriosaCallOptions = {},
): Promise<GetNamedDoubleListVariableMinMaxResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetNamedDoubleListVariableMinMaxRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetNamedDoubleListVariableMinMax',
    request,
    VariablesProtocol.GetNamedDoubleListVariableMinMaxRequest,
    VariablesProtocol.GetNamedDoubleListVariableMinMaxResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['minimumValue', operationScalarSchemas.number, 'minimumValue'],
      ['maximumValue', operationScalarSchemas.number, 'maximumValue'],
    ],
  );
  return mapped as GetNamedDoubleListVariableMinMaxResult;
}

export async function getPointNameRefListVariable(
  briosa: BriosaClient,
  input: GetPointNameRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly PointName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetPointNameRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetPointNameRefListVariable',
    request,
    VariablesProtocol.GetPointNameRefListVariableRequest,
    VariablesProtocol.GetPointNameRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value',
        repeatedOperationValue(getOperationValueSchema('pointName')),
        'value',
      ],
    ],
  );
  return mapped as readonly PointName[];
}

export async function getPointNameVariable(
  briosa: BriosaClient,
  input: GetPointNameVariableInput,
  options: BriosaCallOptions = {},
): Promise<PointName> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetPointNameVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetPointNameVariable',
    request,
    VariablesProtocol.GetPointNameVariableRequest,
    VariablesProtocol.GetPointNameVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', getOperationValueSchema('pointName'), 'value']],
  );
  return mapped as PointName;
}

export async function getRelationshipRefListVariable(
  briosa: BriosaClient,
  input: GetRelationshipRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly CollectionObjectName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetRelationshipRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetRelationshipRefListVariable',
    request,
    VariablesProtocol.GetRelationshipRefListVariableRequest,
    VariablesProtocol.GetRelationshipRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value',
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        'value',
      ],
    ],
  );
  return mapped as readonly CollectionObjectName[];
}

export async function getReportItemsReferenceListVariable(
  briosa: BriosaClient,
  input: GetReportItemsReferenceListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly CollectionObjectName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetReportItemsReferenceListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetReportItemsReferenceListVariable',
    request,
    VariablesProtocol.GetReportItemsReferenceListVariableRequest,
    VariablesProtocol.GetReportItemsReferenceListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value',
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        'value',
      ],
    ],
  );
  return mapped as readonly CollectionObjectName[];
}

export async function getStringRefListVariable(
  briosa: BriosaClient,
  input: GetStringRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly string[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetStringRefListVariableRequest.fromPartial(
    {
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetStringRefListVariable',
    request,
    VariablesProtocol.GetStringRefListVariableRequest,
    VariablesProtocol.GetStringRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', repeatedOperationValue(operationScalarSchemas.string), 'value']],
  );
  return mapped as readonly string[];
}

export async function getStringVariable(
  briosa: BriosaClient,
  input: GetStringVariableInput,
  options: BriosaCallOptions = {},
): Promise<string> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetStringVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetStringVariable',
    request,
    VariablesProtocol.GetStringVariableRequest,
    VariablesProtocol.GetStringVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', operationScalarSchemas.string, 'value']],
  );
  return mapped as string;
}

export async function getTransformVariable(
  briosa: BriosaClient,
  input: GetTransformVariableInput,
  options: BriosaCallOptions = {},
): Promise<Transform> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetTransformVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetTransformVariable',
    request,
    VariablesProtocol.GetTransformVariableRequest,
    VariablesProtocol.GetTransformVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', getOperationValueSchema('transform'), 'value']],
  );
  return mapped as Transform;
}

export async function getVectorNameRefListVariable(
  briosa: BriosaClient,
  input: GetVectorNameRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<readonly VectorName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.GetVectorNameRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetVectorNameRefListVariable',
    request,
    VariablesProtocol.GetVectorNameRefListVariableRequest,
    VariablesProtocol.GetVectorNameRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'value',
        repeatedOperationValue(getOperationValueSchema('vectorName')),
        'value',
      ],
    ],
  );
  return mapped as readonly VectorName[];
}

export async function getVectorVariable(
  briosa: BriosaClient,
  input: GetVectorVariableInput,
  options: BriosaCallOptions = {},
): Promise<Vector> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.GetVectorVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'GetVectorVariable',
    request,
    VariablesProtocol.GetVectorVariableRequest,
    VariablesProtocol.GetVectorVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['value', getOperationValueSchema('vector'), 'value']],
  );
  return mapped as Vector;
}

export async function setBooleanVariable(
  briosa: BriosaClient,
  input: SetBooleanVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetBooleanVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.value, false, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetBooleanVariable',
    request,
    VariablesProtocol.SetBooleanVariableRequest,
    VariablesProtocol.SetBooleanVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCollectionObjectNameVariable(
  briosa: BriosaClient,
  input: SetCollectionObjectNameVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetCollectionObjectNameVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetCollectionObjectNameVariable',
    request,
    VariablesProtocol.SetCollectionObjectNameVariableRequest,
    VariablesProtocol.SetCollectionObjectNameVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setCollectionObjectRefListVariable(
  briosa: BriosaClient,
  input: SetCollectionObjectRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetCollectionObjectRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetCollectionObjectRefListVariable',
    request,
    VariablesProtocol.SetCollectionObjectRefListVariableRequest,
    VariablesProtocol.SetCollectionObjectRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setDoubleVariable(
  briosa: BriosaClient,
  input: SetDoubleVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetDoubleVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.value, 0, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetDoubleVariable',
    request,
    VariablesProtocol.SetDoubleVariableRequest,
    VariablesProtocol.SetDoubleVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setFontVariable(
  briosa: BriosaClient,
  input: SetFontVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetFontVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      getOperationValueSchema('font'),
      resolveOperationDefault(input.value, Font.default, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetFontVariable',
    request,
    VariablesProtocol.SetFontVariableRequest,
    VariablesProtocol.SetFontVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setIntegerVariable(
  briosa: BriosaClient,
  input: SetIntegerVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetIntegerVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.value, 0, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetIntegerVariable',
    request,
    VariablesProtocol.SetIntegerVariableRequest,
    VariablesProtocol.SetIntegerVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setNamedDoubleListVariable(
  briosa: BriosaClient,
  input: SetNamedDoubleListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetNamedDoubleListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      doubleListVariable: toWireOperationValue(
        repeatedOperationValue(operationScalarSchemas.number),
        requireOperationInput(input.doubleListVariable, 'doubleListVariable'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetNamedDoubleListVariable',
    request,
    VariablesProtocol.SetNamedDoubleListVariableRequest,
    VariablesProtocol.SetNamedDoubleListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointNameRefListVariable(
  briosa: BriosaClient,
  input: SetPointNameRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetPointNameRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('pointName')),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetPointNameRefListVariable',
    request,
    VariablesProtocol.SetPointNameRefListVariableRequest,
    VariablesProtocol.SetPointNameRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointNameVariable(
  briosa: BriosaClient,
  input: SetPointNameVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetPointNameVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(input.value, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetPointNameVariable',
    request,
    VariablesProtocol.SetPointNameVariableRequest,
    VariablesProtocol.SetPointNameVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRelationshipRefListVariable(
  briosa: BriosaClient,
  input: SetRelationshipRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetRelationshipRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetRelationshipRefListVariable',
    request,
    VariablesProtocol.SetRelationshipRefListVariableRequest,
    VariablesProtocol.SetRelationshipRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setReportItemsReferenceListVariable(
  briosa: BriosaClient,
  input: SetReportItemsReferenceListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetReportItemsReferenceListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetReportItemsReferenceListVariable',
    request,
    VariablesProtocol.SetReportItemsReferenceListVariableRequest,
    VariablesProtocol.SetReportItemsReferenceListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setStringRefListVariable(
  briosa: BriosaClient,
  input: SetStringRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetStringRefListVariableRequest.fromPartial(
    {
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(operationScalarSchemas.string),
        requireOperationInput(input.value, 'value'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetStringRefListVariable',
    request,
    VariablesProtocol.SetStringRefListVariableRequest,
    VariablesProtocol.SetStringRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setStringVariable(
  briosa: BriosaClient,
  input: SetStringVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetStringVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.value, '', 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetStringVariable',
    request,
    VariablesProtocol.SetStringVariableRequest,
    VariablesProtocol.SetStringVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTransformVariable(
  briosa: BriosaClient,
  input: SetTransformVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetTransformVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      getOperationValueSchema('transform'),
      requireOperationInput(input.value, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetTransformVariable',
    request,
    VariablesProtocol.SetTransformVariableRequest,
    VariablesProtocol.SetTransformVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setVectorNameRefListVariable(
  briosa: BriosaClient,
  input: SetVectorNameRefListVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VariablesProtocol.SetVectorNameRefListVariableRequest.fromPartial({
      name: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.name, '', 'name'),
      ),
      value: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('vectorName')),
        requireOperationInput(input.value, 'value'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetVectorNameRefListVariable',
    request,
    VariablesProtocol.SetVectorNameRefListVariableRequest,
    VariablesProtocol.SetVectorNameRefListVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setVectorVariable(
  briosa: BriosaClient,
  input: SetVectorVariableInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VariablesProtocol.SetVectorVariableRequest.fromPartial({
    name: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.name, '', 'name'),
    ),
    value: toWireOperationValue(
      getOperationValueSchema('vector'),
      requireOperationInput(input.value, 'value'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'Variables',
    'SetVectorVariable',
    request,
    VariablesProtocol.SetVectorVariableRequest,
    VariablesProtocol.SetVectorVariableResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function addAVectorToVectorNameRefList(
  briosa: BriosaClient,
  input: AddAVectorToVectorNameRefListInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.AddAVectorToVectorNameRefListRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      vectorName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.vectorName, '', 'vectorName'),
      ),
      vectorNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('vectorName')),
        requireOperationInput(input.vectorNameList, 'vectorNameList'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'AddAVectorToVectorNameRefList',
    request,
    VectorOperationsProtocol.AddAVectorToVectorNameRefListRequest,
    VectorOperationsProtocol.AddAVectorToVectorNameRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function autoRangeAndSetVectorGroupColorizationAll(
  briosa: BriosaClient,
  input: AutoRangeAndSetVectorGroupColorizationAllInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationAllRequest.fromPartial(
      {
        treatIndividually: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.treatIndividually,
            false,
            'treatIndividually',
          ),
        ),
        colorizationOptionsUsesModeOnly: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptionsUsesModeOnly,
            ColorizationOptions.default,
            'colorizationOptionsUsesModeOnly',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'AutoRangeAndSetVectorGroupColorizationAll',
    request,
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationAllRequest,
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationAllResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function autoRangeAndSetVectorGroupColorizationSelected(
  briosa: BriosaClient,
  input: AutoRangeAndSetVectorGroupColorizationSelectedInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationSelectedRequest.fromPartial(
      {
        vectorGroupsToBeSet: toWireOperationValue(
          repeatedOperationValue(
            getOperationValueSchema('collectionVectorGroupName'),
          ),
          requireOperationInput(
            input.vectorGroupsToBeSet,
            'vectorGroupsToBeSet',
          ),
        ),
        treatIndividually: toWireOperationValue(
          operationScalarSchemas.boolean,
          resolveOperationDefault(
            input.treatIndividually,
            false,
            'treatIndividually',
          ),
        ),
        colorizationOptionsUsesModeOnly: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptionsUsesModeOnly,
            ColorizationOptions.default,
            'colorizationOptionsUsesModeOnly',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'AutoRangeAndSetVectorGroupColorizationSelected',
    request,
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationSelectedRequest,
    VectorOperationsProtocol.AutoRangeAndSetVectorGroupColorizationSelectedResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteIthVectorFromVectorGroup(
  briosa: BriosaClient,
  input: DeleteIthVectorFromVectorGroupInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.DeleteIthVectorFromVectorGroupRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      vectorIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.vectorIndex, 0, 'vectorIndex'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'DeleteIthVectorFromVectorGroup',
    request,
    VectorOperationsProtocol.DeleteIthVectorFromVectorGroupRequest,
    VectorOperationsProtocol.DeleteIthVectorFromVectorGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteVectorByName(
  briosa: BriosaClient,
  input: DeleteVectorByNameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.DeleteVectorByNameRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      vectorName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.vectorName, '', 'vectorName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'DeleteVectorByName',
    request,
    VectorOperationsProtocol.DeleteVectorByNameRequest,
    VectorOperationsProtocol.DeleteVectorByNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function deleteVectors(
  briosa: BriosaClient,
  input: DeleteVectorsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VectorOperationsProtocol.DeleteVectorsRequest.fromPartial({
    vectorNameList: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('vectorName')),
      requireOperationInput(input.vectorNameList, 'vectorNameList'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'DeleteVectors',
    request,
    VectorOperationsProtocol.DeleteVectorsRequest,
    VectorOperationsProtocol.DeleteVectorsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getIthVectorFromVectorGroup(
  briosa: BriosaClient,
  input: GetIthVectorFromVectorGroupInput,
  options: BriosaCallOptions = {},
): Promise<GetIthVectorFromVectorGroupResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetIthVectorFromVectorGroupRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      vectorIndex: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.vectorIndex, 0, 'vectorIndex'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetIthVectorFromVectorGroup',
    request,
    VectorOperationsProtocol.GetIthVectorFromVectorGroupRequest,
    VectorOperationsProtocol.GetIthVectorFromVectorGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['vectorName', operationScalarSchemas.string, 'vectorName'],
      ['beginInWorking', getOperationValueSchema('vector'), 'beginInWorking'],
      ['endInWorking', getOperationValueSchema('vector'), 'endInWorking'],
      [
        'totalDeltaInWorking',
        getOperationValueSchema('vector'),
        'totalDeltaInWorking',
      ],
      [
        'ijkUnitVectorInWorking',
        getOperationValueSchema('vector'),
        'ijkUnitVectorInWorking',
      ],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as GetIthVectorFromVectorGroupResult;
}

export async function getIthVectorFromVectorNameRefList(
  briosa: BriosaClient,
  input: GetIthVectorFromVectorNameRefListInput,
  options: BriosaCallOptions = {},
): Promise<GetIthVectorFromVectorNameRefListResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetIthVectorFromVectorNameRefListRequest.fromPartial(
      {
        vectorNameList: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('vectorName')),
          requireOperationInput(input.vectorNameList, 'vectorNameList'),
        ),
        vectorIndex: toWireOperationValue(
          operationScalarSchemas.integer,
          resolveOperationDefault(input.vectorIndex, 0, 'vectorIndex'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetIthVectorFromVectorNameRefList',
    request,
    VectorOperationsProtocol.GetIthVectorFromVectorNameRefListRequest,
    VectorOperationsProtocol.GetIthVectorFromVectorNameRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'vectorGroupName',
        getOperationValueSchema('collectionObjectName'),
        'vectorGroupName',
      ],
      ['vectorName', operationScalarSchemas.string, 'vectorName'],
      ['beginInWorking', getOperationValueSchema('vector'), 'beginInWorking'],
      ['endInWorking', getOperationValueSchema('vector'), 'endInWorking'],
      [
        'totalDeltaInWorking',
        getOperationValueSchema('vector'),
        'totalDeltaInWorking',
      ],
      [
        'ijkUnitVectorInWorking',
        getOperationValueSchema('vector'),
        'ijkUnitVectorInWorking',
      ],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as GetIthVectorFromVectorNameRefListResult;
}

export async function getNumberOfVectorsInVectorGroup(
  briosa: BriosaClient,
  input: GetNumberOfVectorsInVectorGroupInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetNumberOfVectorsInVectorGroupRequest.fromPartial(
      {
        vectorGroupName: toWireOperationValue(
          getOperationValueSchema('collectionObjectName'),
          requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetNumberOfVectorsInVectorGroup',
    request,
    VectorOperationsProtocol.GetNumberOfVectorsInVectorGroupRequest,
    VectorOperationsProtocol.GetNumberOfVectorsInVectorGroupResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getNumberOfVectorsInVectorNameRefList(
  briosa: BriosaClient,
  input: GetNumberOfVectorsInVectorNameRefListInput,
  options: BriosaCallOptions = {},
): Promise<number> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetNumberOfVectorsInVectorNameRefListRequest.fromPartial(
      {
        vectorNameList: toWireOperationValue(
          repeatedOperationValue(getOperationValueSchema('vectorName')),
          requireOperationInput(input.vectorNameList, 'vectorNameList'),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetNumberOfVectorsInVectorNameRefList',
    request,
    VectorOperationsProtocol.GetNumberOfVectorsInVectorNameRefListRequest,
    VectorOperationsProtocol.GetNumberOfVectorsInVectorNameRefListResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [['totalCount', operationScalarSchemas.integer, 'totalCount']],
  );
  return mapped as number;
}

export async function getVectorFromVectorGroupByName(
  briosa: BriosaClient,
  input: GetVectorFromVectorGroupByNameInput,
  options: BriosaCallOptions = {},
): Promise<GetVectorFromVectorGroupByNameResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetVectorFromVectorGroupByNameRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
      vectorName: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(input.vectorName, '', 'vectorName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetVectorFromVectorGroupByName',
    request,
    VectorOperationsProtocol.GetVectorFromVectorGroupByNameRequest,
    VectorOperationsProtocol.GetVectorFromVectorGroupByNameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['beginInWorking', getOperationValueSchema('vector'), 'beginInWorking'],
      ['endInWorking', getOperationValueSchema('vector'), 'endInWorking'],
      [
        'totalDeltaInWorking',
        getOperationValueSchema('vector'),
        'totalDeltaInWorking',
      ],
      [
        'ijkUnitVectorInWorking',
        getOperationValueSchema('vector'),
        'ijkUnitVectorInWorking',
      ],
      ['magnitude', operationScalarSchemas.number, 'magnitude'],
    ],
  );
  return mapped as GetVectorFromVectorGroupByNameResult;
}

export async function getVectorGroupProperties(
  briosa: BriosaClient,
  input: GetVectorGroupPropertiesInput,
  options: BriosaCallOptions = {},
): Promise<GetVectorGroupPropertiesResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.GetVectorGroupPropertiesRequest.fromPartial({
      vectorGroupName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.vectorGroupName, 'vectorGroupName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'GetVectorGroupProperties',
    request,
    VectorOperationsProtocol.GetVectorGroupPropertiesRequest,
    VectorOperationsProtocol.GetVectorGroupPropertiesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['totalVectors', operationScalarSchemas.integer, 'totalVectors'],
      [
        'vectorsInTolerance',
        operationScalarSchemas.integer,
        'vectorsInTolerance',
      ],
      [
        'vectorsOutOfTolerance',
        operationScalarSchemas.integer,
        'vectorsOutOfTolerance',
      ],
      ['invalidVectors', operationScalarSchemas.integer, 'invalidVectors'],
      [
        'vectorsInTolerance2',
        operationScalarSchemas.number,
        'vectorsInTolerance2',
      ],
      [
        'vectorsOutOfTolerance2',
        operationScalarSchemas.number,
        'vectorsOutOfTolerance2',
      ],
      [
        'absoluteMaxMagnitude',
        operationScalarSchemas.number,
        'absoluteMaxMagnitude',
      ],
      [
        'absoluteMinMagnitude',
        operationScalarSchemas.number,
        'absoluteMinMagnitude',
      ],
      ['maxMagnitude', operationScalarSchemas.number, 'maxMagnitude'],
      ['minMagnitude', operationScalarSchemas.number, 'minMagnitude'],
      [
        'standardDeviationFromZero',
        operationScalarSchemas.number,
        'standardDeviationFromZero',
      ],
      [
        'standardDeviationFromMean',
        operationScalarSchemas.number,
        'standardDeviationFromMean',
      ],
      ['avgMagnitude', operationScalarSchemas.number, 'avgMagnitude'],
      ['avgOfAbsMagnitude', operationScalarSchemas.number, 'avgOfAbsMagnitude'],
      [
        'highToleranceValue',
        operationScalarSchemas.number,
        'highToleranceValue',
      ],
      ['lowToleranceValue', operationScalarSchemas.number, 'lowToleranceValue'],
      ['rmsValue', operationScalarSchemas.number, 'rmsValue'],
    ],
  );
  return mapped as GetVectorGroupPropertiesResult;
}

export async function setVectorGroupColorizationOptionsAll(
  briosa: BriosaClient,
  input: SetVectorGroupColorizationOptionsAllInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsAllRequest.fromPartial(
      {
        colorizationOptions: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptions,
            ColorizationOptions.default,
            'colorizationOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'SetVectorGroupColorizationOptionsAll',
    request,
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsAllRequest,
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsAllResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setVectorGroupColorizationOptionsSelected(
  briosa: BriosaClient,
  input: SetVectorGroupColorizationOptionsSelectedInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsSelectedRequest.fromPartial(
      {
        vectorGroupsToBeSet: toWireOperationValue(
          repeatedOperationValue(
            getOperationValueSchema('collectionVectorGroupName'),
          ),
          requireOperationInput(
            input.vectorGroupsToBeSet,
            'vectorGroupsToBeSet',
          ),
        ),
        colorizationOptions: toWireOperationValue(
          getOperationValueSchema('colorizationOptions'),
          resolveOperationDefault(
            input.colorizationOptions,
            ColorizationOptions.default,
            'colorizationOptions',
          ),
        ),
      } as never,
    );
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'SetVectorGroupColorizationOptionsSelected',
    request,
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsSelectedRequest,
    VectorOperationsProtocol.SetVectorGroupColorizationOptionsSelectedResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function sortVectors(
  briosa: BriosaClient,
  input: SortVectorsInput,
  options: BriosaCallOptions = {},
): Promise<readonly VectorName[]> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = VectorOperationsProtocol.SortVectorsRequest.fromPartial({
    sourceVectors: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('vectorName')),
      requireOperationInput(input.sourceVectors, 'sourceVectors'),
    ),
    sortMethod: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(input.sortMethod, 'Magnitude', 'sortMethod'),
    ),
    coordinateSystem: toWireOperationValue(
      getOperationValueSchema('coordinateSystemType'),
      resolveOperationDefault(
        input.coordinateSystem,
        CoordinateSystemType.cartesian,
        'coordinateSystem',
      ),
    ),
    primarySortCoordinate: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.primarySortCoordinate,
        'X (R)',
        'primarySortCoordinate',
      ),
    ),
    secondarySortCoordinate: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.secondarySortCoordinate,
        'Y (Theta)',
        'secondarySortCoordinate',
      ),
    ),
    tertiarySortCoordinate: toWireOperationValue(
      operationScalarSchemas.string,
      resolveOperationDefault(
        input.tertiarySortCoordinate,
        'Z (Phi)',
        'tertiarySortCoordinate',
      ),
    ),
    primaryCoordinateGranularity: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(
        input.primaryCoordinateGranularity,
        0,
        'primaryCoordinateGranularity',
      ),
    ),
    secondaryCoordinateGranularity: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(
        input.secondaryCoordinateGranularity,
        0,
        'secondaryCoordinateGranularity',
      ),
    ),
    tertiaryCoordinateGranularity: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(
        input.tertiaryCoordinateGranularity,
        0,
        'tertiaryCoordinateGranularity',
      ),
    ),
    ascending: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.ascending, false, 'ascending'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'VectorOperations',
    'SortVectors',
    request,
    VectorOperationsProtocol.SortVectorsRequest,
    VectorOperationsProtocol.SortVectorsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'sortedVectors',
        repeatedOperationValue(getOperationValueSchema('vectorName')),
        'sortedVectors',
      ],
    ],
  );
  return mapped as readonly VectorName[];
}

export async function autoScale(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = ViewControlProtocol.AutoScaleRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'AutoScale',
    request,
    ViewControlProtocol.AutoScaleRequest,
    ViewControlProtocol.AutoScaleResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function centerGraphicsAboutObjects(
  briosa: BriosaClient,
  input: CenterGraphicsAboutObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.CenterGraphicsAboutObjectsRequest.fromPartial({
      objectType: toWireOperationValue(
        getOperationValueSchema('objectType'),
        resolveOperationDefault(input.objectType, ObjectType.any, 'objectType'),
      ),
      collectionWildcardCriteria: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.collectionWildcardCriteria,
          '*',
          'collectionWildcardCriteria',
        ),
      ),
      objectWildcardCriteria: toWireOperationValue(
        operationScalarSchemas.string,
        resolveOperationDefault(
          input.objectWildcardCriteria,
          '*',
          'objectWildcardCriteria',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'CenterGraphicsAboutObjects',
    request,
    ViewControlProtocol.CenterGraphicsAboutObjectsRequest,
    ViewControlProtocol.CenterGraphicsAboutObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function centerGraphicsAboutPoint(
  briosa: BriosaClient,
  input: CenterGraphicsAboutPointInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.CenterGraphicsAboutPointRequest.fromPartial({
      pointName: toWireOperationValue(
        getOperationValueSchema('pointName'),
        requireOperationInput(input.pointName, 'pointName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'CenterGraphicsAboutPoint',
    request,
    ViewControlProtocol.CenterGraphicsAboutPointRequest,
    ViewControlProtocol.CenterGraphicsAboutPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function definePointOfView(
  briosa: BriosaClient,
  input: DefinePointOfViewInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.DefinePointOfViewRequest.fromPartial({
    viewName: toWireOperationValue(
      getOperationValueSchema('viewName'),
      requireOperationInput(input.viewName, 'viewName'),
    ),
    rotationX: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.rotationX, 0, 'rotationX'),
    ),
    rotationY: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.rotationY, 0, 'rotationY'),
    ),
    rotationZ: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.rotationZ, 0, 'rotationZ'),
    ),
    restoreZoomSettings: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.restoreZoomSettings,
        false,
        'restoreZoomSettings',
      ),
    ),
    scaleFactor: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.scaleFactor, 1, 'scaleFactor'),
    ),
    originX: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.originX, 0, 'originX'),
    ),
    originY: toWireOperationValue(
      operationScalarSchemas.number,
      resolveOperationDefault(input.originY, 0, 'originY'),
    ),
    restoreRenderMode: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.restoreRenderMode,
        false,
        'restoreRenderMode',
      ),
    ),
    renderingMode: toWireOperationValue(
      getOperationValueSchema('renderModeType'),
      resolveOperationDefault(
        input.renderingMode,
        RenderModeType.wireframe,
        'renderingMode',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'DefinePointOfView',
    request,
    ViewControlProtocol.DefinePointOfViewRequest,
    ViewControlProtocol.DefinePointOfViewResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function getActiveClippingPlanes(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<readonly CollectionObjectName[]> {
  const request =
    ViewControlProtocol.GetActiveClippingPlanesRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'GetActiveClippingPlanes',
    request,
    ViewControlProtocol.GetActiveClippingPlanesRequest,
    ViewControlProtocol.GetActiveClippingPlanesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      [
        'objects',
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        'objects',
      ],
    ],
  );
  return mapped as readonly CollectionObjectName[];
}

export async function getPointOfViewParameters(
  briosa: BriosaClient,
  input: GetPointOfViewParametersInput,
  options: BriosaCallOptions = {},
): Promise<GetPointOfViewParametersResult> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.GetPointOfViewParametersRequest.fromPartial({
      viewName: toWireOperationValue(
        getOperationValueSchema('viewName'),
        requireOperationInput(input.viewName, 'viewName'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'GetPointOfViewParameters',
    request,
    ViewControlProtocol.GetPointOfViewParametersRequest,
    ViewControlProtocol.GetPointOfViewParametersResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [
      ['rotationX', operationScalarSchemas.number, 'rotationX'],
      ['rotationY', operationScalarSchemas.number, 'rotationY'],
      ['rotationZ', operationScalarSchemas.number, 'rotationZ'],
      [
        'restoreZoomSettings',
        operationScalarSchemas.boolean,
        'restoreZoomSettings',
      ],
      ['scaleFactor', operationScalarSchemas.number, 'scaleFactor'],
      ['originX', operationScalarSchemas.number, 'originX'],
      ['originY', operationScalarSchemas.number, 'originY'],
      [
        'restoreRenderMode',
        operationScalarSchemas.boolean,
        'restoreRenderMode',
      ],
    ],
  );
  return mapped as GetPointOfViewParametersResult;
}

export async function hideAllCalloutViews(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = ViewControlProtocol.HideAllCalloutViewsRequest.fromPartial(
    {},
  );
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'HideAllCalloutViews',
    request,
    ViewControlProtocol.HideAllCalloutViewsRequest,
    ViewControlProtocol.HideAllCalloutViewsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function hideObjects(
  briosa: BriosaClient,
  input: HideObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.HideObjectsRequest.fromPartial({
    objectsToHide: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectsToHide, 'objectsToHide'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'HideObjects',
    request,
    ViewControlProtocol.HideObjectsRequest,
    ViewControlProtocol.HideObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function highlightObjects(
  briosa: BriosaClient,
  input: HighlightObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.HighlightObjectsRequest.fromPartial({
    objectNamesEmptyToClearAll: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(
        input.objectNamesEmptyToClearAll,
        'objectNamesEmptyToClearAll',
      ),
    ),
    highLightObjects: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.highLightObjects,
        false,
        'highLightObjects',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'HighlightObjects',
    request,
    ViewControlProtocol.HighlightObjectsRequest,
    ViewControlProtocol.HighlightObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function highlightPoint(
  briosa: BriosaClient,
  input: HighlightPointInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.HighlightPointRequest.fromPartial({
    pointNameEmptyToClearAll: toWireOperationValue(
      getOperationValueSchema('pointName'),
      requireOperationInput(
        input.pointNameEmptyToClearAll,
        'pointNameEmptyToClearAll',
      ),
    ),
    showPoint: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showPoint, false, 'showPoint'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'HighlightPoint',
    request,
    ViewControlProtocol.HighlightPointRequest,
    ViewControlProtocol.HighlightPointResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function highlightRelationships(
  briosa: BriosaClient,
  input: HighlightRelationshipsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.HighlightRelationshipsRequest.fromPartial(
    {
      relationshipsEmptyToClearAll: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(
          input.relationshipsEmptyToClearAll,
          'relationshipsEmptyToClearAll',
        ),
      ),
      highLightRelationships: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.highLightRelationships,
          false,
          'highLightRelationships',
        ),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'HighlightRelationships',
    request,
    ViewControlProtocol.HighlightRelationshipsRequest,
    ViewControlProtocol.HighlightRelationshipsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function loadRibbonBarFromXmlFile(
  briosa: BriosaClient,
  input: LoadRibbonBarFromXmlFileInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.LoadRibbonBarFromXmlFileRequest.fromPartial({
      filePath: toWireOperationValue(
        getOperationValueSchema('fileReference'),
        requireOperationInput(input.filePath, 'filePath'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'LoadRibbonBarFromXmlFile',
    request,
    ViewControlProtocol.LoadRibbonBarFromXmlFileRequest,
    ViewControlProtocol.LoadRibbonBarFromXmlFileResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function refreshViews(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request = ViewControlProtocol.RefreshViewsRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'RefreshViews',
    request,
    ViewControlProtocol.RefreshViewsRequest,
    ViewControlProtocol.RefreshViewsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function resetRibbonBarToDefault(
  briosa: BriosaClient,
  options: BriosaCallOptions = {},
): Promise<void> {
  const request =
    ViewControlProtocol.ResetRibbonBarToDefaultRequest.fromPartial({});
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ResetRibbonBarToDefault',
    request,
    ViewControlProtocol.ResetRibbonBarToDefaultRequest,
    ViewControlProtocol.ResetRibbonBarToDefaultResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function savePointOfView(
  briosa: BriosaClient,
  input: SavePointOfViewInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SavePointOfViewRequest.fromPartial({
    viewName: toWireOperationValue(
      getOperationValueSchema('viewName'),
      requireOperationInput(input.viewName, 'viewName'),
    ),
    restoreZoomSettings: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.restoreZoomSettings,
        true,
        'restoreZoomSettings',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SavePointOfView',
    request,
    ViewControlProtocol.SavePointOfViewRequest,
    ViewControlProtocol.SavePointOfViewResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setBackgroundColor(
  briosa: BriosaClient,
  input: SetBackgroundColorInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetBackgroundColorRequest.fromPartial({
    solidColorName: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(input.solidColorName, 'solidColorName'),
    ),
    gradientStartColorName: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(
        input.gradientStartColorName,
        'gradientStartColorName',
      ),
    ),
    gradientEndColorName: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(input.gradientEndColorName, 'gradientEndColorName'),
    ),
    highlightColor: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(input.highlightColor, 'highlightColor'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetBackgroundColor',
    request,
    ViewControlProtocol.SetBackgroundColorRequest,
    ViewControlProtocol.SetBackgroundColorResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setMpWindowState(
  briosa: BriosaClient,
  input: SetMpWindowStateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetMpWindowStateRequest.fromPartial({
    mpWindowState: toWireOperationValue(
      getOperationValueSchema('windowState'),
      requireOperationInput(input.mpWindowState, 'mpWindowState'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetMpWindowState',
    request,
    ViewControlProtocol.SetMpWindowStateRequest,
    ViewControlProtocol.SetMpWindowStateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setObjectsColor(
  briosa: BriosaClient,
  input: SetObjectsColorInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetObjectsColorRequest.fromPartial({
    objectsToChange: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectsToChange, 'objectsToChange'),
    ),
    newWorkingColorName: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(input.newWorkingColorName, 'newWorkingColorName'),
    ),
    autoIncrement: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.autoIncrement, false, 'autoIncrement'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetObjectsColor',
    request,
    ViewControlProtocol.SetObjectsColorRequest,
    ViewControlProtocol.SetObjectsColorResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setObjectsTranslucency(
  briosa: BriosaClient,
  input: SetObjectsTranslucencyInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetObjectsTranslucencyRequest.fromPartial(
    {
      objectsToChange: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.objectsToChange, 'objectsToChange'),
      ),
      renderingType: toWireOperationValue(
        getOperationValueSchema('translucencyType'),
        requireOperationInput(input.renderingType, 'renderingType'),
      ),
      opacityValue: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.opacityValue, 0, 'opacityValue'),
      ),
    } as never,
  );
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetObjectsTranslucency',
    request,
    ViewControlProtocol.SetObjectsTranslucencyRequest,
    ViewControlProtocol.SetObjectsTranslucencyResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointOfView(
  briosa: BriosaClient,
  input: SetPointOfViewInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetPointOfViewRequest.fromPartial({
    viewName: toWireOperationValue(
      getOperationValueSchema('viewName'),
      requireOperationInput(input.viewName, 'viewName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetPointOfView',
    request,
    ViewControlProtocol.SetPointOfViewRequest,
    ViewControlProtocol.SetPointOfViewResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointOfViewFromFrame(
  briosa: BriosaClient,
  input: SetPointOfViewFromFrameInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.SetPointOfViewFromFrameRequest.fromPartial({
      frame: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.frame, 'frame'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetPointOfViewFromFrame',
    request,
    ViewControlProtocol.SetPointOfViewFromFrameRequest,
    ViewControlProtocol.SetPointOfViewFromFrameResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setPointOfViewFromInstrumentUpdates(
  briosa: BriosaClient,
  input: SetPointOfViewFromInstrumentUpdatesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.SetPointOfViewFromInstrumentUpdatesRequest.fromPartial({
      instrumentId: toWireOperationValue(
        getOperationValueSchema('collectionInstrumentId'),
        requireOperationInput(input.instrumentId, 'instrumentId'),
      ),
      displayViewControl: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.displayViewControl,
          true,
          'displayViewControl',
        ),
      ),
      enableSetViewpointFromInstrumentUpdates: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.enableSetViewpointFromInstrumentUpdates,
          false,
          'enableSetViewpointFromInstrumentUpdates',
        ),
      ),
      updateViewPercent: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.updateViewPercent,
          75,
          'updateViewPercent',
        ),
      ),
      clipBehindProbe: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.clipBehindProbe,
          false,
          'clipBehindProbe',
        ),
      ),
      automaticZoomWhenTrapping: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.automaticZoomWhenTrapping,
          false,
          'automaticZoomWhenTrapping',
        ),
      ),
      enableDirectionalCloudPoints: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.enableDirectionalCloudPoints,
          false,
          'enableDirectionalCloudPoints',
        ),
      ),
      angleResetThreshold: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(
          input.angleResetThreshold,
          45,
          'angleResetThreshold',
        ),
      ),
      animationSteps: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.animationSteps, 8, 'animationSteps'),
      ),
      referenceFrameObject: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.referenceFrameObject,
          'referenceFrameObject',
        ),
      ),
      useScanStripeForViewFocus: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.useScanStripeForViewFocus,
          true,
          'useScanStripeForViewFocus',
        ),
      ),
      zoomFactor: toWireOperationValue(
        operationScalarSchemas.number,
        resolveOperationDefault(input.zoomFactor, 1, 'zoomFactor'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetPointOfViewFromInstrumentUpdates',
    request,
    ViewControlProtocol.SetPointOfViewFromInstrumentUpdatesRequest,
    ViewControlProtocol.SetPointOfViewFromInstrumentUpdatesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setRenderModeType(
  briosa: BriosaClient,
  input: SetRenderModeTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetRenderModeTypeRequest.fromPartial({
    renderingMode: toWireOperationValue(
      getOperationValueSchema('renderModeType'),
      requireOperationInput(input.renderingMode, 'renderingMode'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetRenderModeType',
    request,
    ViewControlProtocol.SetRenderModeTypeRequest,
    ViewControlProtocol.SetRenderModeTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setSaWindowPos(
  briosa: BriosaClient,
  input: SetSaWindowPosInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetSaWindowPosRequest.fromPartial({
    posX: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.posX, 0, 'posX'),
    ),
    posY: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.posY, 0, 'posY'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetSaWindowPos',
    request,
    ViewControlProtocol.SetSaWindowPosRequest,
    ViewControlProtocol.SetSaWindowPosResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setSaWindowSize(
  briosa: BriosaClient,
  input: SetSaWindowSizeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetSaWindowSizeRequest.fromPartial({
    width: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.width, 0, 'width'),
    ),
    height: toWireOperationValue(
      operationScalarSchemas.integer,
      resolveOperationDefault(input.height, 0, 'height'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetSaWindowSize',
    request,
    ViewControlProtocol.SetSaWindowSizeRequest,
    ViewControlProtocol.SetSaWindowSizeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setSaWindowState(
  briosa: BriosaClient,
  input: SetSaWindowStateInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetSaWindowStateRequest.fromPartial({
    saWindowState: toWireOperationValue(
      getOperationValueSchema('windowState'),
      requireOperationInput(input.saWindowState, 'saWindowState'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetSaWindowState',
    request,
    ViewControlProtocol.SetSaWindowStateRequest,
    ViewControlProtocol.SetSaWindowStateResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setTargetLabelsUseFullNames(
  briosa: BriosaClient,
  input: SetTargetLabelsUseFullNamesInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.SetTargetLabelsUseFullNamesRequest.fromPartial({
      useFullNames: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.useFullNames, false, 'useFullNames'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetTargetLabelsUseFullNames',
    request,
    ViewControlProtocol.SetTargetLabelsUseFullNamesRequest,
    ViewControlProtocol.SetTargetLabelsUseFullNamesResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setToolkitVisibility(
  briosa: BriosaClient,
  input: SetToolkitVisibilityInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetToolkitVisibilityRequest.fromPartial({
    showToolkit: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showToolkit, false, 'showToolkit'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetToolkitVisibility',
    request,
    ViewControlProtocol.SetToolkitVisibilityRequest,
    ViewControlProtocol.SetToolkitVisibilityResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setViewClippingPlane(
  briosa: BriosaClient,
  input: SetViewClippingPlaneInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetViewClippingPlaneRequest.fromPartial({
    object: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.object, 'object'),
    ),
    removeClippingPlane: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.removeClippingPlane,
        false,
        'removeClippingPlane',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetViewClippingPlane',
    request,
    ViewControlProtocol.SetViewClippingPlaneRequest,
    ViewControlProtocol.SetViewClippingPlaneResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setWorkingColor(
  briosa: BriosaClient,
  input: SetWorkingColorInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.SetWorkingColorRequest.fromPartial({
    newWorkingColorName: toWireOperationValue(
      getOperationValueSchema('color'),
      requireOperationInput(input.newWorkingColorName, 'newWorkingColorName'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetWorkingColor',
    request,
    ViewControlProtocol.SetWorkingColorRequest,
    ViewControlProtocol.SetWorkingColorResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function setWorkingColorAutoIncrement(
  briosa: BriosaClient,
  input: SetWorkingColorAutoIncrementInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.SetWorkingColorAutoIncrementRequest.fromPartial({
      autoIncrement: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.autoIncrement, false, 'autoIncrement'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'SetWorkingColorAutoIncrement',
    request,
    ViewControlProtocol.SetWorkingColorAutoIncrementRequest,
    ViewControlProtocol.SetWorkingColorAutoIncrementResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideByObjectType(
  briosa: BriosaClient,
  input: ShowHideByObjectTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHideByObjectTypeRequest.fromPartial({
    allCollections: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.allCollections, false, 'allCollections'),
    ),
    specificCollection: toWireOperationValue(
      getOperationValueSchema('collectionName'),
      requireOperationInput(input.specificCollection, 'specificCollection'),
    ),
    objectTypeToShowHide: toWireOperationValue(
      getOperationValueSchema('objectType'),
      resolveOperationDefault(
        input.objectTypeToShowHide,
        ObjectType.any,
        'objectTypeToShowHide',
      ),
    ),
    hideShowFalse: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.hideShowFalse, true, 'hideShowFalse'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideByObjectType',
    request,
    ViewControlProtocol.ShowHideByObjectTypeRequest,
    ViewControlProtocol.ShowHideByObjectTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideCalloutView(
  briosa: BriosaClient,
  input: ShowHideCalloutViewInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHideCalloutViewRequest.fromPartial({
    calloutViewToShow: toWireOperationValue(
      getOperationValueSchema('collectionItemName'),
      requireOperationInput(input.calloutViewToShow, 'calloutViewToShow'),
    ),
    showCalloutView: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showCalloutView, true, 'showCalloutView'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideCalloutView',
    request,
    ViewControlProtocol.ShowHideCalloutViewRequest,
    ViewControlProtocol.ShowHideCalloutViewResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideDimension(
  briosa: BriosaClient,
  input: ShowHideDimensionInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHideDimensionRequest.fromPartial({
    dimensionName: toWireOperationValue(
      getOperationValueSchema('collectionItemName'),
      requireOperationInput(input.dimensionName, 'dimensionName'),
    ),
    showDimension: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showDimension, true, 'showDimension'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideDimension',
    request,
    ViewControlProtocol.ShowHideDimensionRequest,
    ViewControlProtocol.ShowHideDimensionResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHidePoints(
  briosa: BriosaClient,
  input: ShowHidePointsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHidePointsRequest.fromPartial({
    pointNames: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('pointName')),
      requireOperationInput(input.pointNames, 'pointNames'),
    ),
    showHideFalse: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showHideFalse, false, 'showHideFalse'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHidePoints',
    request,
    ViewControlProtocol.ShowHidePointsRequest,
    ViewControlProtocol.ShowHidePointsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showByObjectType(
  briosa: BriosaClient,
  input: ShowByObjectTypeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowByObjectTypeRequest.fromPartial({
    objectTypeToShow: toWireOperationValue(
      getOperationValueSchema('collectionObjectName'),
      requireOperationInput(input.objectTypeToShow, 'objectTypeToShow'),
    ),
    allCollections: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.allCollections, false, 'allCollections'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowByObjectType',
    request,
    ViewControlProtocol.ShowByObjectTypeRequest,
    ViewControlProtocol.ShowByObjectTypeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showItemsInTree(
  briosa: BriosaClient,
  input: ShowItemsInTreeInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowItemsInTreeRequest.fromPartial({
    collapseAllOtherItems: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.collapseAllOtherItems,
        true,
        'collapseAllOtherItems',
      ),
    ),
    points: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('pointName')),
      requireOperationInput(input.points, 'points'),
    ),
    objects: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objects, 'objects'),
    ),
    instruments: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionInstrumentId')),
      requireOperationInput(input.instruments, 'instruments'),
    ),
    featureChecks: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionItemName')),
      requireOperationInput(input.featureChecks, 'featureChecks'),
    ),
    datums: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.datums, 'datums'),
    ),
    collections: toWireOperationValue(
      repeatedOperationValue(operationScalarSchemas.string),
      requireOperationInput(input.collections, 'collections'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowItemsInTree',
    request,
    ViewControlProtocol.ShowItemsInTreeRequest,
    ViewControlProtocol.ShowItemsInTreeResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showLabels(
  briosa: BriosaClient,
  input: ShowLabelsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowLabelsRequest.fromPartial({
    pointLabelsOn: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.pointLabelsOn, false, 'pointLabelsOn'),
    ),
    objectsLabelsOn: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.objectsLabelsOn, false, 'objectsLabelsOn'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowLabels',
    request,
    ViewControlProtocol.ShowLabelsRequest,
    ViewControlProtocol.ShowLabelsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showObjects(
  briosa: BriosaClient,
  input: ShowObjectsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowObjectsRequest.fromPartial({
    objectsToShow: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
      requireOperationInput(input.objectsToShow, 'objectsToShow'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowObjects',
    request,
    ViewControlProtocol.ShowObjectsRequest,
    ViewControlProtocol.ShowObjectsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideAnnotationsForDatums(
  briosa: BriosaClient,
  input: ShowHideAnnotationsForDatumsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideAnnotationsForDatumsRequest.fromPartial({
      datumNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionObjectName')),
        requireOperationInput(input.datumNameList, 'datumNameList'),
      ),
      show: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.show, false, 'show'),
      ),
      highlight: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.highlight, false, 'highlight'),
      ),
      setInspectionView: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.setInspectionView,
          false,
          'setInspectionView',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideAnnotationsForDatums',
    request,
    ViewControlProtocol.ShowHideAnnotationsForDatumsRequest,
    ViewControlProtocol.ShowHideAnnotationsForDatumsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideAnnotationsForFeatureChecks(
  briosa: BriosaClient,
  input: ShowHideAnnotationsForFeatureChecksInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideAnnotationsForFeatureChecksRequest.fromPartial({
      featureCheckNameList: toWireOperationValue(
        repeatedOperationValue(getOperationValueSchema('collectionItemName')),
        requireOperationInput(
          input.featureCheckNameList,
          'featureCheckNameList',
        ),
      ),
      show: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.show, false, 'show'),
      ),
      highlight: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.highlight, false, 'highlight'),
      ),
      setInspectionView: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.setInspectionView,
          false,
          'setInspectionView',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideAnnotationsForFeatureChecks',
    request,
    ViewControlProtocol.ShowHideAnnotationsForFeatureChecksRequest,
    ViewControlProtocol.ShowHideAnnotationsForFeatureChecksResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideInspectionBar(
  briosa: BriosaClient,
  input: ShowHideInspectionBarInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHideInspectionBarRequest.fromPartial({
    showInspectionBar: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(
        input.showInspectionBar,
        true,
        'showInspectionBar',
      ),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideInspectionBar',
    request,
    ViewControlProtocol.ShowHideInspectionBarRequest,
    ViewControlProtocol.ShowHideInspectionBarResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideInstrumentInterface(
  briosa: BriosaClient,
  input: ShowHideInstrumentInterfaceInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideInstrumentInterfaceRequest.fromPartial({
      instrumentId: toWireOperationValue(
        getOperationValueSchema('collectionInstrumentId'),
        requireOperationInput(input.instrumentId, 'instrumentId'),
      ),
      minimizeInterface: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.minimizeInterface,
          false,
          'minimizeInterface',
        ),
      ),
      hideInterface: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(input.hideInterface, false, 'hideInterface'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideInstrumentInterface',
    request,
    ViewControlProtocol.ShowHideInstrumentInterfaceRequest,
    ViewControlProtocol.ShowHideInstrumentInterfaceResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideInstrumentProbeTip(
  briosa: BriosaClient,
  input: ShowHideInstrumentProbeTipInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideInstrumentProbeTipRequest.fromPartial({
      showInstrumentProbeTip: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showInstrumentProbeTip,
          false,
          'showInstrumentProbeTip',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideInstrumentProbeTip',
    request,
    ViewControlProtocol.ShowHideInstrumentProbeTipRequest,
    ViewControlProtocol.ShowHideInstrumentProbeTipResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideInstruments(
  briosa: BriosaClient,
  input: ShowHideInstrumentsInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request = ViewControlProtocol.ShowHideInstrumentsRequest.fromPartial({
    instrumentIDs: toWireOperationValue(
      repeatedOperationValue(getOperationValueSchema('collectionInstrumentId')),
      requireOperationInput(input.instrumentIDs, 'instrumentIDs'),
    ),
    showInstruments: toWireOperationValue(
      operationScalarSchemas.boolean,
      resolveOperationDefault(input.showInstruments, false, 'showInstruments'),
    ),
  } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideInstruments',
    request,
    ViewControlProtocol.ShowHideInstrumentsRequest,
    ViewControlProtocol.ShowHideInstrumentsResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideRelationshipReport(
  briosa: BriosaClient,
  input: ShowHideRelationshipReportInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideRelationshipReportRequest.fromPartial({
      collectionName: toWireOperationValue(
        getOperationValueSchema('collectionName'),
        requireOperationInput(input.collectionName, 'collectionName'),
      ),
      showRelationshipReport: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showRelationshipReport,
          false,
          'showRelationshipReport',
        ),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideRelationshipReport',
    request,
    ViewControlProtocol.ShowHideRelationshipReportRequest,
    ViewControlProtocol.ShowHideRelationshipReportResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}

export async function showHideRelationshipWatch(
  briosa: BriosaClient,
  input: ShowHideRelationshipWatchInput,
  options: BriosaCallOptions = {},
): Promise<void> {
  if (typeof input !== 'object' || input === null)
    throw new TypeError('input is required.');
  const request =
    ViewControlProtocol.ShowHideRelationshipWatchRequest.fromPartial({
      relationshipName: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(input.relationshipName, 'relationshipName'),
      ),
      showRelationshipWatch: toWireOperationValue(
        operationScalarSchemas.boolean,
        resolveOperationDefault(
          input.showRelationshipWatch,
          false,
          'showRelationshipWatch',
        ),
      ),
      relationshipWatchWindowProperties: toWireOperationValue(
        getOperationValueSchema('collectionObjectName'),
        requireOperationInput(
          input.relationshipWatchWindowProperties,
          'relationshipWatchWindowProperties',
        ),
      ),
      windowTopLeftXPosition: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.windowTopLeftXPosition,
          0,
          'windowTopLeftXPosition',
        ),
      ),
      windowTopLeftYPosition: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(
          input.windowTopLeftYPosition,
          0,
          'windowTopLeftYPosition',
        ),
      ),
      windowWidth: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.windowWidth, 0, 'windowWidth'),
      ),
      windowHeight: toWireOperationValue(
        operationScalarSchemas.integer,
        resolveOperationDefault(input.windowHeight, 0, 'windowHeight'),
      ),
    } as never);
  const response = await invokeClientOperation(
    briosa,
    'ViewControl',
    'ShowHideRelationshipWatch',
    request,
    ViewControlProtocol.ShowHideRelationshipWatchRequest,
    ViewControlProtocol.ShowHideRelationshipWatchResult,
    options,
  );
  const mapped = mapOperationResponse(
    response as Readonly<Record<string, unknown>>,
    [],
  );
  return mapped as void;
}
