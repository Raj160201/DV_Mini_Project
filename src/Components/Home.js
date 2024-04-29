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
import { useSpring, animated } from '@react-spring/web'
import indexApi from '../Utils/apis/index_api';
import indexJson from '../Utils/data/short_index.json';
import Sector from './Sector';

export default function Home() {
    const location = useLocation();
    const [showPrice, setShowPrice] = useState(true);
    const [indexInfo, setIndexInfo] = useState([]);
    const Stocks = lazy(() => import('./Stocks'));
    let { stockName, companyIsin } = location.state || {};
    if (!companyIsin) {
        companyIsin = "INE002A01018";
        stockName = "RIL";
    }

    const priceAnimation = useSpring({
        opacity: showPrice ? 1 : 0,
        translateY: showPrice ? '0%' : '-100%',
        scale: showPrice ? 1 : 0.8,
        rotateX: showPrice ? 0 : 90,
        config: { duration: 500 }
    });

    const percentageAnimation = useSpring({
        opacity: showPrice ? 0 : 1,
        translateY: showPrice ? '100%' : '0%',
        scale: showPrice ? 0.8 : 1,
        rotateX: showPrice ? 90 : 0,
        config: { duration: 500 }
    });

    const getColor = (change) => {
        if (change < 0) return 'danger';
        if (change > 0) return 'success';
        return 'black';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const updatedIndexData = await Promise.all(
                    indexJson.map(async (indexItem) => {
                        const { Index_Name, Index_Code, Index_Logo } = indexItem;
                        const indexInfo = await indexApi({ index: Index_Code });

                        return {
                            Index_Name,
                            Index_Code,
                            Index_Logo,
                            LTP: (indexInfo.previousClose + indexInfo.variation).toFixed(2),
                            Change: indexInfo.variation.toFixed(2),
                            ChangePercentage: indexInfo.percentChange.toFixed(2),
                            Color: getColor(indexInfo.variation),
                        };
                    })
                );
                setIndexInfo(updatedIndexData);
            } catch (error) {
                console.error("Error fetching index data:", error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const typed = new Typed('.typed', {
            strings: ['Discover...', 'Analyze...', 'Decide...', 'Execute...'],
            loop: true,
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 2000
        });

        return () => {
            typed.destroy();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPrice((prevShowPrice) => !prevShowPrice);
        }, 5000);

        return () => clearTimeout(timer);
    }, [showPrice]);

    return (
        <>
            <div className="home">
                <div id="hero" className="hero route bg-image" style={{ backgroundImage: `url(${background})` }}>
                    <div className="overlay-itro"></div>
                    <div className="hero-content display-table">
                        <div className="table-cell">
                            <div className="container" style={{ marginBottom: '30px', marginLeft: '90px' }}>
                                <h1 className="hero-title mb-1">Research today,</h1>
                                <h1 className="hero-title mb-4">Reap tomorrow.</h1>
                                <p className="display-6 color-d">The best trades require research,<br /> then commitment.</p>
                                <p className="hero-subtitle">
                                    <span className="typed"></span> { }
                                </p>
                            </div>
                            <div className="container">
                                <div className="row justify-content-start" style={{ width: '75%' }}>
                                    {indexInfo.map((stock, index) => (
                                        <div key={index} className="col-sm-3 text-center ">
                                            <button type="submit" className="button button-a button-big button-rouded">
                                                <div className="d-flex justify-content-around">
                                                    <div className="card-nifty">
                                                        <img className="index-logo" crossOrigin="" src={stock.Index_Logo} alt="" />
                                                    </div>
                                                    <div className="card-value justify-content-start text-start">
                                                        <h4><span className='text small fw-bold'>{stock.Index_Name}</span></h4>
                                                        <animated.span className={`text-${showPrice ? 'white' : stock.Color} small pt-1 ps-0 fw-bold`} style={showPrice ? priceAnimation : percentageAnimation}>
                                                            {showPrice ? (
                                                                <>{stock.LTP} <span className="text small pt-1 ps-0" style={{ fontWeight: '200' }}>INR</span></>
                                                            ) : (
                                                                <>{stock.ChangePercentage}% <span className="text small pt-1 ps-0" style={{ fontWeight: '400' }}>{stock.Color === 'success' ? `+${stock.Change}` : `${stock.Change}`}</span></>
                                                            )}
                                                        </animated.span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
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
                        <Sector />
                        <IPONews />
                        <News />
                    </div>
                </div>
            </div >
        </>
    );
}