import { getData } from '@/App';
import { Button, Image, Text, useToast, VStack } from '@chakra-ui/react';
import mcash from '@/assets/logo.assets.jpg';
import { useEffect } from 'react';

export interface props {
    data: getData | undefined;
}

export default function Home(props: props) {
    const toast = useToast();

    const reconnect = () => {
        if (props.data === undefined) {
            toast({
                title: 'Reconnecting',
                description: 'Master not found',
                duration: 6000,
                isClosable: true,
            });
            // setTimeout(window.api.reconnect, 1000);
        }
    };

    // useEffect(() => {
    //     if (props.data === undefined) {
    //         reconnect();
    //     }
    // }, [props.data]);
    // console.log(props.data);

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
            <Button>Hago algo</Button>
        </VStack>
    );
}
