import axios from 'axios';

export default async function ipoApi() {
    const apiUrl = `https://finnhub.io/api/v1/calendar/ipo?from=2024-03-25&to=2024-05-30&token=co1icnhr01qgulhr9070co1icnhr01qgulhr907g`;
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
