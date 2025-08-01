import {Autocomplete} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Stack} from '@mui/material';
import {TextField} from '@mui/material';
import {FormControlLabel} from '@mui/material';
import {Switch} from '@mui/material';
import {lighten} from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {sumBy} from 'lodash';
import capitalize from 'lodash/capitalize';
import debounce from 'lodash/debounce';
import moment from 'moment';
import numberFormatter from 'number-formatter';
import {useRef} from 'react';
import {useState} from 'react';
import {useMemo} from 'react';
import React from 'react';
import {FormattedNumber, useIntl} from 'react-intl';
import HeaderPanel from '../../components/HeaderPanel';
import {TOOLS_EDIT} from '../../components/permission/PermissionAllow';
import usePermission from '../../components/permission/usePermission';
import TextFieldLF from '../../components/TextFieldLF';
import {SCALE_APP} from '../../Constants';
import {CURRENCY_FULL_FORMAT} from '../../Constants';
import {DATE_FORMAT_KEYBOARD} from '../../Constants';
import DatePickerFHG2 from '../../fhg/components/DatePickerFHG2';
import useEditData from '../../fhg/components/edit/useEditData';
import TableContainerFrame from '../../fhg/components/table/TableContainerFrame';
import TableNewUiFHG from '../../fhg/components/table/TableNewUiFHG';
import TypographyFHG from '../../fhg/components/Typography';
import {round} from '../../fhg/utils/DataUtil';
import {PMT} from '../../fhg/utils/DataUtil';
import Header from '../../components/Header';
import ButtonFHG from '../../fhg/components/ButtonFHG';
import {LaunchOutlined} from '@mui/icons-material';
import {pdf} from '@react-pdf/renderer';
import {saveAs} from 'file-saver';
import {LoanAmortizationPdf} from './LoanAmortizationPdf';
import useQueryFHG from '../../fhg/hooks/data/useQueryFHG';
import {CLIENT_BY_ID_REPORT_QUERY} from '../../data/QueriesGL';
import {validate} from 'uuid';
import {useCustomSearchParams} from '../../fhg/hooks/useCustomSearchParams';
import {formatMessage} from '../../fhg/utils/Utils';
import CheckboxFHG from '../../fhg/components/CheckboxFHG';

const LOAN_FREQUENCY = [
   'Annual',
   'Semi-Annual',
   'Quarterly',
   'Bi-Monthly',
   'Monthly',
   'Semi-Monthly',
   'Bi-Weekly',
   'Weekly',
];
const PERIODS_PER_YEAR = {
   Annual: 1,
   'Semi-Annual': 2,
   Quarterly: 4,
   'Bi-Monthly': 6,
   Monthly: 12,
   'Semi-Monthly': 24,
   'Bi-Weekly': 26,
   Weekly: 52,
};

const PAYMENTS_UNIT = {
   Annual: 'year',
   'Semi-Annual': 'month', //6
   Quarterly: 'quarters', //
   'Bi-Monthly': 'month', // 2
   Monthly: 'month',
   'Semi-Monthly': 'month', // 1/2,
   'Bi-Weekly': 'week', //2
   Weekly: 'week',
};

const PAYMENTS_MULTIPLIER = {
   Annual: 1,
   'Semi-Annual': 6, //6
   Quarterly: 1, //
   'Bi-Monthly': 2, // 2
   Monthly: 1,
   'Semi-Monthly': 0.5, // 1/2,
   'Bi-Weekly': 2, //2
   Weekly: 1,
};

export const PAYMENT_TYPE = ['End of Period', 'Beginning of Period'];
const PAYMENT_TYPE_VALUE = {
   'End of Period': 0,
   'Beginning of Period': 1,
};

