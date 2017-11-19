import {INgbStepOption} from 'ngx-tour-ng-bootstrap/step-option.interface';
/**
 * Created by kelvin on 11/17/17.
 */
export default <INgbStepOption[]>[{
  anchorId: 'view.ou',
  content: 'Choose organisation units',
  placement: 'bottom',
  title: 'Organisation Unit Selection',
}, {
  anchorId: 'view.pe',
  content: 'Select Period to be used',
  placement: 'bottom',
  title: 'Period Selection',
}, {
  anchorId: 'view.options',
  content: 'Customize the look of scorecard. add numbering, ranking, hide/show legend, average column and row.',
  placement: 'bottom',
  title: 'Additional Options',
}, {
  anchorId: 'view.edit',
  content: 'Click here to edit scorecard',
  placement: 'bottom',
  title: 'Go to Edit Scorecard',
}, {
  anchorId: 'view.print',
  content: 'Click here to print scorecard, to see colors your printer should support colors',
  placement: 'left',
  title: 'Print Scorecard',
}, {
  anchorId: 'view.excel',
  content: 'Click here to download scorecard as excel, you will not get the colors in the resulting file',
  placement: 'left',
  title: 'Download Scorecard as Excel',
}, {
  anchorId: 'view.refresh',
  content: 'Click here to apply the period and organisation unit selections',
  placement: 'left',
  title: 'Update Scorecard',
}, {
  anchorId: 'view.scorecard',
  content: 'Click on any title to sort, double click to do additional options, right click on any cell for additional options',
  placement: 'auto',
  title: 'Here is Your Scorecard',
}, {
  anchorId: 'view.home',
  content: 'Click here to Back to scorecard list',
  placement: 'auto',
  title: 'Back to scorecard list',
}
];
