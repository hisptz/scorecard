
import {animate, group, keyframes, query, stagger, state, style, transition, trigger} from '@angular/animations';

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

export const fadeSmooth = trigger('fadeSmooth', [
    state('void', style({opacity: 0.3})),
    transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        group([
          animate('300ms', style({transform: 'translateX(0)'})),
          animate('500ms', style({opacity: 1}))
        ])
      ]
    )
  ]);

export const listStateTrigger = trigger('listState', [
  transition('* => *', [
    query(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(-20%)'
      }),
      stagger(100, [
        group([animate('400ms ease-out',
          style({
            opacity: 1,
            offset: 1
          })
        ), animate('300ms ease-out',
          style({
            transform: 'translateX(0)',
          })
        )])

      ])
    ], {optional: true})
  ])
]);

export const fadeOut = trigger('fadeOut', [
    state('void', style({opacity: 0})),
    transition(':enter', animate('300ms'))
  ]);

export const fadeOut1 = trigger('fadeOut', [
    state('void', style({opacity: 0})),
    transition(':enter', animate('500ms'))
  ]);


export const zoomCard = trigger('zoomCard', [
  state('normal' , style({
    'transform': 'scale(1, 1)'
  })),
  state('zoomed', style({
    'position': 'absolute',
    'top': '5%',
    'left': '5%',
    'bottom': '5%',
    'right': '5%',
    'z-index': '10000',
    'background-color': 'wheat'
  })),
  transition('normal <=> zoomed', animate('500ms'))
]);
