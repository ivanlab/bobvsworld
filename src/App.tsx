import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './index.css';

const App: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [pieData, setPieData] = useState<any>(null);
  const [thirdChartData, setThirdChartData] = useState<any>(null); // Added state for thirdChartData
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const calculateWeightedValues = (series1: number[], series2: number[], series3: number[]) => {
    return series1.map((_, i) => {
      const total = series1[i] + series2[i] + series3[i];
      return [
        (series1[i] / total) * 100,
        (series2[i] / total) * 100,
        (series3[i] / total) * 100,
      ];
    });
  };

  useEffect(() => {
    const fetchBitcoinPrices = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        const response = await axios.get(`https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`);
        const prices: number[] = Object.values(response.data.bpi);
        const dates: string[] = Object.keys(response.data.bpi);

        const percentageDifference = (prices: number[], reference: number): number[] => {
          return prices.map(price => 100 - Math.abs((price - reference) / reference * 100));
        };

        const bobSeries = percentageDifference(prices, 60000);
        const aliceSeries = percentageDifference(prices, 500000);
        const ivanSeries = percentageDifference(prices, 120000);

        const weightedValues = calculateWeightedValues(bobSeries, aliceSeries, ivanSeries);

        const weightedBobSeries = weightedValues.map(values => values[0]);
        const weightedAliceSeries = weightedValues.map(values => values[1]);
        const weightedIvanSeries = weightedValues.map(values => values[2]);

        const currentBob = weightedBobSeries[weightedBobSeries.length - 1];
        const currentAlice = weightedAliceSeries[weightedAliceSeries.length - 1];
        const currentIvan = weightedIvanSeries[weightedIvanSeries.length - 1];

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `BOB (${currentBob.toFixed(2)}%)`,
              data: weightedBobSeries,
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
            {
              label: `AL-ice (${currentAlice.toFixed(2)}%)`,
              data: weightedAliceSeries,
              borderColor: 'rgba(153, 102, 255, 1)',
              fill: false,
            },
            {
              label: `IVAN (${currentIvan.toFixed(2)}%)`,
              data: weightedIvanSeries,
              borderColor: 'rgba(255, 159, 64, 1)',
              fill: false,
            },
          ],
        });

        const total = currentBob + currentAlice + currentIvan;

        setPieData({
          labels: [
            `BOB (${((currentBob / total) * 100).toFixed(2)}%)`,
            `AL-ice (${((currentAlice / total) * 100).toFixed(2)}%)`,
            `IVAN (${((currentIvan / total) * 100).toFixed(2)}%)`,
          ],
          datasets: [
            {
              data: [currentBob, currentAlice, currentIvan],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });

        // New series calculations
        const bobVsIvanSeries = weightedBobSeries.map((value, index) => value - weightedIvanSeries[index]);
        const aliceVsIvanSeries = weightedAliceSeries.map((value, index) => value - weightedIvanSeries[index]);

        const thirdChartData = {
          labels: dates,
          datasets: [
            {
              label: 'Bob vs Ivan',
              data: bobVsIvanSeries,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
            {
              label: 'Ivan vs AL-ice',
              data: aliceVsIvanSeries,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
            },
          ],
        };

        setThirdChartData(thirdChartData); // Set the thirdChartData state

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Bitcoin prices');
        setLoading(false);
      }
    };

    fetchBitcoinPrices();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="container">
        <h1>Bob vs World 2024 Bet</h1>
        <div className="chart-container">
          {chartData && <Line data={chartData} />}
        </div>
      </div>
      <div className="container">
        <h2>Current Bet Options</h2>
        <div className="pie-chart-container">
          {pieData && <Pie data={pieData} className="pie-chart" />}
        </div>
      </div>
      <div className="container">
        <h2>Take over Bob Chart</h2>
        <div className="chart-container">
          {thirdChartData && <Line data={thirdChartData} />}
        </div>
      </div>
    </div>
  );
};

export default App;
