import moment from 'moment';
import {v4 as uuidv4} from 'uuid';
import {DATE_SHORT_FORMAT} from '../Constants';
import {indexOf} from 'lodash';
import {Font} from '@react-pdf/renderer';

export const createUUID = () => uuidv4();

// export const formatCurrency = (num, sym) => `${sym}${num?.toLocaleString()}`;

// export const filterMeetingsResolved = (meetings) => {
//    if (!meetings) return [];
//    return meetings?.filter((meeting) => {
//       return meeting?.isCompleted;
//    });
// };

export const convertTimeToShortFormat = (time) => {
   if (!time) return '';
   return moment(time).format(DATE_SHORT_FORMAT);
};

export const convertTimeToLongFormat = (time) => {
   return moment(time).format('MMMM DD, YYYY');
};

export const formatMoneyToNumber = (value) => {
   if (!value) return 0;
   return Number(String(value)?.replace(/,/g, ''));
};

export const getLatestDate = (dates) => {
   dates?.sort((a, b) => {
      const t1 = moment(a);
      const t2 = moment(b);
      if (t1.isAfter(t2)) return -1;
      if (t1.isBefore(t2)) return 1;
      return 0;
   });
   return (dates || [])?.[0] || '';
};

export function isImageURL(url) {
   return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
   });
}

export const getUrlRequest = (link) => {
   return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', link, true);
      xhr.responseType = 'blob';
      xhr.onreadystatechange = function () {
         if (xhr.readyState === 4 && xhr.status === 200) {
            resolve(xhr.response);
         }
      };
      xhr.onerror = function (error) {
         reject(error);
      };
      xhr.send();
   });
};

export function isAudioURL(url) {
   if (!url) return false;
   url = url.toLowerCase();
   return (
      url.includes('mp3') ||
      url.includes('mp4') ||
      url.includes('aac') ||
      url.includes('wav') ||
      url.includes('wma') ||
      url.includes('flac') ||
      url.includes('m4a')
   );
}

export const registerInterFont = () => {
   if (indexOf(Font.getRegisteredFontFamilies(), 'Inter') < 0) {
      try {
         Font.register({
            family: 'Inter',
            fonts: [
               {src: '/fonts/Inter-Regular.ttf'},
               {src: '/fonts/Inter-Medium.ttf', fontWeight: 'medium'},
               {src: '/fonts/Inter-SemiBold.ttf', fontWeight: 'semibold'},
               {src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold'},
            ],
         });
      } catch (e) {
         console.log(e);
      }
   }
};

export const generateHtml = (html) => {
   return `
   <html>
   <head>
   </head>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Open+Sans:wght@300;500;600;700;800&display=swap" rel="stylesheet">
   <body>
   ${html}
   </body>
   </html>
   `;
};
