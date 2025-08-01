import React from 'react';
import {Line} from 'react-chartjs-2';
import {
   Chart as ChartJS,
   CategoryScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
   Filler,
   LinearScale,
} from 'chart.js';
import numberFormatter from 'number-formatter';
import {CURRENCY_FORMAT} from '../../../Constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const options = {
   responsive: true,
   tension: 0.3,
   plugins: {
      legend: {
         display: false,
      },
      scales: {
         x: {
            color: 'red',
            grid: {
               color: 'red', // Color of the grid lines
               borderColor: '#333',
            },
            ticks: {
               color: 'yellow', // Color of the tick labels
               font: {
                  size: 14, // Font size for tick labels
               },
               callback: (value) => `${value / 100} m`,
            },
         },
         y: {
            color: 'pink',
            grid: {
               color: 'pink', // Color of the grid lines
            },
            ticks: {
               color: 'violet', // Color of the tick labels
               font: {
                  size: 14, // Font size for tick labels
               },
               callback: (value) => `${value / 100} m`,
            },
         },
      },
      tooltip: {
         enabled: true,
         backgroundColor: '#769548',
         displayColors: false,
         callbacks: {
            label: function (context) {
               return numberFormatter(CURRENCY_FORMAT, context.parsed.y);
            },
            title: function (context) {
               return 'Assets';
            },
         },
         custom: function (tooltipModel) {
            /* if data & datasets not empty & tooltip available */
            if (tooltipModel.opacity !== 0) {
               /* set backgroundColor */
               tooltipModel.backgroundColor = '#fffff';
            }
         },
      },
   },
};

function TrendAnalysisChart(totalAssets) {
   const last12Months = totalAssets?.totalAssets?.slice(-12);

   const labels = last12Months.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleString('default', {month: 'short', timeZone: 'UTC'});
   });

   const data = last12Months.map((item) => item.value);

   const chartData = {
      labels,
      datasets: [
         {
            data,
            borderColor: '#769548',
            backgroundColor: 'linear-gradient(180deg, rgba(118, 149, 72, 0.25) -13.47%, rgba(118, 149, 72, 0) 98.07%)',
            fill: {
               target: 'origin', // Set the fill options
               above: 'rgba(118, 149, 72, 0.25)',
            },
         },
      ],
   };

   return <Line options={options} data={chartData} />;
}

export default TrendAnalysisChart;
