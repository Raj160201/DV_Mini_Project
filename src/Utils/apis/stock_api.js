import axios from 'axios';

export default async function stockApi(stock_code, company_isin, time_interval, start_date, end_date) {
    const apiUrl = `https://api.upstox.com/v2/historical-candle/${stock_code}%7C${company_isin}/${time_interval}/${start_date}/${end_date}`;
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
