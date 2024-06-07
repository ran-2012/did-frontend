import {useRouteError,Link} from 'react-router-dom'

function Error() {
    const error = useRouteError() as { [key: string]: string | null };

    return (
        <div className='vh-100 d-flex'>
            <div className='m-auto'>
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
                <Link to={'/'} style={{textDecoration: "none"}}>Home</Link>
            </div>
        </div>
    );
}

export default Error;