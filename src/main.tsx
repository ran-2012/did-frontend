import React, {Component} from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouterProps, createBrowserRouter, RouteObject, RouterProvider} from "react-router-dom";
import Index from './route/Index.tsx'
import Mine from './route/Mine.tsx'
import Error from './route/Error.tsx'
import PageTemplate from "./template/PageTemplate.tsx";

function createRoute(route: string, Component: React.ComponentClass): RouteObject {
    return {
        path: route,
        loader: ()=> <Component/>,
        element: <PageTemplate/>,
        errorElement: <Error/>
    }

}

const router = createBrowserRouter([
    createRoute('/', Index),
    createRoute('mine', Mine)
])
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
)
