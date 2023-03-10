import { VStack, HStack, Image, Text, Button } from '@chakra-ui/react';
// import { useState } from 'react';
import vite from '/vite.svg';
import react from '/react.svg';
import electron from '/electron.png';
// import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

export interface getData {
    ip: string;
    message: string;
    port: string;
}

export default function App() {
    const [data, setData] = useState<getData | undefined>(undefined);

    window.addEventListener('message', (event) => {
        if (event.data.channel === 'getBack') {
            console.log(event.data); // response.message
            setData(event.data.response);
        }
    });
    useEffect(() => {
        window.api.getBack();
    }, []);

    return (
        <>
            <VStack align="center" pt={12} spacing={4}>
                <HStack>
                    <Image alt="vite logo" boxSize="150px" src={vite} />
                    <Image alt="vite logo" boxSize="150px" src={react} />
                    <Image alt="vite logo" boxSize="150px" src={electron} />
                </HStack>
                <Text>{data !== undefined ? data.ip : 'no cargo la ip'}</Text>
                <Text>
                    {data !== undefined ? data.message : 'no tengo mensaje'}
                </Text>
            </VStack>
        </>
    );
}
