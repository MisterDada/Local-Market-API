export function productResource(products) {
    if (Array.isArray(products)) {
        return {
            success: true,
            data: products.map(product => ({
                id: product._id,
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description,
                image: product.image
            })),
            total: products.length
        };
    } else {
        return {
            success: true,
            data: {
                id: products._id,
                name: products.name,
                price: products.price,
                category: products.category,
                description: products.description,
                image: products.image
            }
        };
    }
}