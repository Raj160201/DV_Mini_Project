import axios from 'axios';

export default async function tokenApi() {
    const apiUrl = "https://api.marketdata.app/v1/options/chain/AAPL/";
    const headers = {
        'Accept': 'application/json'
    };

    try {
        console.log('Fetching token data...');
        const response = await fetch("https://api.marketdata.app/v1/options/strikes/AAPL/?token=NkVkRmtMNUo2RUpNMUd0UHlyZmdBcTczRTA3OVJ5aFpoSHdFbWlUZXB3VT0/?human=true");
        const data = await response.json();
        return data;
        console.log(data);
    } catch (error) {
        console.log(error);
        throw new Error(`Error: ${error.response.status} - ${error.response.data}`);
    }
}

