export const NewCartResource = (cartItem) => {
    return {
        id: cartItem._id,
        productId: cartItem.productId._id,
        name: cartItem.name,
        description: cartItem.description,
        price: cartItem.price,
        category: cartItem.category,
        quantity: cartItem.quantity,

        // image: cartItem.image ?
        //     cartItem.image.url :
        //     null,

        // productImage: cartItem.productId ?
        //     cartItem.productId.image ?
        //     cartItem.productId.image.url :
        //     null : null,

        createdAt: cartItem.createdAt,
        updatedAt: cartItem.updatedAt
    };
};

export const CartCollection = (cartItems) => {
    return cartItems.map(item => NewCartResource(item));
};