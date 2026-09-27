import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashborad from "../features/products/pages/Dashborad";



/*
A relative path → create-product
or, if using an absolute path, it must include the parent's complete path → /seller/create-product
*/

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Buddy</h1>
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/seller",
        children: [
            {
                path: "create-product",
                element: <CreateProduct />
            },
            {
                path: "dashboard",
                element: <Dashborad />
            }
        ]
    }
])
