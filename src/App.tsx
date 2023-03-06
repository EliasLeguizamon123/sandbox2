import { Button, VStack, HStack, Text, Image } from '@chakra-ui/react';
import { useState } from 'react';
import vite from '/vite.svg';
import react from '/react.svg';
import electron from '/electron.png';

export default function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <VStack align="center" pt={12} spacing={4}>
                <HStack>
                    <Image alt="vite logo" boxSize="150px" src={vite} />
                    <Image alt="vite logo" boxSize="150px" src={react} />
                    <Image alt="vite logo" boxSize="150px" src={electron} />
                </HStack>
                <Button color="blue.200" onClick={() => setCount(count + 1)}>
                    Count
                </Button>
                <Text>count is {count}</Text>
            </VStack>
        </>
    );
}
