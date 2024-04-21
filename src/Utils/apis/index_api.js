import axios from 'axios';

export default async function indexApi({ index }) {
    const apiUrl = 'https://nse-market.p.rapidapi.com/index_metrics';
    const headers = {
        'X-RapidAPI-Key': '21c9e4ec93msh3fd4f9287fa6bb1p1da802jsna863dcd24877',
        'X-RapidAPI-Host': 'nse-market.p.rapidapi.com'
    };

    try {
        const response = await axios.get(apiUrl, {
            headers,
            params: { index: index }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`Error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            throw new Error('Error: No response received from the server');
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
}