const useStyles = makeStyles(
   (theme) => ({
      formStyle: {
         maxHeight: '100%',
         // overflow: 'hidden',
         width: '100%',
         display: 'flex',
         flexDirection: 'column',
      },
      infoRootStyle: {
         maxHeight: `calc(100% - ${theme.spacing(5)})`,
         '& > *': {
            marginRight: theme.spacing(1),
         },
         overflow: 'auto',
         marginBottom: theme.spacing(1),
      },
      infoInnerStyle: {
         padding: theme.spacing(0, 2),
         maxWidth: 400,
      },
      buttonPanelStyle: {
         marginLeft: -8,
         borderTop: `solid 1px ${theme.palette.divider}`,
         margin: theme.spacing(0, 0, 0, 0),
         padding: theme.spacing(1, 2, 0),
         '& > *': {
            marginRight: theme.spacing(1),
         },
      },
      frameStyle: {
         padding: theme.spacing(3, 3, 3, 0),
         overflow: 'auto',
         position: 'relative',
         height: '100%',
      },
      '::placeholder': {
         color: '#707070 !important',
      },
      buttonStyle: {
         margin: theme.spacing(1),
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      deleteColorStyle: {
         backgroundColor: lighten(theme.palette.error.light, 0.3),
         '&:hover': {
            backgroundColor: lighten(theme.palette.error.light, 0.6),
         },
      },
      deleteButtonStyle: {
         '&:hover': {
            color: theme.palette.error.main,
         },
      },
      headerTextStyle: {
         fontWeight: 500,
         // height: 36,
      },
      tableRoot: {
         margin: '0 !important',
         overflow: 'auto',
      },
      tableFrameStyle: {
         padding: 3,
         minHeight: 80,
      },
      headerStyle: {
         backgroundColor: '#f1f1f1',
         padding: theme.spacing(6.25, 1.25),
         color: 'black',
         textAlign: 'center',
         fontSize: 90 * SCALE_APP,
         fontWeight: 'bold',
         position: 'fixed',
         top: 0,
         width: '100%',
         transition: '0.2s',
      },
      smallHeaderStyle: {
         backgroundColor: 'rgba(240,246,233,0.47)',
         padding: theme.spacing(3, 0.625),
         color: theme.palette.text.primary,
         textAlign: 'center',
         fontSize: 30 * SCALE_APP,
         fontWeight: 'bold',
         position: 'fixed',
         top: 0,
         width: '100%',
         transition: '0.2s',
      },
      textFieldStyle: {
         '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
      },
      date: {
         '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiOutlinedInput-root': {
            color: `${theme.palette.text.primary} !important`,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
      },
      select: {
         '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
         },
         '& .MuiOutlinedInput-root': {
            color: `${theme.palette.text.primary} !important`,
         },
         '& .MuiSvgIcon-fontSizeMedium': {
            color: theme.palette.text.primary,
         },
         '& .MuiSvgIcon-fontSizeSmall': {
            color: theme.palette.text.primary,
         },
      },
      controlLabel: {
         '& .MuiFormControlLabel-label': {
            color: theme.palette.text.primary,
         },
      },
   }),
   {name: 'LoanAmortizationStyles'},
);

LoanAmortization.propTypes = {};

export default function LoanAmortization() {
   const classes = useStyles();
   const ref = useRef();

   const [additionalPayments, setAdditionalPayments] = useState([]);

   const cachedValues = useMemo(() => {
      let values = {};

      if (localStorage.loanAmortization) {
         const jsonValues = JSON.parse(localStorage.loanAmortization);
         if (jsonValues.firstPaymentDate) {
            jsonValues.firstPaymentDate = moment(jsonValues.firstPaymentDate);
         }
         values = jsonValues;
      }
      return values;
   }, []);

   const [editValues, /*unused*/ handleChange, {handleDateChange, getValue, defaultValues}] = useEditData(
      {paymentType: PAYMENT_TYPE[0], rounding: true, overwriteAll: false, ...cachedValues},
      undefined,
      false,
      (changedEditValues, editValue) => {
         if (changedEditValues?.termYears || changedEditValues?.paymentFrequency || changedEditValues?.amountOfAcres) {
            setAdditionalPayments([]);
         }
         handleSubmitDebounced(editValue);
      },
   );

   const handleSubmit = (editValue) => {
      localStorage.loanAmortization = JSON.stringify(editValue);
   };

   const handleSubmitDebounced = useRef(debounce(handleSubmit, 1000)).current;

   let compoundPeriod = PERIODS_PER_YEAR[getValue('compoundPeriod', LOAN_FREQUENCY[0])];
   let periodsPerYear = PERIODS_PER_YEAR[getValue('paymentFrequency', LOAN_FREQUENCY[0])];

   const loanAmount = getValue('loanAmount', 0);
   const annualInterestRate = getValue('annualInterestRate', 0) / 100;
   const termOfLoanInYears = getValue('termYears', 0);
   const paymentType = PAYMENT_TYPE_VALUE[getValue('paymentType', PAYMENT_TYPE[0])];
   const isRounding = getValue('rounding');
   const amountOfAcres = getValue('amountOfAcres', 0);
   const additionalPaymentAuto = getValue('additionalPaymentAuto', 0);
   const overwriteAll = getValue('overwriteAll', false);

   // E5 - Annual Interest Rate
   // E6 - Term of loan in years
   // E12 - Periods per year
   // E13 -Compound Period

   // Interest Rate Per Period
   //((1+E5/E13)^(E13/E12))-1
   const ratePerPeriod = Math.pow(1 + annualInterestRate / compoundPeriod, compoundPeriod / periodsPerYear) - 1;

   //Scheduled # Payments
   //=$E$6*$E$12
   const scheduledNumberOfPayments = termOfLoanInYears * periodsPerYear;

   // =IF('Loan Calculator'!roundOpt,ROUND(-PMT('Loan Calculator'!rate,'Loan Calculator'!nper,$E$4,,'Loan
   // Calculator'!pmtType),2),-PMT('Loan Calculator'!rate,'Loan Calculator'!nper,$E$4,,'Loan Calculator'!pmtType))
   let unRoundedPayment = -PMT(ratePerPeriod, scheduledNumberOfPayments, loanAmount, undefined, paymentType) || 0;
   const payment = round(unRoundedPayment, isRounding);

   // =IF(B58="","",IF('Loan Calculator'!roundOpt,IF(OR(B58='Loan Calculator'!nper,'Loan
   // Calculator'!payment>ROUND((1+'Loan Calculator'!rate)*I57,2)),ROUND((1+'Loan Calculator'!rate)*I57,2),'Loan
   // Calculator'!payment),IF(OR(B58='Loan Calculator'!nper,'Loan Calculator'!payment>(1+'Loan
   // Calculator'!rate)*I57),(1+'Loan Calculator'!rate)*I57,'Loan Calculator'!payment)))

   // =IF(B58="","",IF('Loan Calculator'!roundOpt,IF(OR(B58='actualNumberOfPayments,'Loan
   // Calculator'!payment>ROUND((1+'annualInterestRate)*I57,2)),ROUND((1+'annualInterestRate)*I57,2),'Loan
   // Calculator'!payment),IF(OR(B58='actualNumberOfPayments,'Loan
   // Calculator'!payment>(1+'annualInterestRate)*I57),(1+'annualInterestRate)*I57,'Loan Calculator'!payment)))
   const data = useMemo(() => {
      if (loanAmount > 0 && ratePerPeriod > 0 && payment > 0 && scheduledNumberOfPayments > 0) {
         const paymentEntries = [];
         const paymentFrequency = getValue('paymentFrequency', LOAN_FREQUENCY[0]);
         const firstPaymentDate = getValue('firstPaymentDate', moment().add(1, 'day'));
         const unit = PAYMENTS_UNIT[paymentFrequency];
         const multiplier = PAYMENTS_MULTIPLIER[paymentFrequency];

         let paymentDue = payment;
         let previousBalance = loanAmount;

         for (let i = 0; i < scheduledNumberOfPayments; i++) {
            const interest = i === 0 && paymentType === 1 ? 0 : round(previousBalance * ratePerPeriod, isRounding);
            let dueDate;

            if (paymentFrequency === LOAN_FREQUENCY[5]) {
               if (i % 2 === 1) {
                  dueDate = moment(firstPaymentDate).add((1 / 2) * i, 'month');
               } else {
                  dueDate = moment(firstPaymentDate)
                     .add((1 / 2) * i, 'month')
                     .subtract(2, 'weeks');
               }
            } else {
               dueDate = moment(firstPaymentDate).add(i * multiplier, unit);
            }
            const additionalPayment = additionalPayments[i] || (overwriteAll ? additionalPaymentAuto : 0) || 0;
            let principal = payment - interest + Number(additionalPayment || 0);
            let balance = previousBalance - principal;
            previousBalance = balance;

            if (i + 1 === scheduledNumberOfPayments || balance < 0) {
               paymentDue += balance;
               principal = paymentDue - interest + Number(additionalPayment || 0);
               balance = 0;
            }
            paymentEntries.push({number: i + 1, dueDate, additionalPayment, paymentDue, interest, principal, balance});
            if (balance <= 0) {
               break;
            }
         }

         return paymentEntries;
      }
   }, [
      loanAmount,
      ratePerPeriod,
      payment,
      scheduledNumberOfPayments,
      getValue,
      paymentType,
      isRounding,
      additionalPayments,
      additionalPaymentAuto,
      overwriteAll,
   ]);

   // Actual # of Payments
   // =MAX(B56:B838) Maximum number on the payments in the table. Highest payment number
   const actualNumberOfPayments = data?.length || 0;

   // Total Interest
   // =SUM(G55:G837) Sum of Interest
   const totalInterest = useMemo(() => sumBy(data, 'interest'), [data]);

   const totalPrincipal = useMemo(() => sumBy(data, 'principal'), [data]);

   // Total Payments
   // =SUM(G55:G837)+SUM(H55:H837)
   // Sum of Interest table column + sum of principal table column
   const totalPayments = totalInterest + totalPrincipal;

   // Est Interest Savings
   // E58:E837 is sum the additional payments
   // nper is actual number of payments;  Loan Calculator'!nper = actualNumberOfPayments
   // rate is annual interest rate; 'Loan Calculator'!rate = annualInterestRate
   // loan_amount is loan amount; 'Loan Calculator'!loan_amount  = loanAmount;
   // pmtType is the Payment Type; 'Loan Calculator'!pmtType = paymentType;
   // I8 is total interest
   // =IF(AND(SUM(E58:E837)=0,'Loan Calculator'!roundOpt)," - ",('Loan Calculator'!nper*(-PMT('Loan
   // Calculator'!rate,'Loan Calculator'!nper,'Loan Calculator'!loan_amount,,'Loan Calculator'!pmtType))-'Loan
   // Calculator'!loan_amount)-I8)

   // =IF(AND(SUM(E58:E837)=0,'isRounding)," -
   // ",('actualNumberOfPayments*(-PMT(totalInterest,actualNumberOfPayments,'loanAmount,,'paymentType))-'loanAmount)-I8)

   const additionalPaymentsCount = useMemo(
      () => additionalPayments?.filter((item) => Number(item) > 0)?.length || 0,
      [additionalPayments],
   );

   //**  (Schedule!nper*(-PMT(Schedule!rate,Schedule!nper,Schedule!loan_amount,,Schedule!pmtType))-Schedule!loan_amount)-H10)
   /* https://docs.google.com/spreadsheets/d/1ZF6P1MOalBvkAPyyzPQ0z5wIxMECNJ86NfxaihA4eW4/template/preview */
   const estimatedInterestSavings = useMemo(() => {
      if (additionalPaymentsCount > 0) {
         return (
            scheduledNumberOfPayments *
               -PMT(ratePerPeriod, scheduledNumberOfPayments, loanAmount, undefined, paymentType) -
            loanAmount -
            totalInterest
         );
      } else {
         return 0;
      }
   }, [actualNumberOfPayments, additionalPaymentsCount, annualInterestRate, loanAmount, paymentType, totalInterest]);

   /**
    * Create the asset columns for the table.
    */
   const columns = useMemo(() => {
      let columnIndex = 0;

      return [
         {
            Header: <TypographyFHG id={'amortization.number.column'} />,
            ___index: columnIndex++,
            accessor: 'number',
         },
         {
            Header: <TypographyFHG id={'amortization.dueDate.column'} />,
            ___index: columnIndex++,
            accessor: 'dueDate',
            Cell: ({row}) => row.values?.dueDate?.format(DATE_FORMAT_KEYBOARD) || '',
         },
         {
            Header: <TypographyFHG id={'amortization.paymentDue.column'} />,
            ___index: columnIndex++,
            accessor: 'paymentDue',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, row.values?.paymentDue)}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.additionalPayment.column'} />,
            accessor: 'additionalPayment',
            ___index: columnIndex++,
            isEditable: true,
            prefix: '',
            format: CURRENCY_FULL_FORMAT,
            allowNegative: false,
            minWidth: 111,
            tableCellProps: {align: 'right'},
         },
         {
            Header: <TypographyFHG id={'amortization.interest.column'} />,
            ___index: columnIndex++,
            accessor: 'interest',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.interest))}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.principal.column'} />,
            ___index: columnIndex++,
            accessor: 'principal',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.principal))}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.balance.column'} />,
            ___index: columnIndex++,
            accessor: 'balance',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.balance))}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.paymentPerAcre.column'} />,
            ___index: columnIndex++,
            accessor: 'paymentPerAcre',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {amountOfAcres
                        ? numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.paymentDue / amountOfAcres))
                        : 0}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.principalPerAcre.column'} />,
            ___index: columnIndex++,
            accessor: 'principalPerAcre',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {amountOfAcres
                        ? numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.principal / amountOfAcres))
                        : 0}
                  </div>
               );
            },
         },
         {
            Header: <TypographyFHG id={'amortization.interestPerAcre.column'} />,
            ___index: columnIndex++,
            accessor: 'interestPerAcre',
            Cell: ({row}) => {
               return (
                  <div style={{textAlign: 'right'}}>
                     {amountOfAcres
                        ? numberFormatter(CURRENCY_FULL_FORMAT, round(row.values?.interest / amountOfAcres))
                        : 0}
                  </div>
               );
            },
         },
      ];
   }, [amountOfAcres]);

   const digitLimit = (minimum, maximum) => (inputObj) => {
      const {value} = inputObj;

      if (value === '' || value === undefined || value === null) {
         return inputObj;
      }
      if (value <= maximum) {
         if (minimum === undefined || value >= minimum) {
            return inputObj;
         }
      }
   };

   const handleUpdate = (index, id, value) => {
      const useAdditionalPayments = [...additionalPayments];
      useAdditionalPayments[index] = value;
      setAdditionalPayments(useAdditionalPayments);
   };

   const hasPermission = usePermission(TOOLS_EDIT);

   const intl = useIntl();

   const [{clientId, reportDate}] = useCustomSearchParams();

   const [clientData] = useQueryFHG(
      CLIENT_BY_ID_REPORT_QUERY,
      {fetchPolicy: 'network-only', variables: {clientId}, skip: !validate(clientId)},
      'client.type',
   );

   const exportPdf = (title) => {
      return (
         <LoanAmortizationPdf
            title={title}
            intl={intl}
            clientData={clientData?.client}
            data={data}
            info={{
               payment,
               periodsPerYear,
               scheduledNumberOfPayments,
               actualNumberOfPayments,
               totalPayments,
               totalInterest,
               ratePerPeriod,
               estimatedInterestSavings,
               ...defaultValues,
               ...editValues,
            }}
            historyDate={reportDate}
         />
      );
   };

   const handleExportPdf = async () => {
      const title = `${formatMessage(intl, 'amortization.title.label')}-${moment().format(DATE_FORMAT_KEYBOARD)}`;
      const pdfDocument = exportPdf(title);
      const blob = await pdf(pdfDocument).toBlob();
      saveAs(blob, title + '.pdf');
   };

   return (
      <Stack
         ref={ref}
         name={'loan amo sheet root'}
         width={'100%'}
         height={'100%'}
         direction={'column'}
         wrap={'nowrap'}
         overflow={'auto'}
      >
         <Header idTitle='amortization.title.label' values={{month: null}} justifyContent='space-between'>
            <ButtonFHG
               variant='contained'
               color='primary'
               size='large'
               className={'button-title'}
               startIcon={<LaunchOutlined />}
               labelKey={'contract.exportPdf.button'}
               onClick={handleExportPdf}
            />
         </Header>
         <Grid2 rowSpacing={1} columnSpacing={1} container minHeight={'fit-content'}>
            <Grid2 minHeight={200} overflow={'auto'} xs={12} md={7}>
               <HeaderPanel
                  name={'Loan Amortization Left Column'}
                  titleKey={'amortization.variables.title'}
                  maxWidth={'100%'}
                  height={'100% !important'}
                  variant={'h5'}
               >
                  <Grid2 container rowSpacing={2} columnSpacing={1} alignItems={'center'}>
                     <Grid2 xs={8} sm={8} md={6}>
                        <TextFieldLF
                           isFormattedNumber
                           inputProps={{prefix: '$', allowNegative: false}}
                           name={'loanAmount'}
                           autoFocus
                           labelKey={'amortization.loanAmount.label'}
                           onChange={handleChange}
                           value={getValue('loanAmount')}
                           margin={'none'}
                           fullWidth
                           required
                           disabled={!hasPermission}
                           classes={classes}
                        />
                     </Grid2>
                     <Grid2 xs={4} sm={4} md={3}>
                        <TextFieldLF
                           isFormattedNumber
                           inputProps={{suffix: '%', allowNegative: false, isAllowed: digitLimit(1, 100)}}
                           name={'annualInterestRate'}
                           labelKey={'amortization.annualInterestRate.label'}
                           onChange={handleChange}
                           value={getValue('annualInterestRate')}
                           fullWidth
                           margin={'none'}
                           required
                           disabled={!hasPermission}
                           classes={classes}
                        />
                     </Grid2>
                     <Grid2 xs={4} sm={4} md={3}>
                        <TextFieldLF
                           isFormattedNumber
                           inputProps={{allowNegative: false, isAllowed: digitLimit(1, 100)}}
                           name={'termYears'}
                           labelKey={'amortization.termYears.label'}
                           onChange={handleChange}
                           value={getValue('termYears')}
                           fullWidth
                           margin={'none'}
                           required
                           disabled={!hasPermission}
                           classes={classes}
                        />
                     </Grid2>
                     <Grid2 xs={8} sm={8} md={6}>
                        <DatePickerFHG2
                           name={'firstPaymentDate'}
                           format={DATE_FORMAT_KEYBOARD}
                           labelKey={'amortization.firstPaymentDate.label'}
                           value={getValue('firstPaymentDate', moment().add(1, 'day'))}
                           onChange={handleDateChange}
                           required={getValue('firstPaymentDate')}
                           disableFuture={false}
                           fullWidth
                           margin={'none'}
                           disabled={!hasPermission}
                           className={classes.date}
                        />
                     </Grid2>
                     <Grid2 xs={6} sm={4} md={3}>
                        <Autocomplete
                           key='paymentFrequency'
                           name={'paymentFrequency'}
                           labelKey={'amortization.paymentFrequency.label'}
                           value={capitalize(getValue('paymentFrequency', LOAN_FREQUENCY[0]))}
                           freeSolo={false}
                           autoHighlight
                           onChange={(event, value, reason) =>
                              handleChange(event, value, reason, {paymentFrequency: value}, 'paymentFrequency')
                           }
                           valueKey={false}
                           options={LOAN_FREQUENCY}
                           fullWidth
                           margin={'none'}
                           required
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 label={<TypographyFHG id={'amortization.paymentFrequency.label'} />}
                                 variant={'outlined'}
                                 size={'small'}
                                 margin={'normal'}
                              />
                           )}
                           disabled={!hasPermission}
                           className={classes.select}
                        />
                     </Grid2>
                     <Grid2 xs={6} sm={4} md={3}>
                        <Autocomplete
                           key={'compoundPeriod'}
                           name={'compoundPeriod'}
                           value={capitalize(getValue('compoundPeriod', LOAN_FREQUENCY[0]))}
                           freeSolo={false}
                           autoHighlight
                           onChange={(event, value, reason) =>
                              handleChange(event, value, reason, {compoundPeriod: value}, 'compoundPeriod')
                           }
                           valueKey={false}
                           options={LOAN_FREQUENCY}
                           fullWidth
                           margin={'none'}
                           required
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 label={<TypographyFHG id={'amortization.compoundPeriod.label'} />}
                                 variant={'outlined'}
                                 size={'small'}
                                 margin={'normal'}
                              />
                           )}
                           disabled={!hasPermission}
                           className={classes.select}
                        />
                     </Grid2>
                     <Grid2 xs={6}>
                        <Autocomplete
                           key={'paymentType'}
                           name={'paymentType'}
                           labelKey={'amortization.paymentType.label'}
                           value={getValue('paymentType')}
                           freeSolo={false}
                           autoHighlight
                           onChange={handleChange}
                           valueKey={false}
                           options={PAYMENT_TYPE}
                           fullWidth
                           required
                           renderInput={(params) => (
                              <TextField
                                 {...params}
                                 label={<TypographyFHG id={'amortization.paymentType.label'} />}
                                 variant={'outlined'}
                                 size={'small'}
                                 margin={'none'}
                                 fullWidth
                              />
                           )}
                           disabled={!hasPermission}
                           className={classes.select}
                        />
                     </Grid2>
                     <Grid2 xs={8} sm={3} md={3}>
                        <FormControlLabel
                           control={
                              <Switch
                                 checked={getValue('rounding')}
                                 onChange={handleChange}
                                 name='rounding'
                                 color='primary'
                                 disabled={!hasPermission}
                              />
                           }
                           label='Rounding'
                           fullWidth={false}
                           className={classes.controlLabel}
                        />
                     </Grid2>
                     <Grid2 xs={6} sm={3} md={3}>
                        <TextFieldLF
                           isFormattedNumber
                           key={'amountOfAcres'}
                           inputProps={{allowNegative: false, isAllowed: false}}
                           name={'amountOfAcres'}
                           labelKey={'amortization.amountOfAcres.label'}
                           onChange={handleChange}
                           value={getValue('amountOfAcres')}
                           fullWidth
                           margin={'none'}
                           disabled={!hasPermission}
                           classes={classes}
                        />
                     </Grid2>
                     <Grid2 xs={8} sm={8} md={6}>
                        <TextFieldLF
                           isFormattedNumber
                           key={'additionalPaymentAuto'}
                           inputProps={{allowNegative: false, isAllowed: false}}
                           name={'additionalPaymentAuto'}
                           labelKey={'amortization.additionalPayment.column'}
                           onChange={handleChange}
                           value={getValue('additionalPaymentAuto')}
                           fullWidth
                           margin={'none'}
                           disabled={!hasPermission}
                           classes={classes}
                        />
                     </Grid2>
                     <Grid2 xs={4} sm={4} md={6}>
                        <CheckboxFHG
                           key={'overwriteAll'}
                           name={'overwriteAll'}
                           onChange={handleChange}
                           color={'default'}
                           labelKey={'amortization.overwriteAll.label'}
                           value={'overwriteAll'}
                           checked={getValue('overwriteAll', false)}
                           defaultChecked={getValue('overwriteAll', false)}
                           marginTop={0}
                           fullWidth
                        />
                     </Grid2>
                  </Grid2>
               </HeaderPanel>
            </Grid2>
            <Grid2 xs={12} md={5}>
               <HeaderPanel
                  name={'Loan Amortization Right Column'}
                  title={'Summary'}
                  maxWidth={'100%'}
                  height={'100% !important'}
                  scrollRef={ref}
                  variant={'h5'}
               >
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.annualPayment.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={payment} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.ratePerPeriod.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber
                           value={ratePerPeriod}
                           // eslint-disable-next-line react/style-prop-object
                           style='percent'
                           minimumFractionDigits={1}
                           maximumFractionDigits={4}
                        />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.scheduledPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={scheduledNumberOfPayments} />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.actualPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={actualNumberOfPayments} />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.totalPayments.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={totalPayments} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.totalInterest.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={totalInterest} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Stack>
                  <Stack flexDirection='row' justifyContent={'space-between'} width={'100%'}>
                     <TypographyFHG
                        id={'amortization.estimatedInterestSavings.label'}
                        color='primary'
                        className={classes.headerTextStyle}
                        variant='h6'
                     />
                     <TypographyFHG color='primary' className={classes.headerTextStyle} variant='h6'>
                        {/* eslint-disable-next-line react/style-prop-object */}
                        <FormattedNumber value={estimatedInterestSavings} style='currency' currency='USD' />
                     </TypographyFHG>
                  </Stack>
               </HeaderPanel>
            </Grid2>
         </Grid2>
         {data?.length > 0 && (
            <TableContainerFrame titleKey={'amortization.payment.title'} top={-24} stickyTitle={true}>
               <TableNewUiFHG
                  name={'Loan Amortization'}
                  columns={columns}
                  data={data || [{}]}
                  updateMyData={handleUpdate}
                  classes={{
                     root: classes.tableRoot,
                  }}
                  allowCellSelection={true}
                  hasBorder={false}
                  isEditOnSingleClick={true}
               />
            </TableContainerFrame>
         )}
      </Stack>
   );
}
