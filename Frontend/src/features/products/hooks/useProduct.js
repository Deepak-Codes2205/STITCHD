import {
    createProduct,
    getSellerProduct,
    getAllProducts,
    getProductById,
    getProductDetailsById,
    addProductVariant,
    updateProductVariantStock,
    deleteProductVariant,
    updateAllProductVariants
} from "../service/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice";

export const useProduct = () => {

    const dispatch = useDispatch();

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

    async function handleGetSellerProduct() {
        try {
            const data = await getSellerProduct();
            dispatch(setSellerProducts(data.products));
            return data.products;
        } catch (error) {
            console.log(error);
        }
    }

    async function handleGetAllProducts() {
        try {
            const data = await getAllProducts();
            dispatch(setProducts(data.products));
        } catch (error) {
            console.log(error);
        }
    }

    async function handleGetProductById(id) {
        try {
            const data = await getProductById(id);
            return data.product;
        } catch (error) {
            console.log(error);
        }
    }

    async function handleGetProductDetailsById(productId) {
        try {
            const data = await getProductDetailsById(productId);
            return data.product;
        } catch (error) {
            console.log(error);
        }
    }

    async function handleAddProductVariant(productId, variantData) {
        try {
            const data = await addProductVariant(productId, variantData);
            console.log(data.product)
            return data.product;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async function handleUpdateProductVariantStock(productId, variantId, stock) {
        try {
            const data = await updateProductVariantStock(productId, variantId, stock);
            return data.product;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async function handleDeleteProductVariant(productId, variantId) {
        try {
            const data = await deleteProductVariant(productId, variantId);
            return data.product;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async function handleUpdateAllProductVariants(productId, variants) {
        try {
            const data = await updateAllProductVariants(productId, variants);
            return data.product;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    return {
        handleCreateproduct,
        handleCreateProduct: handleCreateproduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById,
        handleGetProductDetailsById,
        handleAddProductVariant,
        handleUpdateProductVariantStock,
        handleDeleteProductVariant,
        handleUpdateAllProductVariants
    };
}




