import React from 'react';
import { useLocation } from 'react-router-dom';
import News from './News';
import Stocks from './Stocks';
// import StockChart from './Stock_Chart';
import StockIndex from './Stock_index';
import IPONews from './IPO_News';
import StockChartData from './StockChartData';
import StockChartContent from './StockChartContent';

export default function Home() {
    const location = useLocation();
    let { stockName, companyIsin } = location.state || {};
    if (!companyIsin) {
        companyIsin = "INE002A01018";
        stockName = "RIL";
    }
    const today = new Date().toISOString().split('T')[0];
    const apiHeader = "https://api.upstox.com/v2/historical-candle/NSE_EQ%7C";
    const apiFooter = `/day/${today}/2000-01-01`;
    const apiUrl = apiHeader + companyIsin + apiFooter;

    return (
        <>
            <div className="home">
                <div className="row">
                    <div className="col-md-9">
                        <StockChartData apiUrl={apiUrl}>
                            {(chartData, loading) => (
                                <StockChartContent stockCode={stockName} chartData={chartData} loading={loading} />
                            )}
                        </StockChartData>
                    </div>
                    <div className="col-md-3">
                        <StockIndex />
                        <Stocks />

                    </div>
                    <div className="col-md-12">
                        <IPONews />
                        <News />
                    </div>
                </div>
            </div>
        </>
    );
}