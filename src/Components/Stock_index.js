import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import indexDataJson from '../Utils/data/index.json';
import './Style.css';
import indexApi from '../Utils/apis/index_api';
import Loader from './Loader';

export default function StockIndex() {
    const [indexInfo, setIndexInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const updatedIndexData = await Promise.all(
                    indexDataJson.map(async (indexItem) => {
                        setLoading(true);
                        const { Index_Name, Index_Code } = indexItem;
                        const indexInfo = await indexApi({ index: Index_Code });

                        return {
                            Index_Name,
                            Index_Code,
                            LTP: (indexInfo.previousClose + indexInfo.variation).toFixed(2),
                            Change: indexInfo.variation.toFixed(2),
                            ChangePercentage: indexInfo.percentChange.toFixed(2),
                            Color: getColor(indexInfo.variation),
                        };
                    })
                );
                setIndexInfo(updatedIndexData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching index data:", error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getColor = (change) => {
        if (change < 0) return 'danger';
        if (change > 0) return 'success';
        return 'black';
    };

    const sliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        swipeToSlide: true,
        lazyLoad: true,
        autoplaySpeed: 3000,
        arrows: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <>
            {loading && <Loader />}
            <Slider {...sliderSettings}>
                {indexInfo.map((stock, index) => (
                    <div key={index} className="col-xxl-6 col-md-6">
                        <div className="card info-card sales-card">
                            <div className="card-body-custom">
                                <div className="d-flex justify-content-around">
                                    <div className="card-index">
                                        <p className="card-title">{stock.Index_Name}</p>
                                        <span className="text-bold small index">NSE INDEX</span>
                                    </div>
                                    <div className="card-value">
                                        <h4><span className={`text-${stock.Color} small fw-bold`}>{stock.ChangePercentage}%</span></h4>
                                        <span className="text-bold small pt-1 ps-0">{stock.LTP}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </>
    );
}



