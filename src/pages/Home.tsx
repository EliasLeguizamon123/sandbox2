import { getData } from '@/App';
import { Button, Image, Text, useToast, VStack } from '@chakra-ui/react';
import mcash from '@/assets/logo.assets.jpg';

export interface props {
    data: getData | undefined;
}

export default function Home(props: props) {
    const toast = useToast();

    const handlePrint = () => {
        toast({
            title: 'Printing',
            description: 'your impression begins in a moment',
            duration: 9000,
            isClosable: true,
        });
        window.api.print();
    };

    return (
        <VStack align="center" pt={12} spacing={4}>
            <Image boxSize="120px" src={mcash} />
            <Text fontSize="xl">MCASH ELECTRON TESTING APP</Text>
            <Button onClick={handlePrint}>Print!</Button>
        </VStack>
    );
}
