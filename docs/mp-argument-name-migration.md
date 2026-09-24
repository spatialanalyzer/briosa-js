# MP Argument Name Migration

The next server and client releases remove parenthetical MP-label qualifiers from public argument and result names. For example, `angle_tolerance_0_0_for_none` becomes `angle_tolerance` (`angleTolerance` in .NET and JavaScript). **0.0 still disables angle tolerance.** Units, defaults, presence, omission behavior, and SDK bindings do not change.

This is a source and JSON naming change. Update named arguments, result properties, object keys, keyword arguments, JSON/TextFormat payloads, and reflection-based lookups when adopting the new packages. Regenerate custom transport clients from the matching new protocol artifact. Binary protobuf field numbers, types, and presence remain unchanged. Runtime admission continues to use the existing exact-SA-target and behavioral compatibility rules independently of package versions.

Keep all existing names for **Evaluate Feature Check**, **Reset Cloud Bounding Box**, **Define point of view**, and **Get point of view parameters** because removing qualifiers causes collisions. Their entire signatures remain unchanged. The same method-level rule applies to future collisions.

Applications keep control of their package dependencies and server selection. Existing released packages and documentation snapshots retain their original names. Upgrade a consuming application by updating its client package for the same exact SA target, applying the table below, and running its tests. A new installer/server installation does not upgrade the application's client dependency. Previous immutable packages remain available for rollback.

The 2024 product has 168 renamed members in 83 commands. The 2026 product has 172 in 86 commands; its additions are Set Cone Properties, Set Line Properties, and Set Geom Relationship Auto Measure Nominal Feature. Shared result values follow their declaring type. The table lists every occurrence in the 2026 product; entries marked 2026 only are absent from 2024.

Names preserve established abbreviations and identifier conventions unrelated to parentheses. For example, `value_0_360` retains its necessary identifier prefix, and percent outside parentheses remains part of `per_unit_length_step_over_percent`.

## Rename Table

