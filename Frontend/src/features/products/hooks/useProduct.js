import { createProduct, getSellerProduct } from "../service/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts } from "../state/product.slice";



export const useProduct = () => {

    const dispatch = useDispatch();

    //const handleCreateProduct = async (formData) => {
    async function handleCreateproduct(formData) {
        try {
            const data = await createProduct(formData);
            if (data) {
                return data.product;
            }
        } catch (error) {
            console.log(error);
        }
    }

    //const handleGetSellerProduct = async () => {
    async function handleGetSellerProduct() {
        try {

            const data = await getSellerProduct();
            dispatch(setSellerProducts(data.products));
            return data.products;

        } catch (error) {
            console.log(error);
        }
    }

    return { handleCreateproduct, handleGetSellerProduct }
}


