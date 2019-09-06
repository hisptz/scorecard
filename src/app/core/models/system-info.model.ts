export interface SystemInfo {
  /**
   * System ID
   */
  id: string;

  /**
   * Context path
   */
  contextPath: string;

  /**
   * Api key for google maps
   */
  googleMapsApiKey: string;

  /**
   * Financial period for analytics
   */
  analyticsFinancialYear: string;

  /**
   * Calender format
   */
  calendar: string;

  /**
   * Last time analytics has successfully run
   */
  lastAnalyticsTableSuccess: string;

  /**
   * Default analytics default relative period
   */
  analysisRelativePeriod: string;

  /**
   * System version
   */
  version: number;

  /**
   * Current date format
   */
  dateFormat: string;

  /**
   * Spacial support
   */
  spacialSupport: boolean;
}