The authoritative naming rule and wire contracts belong to [Briosa](https://github.com/spatialanalyzer/briosa/blob/main/docs/development/mp-argument-name-migration.md).

| Command | Direction | Previous Member | New Member | Meaning |
| --- | --- | --- | --- | --- |
| Angle Between Line and Plane | input | `angleTolerance00ForNone` | `angleTolerance` | 0.0 disables this tolerance. |
| Angle Between Two Lines | input | `angleTolerance00ForNone` | `angleTolerance` | 0.0 disables this tolerance. |
| Angle Between Two Planes' normals | input | `angleTolerance00ForNone` | `angleTolerance` | 0.0 disables this tolerance. |
| Best Fit Transformation - Group to Group | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Best Fit Transformation - Group to Group | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Best Fit Transformation - Group to Group | input | `filePathForCsvTextReportRequiresShowInterfaceTrue` | `filePathForCsvTextReport` | Requires Show Interface to be true. |
| Fit Geometry to Point Group | input | `fitInterfaceTolerance10UseProfile` | `fitInterfaceTolerance` | -1.0 uses the profile tolerance. |
| Fit Geometry to Point Group | input | `startingConditionGeometryOptional` | `startingConditionGeometry` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Fit Geometry to Point Group Projected to Plane | input | `fitInterfaceTolerance10UseProfile` | `fitInterfaceTolerance` | -1.0 uses the profile tolerance. |
| Fit Geometry to Point Group Projected to Plane | input | `startingConditionGeometryOptional` | `startingConditionGeometry` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Fit Geometry to Points | input | `fitInterfaceTolerance10UseProfile` | `fitInterfaceTolerance` | -1.0 uses the profile tolerance. |
| Fit Geometry to Points | input | `startingConditionGeometryOptional` | `startingConditionGeometry` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Get Cone Properties | output | `coneEndPointInWorkingCoordinates` | `coneEndPoint` | Expressed in working coordinates. |
| Get Cone Properties | output | `coneAxisInWorkingCoordinates` | `coneAxis` | Expressed in working coordinates. |
| Get Measurement Weather Data | output | `temperatureDegF` | `temperature` | Temperature in degrees Fahrenheit. |
| Get Measurement Weather Data | output | `pressureInHg` | `pressure` | Pressure in inches of mercury. |
| Get Measurement Weather Data | output | `humidityRh` | `humidity` | Relative humidity in percent. |
| Get Slot Properties | output | `slotTransformInWorkingCoordinates` | `slotTransform` | Expressed in working coordinates. |
| Get Slot Properties | output | `centerInWorkingCoordinates` | `center` | Expressed in working coordinates. |
| Get Slot Properties | output | `normalDirectionInWorkingCoordinates` | `normalDirection` | Expressed in working coordinates. |
| Get Slot Properties | output | `centerlinePt1InWorkingCoordinates` | `centerlinePt1` | Expressed in working coordinates. |
| Get Slot Properties | output | `centerlinePt2InWorkingCoordinates` | `centerlinePt2` | Expressed in working coordinates. |
| Group To Surface Fit | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Group To Surface Fit | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Make Circle Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Circle Fit Profile | input | `overridePlanarOffset10UseCurrent` | `overridePlanarOffset` | -1.0 uses the current offset. |
| Make Circle Fit Profile | input | `lockRadius10DoNotLock` | `lockRadius` | -1.0 leaves this dimension unlocked. |
| Make Cone Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Cone Fit Profile | input | `lockAngleInDegrees10DoNotLock` | `lockAngleInDegrees` | -1.0 leaves this dimension unlocked. |
| Make Cylinder Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Cylinder Fit Profile | input | `lockRadius10DoNotLock` | `lockRadius` | -1.0 leaves this dimension unlocked. |
| Make Ellipse Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Ellipse Fit Profile | input | `overridePlanarOffset10UseCurrent` | `overridePlanarOffset` | -1.0 uses the current offset. |
| Make Paraboloid Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Paraboloid Fit Profile | input | `lockFocalLength10DoNotLock` | `lockFocalLength` | -1.0 leaves this dimension unlocked. |
| Make Plane Fit Profile | input | `overridePlanarOffset10UseCurrent` | `overridePlanarOffset` | -1.0 uses the current offset. |
| Make Slot Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Slot Fit Profile | input | `overridePlanarOffset10UseCurrent` | `overridePlanarOffset` | -1.0 uses the current offset. |
| Make Sphere Fit Profile | input | `overrideRadialOffset10UseCurrent` | `overrideRadialOffset` | -1.0 uses the current offset. |
| Make Sphere Fit Profile | input | `lockRadius10DoNotLock` | `lockRadius` | -1.0 leaves this dimension unlocked. |
| Query Clouds to Objects | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Query Clouds to Objects | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Query Clouds to Surface | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Query Clouds to Surface | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Query Frame to Frame | output | `rxRoll` | `rx` | MP qualifier: Roll. |
| Query Frame to Frame | output | `ryPitch` | `ry` | MP qualifier: Pitch. |
| Query Frame to Frame | output | `rzYaw` | `rz` | MP qualifier: Yaw. |
| Query Groups to Objects | input | `groupNameListGroupsToProject` | `groupNameList` | MP qualifier: Groups to Project. |
| Query Groups to Objects | input | `objectNameListObjectsToProjectTo` | `objectNameList` | MP qualifier: Objects to Project to. |
| Query Groups to Objects | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Query Groups to Objects | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Query Points to Objects | input | `objectNameListObjectsToProjectTo` | `objectNameList` | MP qualifier: Objects to Project to. |
| Query Points to Objects | input | `rmsTolerance00ForNone` | `rmsTolerance` | 0.0 disables this tolerance. |
| Query Points to Objects | input | `maximumAbsoluteTolerance00ForNone` | `maximumAbsoluteTolerance` | 0.0 disables this tolerance. |
| Set Cone Properties | input | `coneEndPointInWorkingCoordinates` | `coneEndPoint` | Expressed in working coordinates. |
| Set Cone Properties | input | `coneAxisInWorkingCoordinates` | `coneAxis` | Expressed in working coordinates. |
| Set Line Properties | input | `lengthOptional` | `length` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Temperature Compensate a group | input | `scalingOriginCoordinateFrame` | `scalingOrigin` | MP qualifier: coordinate frame. |
| Temperature Compensate a group | input | `materialCte1DegF` | `materialCte` | Coefficient per degree Fahrenheit. |
| Temperature Compensate a group | input | `initialTemperatureF` | `initialTemperature` | Temperature in degrees Fahrenheit. |
| Temperature Compensate a group | input | `finalTemperatureF` | `finalTemperature` | Temperature in degrees Fahrenheit. |
| Cloud Display Control | input | `thinDrawIncrement` | `thin` | MP qualifier: Draw Increment. |
| Create Point Callout | input | `showXR` | `showX` | MP qualifier: R. |
| Create Point Callout | input | `showYTheta` | `showY` | MP qualifier: Theta. |
| Create Point Callout | input | `showZPhi` | `showZ` | MP qualifier: Phi. |
| Create Point Callout | input | `showUxUr` | `showUx` | MP qualifier: Ur. |
| Create Point Callout | input | `showUyUtheta` | `showUy` | MP qualifier: Utheta. |
| Create Point Callout | input | `showUzUphi` | `showUz` | MP qualifier: Uphi. |
| Get Gradient At Projected Point On Surface Edge | input | `surfaceEdgeBSpline` | `surfaceEdge` | MP qualifier: B-Spline. |
| Construct Points Cylindrically Shifted | input | `thetaShiftDegrees` | `thetaShift` | Angle in degrees. |
| Create Hidden Point Rod | input | `targetToTargetDistance` | `aToBDistance` | MP qualifier: Target to Target. |
| Create Hidden Point Rod | input | `targetToTipDistance` | `aToCDistance` | MP qualifier: Target to Tip. |
| Construct Sphere | input | `sphereCenterInWorkingCoordinates` | `sphereCenter` | Expressed in working coordinates. |
| Direct CAD Access | input | `surfaceNormalsMode1Or2` | `surfaceNormalsMode` | MP qualifier: 1 or 2. |
| Direct CAD Access | input | `cadFileUnitsLeaveBlankToUseTheUnitsSpecifiedInTheFile` | `cadFileUnits` | An empty value uses the units specified in the file. |
| Export ASCII Point Set | input | `maximumPrecisionScientificNotation` | `maximumPrecision` | MP qualifier: Scientific Notation. |
| Export ASCII Points | input | `maximumPrecisionScientificNotation` | `maximumPrecision` | MP qualifier: Scientific Notation. |
| Export Vector Container to ASCII File | input | `overwriteExistingFileFalseAppend` | `overwriteExistingFile` | False appends to the existing file. |
| Export Vector Container to ASCII File | input | `useFullPrecisionScientificNotation` | `useFullPrecision` | MP qualifier: Scientific Notation. |
| Import SA File | input | `selectedCollectionsOptional` | `selectedCollections` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Make GD&T Feature Check Annotation | input | `perUnitAreaLengthDistance` | `perUnitLengthDistance` | MP qualifier: area. |
| Make GD&T Feature Check Annotation | input | `perUnitAreaLengthStepOverPercent` | `perUnitLengthStepOverPercent` | MP qualifier: area. |
| LR Self Test | output | `referenceArmLengthInches` | `referenceArmLength` | Length in inches. |
| LR Self Test | output | `mirrorMeasurementRangeMeanInches` | `mirrorMeasurementRangeMean` | Length in inches. |
| LR Self Test | output | `mirrorMeasurementRangeStandardDeviationInches` | `mirrorMeasurementRangeStandardDeviation` | Length in inches. |
| LR Self Test - Linearization | output | `linearityKhz` | `linearity` | Frequency in kilohertz. |
| Get Current Instrument Position Update | output | `yOrThetaDegrees` | `yOrTheta` | Angle in degrees. |
| Get Current Instrument Position Update | output | `zOrPhiDegrees` | `zOrPhi` | Angle in degrees. |
| Get Current Instrument Position Update | output | `timeSinceUpdateSeconds` | `timeSinceUpdate` | Time in seconds. |
| Get Current Instrument Position Update | output | `timestampApproximate` | `timestamp` | MP qualifier: Approximate. |
| Locate Instruments (USMN) | input | `analysisTimeLimitMinutes` | `analysisTimeLimit` | Time in minutes; 0 disables the time limit. |
| Create Templated Instrument (USMN) | input | `azimuthWeight` | `component1Weight` | MP qualifier: Azimuth. |
| Create Templated Instrument (USMN) | input | `elevationWeight` | `component2Weight` | MP qualifier: Elevation. |
| Create Templated Instrument (USMN) | input | `distanceWeight` | `component3Weight` | MP qualifier: Distance. |
| Get Tracker/EDM Theodolite Uncertainties | output | `thetaDispersionArcseconds` | `thetaDispersion` | Angle in arcseconds. |
| Get Tracker/EDM Theodolite Uncertainties | output | `phiDispersionArcseconds` | `phiDispersion` | Angle in arcseconds. |
| Get Tracker/EDM Theodolite Uncertainties | output | `distancePpm` | `distance` | Value in parts per million. |
| Set Tracker/EDM Theodolite Uncertainties | input | `thetaDispersionArcseconds` | `thetaDispersion` | Angle in arcseconds. |
| Set Tracker/EDM Theodolite Uncertainties | input | `phiDispersionArcseconds` | `phiDispersion` | Angle in arcseconds. |
| Set Tracker/EDM Theodolite Uncertainties | input | `distancePpm` | `distance` | Value in parts per million. |
| Get Instrument Weather Setting | output | `temperatureFahrenheit` | `temperature` | Temperature in degrees Fahrenheit. |
| Get Instrument Weather Setting | output | `pressureMmHg` | `pressure` | Pressure in millimeters of mercury. |
| Get Instrument Weather Setting | output | `relativeHumidityPercent` | `relativeHumidity` | Relative humidity in percent. |
| Set Instrument Weather Setting | input | `temperatureFahrenheit` | `temperature` | Temperature in degrees Fahrenheit. |
| Set Instrument Weather Setting | input | `pressureMmHg` | `pressure` | Pressure in millimeters of mercury. |
| Set Instrument Weather Setting | input | `relativeHumidityPercent` | `relativeHumidity` | Relative humidity in percent. |
| Get Instrument Part Temperature | output | `partTemperatureFahrenheit` | `partTemperature` | Temperature in degrees Fahrenheit. |
| Compute CTE Scale Factor | input | `materialCtePerDegreeFahrenheit` | `materialCte` | Coefficient per degree Fahrenheit. |
| Compute CTE Scale Factor | input | `initialTemperatureFahrenheit` | `initialTemperature` | Temperature in degrees Fahrenheit. |
| Compute CTE Scale Factor | input | `finalTemperatureFahrenheit` | `finalTemperature` | Temperature in degrees Fahrenheit. |
| Get Instrument Interface Response Timeout | output | `timeoutSeconds` | `timeout` | Time in seconds. |
| Set Instrument Interface Response Timeout | input | `timeoutSeconds` | `timeout` | Time in seconds. |
| Ask for User Decision from Image | input | `windowWidth0Default` | `windowWidth` | 0 uses the default window dimension. |
| Ask for User Decision from Image | input | `windowHeight0Default` | `windowHeight` | 0 uses the default window dimension. |
| Ask for User Decision from Strings | input | `button1TextEmptyToHideButton` | `button1Text` | An empty string hides the button. |
| Ask for User Decision from Strings | input | `button2TextEmptyToHideButton` | `button2Text` | An empty string hides the button. |
| Ask for User Decision from Strings | input | `button3TextEmptyToHideButton` | `button3Text` | An empty string hides the button. |
| Get Geom Relationship Auto Vectors | output | `autoVectorsNominalAvnEnabled` | `autoVectorsNominalEnabled` | MP qualifier: AVN. |
| Get Geom Relationship Auto Vectors | output | `autoVectorsNominalAvnName` | `autoVectorsNominalName` | MP qualifier: AVN. |
| Get Geom Relationship Auto Vectors | output | `autoVectorsFitAvfEnabled` | `autoVectorsFitEnabled` | MP qualifier: AVF. |
| Get Geom Relationship Auto Vectors | output | `autoVectorsFitAvfName` | `autoVectorsFitName` | MP qualifier: AVF. |
| Set Geom Relationship Auto Measure Nominal Feature | input | `trapCloudsFalseGeometry` | `trapClouds` | False selects geometry. |
| Set Relationship Voxel Cloud Display | input | `voxelSize10Autodetect` | `voxelSize` | -1.0 selects automatic detection. |
| Set Relationship Voxel Cloud Display | input | `voxelRenderingDiameter10Fast` | `voxelRenderingDiameter` | -1.0 selects fast rendering. |
| Relationship Watch Window Template | input | `showDeviationXRx` | `showDeviationX` | MP qualifier: Rx. |
| Relationship Watch Window Template | input | `showDeviationYRy` | `showDeviationY` | MP qualifier: Ry. |
| Relationship Watch Window Template | input | `showDeviationZRz` | `showDeviationZ` | MP qualifier: Rz. |
| Create Chart from Vector Group | input | `templateChartNameOptional` | `templateChartName` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Define Report Template | input | `reportPageSettingsSaReportOnly` | `reportPageSettings` | MP qualifier: SA Report only. |
| Make New SA Report | input | `saReportTemplateOptional` | `saReportTemplate` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Quick Report | input | `reportNameOptional` | `reportName` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Save Current View (BMP/JPG/PNG/GIF/TIFF) | input | `renderScaleFactor10UsesWindowSize` | `renderScaleFactor` | 1.0 uses the window size. |
| Set Calibration Appliance Node Instrument Dwell Time | input | `measurementDwellTimeSeconds` | `measurementDwellTime` | Time in seconds. |
| Set Robot Calibration Tool Frame | input | `toolFrameRelativeToFlange` | `toolFrame` | MP qualifier: relative to flange. |
| Set Robot Calibration Measurement Offset In Tool Frame | input | `measurementFrameRelativeToTool` | `measurementFrame` | MP qualifier: relative to tool. |
| Scale Bar Check | input | `currentTemperatureF` | `currentTemperature` | Temperature in degrees Fahrenheit. |
| Scale Bar Check | input | `materialCtePpmF` | `materialCte` | Coefficient in parts per million per degree Fahrenheit. |
| Get Angular Representation | output | `value0360False180` | `value0360` | False selects the +/-180 angular representation. |
| Get Screen Resolution | input | `display1Primary` | `display` | -1 selects the primary display. |
| Set Angular Representation | input | `value0360False180` | `value0360` | False selects the +/-180 angular representation. |
| Set Collection Notes | input | `appendFalseOverwrite` | `append` | False overwrites existing notes. |
| Set Folder Notes | input | `appendFalseOverwrite` | `append` | False overwrites existing notes. |
| Set Object Notes | input | `appendFalseOverwrite` | `append` | False overwrites existing notes. |
| Set Point Notes | input | `appendFalseOverwrite` | `append` | False overwrites existing notes. |
| Set User Interface Profile | input | `profileFileNameOptional` | `profileFileName` | Optional in the MP editor; the existing API presence and omission behavior is unchanged. |
| Auto-Range and Set Vector Group Colorization (All) | input | `colorizationOptionsUsesModeOnly` | `colorizationOptions` | MP qualifier: Uses Mode Only. |
| Auto-Range and Set Vector Group Colorization (Selected) | input | `colorizationOptionsUsesModeOnly` | `colorizationOptions` | MP qualifier: Uses Mode Only. |
| Highlight Objects | input | `objectNamesEmptyToClearAll` | `objectNames` | An empty selection clears all highlights. |
| Highlight Point | input | `pointNameEmptyToClearAll` | `pointName` | An empty selection clears all highlights. |
| Highlight Relationships | input | `relationshipsEmptyToClearAll` | `relationships` | An empty selection clears all highlights. |
| Show / Hide by Object Type | input | `hideShowFalse` | `hide` | False shows the objects. |
| Show / Hide Points | input | `showHideFalse` | `show` | False hides the points. |
| Get Observation Info | output | `temperatureFahrenheit` | `temperature` | Temperature in degrees Fahrenheit. |
| Get Observation Info | output | `pressureInHg` | `pressure` | Pressure in inches of mercury. |
| Get Observation Info | output | `relativeHumidityPercent` | `relativeHumidity` | Relative humidity in percent. |
| LR Get Most Recent SNR Info | output | `peakValueDb` | `peakValue` | Value in decibels. |
| LR Get Most Recent SNR Info | output | `measuredRangeMeters` | `measuredRange` | Range in meters. |
| LR Self Test - Flip Test | output | `frontRangeInches` | `frontRange` | Length in inches. |
| LR Self Test - Flip Test | output | `frontAzimuthDegrees` | `frontAzimuth` | Angle in degrees. |
| LR Self Test - Flip Test | output | `frontElevationDegrees` | `frontElevation` | Angle in degrees. |
| LR Self Test - Flip Test | output | `backRangeInches` | `backRange` | Length in inches. |
| LR Self Test - Flip Test | output | `backAzimuthDegrees` | `backAzimuth` | Angle in degrees. |
| LR Self Test - Flip Test | output | `backElevationDegrees` | `backElevation` | Angle in degrees. |
| LR Self Test - Flip Test | output | `frontBackDifferenceRangeInches` | `frontBackDifferenceRange` | Length in inches. |
| LR Self Test - Flip Test | output | `frontBackDifferenceAzimuthDegrees` | `frontBackDifferenceAzimuth` | Angle in degrees. |
| LR Self Test - Flip Test | output | `frontBackDifferenceElevationDegrees` | `frontBackDifferenceElevation` | Angle in degrees. |
| LR Self Test - LO Sep | output | `primaryLoIndex` | `primaryLo` | Indexing starts at 1. |
| LR Self Test - LO Sep | output | `secondaryLoIndex` | `secondaryLo` | Indexing starts at 1. |
| LR Self Test - LO Sep | output | `primaryLoRangeMeanInches` | `primaryLoRangeMean` | Length in inches. |
| LR Self Test - LO Sep | output | `primaryLoRangeStandardDeviationInches` | `primaryLoRangeStandardDeviation` | Length in inches. |
| LR Self Test - LO Sep | output | `secondaryLoRangeMeanInches` | `secondaryLoRangeMean` | Length in inches. |
| LR Self Test - LO Sep | output | `secondaryLoRangeStandardDeviationInches` | `secondaryLoRangeStandardDeviation` | Length in inches. |
