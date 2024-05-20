import {useLoaderData} from 'react-router-dom'
import {Web3Provider} from "../component/Web3Provider.tsx";
import {Container} from "react-bootstrap";
import NavigationBar from "../component/NavigationBar.tsx";

function PageTemplate() {
    const content = useLoaderData();

    return (
        <Web3Provider>
            <NavigationBar/>
            <Container>
                {content}
            </Container>
        </Web3Provider>
    );
}

export default PageTemplate;