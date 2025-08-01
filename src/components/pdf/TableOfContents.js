import {useContext} from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import {Page, View, Text, StyleSheet, Font, Image} from '@react-pdf/renderer';
import {BACKGROUND_IMAGE_PDF, MONTH_FORMAT, PRIMARY_COLOR, SMALL_LOGO, TABLE_CONTENTS_LOGO} from '../../Constants';
import moment from 'moment';
import indexOf from 'lodash/indexOf';

if (indexOf(Font.getRegisteredFontFamilies(), 'merriweather') < 0) {
   try {
      Font.register({
         family: 'merriweather',
         fonts: [
            {
               src: '/fonts/merriweather-v21-latin-regular.ttf',
            },
            {
               src: '/fonts/merriweather-v21-latin-700.ttf',
               fontWeight: 'bold',
            },
            {
               src: '/fonts/merriweather-v21-latin-italic.ttf',
               fontWeight: 'normal',
               fontStyle: 'italic',
            },
            {
               src: '/fonts/merriweather-v21-latin-700italic.ttf',
               fontWeight: 'bold',
               fontStyle: 'italic',
            },
         ],
      });
   } catch (error) {
      console.log(error);
   }
}

if (indexOf(Font.getRegisteredFontFamilies(), 'montserrat') < 0) {
   try {
      Font.register({
         family: 'montserrat',
         fonts: [
            {src: '/fonts/montserrat-regular-webfont.ttf'}, // font-style: normal, font-weight: normal
            {src: '/fonts/montserrat-bold-webfont.ttf', fontWeight: 700},
         ],
      });
   } catch (error) {
      console.log(error);
   }
}

const styles = StyleSheet.create({
   page: {
      fontFamily: 'montserrat',
      fontSize: 12,
      textAlign: 'left',
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
   },
   contentItemStyle: {
      marginBottom: 10,
   },
   titleStyle: {
      fontFamily: 'montserrat',
      fontSize: 20,
      color: PRIMARY_COLOR,
      marginTop: 32,
      textAlign: 'center',
      '@media orientation portrait': {
         marginBottom: 23,
      },
      '@media orientation: landscape': {
         marginBottom: 10,
      },
   },
   info: {
      fontSize: 10,
      fontWeight: '500',
      color: 'rgba(153, 153, 153, 1)',
      fontFamily: 'montserrat',
   },
});

/**
 * Table of Contents context for the elements in the Table of Contents.
 * @type {React.Context<{add: add, tableofcontents: *[]}>}
 */
const TableOfContentsContext = React.createContext({
   tableofcontents: [],
   add: () => {},
});

/**
 * Table of Contents provider to add and maintain elements to the Table of Contents.
 */
export class TableOfContentsProvider extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         tableofcontents: [],
         add: (title) => {
            if (!this.state.tableofcontents.includes(title))
               this.setState((state) => ({
                  tableofcontents: [...state.tableofcontents, title],
               }));
         },
      };
   }

   render() {
      return <TableOfContentsContext.Provider value={this.state} {...this.props} />;
   }
}

/**
 * Table of Contents component to display the table of contents.
 *
 * @param intl The intl object for localization.
 * @param orientation The orientation of the table of contents.
 * @param title The title of the table of contents.
 * @return {JSX.Element}
 * @constructor
 */
export const TableOfContents = ({intl, orientation, title, historyDate}) => {
   const {tableofcontents} = useContext(TableOfContentsContext);

   return (
      <Page size='LETTER' orientation={orientation} style={styles.page}>
         <View style={{flex: '1 1 100%'}}>
            <View
               style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 23,
                  paddingVertical: 21,
               }}
            >
               <Image
                  src={TABLE_CONTENTS_LOGO}
                  style={{
                     width: 230,
                     height: 30,
                  }}
               />
               <Image
                  src={SMALL_LOGO}
                  style={{
                     height: 28,
                  }}
               />
            </View>
            <View
               style={{
                  paddingHorizontal: 23,
               }}
            >
               <Text style={styles.info}>{`${title} | ${moment(historyDate, MONTH_FORMAT).format('MMMM YYYY')}`}</Text>
            </View>
            <View
               style={{
                  display: 'flex',
                  flex: 1,
                  position: 'relative',
               }}
            >
               {tableofcontents.map((item, index) => (
                  <View
                     key={`toc${index}`}
                     style={{
                        paddingHorizontal: 23,
                        paddingTop: 18,
                     }}
                  >
                     <Text style={styles.contentItemStyle}>{item}</Text>
                  </View>
               ))}
               <Image
                  src={BACKGROUND_IMAGE_PDF}
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     right: 0,
                     left: 0,
                  }}
               />
            </View>
         </View>
      </Page>
   );
};

/**
 * The title component to display the title and add it to the provider.
 */
class InnerTitle extends React.Component {
   static propTypes = {
      children: PropTypes.string,
      style: PropTypes.object,
      add: PropTypes.func,
   };

   componentDidMount() {
      this.props.add(this.props.children);
   }

   render() {
      return (
         <Text style={this.props.style} bookmark={{title: this.props.children, fit: true}}>
            {this.props.children}
         </Text>
      );
   }
}

/**
 * The title to be added to the table of contents.
 *
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export const Title = ({...props}) => {
   return (
      <TableOfContentsContext.Consumer>
         {({add}) => <InnerTitle {...props} add={add} />}
      </TableOfContentsContext.Consumer>
   );
};
