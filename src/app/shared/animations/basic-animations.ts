
import {animate, state, style, transition, trigger} from '@angular/animations';

export const visibilityChanged = trigger('visibilityChanged', [
  state('notHovered' , style({
    'transform': 'scale(1, 1)',
    '-webkit-box-shadow': '0 0 0px rgba(0,0,0,0.1)',
    'box-shadow': '0 0 0px rgba(0,0,0,0.2)',
    'background-color': 'rgba(0,0,0,0.0)',
    'border': '0px solid #ddd'
  })),
  state('hoovered', style({
    'transform': 'scale(1.02, 1.02)',
    '-webkit-box-shadow': '0 0 10px rgba(0,0,0,0.2)',
    'box-shadow': '0 0 10px rgba(0,0,0,0.1)',
    'background-color': 'rgba(0,0,0,0.02)',
    'border': '1px solid #ddd'
  })),
  transition('notHovered <=> hoovered', animate('300ms'))
]);

export const hiddenItem = trigger('hiddenItem', [
    state('notHidden' , style({
      'transform': 'scale(1, 1)'
    })),
    state('hidden', style({
      'transform': 'scale(0.0, 0.00)',
      'visibility': 'hidden',
      'height': '0px'
    })),
    transition('notHidden => hidden', animate('500ms')),
    transition('hidden => notHidden', animate('200ms'))
  ]);

export const fadeIn = trigger('fade', [
    state('void', style({opacity: 0})),
    transition(':enter', animate('300ms')),
    transition(':leave', animate('300ms'))
  ]);

export const fadeOut = trigger('fadeOut', [
    state('void', style({opacity: 0})),
    transition(':enter', animate('300ms'))
  ]);
