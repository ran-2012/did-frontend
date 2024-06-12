import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouteObject, RouterProvider} from "react-router-dom";
import {ToastContainer} from "react-toastify";

import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

import {ConfigProvider} from 'antd';
import enUS from 'antd/locale/en_US';

import Index from './page/Index.tsx'
import Mine from './page/Mine.tsx'
import Error from './page/Error.tsx'
import PageTemplate from "./template/PageTemplate.tsx";
import VcList from "./page/VcList.tsx";
import VpList from "./page/VpList.tsx";
import ModalTestGround from "./page/ModalTestGround.tsx";

function createRoute(route: string, Component: React.ComponentClass | React.FC): RouteObject {
    return {
        path: route,
        loader: () => <Component/>,
        element: <PageTemplate/>,
        errorElement: <Error/>
    }
}

const router = createBrowserRouter([
    createRoute('/', Index),
    createRoute('mine', Mine),
    createRoute('vc-list', VcList),
    createRoute('vp-list', VpList),
    createRoute('test', ModalTestGround),
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
        <ToastContainer/>
        <ConfigProvider locale={enUS}>
            <RouterProvider router={router}/>
        </ConfigProvider>
    </>
)
