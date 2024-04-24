import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import News from './News';
import StockIndex from './Stock_index';
import IPONews from './IPO_News';
import Loader from './Loader';
import StockChartContent from './StockChartContent';
import background from '../Assets/background.jpg'
import Typed from 'typed.js';
import ScrollToSomeSection from './ScrollToSomeSection';

export default function Home() {
    const location = useLocation();
    const [tokenData, setTokenData] = useState(null);
    const Stocks = lazy(() => import('./Stocks'));
    let { stockName, companyIsin } = location.state || {};
    if (!companyIsin) {
        companyIsin = "INE002A01018";
        stockName = "RIL";
    }

    useEffect(() => {
        const typed = new Typed('.typed', {
            strings: ['Discover', 'Analyze', 'Decide', 'Execute'],
            loop: true,
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 2000
        });

        return () => {
            typed.destroy();
        };

    }, []);

    return (
        <>
            <div className="home">
                <div id="hero" class="hero route bg-image" style={{ backgroundImage: `url(${background})` }}>
                    <div class="overlay-itro"></div>
                    <div class="hero-content display-table">
                        <div class="table-cell">
                            <div class="container" style={{ marginBottom: '100px', marginLeft: '90px' }}>
                                <h1 class="hero-title mb-1">Research today,</h1>
                                <h1 class="hero-title mb-4">Reap tomorrow.</h1>
                                <p className="display-6 color-d">The best trades require research,<br /> then commitment.</p>
                                <p className="hero-subtitle">
                                    <span className="typed"></span> { }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <ScrollToSomeSection section="about" />
                <div id="about" className="row">
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
            </div >
        </>
    );
}