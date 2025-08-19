export const CartItemResource = (item) => {
    return {
        id: item._id,
        quantity: item.quantity,
        product: {
            id: item.product._id,
            name: item.product.name,
            description: item.product.description,
            price: Number(item.product.price),
            category: item.product.category,
            imageUrl: item.product && item.product.image ?
                item.product.image.url : null

        }
    };
};