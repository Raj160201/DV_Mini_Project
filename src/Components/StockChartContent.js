import React, { useState, useEffect } from 'react';
import StockLineChartContent from './StockLineChartContent';
import StockCandleChartContent from './StockCandleChartContent';
import StockAreaChartContent from './StockAreaChartContent';
import StockStepChartContent from './StockStepChartContent';
import Loader from './Loader';
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faChartArea, faStairs } from '@fortawesome/free-solid-svg-icons';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

const StockChartContent = ({ companyIsin, stockCode }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState('area');
    const [selectedTime, setSelectedTime] = useState('day');
    const [selectedChartIcon, setChartIcon] = useState(faChartArea);

    const today = new Date().toISOString().split('T')[0];
    const apiHeader = "https://api.upstox.com/v2/historical-candle/NSE_EQ%7C";
    const apiFooter = `/${selectedTime}/${today}/2000-01-01`;
    const apiUrl = apiHeader + companyIsin + apiFooter;

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

    const handleChartChange = (chartType, chartIcon) => {
        setSelectedChart(chartType);
        setChartIcon(chartIcon);
    };

    const handleTimeChange = (timePeriod) => {
        setSelectedTime(timePeriod);
    };

    return (
        <>
            {loading && <Loader />}
            <div className="row" style={{ justifyContent: 'flex-start', padding: '0', maxHeight: '20px' }}>
                <div className="col chart-col" style={{ flex: '1', maxWidth: 'max-content' }}>
                    <svg id="chart-title" width="auto" height="40%">
                        <text x="10" y="40" className="chart-title" fontSize="20px" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
                            {stockCode} &#8226; {selectedTime === 'day' ? 'D' :
                                selectedTime === 'week' ? 'W' :
                                    selectedTime === 'month' ? 'M' :
                                        selectedTime === '1minute' ? '1m' :
                                            selectedTime === '30minute' ? '30m' : selectedTime} &#8226; NSE
                        </text>
                    </svg>
                </div>
                <div className="col chart-col" style={{ flex: '1', maxWidth: 'max-content', paddingTop: '15px', marginLeft: '-40px' }}>
                    <MDBDropdown>
                        <MDBDropdownToggle size='sm'>
                            {selectedChart === 'candles' ? <CandlestickChartIcon style={{ fontSize: '20px', marginRight: '2px', padding: '0' }} /> : <FontAwesomeIcon icon={selectedChartIcon} style={{ marginRight: '7px' }} />}
                            {selectedChart}
                        </MDBDropdownToggle>
                        <MDBDropdownMenu dark>
                            <MDBDropdownItem link aria-current={selectedChart === 'area'} childTag='button' onClick={() => handleChartChange('area', faChartArea)}>
                                <FontAwesomeIcon icon={faChartArea} style={{ marginRight: '10px' }} />Area
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedChart === 'line'} childTag='button' onClick={() => handleChartChange('line', faArrowTrendUp)}>
                                <FontAwesomeIcon icon={faArrowTrendUp} style={{ marginRight: '10px' }} />Line
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedChart === 'candles'} childTag='button' onClick={() => handleChartChange('candles', CandlestickChartIcon)}>
                                <CandlestickChartIcon /> Candle
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedChart === 'step area'} childTag='button' onClick={() => handleChartChange('step area', faStairs)}>
                                <FontAwesomeIcon icon={faStairs} style={{ marginRight: '7px' }} /> Step Area
                            </MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </div>
                <div className="col chart-col" style={{ flex: '1', maxWidth: 'max-content', paddingTop: '15px', marginLeft: '10px' }}>
                    <MDBDropdown>
                        <MDBDropdownToggle size='sm'>
                            {selectedTime === 'day' ? '1 Day' :
                                selectedTime === 'week' ? '1 Week' :
                                    selectedTime === 'month' ? '1 Month' :
                                        selectedTime === '1minute' ? '1 Minute' :
                                            selectedTime === '30minute' ? '30 Minutes' : selectedTime}
                        </MDBDropdownToggle>
                        <MDBDropdownMenu dark>
                            <MDBDropdownItem link aria-current={selectedTime === '1minute'} childTag='button' onClick={() => handleTimeChange('1minute')}>
                                1 minute
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedTime === '30minute'} childTag='button' onClick={() => handleTimeChange('30minute')}>
                                30 minutes
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedTime === 'day'} childTag='button' onClick={() => handleTimeChange('day')}>
                                1 Day
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedTime === 'week'} childTag='button' onClick={() => handleTimeChange('week')}>
                                1 Week
                            </MDBDropdownItem>
                            <MDBDropdownItem link aria-current={selectedTime === 'month'} childTag='button' onClick={() => handleTimeChange('month')}>
                                1 Month
                            </MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </div>
            </div>

            {selectedChart === 'area' && <StockAreaChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'line' && <StockLineChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'candles' && <StockCandleChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'step area' && <StockStepChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
        </>
    );
};

export default StockChartContent;
