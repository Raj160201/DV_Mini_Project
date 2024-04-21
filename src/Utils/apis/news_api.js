import axios from 'axios';

export default async function newsApi() {
    // const symbols = 'RELIANCE.NS,INFY.NS,TCS.NS,JIOFIN.NS,AXISBANK.NS,HDFCBANK.NS,HEROMOTOCO.NS,KOTAKBANK.NS';
    const apiUrl = 'https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=ff70f20ee0cd4354ba4f569c1f00b5bc'
    // const apiUrl = `https://api.marketaux.com/v1/news/all?symbols=${symbols}&filter_entities=true&language=en&api_token=qWX59r0MazXuX8DyiHNiCMq1gYudmjKDDs0FzIfz`;
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
