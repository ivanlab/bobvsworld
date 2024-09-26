import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './index.css';

const App: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
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

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `BOB (${bobSeries[bobSeries.length - 1].toFixed(2)}%)`,
              data: bobSeries,
              borderColor: 'rgba(75, 192, 192, 1)',
              fill: false,
            },
            {
              label: `AL-ice (${aliceSeries[aliceSeries.length - 1].toFixed(2)}%)`,
              data: aliceSeries,
              borderColor: 'rgba(153, 102, 255, 1)',
              fill: false,
            },
            {
              label: `IVAN (${ivanSeries[ivanSeries.length - 1].toFixed(2)}%)`,
              data: ivanSeries,
              borderColor: 'rgba(255, 159, 64, 1)',
              fill: false,
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
    <div className="container">
      <h1>Bitcoin Price Bet End-2024: Bob vs World</h1>
      <div className="chart-container">
        {chartData && <Line data={chartData} />}
      </div>
    </div>
  );
};

export default App;
