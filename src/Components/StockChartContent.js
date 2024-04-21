import React, { useState } from 'react';
import StockLineChartContent from './StockLineChartContent';
import StockCandleChartContent from './StockCandleChartContent';
import StockAreaChartContent from './StockAreaChartContent';
import StockStepChartContent from './StockStepChartContent';
import Loader from './Loader';
import { MDBDropdown, MDBDropdownMenu, MDBDropdownToggle, MDBDropdownItem } from 'mdb-react-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faChartArea, faStairs } from '@fortawesome/free-solid-svg-icons';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

const StockChartContent = ({ stockCode, chartData, loading }) => {
    const [selectedChart, setSelectedChart] = useState('area');
    const [selectedChartIcon, setChartIcon] = useState(faChartArea);

    const handleChartChange = (chartType, chartIcon) => {
        setSelectedChart(chartType);
        setChartIcon(chartIcon);
    };

    return (
        <>
            {loading && <Loader />}
            <div className="row" style={{ justifyContent: 'flex-start', padding: '0', maxHeight: '20px' }}>
                <div className="col chart-col" style={{ flex: '1', maxWidth: 'max-content' }}>
                    <svg id="chart-title" width="auto" height="40%">
                        <text x="10" y="40" className="chart-title" fontSize="20px" fill="#fff" fontWeight="bold" fontFamily="sans-serif">
                            {stockCode} &#8226; 1D &#8226; NSE
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
            </div>

            {selectedChart === 'area' && <StockAreaChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'line' && <StockLineChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'candles' && <StockCandleChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
            {selectedChart === 'step area' && <StockStepChartContent stockCode={stockCode} chartData={chartData} loading={loading} />}
        </>
    );
};

export default StockChartContent;
