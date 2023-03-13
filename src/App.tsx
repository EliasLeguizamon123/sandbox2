// import { useState } from 'react';
// import { io } from 'socket.io-client';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Home from './pages/Home';

export interface getData {
    ip: string;
    message: string;
    port: string;
}

export default function App() {
    const [data, setData] = useState<getData | undefined>();
    const toast = useToast();

    useEffect(() => {
        const lookingEvents = (event: MessageEvent) => {
            if (event.data.channel === 'getBack') {
                toast.closeAll();
                console.log(event.data.response);
                if (event.data.response.message === 'error') {
                    toast({
                        title: 'Error',
                        description: 'No master find',
                        status: 'error',
                        // console.log(res)
                        isClosable: true,
                    });
                } else if (event.data.response.message === 'mcash') {
                    toast({
                        title: 'Success',
                        description: 'Master find correctly',
                        status: 'success',
                        isClosable: true,
                    });
                    setData(event.data.response);
                }
            }
        };

        toast({
            title: 'Searching ...',
            description: 'Locking for a master connection',
            duration: 6000,
            isClosable: true,
        });
        window.addEventListener('message', lookingEvents);
        window.api.getBack();

        return () => {
            window.removeEventListener('message', lookingEvents);
        };
    }, []);

    return <Home data={data} />;
}
