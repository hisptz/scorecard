/* global angular */

'use strict';

/* Services
* List all the services to be used here
*
*/

var scorecardServices = angular.module('scorecardServices', [ 'mainServices','chartServices','tableServices','filterService','IndicatorModule','IndicatorGroupModule','ScoreCardModule','DataElementModule','DataElementGroupModule','DatasetModule' ]);
