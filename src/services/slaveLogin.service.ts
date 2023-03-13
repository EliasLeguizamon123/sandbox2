import axios from 'axios';

export const slaveLogin = async (ip: string) => {
    try {
        const body = {
            user: 'mcash',
            password: 'mcash',
            device_id: '1234567',
            name: 'CASHIER',
        };

        const { data } = await axios.get(`http://${ip}:8000/slave-login`);

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error.response;
        } else {
            return error;
        }
    }
};
