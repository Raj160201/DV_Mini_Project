import axios from 'axios';

export default async function marketHolidayApi(date) {
    const apiUrl = `https://api.upstox.com/v2/market/holidays/${date}`;
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
