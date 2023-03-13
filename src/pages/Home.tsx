import { getData } from '@/App';
import { Button, Image, Text, VStack } from '@chakra-ui/react';
import mcash from '@/assets/logo.assets.jpg';
import { useEffect, useState } from 'react';
import { slaveLogin } from '@/services/slaveLogin.service';

export interface props {
    data: getData | undefined;
}

export default function Home(props: props) {
    const [token, setToken] = useState<string>();
    const handleGenerateToken = () => {
        if (props.data !== undefined) {
            slaveLogin(props.data.ip).then((res) => {
                console.log(res);
                setToken(res.Authorization);
            });
        }
    };
    //
    // useEffect(() => {
    //     handleGenerateToken();
    // }, []);

    return (
        <VStack align="center" pt={12} spacing={4}>
            <Image boxSize="120px" src={mcash} />
            <Text fontSize="xl">MCASH DATA FROM SERVER</Text>
            <Text>
                {props.data !== undefined ? props.data.ip : 'no cargo la ip'}
            </Text>
            <Text>
                {props.data !== undefined
                    ? props.data.message
                    : 'no tengo mensaje'}
            </Text>
            <Button onClick={() => handleGenerateToken()}>Token</Button>
            {token !== null ? <Text>{token}</Text> : null}
        </VStack>
    );
}
