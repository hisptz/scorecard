import { SystemInfo } from '../models/system-info.model';

export function getSanitizedSystemInfo(systemInfo: any): SystemInfo {
  if (!systemInfo) {
    return null;
  }

  return {
    id: systemInfo.systemId, contextPath: systemInfo.contextPath, googleMapsApiKey: systemInfo.keyGoogleMapsApiKey,
    analyticsFinancialYear: systemInfo.analyticsFinancialYearStart, calendar: systemInfo.calendar,
    lastAnalyticsTableSuccess: systemInfo.lastAnalyticsTableSuccess,
    analysisRelativePeriod: systemInfo.keyAnalysisRelativePeriod, version: systemInfo.version,
    dateFormat: systemInfo.dateFormat,
    spacialSupport: systemInfo.databaseInfo ? systemInfo.databaseInfo.spatialSupport : false
  };
}
