import {Page, Text, View, Image, StyleSheet} from '@react-pdf/renderer';
import moment from 'moment';
import React from 'react';
import {
   BUSINESS_STRUCTURE_INDEX,
   CROP_PLAN_IMAGE_PDF,
   FIELD_METRICS_INDEX,
   MONTH_FORMAT,
   TABLE_CONTENTS_LOGO,
} from '../../Constants';
import {ASSET_INDEX} from '../../Constants';
import {LOGO_LARGE} from '../../Constants';
import {LOAN_AMORTIZATION_LOGO} from '../../Constants';
import {ACCOUNTABILITY_CHART_INDEX} from '../../Constants';
import {CONTRACTS_INDEX} from '../../Constants';
import {CASH_FLOW_INDEX} from '../../Constants';
import {BALANCE_SHEET_INDEX} from '../../Constants';
import {LOAN_ANALYSIS_INDEX} from '../../Constants';
import {LIABILITY_INDEX} from '../../Constants';
import {LOGO_LARGEST_RIGHT} from '../../Constants';
import {BORROWING_LOGO} from '../../Constants';
import {ASSETS_LOGO} from '../../Constants';
import {LIABILITIES_LOGO} from '../../Constants';
import {BALANCE_SHEET_LOGO} from '../../Constants';
import {CASH_FLOW_LOGO} from '../../Constants';
import {CONTRACT_LOGO} from '../../Constants';
import {ACCOUNT_LOGO} from '../../Constants';
// import {TAXABLE_INCOME_INDEX} from '../../Constants';
import {GAME_PLAN_INDEX} from '../../Constants';
import {LOGO_TEXT} from '../../Constants';
import {registerInterFont} from '../../utils/helpers';

registerInterFont();

const styles = StyleSheet.create({
   section: {
      alignItems: 'center',
      textAlign: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      display: 'flex',
      width: '100%',
      '@media orientation portrait': {
         height: '60%',
      },
   },
   logo: {
      '@media orientation portrait': {
         marginTop: 45,
         width: 255,
         marginLeft: 24,
      },
      '@media orientation: landscape': {
         width: 255,
         marginTop: 45,
         marginLeft: 24,
         marginBottom: 110,
      },
   },
   logoText: {
      '@media orientation portrait': {
         height: 122,
         width: 404,
         marginLeft: 24,
      },
      '@media orientation: landscape': {
         height: 122,
         width: 404,
         marginLeft: 24,
      },
   },
   logoRight: {
      flex: 1,
      objectFit: 'contain',
      '@media orientation portrait': {
         width: 300,
      },
      '@media orientation: landscape': {
         width: 500,
      },
   },
   titleStyle: {
      fontSize: 20,
      paddingLeft: 24,
      fontWeight: '500',
      marginTop: 24,
      color: '#999999',
      textAlign: 'left',
      fontFamily: 'Inter',
   },
   infoText: {
      color: '#999999',
      fontSize: 10,
      paddingLeft: 24,
      fontWeight: '400',
      fontFamily: 'Inter',
   },
});

/**
 * Title page for PDF documents.
 *
 * @param intl The intl object for localization.
 * @param orientation The orientation for the PDF page.
 * @param types The PDF document types selected to be exported.
 * @param historyDate The date used for the document.
 * @param entityNames The name of the entities selected for the PDF documents.
 * @param clientData The client information needed for the title page.
 * @return {JSX.Element} The Title Page component.
 * @constructor
 */
export default function TitlePage({intl, orientation, types, historyDate, entityNames, clientData}) {
   /**
    * Combine the selected PDF document types to be displayed.
    * @return {string} The type title.
    */
   const getTypeTitle = () => {
      let logo;
      if (types === 'CROP') return CROP_PLAN_IMAGE_PDF;
      if (!types) return LOAN_AMORTIZATION_LOGO;
      if (types[ACCOUNTABILITY_CHART_INDEX]) {
         logo = ACCOUNT_LOGO;
      }
      if (types[BUSINESS_STRUCTURE_INDEX]) {
         logo = TABLE_CONTENTS_LOGO;
      }
      if (types[ASSET_INDEX]) {
         logo = ASSETS_LOGO;
      }
      if (types[BALANCE_SHEET_INDEX]) {
         logo = BALANCE_SHEET_LOGO;
      }
      if (types[CASH_FLOW_INDEX]) {
         logo = CASH_FLOW_LOGO;
      }
      if (types[CONTRACTS_INDEX]) {
         logo = CONTRACT_LOGO;
      }
      if (types[LIABILITY_INDEX]) {
         logo = LIABILITIES_LOGO;
      }
      if (types[LOAN_ANALYSIS_INDEX]) {
         logo = BORROWING_LOGO;
      }
      if (types[GAME_PLAN_INDEX]) {
         logo = LOGO_TEXT;
      }
      if (types[FIELD_METRICS_INDEX]) {
         logo = CROP_PLAN_IMAGE_PDF;
      }
      //TODO Taxable Income is on hold for now. Maybe restored later.
      // if (types[TAXABLE_INCOME_INDEX]) {
      //    titles.push(formatMessage(intl, 'export.taxableIncome.title'));
      // }

      return logo;
   };

   return (
      <Page size='LETTER' orientation={orientation} style={styles.section} wrap={false}>
         <View
            style={{
               flex: '1 1 100%',
               display: 'flex',
               flexDirection: 'row',
               justifyContent: 'space-between',
            }}
         >
            <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1}}>
               <Image style={styles.logo} src={LOGO_LARGE} />
               <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <Image style={styles.logoText} src={getTypeTitle()} />
                  <Text style={styles.titleStyle}>{`${entityNames} | ${moment(historyDate, MONTH_FORMAT).format(
                     'MMMM YYYY',
                  )}`}</Text>
               </View>
               <View
                  style={{
                     display: 'flex',
                     flexDirection: 'column',
                     marginBottom: 28,
                     marginTop: 146,
                     alignItems: 'flex-start',
                  }}
               >
                  <Text style={styles.infoText}>{clientData?.name}</Text>
                  <Text style={styles.infoText}>{clientData?.addressLineOne}</Text>
                  <Text style={styles.infoText}>{clientData?.addressLineTwo}</Text>
                  <Text style={[styles.infoText]}>
                     {clientData?.city?.name}, {clientData?.state?.name} {clientData?.zipCode}
                  </Text>
               </View>
            </View>
            <Image style={styles.logoRight} src={LOGO_LARGEST_RIGHT} />
         </View>
      </Page>
   );
}
