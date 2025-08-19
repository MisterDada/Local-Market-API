// resources/CartResource.js
import { CartItemResource } from "./cartItemResource.js";

export const CartResource = (cart, total, itemCount) => {
    return {
        items: cart.items.map(CartItemResource),
        total: Number(total),
        itemCount
    };
};