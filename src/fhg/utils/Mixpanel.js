import mixpanel from 'mixpanel-browser';
import {MIXPANEL_TOKEN} from '../../Constants';

mixpanel.init(MIXPANEL_TOKEN, {
   track_pageview: true,
});

export const Mixpanel = {
   identify: (id) => {
      mixpanel.identify(id);
   },
   track: (name, props) => {
      mixpanel.track(name, props);
   },
};
