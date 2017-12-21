import {INgbStepOption} from 'ngx-tour-ng-bootstrap/step-option.interface';
/**
 * Created by kelvin on 11/17/17.
 */
export default <INgbStepOption[]>[{
  anchorId: 'home.start.tour',
  content: 'Welcome to the Most interactive scorecard ever!',
  placement: 'bottom',
  title: 'Welcome',
}, {
  anchorId: 'create.sample',
  content: 'This will show the sample of the scorecard that you are creating',
  placement: 'top',
  title: 'Sample Scorecard',
}, {
  anchorId: 'create.sharing',
  content: 'Choose who should see/update the scorecard that you create',
  placement: 'right',
  title: 'Scorecard Sharing',
}, {
  anchorId: 'create.pe',
  content: 'Select the starting period for the scorecard',
  placement: 'right',
  title: 'Starting Period',
}, {
  anchorId: 'create.ou',
  content: 'Selecting the starting organisation unit for the scorecard',
  placement: 'right',
  title: 'Starting Organisation Unit',
}, {
  anchorId: 'create.name',
  content: 'Write the name of scorecard',
  placement: 'bottom',
  title: 'Scorecard Name',
}, {
  anchorId: 'create.description',
  content: 'Describe your scorecard',
  placement: 'bottom',
  title: 'Scorecard Description',
}, {
  anchorId: 'create.legend',
  content: 'Update the The legend colors and description',
  placement: 'right',
  title: 'Scorecard Legend',
}, {
  anchorId: 'create.newlegend',
  content: 'Add new legend by choosing color and giving a new legend a name',
  placement: 'bottom',
  title: 'Add New Legend',
}, {
  anchorId: 'create.label',
  content: 'These will be additional rows to add more information about your scorecard, eg. Source of data',
  placement: 'bottom',
  title: 'Scorecard Labels',
}, {
  anchorId: 'create.type_selection',
  content: 'Select the type of data you want to add to your scorecard',
  placement: 'top',
  title: 'Data type Selection',
}, {
  anchorId: 'create.group_selection',
  content: 'Select the group to see the list of data items in the list',
  placement: 'bottom',
  title: 'Group Selection',
}, {
  anchorId: 'create.item_selection',
  content: 'Select the item to add it the scorecard, you can simply click it, drag it to the sample area, or right click to get more options',
  placement: 'bottom',
  title: 'Data Item Selection',
}, {
  anchorId: 'create.save',
  content: 'Click here to save the changes',
  placement: 'auto',
  title: 'Save changes',
}, {
  anchorId: 'create.cancel',
  content: 'Click here to cancel and go back',
  placement: 'auto',
  title: 'Cancel and Go back',
}
];
