import React, { Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import News from './News';
import StockIndex from './Stock_index';
import IPONews from './IPO_News';
import Loader from './Loader';
import StockChartContent from './StockChartContent';

export default function Home() {
    const location = useLocation();
    const Stocks = lazy(() => import('./Stocks'));
    let { stockName, companyIsin } = location.state || {};
    if (!companyIsin) {
        companyIsin = "INE002A01018";
        stockName = "RIL";
    }
    return (
        <>
            <div className="home">
                <div className="row">
                    <div className="col-md-9">
                        <StockChartContent companyIsin={companyIsin} stockCode={stockName} />
                    </div>
                    <div className="col-md-3">
                        <StockIndex />
                        <Suspense fallback={<Loader />}>
                            <Stocks />
                        </Suspense>
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