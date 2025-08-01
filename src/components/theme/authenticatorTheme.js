import {PRIMARY_COLOR} from '../../Constants';

export const authenticatorTheme = {
   name: 'my-theme',
   overrides: [
      {
         colorMode: 'dark',

         tokens: {
            colors: {
               font: {
                  primary: {value: '#fff'},
                  secondary: {value: '#769548'},
                  tertiary: {value: 'rgba(240,240,240)'},
               },
               background: {
                  primary: {value: '#1D1D1D'},
                  secondary: {value: '#212121'},
                  tertiary: {value: '#303030'},
               },
               border: {
                  primary: {value: 'rgba(255, 255, 255, 0.62)'},
                  secondary: {value: '#769548'},
                  tertiary: {value: 'lightgreen'},
                  focus: {value: '#9AB96C'},
               },
            },
            components: {
               fieldcontrol: {
                  _focus: {
                     boxShadow: 'none',
                  },
               },
               link: {
                  _hover: {
                     color: '#c8c8c8',
                  },
                  color: 'rgba(240,240,240)',
               },
               tabs: {
                  item: {
                     _hover: {
                        backgroundColor: {value: 'transparent'},
                        borderColor: {value: '{colors.border.focus.value}'},
                        boxShadow: {value: 'none'},
                        color: {value: '#ABC18D'},
                     },
                     _active: {
                        backgroundColor: {value: 'transparent'},
                        borderColor: {value: '{colors.border.focus.value}'},
                        boxShadow: {value: 'none'},
                        color: {value: PRIMARY_COLOR},
                     },
                     _focus: {
                        backgroundColor: {value: 'transparent'},
                        borderColor: {value: '{colors.border.focus.value}'},
                        boxShadow: {value: 'none'},
                        color: {value: PRIMARY_COLOR},
                     },
                  },
               },
            },
         },
      },
   ],
   tokens: {
      colors: {
         font: {
            primary: {value: '#000000'},
            secondary: {value: '#527928'},
            tertiary: {value: '#707070'},
         },
         background: {
            primary: {value: '#FFFFFF'},
            secondary: {value: '#FFFFFF'},
            tertiary: {value: '#F4F4F4'},
         },
      },
      components: {
         heading: {
            backgroundColor: {value: '#fff'},
         },
         button: {
            color: '#527928 !important',
            // this will affect the font weight of all button variants
            fontWeight: {value: '{fontWeights.black.value}'},
            // style the primary variation
            primary: {
               backgroundColor: {value: PRIMARY_COLOR},
               _hover: {
                  backgroundColor: {value: '#527928'},
               },
            },
            _hover: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
            _focus: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
            _active: {
               backgroundColor: {value: 'rgba(223,235,209,0.35)'},
            },
         },
         link: {
            _hover: {
               color: '#999999',
            },
            color: '#000000',
         },

         tabs: {
            item: {
               _hover: {
                  backgroundColor: {value: 'transparent'},
                  borderColor: {value: '{colors.border.focus.value}'},
                  boxShadow: {value: 'none'},
                  color: {value: '#9AB96C'},
               },
               _active: {
                  backgroundColor: {value: 'transparent'},
                  borderColor: {value: '{colors.border.focus.value}'},
                  boxShadow: {value: 'none'},
                  color: {value: PRIMARY_COLOR},
               },
               _focus: {
                  backgroundColor: {value: 'transparent'},
                  borderColor: {value: '{colors.border.focus.value}'},
                  boxShadow: {value: 'none'},
                  color: {value: PRIMARY_COLOR},
               },
            },
         },
      },
   },
};
