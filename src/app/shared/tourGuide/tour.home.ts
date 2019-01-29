import { IStepOption } from 'ngx-tour-ng-bootstrap';
/**
 * Created by kelvin on 11/17/17.
 */
export default <IStepOption[]>[
  {
    anchorId: 'home.start.tour',
    content: 'Welcome to the Most interactive scorecard ever!',
    placement: 'bottom',
    title: 'Welcome'
  },
  {
    anchorId: 'home.search',
    content: 'Search scorecards by name or description',
    placement: 'bottom',
    title: 'Search for Your Scorecard'
  },
  {
    anchorId: 'home.listview',
    content: 'Change the scorecard list view.',
    placement: 'bottom',
    title: 'List Style'
  },
  {
    anchorId: 'home.create',
    content: 'Click here to create a new scorecard',
    placement: 'auto',
    title: 'Create Scorecard'
  }
];
