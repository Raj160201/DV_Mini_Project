import React, { useState, useEffect } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { useNavigate } from 'react-router-dom';
import companyData from '../Utils/data/company.json';
import Loader from './Loader';
import stockApi from '../Utils/apis/stock_api';
import intradayStockApi from '../Utils/apis/intraday_stock';
import marketHolidayApi from '../Utils/apis/market_holiday';
import './Style.css';

export default function Stocks() {
    const [stockData, setStockData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleTableRowClick = async (stock) => {
        navigate('/', {
            state: {
                stockName: stock.Company_Code,
                companyIsin: stock.ISIN_Code,
                startDate: '2024-03-27',
                endDate: '2000-01-01',
            },
        });
    };

    const isMarketHoliday = async (date) => {
        const marketHoliday = await marketHolidayApi(date);
        return marketHoliday.status === 'success' && marketHoliday.data.length > 0;
    };

    const isWeekend = (completeDate) => {
        const dayOfWeek = completeDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) and Saturday (6) are weekends
    };

    useEffect(() => {
        const findLastTradingDay = async (completeDate) => {
            let currentDate = new Date(completeDate);
            let lastTradingDay = null;
            let cnt = true;
            while (cnt === true) {
                currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
                if (!isWeekend(currentDate)) {
                    const currentDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
                    const isHoliday = await isMarketHoliday(currentDateStr);
                    if (!isHoliday) {
                        lastTradingDay = currentDateStr;
                        cnt = false;
                        break;
                    }
                }
            }
            return lastTradingDay;
        };

        const fetchData = async () => {
            try {
                const today = new Date();

                const marketOpeningTime = new Date(today);
                marketOpeningTime.setHours(9);
                marketOpeningTime.setMinutes(15);

                const marketClosingTime = new Date(today);
                marketClosingTime.setHours(15);
                marketClosingTime.setMinutes(30);

                const updatedStockData = await Promise.all(
                    companyData.map(async (company) => {
                        const { ISIN_Code, Company_Code, Company_Name } = company;
                        let stockInfo, lastDayInfo;
                        const currentTime = today.getTime();
                        const lastTradingDay = await findLastTradingDay(today);
                        const todayDateStr = today.toISOString().split('T')[0];
                        const isHoliday = await isMarketHoliday(todayDateStr);

                        if (isHoliday || isWeekend(today)) {
                            const lastSecondTradingDay = await findLastTradingDay(new Date(lastTradingDay));
                            stockInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastTradingDay, lastTradingDay);
                            lastDayInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastSecondTradingDay, lastSecondTradingDay);
                        } else if (currentTime < marketOpeningTime.getTime()) {
                            const lastSecondTradingDay = await findLastTradingDay(new Date(lastTradingDay));
                            stockInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastTradingDay, lastTradingDay)
                            lastDayInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastSecondTradingDay, lastSecondTradingDay);
                        } else if (currentTime >= marketOpeningTime.getTime() && currentTime <= marketClosingTime.getTime()) {
                            stockInfo = await intradayStockApi('NSE_EQ', ISIN_Code);
                            lastDayInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastTradingDay, lastTradingDay);
                        } else if (currentTime >= marketClosingTime.getTime()) {
                            stockInfo = await intradayStockApi('NSE_EQ', ISIN_Code);
                            lastDayInfo = await stockApi('NSE_EQ', ISIN_Code, '30minute', lastTradingDay, lastTradingDay);
                        }

                        const lastDayLTP = lastDayInfo.data.candles[0][4];
                        const change = stockInfo.data.candles[0][4] - lastDayLTP;
                        const changePercentage = ((change / lastDayLTP) * 100).toFixed(2);

                        return {
                            Company_Name,
                            Company_Code,
                            ISIN_Code,
                            LTP: stockInfo.data.candles[0][4],
                            Change: change.toFixed(2),
                            ChangePercentage: changePercentage,
                            Color: getColor(change),
                        };
                    })
                );
                setIsLoading(false);
                setStockData(updatedStockData);
            } catch (error) {
                console.error(error.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const getColor = (change) => {
        if (change < 0) return 'red';
        if (change > 0) return 'green';
        return 'black';
    };

    const filteredStockData = stockData.filter(stock =>
        stock.Company_Code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <ReactTooltip id="my-tooltip" />
            <div style={{ maxHeight: '750px', overflowY: 'auto' }}>
                <input
                    type="text"
                    placeholder="Search by Company Code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '545px',
                        backgroundColor: '#0f141f',
                        color: '#fff',
                        border: '1px solid #555',
                        padding: '8px',
                        borderRadius: '4px',
                        marginBottom: '10px'
                    }}
                />


                {isLoading ? (
                    <Loader />
                ) : filteredStockData.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                        No results found for "{searchQuery}"
                    </div>
                ) : (
                    <table className="table table-sm custom-table">
                        <thead className="thead-custom">
                            <tr>
                                <th scope="col">Company</th>
                                <th scope="col">LTP</th>
                                <th scope="col">Chg</th>
                                <th scope="col">Chg%</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider table-divider-color">
                            {filteredStockData.map((stock, index) => (
                                <tr key={index} onClick={() => handleTableRowClick(stock)}>
                                    <td style={{ color: '#fff' }} data-tooltip-id="my-tooltip" data-tooltip-content={`${stock.Company_Name}`}>{stock.Company_Code}</td>
                                    <td style={{ color: '#fff' }}>{stock.LTP}</td>
                                    <td style={{ color: stock.Color }}>{stock.Change}</td>
                                    <td style={{ color: stock.Color }}>{stock.ChangePercentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
                }
            </div >
        </>
    );
}
