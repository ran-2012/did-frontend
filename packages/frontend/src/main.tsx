import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouteObject, RouterProvider} from "react-router-dom";
import {ToastContainer} from "react-toastify";

import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

import {ConfigProvider} from 'antd';
import enUS from 'antd/locale/en_US';

import Index from './route/Index.tsx'
import Mine from './route/Mine.tsx'
import Error from './route/Error.tsx'
import PageTemplate from "./template/PageTemplate.tsx";
import VcList from "./route/VcList.tsx";
import VpList from "./route/VpList.tsx";
import ModalTestGround from "./route/ModalTestGround.tsx";

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
