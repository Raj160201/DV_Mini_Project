import React, { useEffect, useState } from 'react';

const StockChartData = ({ apiUrl, children }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                const response = await fetch(apiUrl);
                const jsonData = await response.json();

                const data = jsonData.data.candles.map(candle => ({
                    Date: new Date(candle[0]),
                    Open: candle[1],
                    High: candle[2],
                    Low: candle[3],
                    Close: candle[4]
                }));

                setLoading(false);
                setChartData(data);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setLoading(false);
            }
        };

        fetchChartData();

        return () => {
            // Cleanup code if necessary
        };
    }, [apiUrl]);

    return <>{children(chartData, loading)}</>;
};

export default StockChartData;
