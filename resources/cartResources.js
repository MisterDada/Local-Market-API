/**
 * Transforms a single cart item for the API response.
 */
const CartItemResource = (item) => ({
    id: item._id,
    quantity: item.quantity,
    product: {
        id: item.product._id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        category: item.product.category,
        imageUrl: item.product?.image?.url || null,
    },
});

/**
 * Transforms the full cart for the API response.
 */
export const CartResource = (cart, total, itemCount) => ({
    items: cart.items.map(CartItemResource),
    total: Number(total.toFixed(2)),
    itemCount,
});