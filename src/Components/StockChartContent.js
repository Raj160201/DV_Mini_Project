import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import StockLineChartContent from './StockLineChartContent';
import StockCandleChartContent from './StockCandleChartContent';
import StockAreaChartContent from './StockAreaChartContent';
import StockStepChartContent from './StockStepChartContent';
import StockHLCChartContent from './StockHLCChartContent';
import Loader from './Loader';
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faChartArea, faStairs, faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
Modal.setAppElement('#root');

const StockChartContent = ({ companyIsin, stockCode }) => {
    const [chartData, setChartData] = useState(null);
    const [colorData, setColorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedChart, setSelectedChart] = useState('area');
    const [selectedTime, setSelectedTime] = useState('month');
    const [selectedIndicator, setSelectedIndicator] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [variablePeriod, setVariablePeriod] = useState('');
    const [selectedIndicatorWithPeriod, setSelectedIndicatorWithPeriod] = useState([]);
    const [selectedColor, setSelectedColor] = useState('#FFFF00');
    const [selectedChartIcon, setChartIcon] = useState(faChartArea);

    const today = new Date().toISOString().split('T')[0];
    const apiHeader = "https://api.upstox.com/v2/historical-candle/NSE_EQ%7C";
    const apiFooter = `/${selectedTime}/${today}/2000-01-01`;
    const apiUrl = apiHeader + companyIsin + apiFooter;

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
                Close: candle[4],
                Volume: candle[5]
            }));

            const latestCandle = data[0];
            const secondLatestCandle = data[data.length - 1];

            let color;
            if (latestCandle.Close > secondLatestCandle.Close) {
                setColorData('#85bb65');
            } else {
                setColorData('#C41E3A');
            }

            setLoading(false);
            setChartData(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();

        return () => { };
    }, [apiUrl]);

    const handleChartChange = (chartType, chartIcon) => {
        setSelectedChart(chartType);
        setChartIcon(chartIcon);
    };

    const handleTimeChange = (timePeriod) => {
        setSelectedTime(timePeriod);
    };
    useEffect(() => {
        fetchChartData();
    }, [selectedIndicator]);

    const handleIndicator = (indicator) => {
        const index = selectedIndicator.findIndex(item => item.indicator === indicator);
        if (index !== -1) {
            const updatedIndicator = [...selectedIndicator];
            updatedIndicator.splice(index, 1);
            setSelectedIndicator(updatedIndicator);
        } else {
            if (indicator !== 'Volume') {
                setModalIsOpen(true);
            }
            else {
                const updatedIndicator = [...selectedIndicator, { indicator, color: selectedColor }];
                setSelectedIndicator(updatedIndicator);
            }
            setSelectedIndicatorWithPeriod({ indicator });
        }
    };

    const handleModalClose = () => {
        setModalIsOpen(false);
        setVariablePeriod('');
        setSelectedColor('Red');
    };

    const handleModalSubmit = () => {
        if (selectedIndicatorWithPeriod.indicator !== 'VWAP' && (!variablePeriod || isNaN(variablePeriod) || parseInt(variablePeriod) <= 0)) {
            alert('Please enter a valid positive number for the period.');
            return;
        }
        const updatedIndicator = [...selectedIndicator, { ...selectedIndicatorWithPeriod, period: parseInt(variablePeriod), color: selectedColor }];
        setSelectedIndicator(updatedIndicator);
        setModalIsOpen(false);
        setVariablePeriod('');
        setSelectedColor('Red');
    };
    useEffect(() => {
        console.log(selectedIndicator);
    }, [selectedIndicator]);

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
                            <MDBDropdownItem link aria-current={selectedChart === 'hlc area'} childTag='button' onClick={() => handleChartChange('hlc area', faStairs)}>
                                <FontAwesomeIcon icon={faStairs} style={{ marginRight: '7px' }} /> HLC Area
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
                <div className="col chart-col" style={{ flex: '1', maxWidth: 'max-content', paddingTop: '15px', marginLeft: '10px' }}>
                    <MDBDropdown>
                        <MDBDropdownToggle size='sm'>
                            {'Select Indicator'}
                        </MDBDropdownToggle>
                        <MDBDropdownMenu dark>
                            <MDBDropdownItem
                                link
                                aria-current={selectedIndicator.some(item => item.indicator === 'SMA')}
                                childTag='button'
                                onClick={() => handleIndicator('SMA')}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckSquare}
                                    style={{
                                        marginRight: '7px',
                                        color: selectedIndicator.some(item => item.indicator === 'SMA') ? '#0d6efd' : 'inherit'
                                    }}
                                />
                                SMA
                            </MDBDropdownItem>
                            <MDBDropdownItem
                                link
                                aria-current={selectedIndicator.some(item => item.indicator === 'EMA')}
                                childTag='button'
                                onClick={() => handleIndicator('EMA')}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckSquare}
                                    style={{
                                        marginRight: '7px',
                                        color: selectedIndicator.some(item => item.indicator === 'EMA') ? '#0d6efd' : 'inherit'
                                    }}
                                />
                                EMA
                            </MDBDropdownItem>
                            <MDBDropdownItem
                                link
                                aria-current={selectedIndicator.some(item => item.indicator === 'VWAP')}
                                childTag='button'
                                onClick={() => handleIndicator('VWAP')}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckSquare}
                                    style={{
                                        marginRight: '7px',
                                        color: selectedIndicator.some(item => item.indicator === 'VWAP') ? '#0d6efd' : 'inherit'
                                    }}
                                />
                                VWAP
                            </MDBDropdownItem>
                            <MDBDropdownItem
                                link
                                aria-current={selectedIndicator.some(item => item.indicator === 'Volume')}
                                childTag='button'
                                onClick={() => handleIndicator('Volume')}
                            >
                                <FontAwesomeIcon
                                    icon={faCheckSquare}
                                    style={{
                                        marginRight: '7px',
                                        color: selectedIndicator.some(item => item.indicator === 'Volume') ? '#0d6efd' : 'inherit'
                                    }}
                                />
                                Volume
                            </MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </div>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={handleModalClose}
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        content: {
                            width: '350px',
                            height: selectedIndicatorWithPeriod.indicator === 'VWAP' ? '250px' : '300px',
                            margin: 'auto',
                            backgroundColor: 'black',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                >
                    <div style={{ padding: '20px' }}>
                        <h2 style={{ marginBottom: '25px', color: '#fff' }}>{selectedIndicatorWithPeriod.indicator}</h2>
                        {selectedIndicatorWithPeriod.indicator !== 'VWAP' && (
                            <input
                                type="number"
                                placeholder="Period"
                                value={variablePeriod}
                                onChange={(e) => setVariablePeriod(e.target.value)}
                                style={{
                                    marginBottom: '20px',
                                    width: '100%',
                                    padding: '8px',
                                    boxSizing: 'border-box',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                            />
                        )}
                        <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            style={{
                                marginBottom: '20px',
                                width: '100%',
                                padding: '8px',
                                boxSizing: 'border-box',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={handleModalSubmit}
                                style={{
                                    marginRight: '10px',
                                    padding: '8px 15px',
                                    backgroundColor: '#0d6efd',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                }}
                            >
                                OK
                            </button>
                            <button
                                onClick={handleModalClose}
                                style={{
                                    padding: '8px 15px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

            </div>

            {selectedChart === 'area' && <StockAreaChartContent stockCode={stockCode} chartData={chartData} selectedIndicator={selectedIndicator} colorData={colorData} loading={loading} />}
            {selectedChart === 'line' && <StockLineChartContent stockCode={stockCode} chartData={chartData} selectedIndicator={selectedIndicator} colorData={colorData} loading={loading} />}
            {selectedChart === 'candles' && <StockCandleChartContent stockCode={stockCode} chartData={chartData} selectedIndicator={selectedIndicator} loading={loading} />}
            {selectedChart === 'step area' && <StockStepChartContent stockCode={stockCode} chartData={chartData} selectedIndicator={selectedIndicator} colorData={colorData} loading={loading} />}
            {selectedChart === 'hlc area' && <StockHLCChartContent stockCode={stockCode} chartData={chartData} selectedIndicator={selectedIndicator} loading={loading} />}
        </>
    );
};

export default StockChartContent;
