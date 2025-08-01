import {Stack} from '@mui/material';
import OverviewPanel from '../../../components/OverviewPanel';
import React from 'react';
import OverviewPanelView from './OverviewPanelView';

const MAX_WIDTH_OVERVIEW = 420;
const MIN_WIDTH_OVERVIEW = 328;
const HEIGHT_OVERVIEW = 180;

const Overview = ({
   isGraph,
   clientLeverage,
   totalBankSafetyNet,
   totalLiabilities,
   totalAvailable,
   totalAssets,
   isPotentialBorrowingPower,
}) => {
   const View = !isGraph ? OverviewPanel : OverviewPanelView;

   return (
      <Stack
         name={'totalsValuesArea'}
         gap={{xs: 1, md: 3}}
         overflow='visible'
         flexDirection='row'
         flexWrap={{xs: 'wrap', lg: 'nowrap'}}
         sx={{mb: {xs: 1, md: 3}}}
         flex={'1 1'}
      >
         <View
            icon='/images/solar_hand-money-broken.png'
            titleKey={'loanAnalysis.overview.total.assetBorrowingPower'}
            value={totalAvailable || 0}
            titleKey2={'loanAnalysis.overview.total.liabilities'}
            value2={totalLiabilities || 0}
            titleKeyThird={
               isPotentialBorrowingPower
                  ? 'loan.potentialBorrowingPower.label'
                  : 'loanAnalysis.overview.total.borrowingPower'
            }
            isThirdTitlePrimary
            valueThird={clientLeverage || 0}
            maxWidth={MAX_WIDTH_OVERVIEW}
            minWidth={MIN_WIDTH_OVERVIEW}
            height={HEIGHT_OVERVIEW}
         />
         <View
            icon='/images/akar-icons_money.png'
            titleKey={'loanAnalysis.overview.total.assets'}
            value={totalAssets}
            titleKey2={'loanAnalysis.overview.total.liabilities'}
            value2={totalLiabilities}
            titleKeyThird={'loanAnalysis.overview.total.bankSafetyNet'}
            valueThird={totalBankSafetyNet || 0}
            isThirdTitlePrimary
            maxWidth={MAX_WIDTH_OVERVIEW}
            minWidth={MIN_WIDTH_OVERVIEW}
            height={HEIGHT_OVERVIEW}
         />
      </Stack>
   );
};

export default Overview;
