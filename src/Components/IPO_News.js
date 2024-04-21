import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Style.css';
import ipoApi from '../Utils/apis/ipos_api';
import Loader from './Loader';

export default function IPONews() {
    const [ipoInfo, setIpoInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await ipoApi();
                const filteredArticles = data.ipoCalendar.filter(article => {
                    return (
                        article.date !== null &&
                        article.exchange !== null &&
                        article.symbol !== null &&
                        article.price !== null
                    );
                });
                setIpoInfo(filteredArticles);
                setLoading(false);
            } catch (error) {
                console.error(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const sliderSettings = {
        infinite: true,
        speed: 500,
        slidesToShow: 6,
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
                {ipoInfo && ipoInfo.map((article, index) => (
                    <div key={index} className="col-xxl-6 col-md-6">
                        <div className="card info-card sales-card" style={{ marginTop: '60px' }}>
                            <div className="card-body-custom">
                                <div className="d-flex justify-content-around">
                                    <div className="card-index">
                                        <p className="card-title">{article.symbol}</p>
                                        <span className="text-bold small index">{article.exchange}</span>
                                    </div>
                                    <div className="card-value">
                                        <h4><span className={`text-success small fw-bold`}>$ {article.price}</span></h4>
                                        <span className="text-bold small pt-1 ps-0">{article.date}</span>
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
