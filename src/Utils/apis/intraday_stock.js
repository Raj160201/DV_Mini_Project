import axios from 'axios';

export default async function intradayStockApi(stock_code, company_isin) {
    const apiUrl = `https://api.upstox.com/v2/historical-candle/intraday/${stock_code}%7C${company_isin}/30minute`;
    const headers = {
        'Accept': 'application/json'
    };

    try {
        const response = await axios.get(apiUrl, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Error: ${error.response.status} - ${error.response.data}`);
    }
}
