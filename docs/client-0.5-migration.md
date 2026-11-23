# Migrating to Client 0.5 (Server 0.10.x)

Client 0.5.0 of both exact-target packages, `@spatialanalyzer/briosa-2026.1.0529.7`
and `@spatialanalyzer/briosa-2024.1.0508.5`, targets Briosa Server 0.10.x.
Client 0.5.0 was tested with Server 0.10.0. Upgrading from Client 0.4.0 to
Client 0.5.0 requires application changes; use Server 0.10.x with the new
client. For server releases after 0.10.0, a patch update keeps the same clients
working; a minor update may require a client upgrade. The authoritative
description of every server change is the
[Server 0.10.0 change record](https://github.com/spatialanalyzer/briosa/blob/main/docs/development/contract-major-3.md);
this page lists what JavaScript and TypeScript callers change.

Upgrade an application by installing Server 0.10.x beside the existing server,
moving its dependency to the 0.5.x package for the same exact SA target, applying
the changes below, and running its tests. Client 0.4.x packages keep selecting
Server 0.9.x installations (and do not work with Server 0.10.x), so they remain
available for rollback.

## Server selection

- Client 0.5.x works with Server 0.10.x. Before launch, it checks that the
  installation matches the exact SA target and declares support for this client.
  It rejects Server 0.9.x and earlier. Rejected installations fail before launch
  with `server-installation-incompatible`.
- The default startup budget, `startupTimeoutMs`, is 120000 (two minutes). It is
  sized from the server's lifecycle bounds; see the
  [public API contract](design/v1-public-api-contract.md#startup-and-lifecycle-time-budgets).

## Admission

The server's packaged default narrows from every operation to the `standard`
admission profile ([admission profile migration](https://github.com/spatialanalyzer/briosa/blob/main/docs/development/admission-profile-migration.md)).
The facades stay in the package, and a denied call fails with
`BriosaOperationError` of kind `policyDenied` and disposition `notStarted`.

- The seven device-configuration setters need `Profile=device`, `Profile=full`,
  `Flags:device_config=allow`, or a per-operation `allow` override:
  `setAbsoluteInstrumentScaleFactor`, `setMultiplyInstrumentScaleFactor`,
  `setRobotMachineModelLinkParameters`, `setActiveRobotCalibration`,
  `setRobotCalibrationToolFrame`,
  `setRobotCalibrationMeasurementOffsetInToolFrame`, and
  `setProbeOffsetFrameOffline`.
- Operations, and request options, that open or block on operator UI need the
  server's interactive opt-in, `Flags:interactive_ui=allow`, or a per-operation
  `allow` override. Without either, a request that is denied only because one of
  its options opens operator UI fails with `operation-option-denied`, and a
  request for an operation that the profile doesn't admit fails with
  `operation-policy-denied`. Flags explicitly set to `deny` are checked before
  the profile, though: with `Flags:interactive_ui=deny`, a request whose option
  opens operator UI fails with `operation-option-denied` even when the profile
  doesn't admit its operation, unless one of the operation's own risk flags is
  set to `deny` too, in which case it fails with `operation-policy-denied`. A
  per-operation `allow` override admits the operation even over a flag `deny`;
  only unreviewed operations, requests that cannot be read against their
  reviewed options (`operation-request-unclassified`), exclusive workflows, and
  requests that leave work running after the call returns are denied before
  overrides apply.
- Multi-call exclusive workflows (device, trapping, watch, robot-interface, and
  appliance sessions) are denied under every setting.
- For any other operation, setting `waitForCompletion`, `waitForComplete`, or
  `acknowledgeArrival` to `false` leaves work running after the call returns,
  so the request is denied under every setting with
  `operation-option-isolation-unsupported`. Neither the interactive opt-in nor
  an `allow` override admits it, even when the request also opens operator UI.

## Discovery

- `BriosaServerSnapshot` reports `admissionProfile` and `policyFingerprint`. The
  fingerprint is opaque: compare it only for equality, for example to tell
  whether a replacement generation runs under the same policy.
- Each `BriosaOperationCapability` reports `riskFlags` (an ordered set; empty
  means no reviewed risk applies), `durationClass`, `validationStatus`, and
  `admission`, all taken from the server. A value added in a later compatible
  server release maps to `'unknown'`. The validation status is informational and
  never blocks an admitted operation.
- `briosa.listCapabilities({ includeDenied: true })` is a diagnostic listing of
  every registered operation, each denied one with its denial reason, such as
  `deniedOverride` or `deniedExclusive`. It never changes which operations the
  generation admits.
- A capability describes the operation's reviewed row. A request option can
  still open operator UI or leave work running, and the server can deny that
  request; the client does not pre-validate request options.

## Request defaults that changed

Waiting is now the default. The server denies the old values: those of
`measureImmediately`, `autoStart`, and `promptOnMissingComponents` need the
interactive opt-in, and the non-waiting values of `waitForComplete` and
`acknowledgeArrival` are never admitted.

| Operation                                                    | Field                       | 0.4.0 default | 0.5.0 default |
| ------------------------------------------------------------ | --------------------------- | ------------- | ------------- |
| `instrumentOperations.measureSinglePointHere`                | `measureImmediately`        | `false`       | `true`        |
| `instrumentOperations.configureAndMeasure`                   | `measureImmediately`        | `false`       | `true`        |
| `instrumentOperations.measureExistingSinglePoint`            | `measureImmediately`        | `false`       | `true`        |
| `instrumentOperations.measureExistingSinglePointAndCompare`  | `measureImmediately`        | `false`       | `true`        |
| `instrumentOperations.measureExistingSinglePointManualGuide` | `measureImmediately`        | `false`       | `true`        |
| `instrumentOperations.autoMeasurePoints`                     | `autoStart`                 | `false`       | `true`        |
| `instrumentOperations.autoMeasureSpecifiedGeometry`          | `waitForComplete`           | `false`       | `true`        |
| `robotOperations.moveRobotMachineToFrame`                    | `acknowledgeArrival`        | `false`       | `true`        |
| `robotOperations.moveRobotMachineToNamedDestination`         | `acknowledgeArrival`        | `false`       | `true`        |
| `directCadAccess`                                            | `promptOnMissingComponents` | `true`        | `false`       |

## Argument rules

The client never sends an empty value, 0, or false for an argument the caller
left unset, and it does not pre-validate empty strings. The server rejects an
invalid request before dispatch with `BriosaOperationError` of kind
`validation`, diagnostic `request-validation-failed`, and disposition
`notStarted`, so the request is safe to correct and resend
([argument defaults migration](https://github.com/spatialanalyzer/briosa/blob/main/docs/development/argument-defaults-migration.md)).

Now optional, with no default; the field is left unset when omitted:

- `createChartFromVectorGroup`: `templateChartName`;
- `setUserInterfaceProfile`: `profileFileName`;
- `fitGeometryToPointGroup`, `fitGeometryToPoints`, and
  `fitGeometryToPointGroupProjectedToPlane`: `startingConditionGeometry`.
  SpatialAnalyzer then fits without a starting geometry.

Now required, with no default. Omitting one is a TypeScript compile error and a
`TypeError` before any call:

- the `tolerance` and `constraint` of `makeGroupToGroupRelationship`,
  `makeGroupToNominalGroupRelationship`, `makePointToPointRelationship`, and
  `makePointsToPointsRelationship`. For a relationship without limits, pass
  `ToleranceVectorOptions.noLimits` explicitly;
- `robotOperations.moveRobotMachineToJointPoseSixDof`: `joint1` to `joint6`;
- `instrumentOperations.setInstrumentWeatherSetting`: `setAutomatically`;
- `scaleObjects`, `instrumentOperations.setAbsoluteInstrumentScaleFactor`, and
  `instrumentOperations.setMultiplyInstrumentScaleFactor`: `scaleFactor`;
- `robotOperations.setRobotMachineParameter`: `parameterValue` and
  `parameterName`. An explicit name, even an empty one, is sent unchanged;
- `robotOperations.setRobotMachineModelLinkParameters`: `configuration`, and all
  25 members of `RobotModelLinkConfiguration`: the 22 parameters from
  `dhAlphaComponent` through `segmentCgMassKg`, `linkType` (no longer `'DH'` by
  default), `activeJointComponent` (no longer `'NONE'`), and
  `segmentCgInSegment`;
- `instrumentOperations.deleteMeasurementObservation` and
  `instrumentOperations.moveMeasurementObservation`: `observationIndex`;
  `deleteIthVectorFromVectorGroup`: `vectorIndex`;
- `deleteFolder`: `folderPath`; `deleteVariable`: `name`;
  `deleteVariablesWildcardMatch`: `variableWildcardCriteria`;
  `deleteVectorByName`: `vectorName`;
  `constructionOperations.deleteCollectionsByWildcard` and
  `constructionOperations.deleteFoldersByWildcard`: `searchString`;
  `robotOperations.deleteRobotCalibration`: `calibrationName`;
  `removeReportTag`: `tagName`. The server also rejects an empty or
  whitespace-only value for these;
- `instrumentOperations.locateInstrumentGroupToSurfaceQuickFit`:
  `otherObjectsToTransform`;
- `gdtOperations.featureInspectionAutoFilter`: `pointNames`, `groupNames`,
  `cloudNames`, and `featureCheckNameList`, so the input itself is required.

### Inputs the server requires

Every input that Server 0.10.0 requires is now required in the public types too,
and the client fills none of them in: no identity transform, no default settings
value, and no empty list. The server rejects each of these before dispatch when
it is absent, so a call that omitted one never succeeded. Omitting one is now a
TypeScript compile error and a `TypeError` before any call. Lists among them are
sent as given; the server also rejects some of them when empty.

- `autoFilterCloudsToNominalGeometry2D`: `filterProximitySettings2D`;
  `autoFilterCloudsToNominalGeometry3D` and
  `autoFilterPointsToNominalGeometry3D`: `filterProximitySettings3D`, with every
  member of `FilterProximitySettings` (below);
- `autoFilterPointsGroupsCloudsToSurfaceFaces`: `points`, `groups`, `clouds`, and
  `offsetDirection`;
- `createPointsToObjectsMap`: `points` and `groups`;
- `doRelationshipFit` and `moveCollectionsByMinimizingRelationships`:
  `motionToAllow`;
- `extractGeometryFromPointClouds` (SA 2026): `geometryType` and
  `boundingPoints`;
- `makeDynamicCircleRelationship`, `makeDynamicEllipseRelationship`,
  `makeDynamicLineRelationship`, `makeDynamicPlaneRelationship`, and
  `makeDynamicPointRelationship`: `constructionMode`, and for the point also
  `thirdReferenceGeometry`;
- `makeFrameToFrameRelationship`: `orientationTolerance` and
  `positionTolerance`;
- `makeGroupsToObjectsRelationship`, `makePointCloudsToObjectsRelationship`, and
  `makePointsToObjectsRelationship`: `projectionOptions`;
- `relationshipWatchWindowTemplate`: the input, `watchWindowTemplateName`, and
  `options` with `options.udpNetworkTransmitSettings`;
- `setObjectToObjectDirectionRelationshipTolerances`:
  `angleBetweenVectorsTolerances` and `mutualPerpendicularLengthTolerances`;
- `setPointsToPointsRelationshipAssociatedData`: `nominalPoints` and
  `actualPoints`; `setRelationshipAssociatedData`: `individualPoints`,
  `pointGroups`, `pointClouds`, and `objects`;
- `exportQdasCharacteristics` and `prepareQdasDataList` (SA 2026):
  `k0004DateTimeStamp`, which loses its fixed `'2026-07-20/16:32:22'` default;
- `constructionOperations`: `createPointCallout.desiredCoordinateSystem`;
  `constructCrossSectionCloud.referenceObject`;
  `constructEllipsoid.transformInWorkingCoordinates`;
  `constructFrame.transformInWorkingCoordinates`;
  `constructFrameFromTransformInWorld.transformInWorldCoordinates`;
  `constructPointFromCloudPointRuntimeSelect.constructedPointName`;
  `constructPointsFromSurfacesOnUvGrid.edgePointMode`;
  `constructPointsShiftedInWorkingFrame.shiftVector`;
  `constructPointsSubsetWithGreatestSpacing.groupForSubset`;
  `getGradientAtProjectedPointOnSurfaceEdge.edgeOffsetDirection`;
  `makeCollectionItemNameRefListWildcardSelection.itemType`; and `objectType` of
  `makeCollectionObjectNameRefListByType`,
  `makeCollectionObjectNameRefListByTypeAndColor`,
  `makeCollectionObjectNameRefListRuntimeSelect`,
  `makeCollectionObjectNameRefListWildcardSelection`, and
  `makeCollectionObjectNameRuntimeSelect`;
- `gdtOperations`: `enableDisableDatumAlignmentForFeatureCheck.alignment`;
  `featureInspectionAutoFilter.offsetDirection`; `objects`,
  `geometryRelationships`, `auxiliaryObject`, and
  `auxiliaryGeometryRelationship` of `makeGdtDatumAnnotation` and
  `makeGdtFeatureCheckAnnotation`; `setGdtOptions.distanceBetweenMode` and
  `evaluationMethod`;
- `instrumentOperations`:
  `autoCorrespondWithProximityTrigger.deviationVectorGroupName` (an empty name
  still means none); `buildTarget.tolerance`;
  `calculateTcpFixtureUncertainties.tcpInWorking`; `collimation.tiltMode`,
  `baselineMethod`, `scalePoint1`, `scalePoint2`,
  `notMeasuredByMovingInstrument`, and `asMeasuredByMovingInstrument`;
  `setObservationCollimationShotOptions.targetedInstrument`;
  `locateInstrumentsUsmn.showUsmnDialog`;
  `setTargetComputationOptions.computationMethod`;
- `robotOperations`: `setRobotCalibrationToolFrame.toolFrame`,
  `setRobotCalibrationMeasurementOffsetInToolFrame.measurementFrame`, and
  `setRobotMachineBaseTransform.destinationTransform`;
- `robotCalibrationApplianceNodeOperations.setCalibrationApplianceNodeMeasurementOffsetTransform`:
  `measurementOffsetTransform`.

Where every member of an input was optional, the input itself is now required:
`relationshipWatchWindowTemplate`, `gdtOperations.setGdtOptions`,
`instrumentOperations.setTargetComputationOptions`, and
`constructPointFromCloudPointRuntimeSelect`,
`makeCollectionItemNameRefListWildcardSelection`,
`makeCollectionObjectNameRefListRuntimeSelect`,
`makeCollectionObjectNameRefListWildcardSelection`, and
`makeCollectionObjectNameRuntimeSelect` of `constructionOperations`.

`ReportOutputOptions`, the `reportOutputOptions` of `defineReportTemplate` and
`generateQuickReportFromTabOrder`, is now a union type: options you pass need
exactly one destination, `externalPath` or `embeddedFile`. Neither or both is a
compile error and a `TypeError` before any call. When you omit the options, the
client sends the server's default, an embedded report named `My Report`. The
0.4.0 client never sent the destination, and Server 0.10.0 rejects report
options without one; 0.5.0 sends it.

All eleven members of `FilterProximitySettings` are required, with no
defaults. The server rejects an unspecified proximity mode, and it passes the
six distances and two Booleans to SpatialAnalyzer as given, so an omitted one
would reach SA as 0 or false. The distances are in the job's length units, so
choose them for your job. These values are only an example:

```ts
const filterProximitySettings3D = {
  surfaceInclusionProximity: 0.1,
  edgeExclusionProximity: 0.1,
  planarInclusionProximity: 0.5,
  planarExclusionProximity: 0.1,
  radialInclusionProximity: 0.1,
  geometryExtractionTolerance: 0.01,
  surfaceProximityMode: 'both',
  planarProximityMode: 'both',
  radialProximityMode: 'both',
  projectToPlane: true,
  assertPlaneBoundaries: false,
} as const;
```

The weather values `temperature`, `pressure`, and `relativeHumidity` of
`setInstrumentWeatherSetting` stay optional but lose their 0 default. When
omitted, the field is left unset: the server rejects that while
`setAutomatically` is false, and uses 0 when it is true.

These stay as they were: the USMN `excludedGroups` list of
`instrumentOperations.locateInstrumentsUsmn` stays optional, and an omitted list
is sent empty. Server 0.10.x then skips SpatialAnalyzer's setter, which
licensed probes showed runs USMN correctly. The USMN `nominalsGroup` and the
`constructPlanesBoundingPointGroup` plane names stay optional and are left unset
when omitted, which Server 0.10.x now accepts.

## Removed operations

Client 0.5.0 removes these nine operations for Server 0.10.0. Eight failed to
produce a usable result in licensed testing; the ninth could not be verified.
They are removed with their inputs and value types (`CircleLineMode`,
`MeshOrientationType`, and `MirrorFramePlane`):

| Operation                                                                   | Replacement                                                                                                                                                                                                     |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deleteCloudPointsByXYZRange`                                               | None. There is no X Y Z box delete; the radial delete has different semantics, and a licensed session validated it on both targets for one cloud and one point.                                                 |
| `mirrorObjects`                                                             | None.                                                                                                                                                                                                           |
| `constructionOperations.constructCirclesLinesFromSurfaces`                  | None.                                                                                                                                                                                                           |
| `constructionOperations.addCollectionInstrumentsToRefListWildcardSelection` | Build the instrument reference list directly.                                                                                                                                                                   |
| `constructionOperations.makeCalloutViewRefListWildcardSelection`            | `constructionOperations.makeCollectionItemNameRefListWildcardSelection`. Use the callout-view item type. This is a different MP step; that item type has not been observed on a licensed run.                   |
| `constructionOperations.setCalloutViewProperties`                           | None. `setDefaultCalloutViewProperties` stays.                                                                                                                                                                  |
| `constructionOperations.constructPolygonizedSurfaceFromPointClouds`         | None.                                                                                                                                                                                                           |
| `constructionOperations.makeCollectionVectorGroupNameRefListRuntimeSelect`  | None.                                                                                                                                                                                                           |
| `constructionOperations.makeVectorNameRefListRuntimeSelect`                 | None yet. SpatialAnalyzer never rejected it, but no operator could complete the selection in licensed testing, so it is unverified. A later compatible release can bring it back once a licensed session verifies it. |

## Typed outcomes

- **SDK call faults.** `OperationFailureKind` gains `sdkCallFaulted`: one SDK
  call threw during the MP sequence. Read the proven phase from
  `executionDisposition`: `notStarted` (before Execute Step, do not replay),
  `startedOutcomeUnknown` (reconcile before any replay), or `completed` (an
  output getter threw after the MP returned code 2 or 4).
- **Partial success.** An MP that returns code 4 (PARTIAL SUCCESS) did its work.
  The call is never retried, and it resolves with its outputs when the server
  retrieves all of them. Pass `onMpCompletion` in the call options to observe
  each call's completion,
  `{ state: 'succeeded' | 'partialSuccess', mpResultCode }`:

  ```ts
  await getWorkingDirectory(briosa, {
    onMpCompletion: ({ state, mpResultCode }) => {
      if (state === 'partialSuccess') console.warn(`MP code ${mpResultCode}`);
    },
  });
  ```

  The client checks every success, whether or not a callback is passed: a
  success needs execution details with `succeeded` and MP code 2, or
  `partialSuccess` and MP code 4. Anything else fails with
  `BriosaProtocolError` (`mp-completion-missing` or `mp-completion-invalid`),
  because the server always reports the code. The callback runs once, after that
  check and before the outputs are mapped, so it reports the completion even if
  output mapping then fails; an exception it throws rejects the call.

  The server retrieves the outputs before it replies. If it can't retrieve one
  after code 4, the call rejects with `BriosaOperationError` instead, and the
  callback isn't called, because the call didn't succeed. The kind is
  `outputRetrievalFailure` when a getter returned no usable value or the worker
  couldn't deliver the outputs, for example one too large to encode, and
  `sdkCallFaulted` when a getter threw. Both have the `executionDisposition`
  `completed` and the `replayGuidance` `doNotReplay`, and their `mpExecution`
  keeps the state `partialSuccess` and MP code 4.

  Four operations report code 4 as an ordinary `mpFailure`, whose `mpExecution`
  has state `failed` and code 4: `constructPointFromSurveyTargetCenter`,
  `openSaFile`, `openTemplateFile`, and `setReportOptionsForObject`. On SA 2026
  the target documentation says code 4 leaves the work undone for all four. On
  SA 2024 it says so for `constructPointFromSurveyTargetCenter` and
  `setReportOptionsForObject`, and lists no code 4 for `openSaFile` and
  `openTemplateFile`. Those two report it as a failure on SA 2024 too, by the
  maintainer decision on
  [spatialanalyzer/briosa#351](https://github.com/spatialanalyzer/briosa/issues/351):
  reporting a discarded open job as a success would be worse than a false
  failure.

- **MP execution details.** `BriosaOperationError.mpExecution` carries the
  server's value-free MP execution details (`state`, `mpResultCode`, and
  `outputRetrievals`), or `null`. A `partialSuccess` state stays distinct there
  too, for example when an output could not be retrieved after code 4.
  `outputRetrievals` holds the per-output states that the server reports. They
  don't always identify the getter that failed: when the worker can't deliver
  the outputs, every output can be marked `failed`, whether the kind is
  `outputRetrievalFailure` or `sdkCallFaulted`.
- **Modal dialogs.** When a SpatialAnalyzer modal dialog holds an MP, the
  failure stays `workerWatchdogTimeout` with `startedOutcomeUnknown`, its
  diagnostic is `sa-modal-dialog-open`, and recovery guidance is
  `operatorInterventionRequired`: an operator must dismiss the dialog, and
  replacing the worker does not help. A readiness probe held by a dialog
  reports the same diagnostic with operator recovery. The server setting
  `Briosa:SpatialAnalyzer:InteractionMode` (default `Unchanged`; `Silent` is
  recommended for unattended stations) sets SpatialAnalyzer's interaction mode
  after every Connect. SpatialAnalyzer keeps the mode across restarts and has no
  getter for it. Clients don't set it.

## Lifecycle and cancellation

- Aborting a lifecycle call's `signal`, for example with
  `AbortSignal.timeout(...)`, rejects it with `BriosaCallAbortedError` and stops
  only the caller's wait. Once the server has accepted a Start, Connect,
  Reconnect, Recover, or Launch, it finishes the exchange under its own bounds,
  so an abandoned startup may still produce a running or ready generation.
  Refresh state with `getSpatialAnalyzerSdkState()` or
  `getSpatialAnalyzerState()` before deciding what to do next.
- `sdk-lifecycle-transition-in-progress` and
  `application-lifecycle-transition-in-progress` (kind `stateConflict`,
  guidance `refreshState`) mean another accepted transition is still running:
  refresh state and retry later. Stop a generation you own only after the
  transition has ended.
- Both lifecycle failure kinds gain `callerCancelled` and
  `callerDeadlineExceeded`. A remote caller rarely receives them, because gRPC
  delivers no response after a cancellation or deadline; the client never
  reports them as a state conflict and never retries.
- MP calls made after a manual SDK connection need the server snapshot to report
  readiness too: call `getServerSnapshot()` once the SDK state is ready.

## Call options on every operation

Every operation takes the optional trailing `BriosaCallOptions` argument, so
each call can be cancelled with its `signal` and observed with `onMpCompletion`.
Eleven `gdtOperations` methods took none in 0.4.0 and now take it:
`deleteFeatureChecks`, `makeAnnotationRefListFromCollection`,
`makeAnnotationRefListWildcardSelection`, `makeDatumRefListFromCollection`,
`makeFeatureCheckRefListFromCollection`,
`makeFeatureCheckReferenceListWildcardSelection`, `makeFeatureChecks`,
`makeGdtDatumAnnotation`, `makeGdtFeatureCheckAnnotation`,
`makeSurfaceFaceListFromSurface`, and `makeSurfaceFaceListRuntimeSelect`. The
argument is optional, so existing calls are unchanged:

```ts
await briosa.gdtOperations.makeFeatureChecks(collection, {
  signal: AbortSignal.timeout(30_000),
});
```
