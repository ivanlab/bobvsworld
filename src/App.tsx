import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './index.css';

const App: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [pieData, setPieData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

        const currentBob = bobSeries[bobSeries.length - 1];
        const currentAlice = aliceSeries[aliceSeries.length - 1];
        const currentIvan = ivanSeries[ivanSeries.length - 1];

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `BOB (${currentBob.toFixed(2)}%)`,
              data: bobSeries,
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
            {
              label: `AL-ice (${currentAlice.toFixed(2)}%)`,
              data: aliceSeries,
              borderColor: 'rgba(153, 102, 255, 1)',
              fill: false,
            },
            {
              label: `IVAN (${currentIvan.toFixed(2)}%)`,
              data: ivanSeries,
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
        <h1>Bitcoin Price Percentage Difference Time Series</h1>
        <div className="chart-container">
          {chartData && <Line data={chartData} />}
        </div>
      </div>
      <div className="container">
        <h2>Current Percentage Differences</h2>
        <div className="pie-chart-container">
          {pieData && <Pie data={pieData} className="pie-chart" />}
        </div>
      </div>
    </div>
  );
};

export default App;
