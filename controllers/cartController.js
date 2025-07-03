import Cart from "../models/CartItemsSchema";

export const addToCart = async (req, res) => {
  try {
    const {productId, quantity} = req.body
    const userId = req.user.user_id;

    let cart = await Cart.findOne(userId)

    if(!cart){
        cart = await Cart.create({
            user: userId,
            item: [{product: productId, quantity}]
        })
    }


  } catch (error) {
    console.error(error)
    res.status(400).json({message: "Could not add to cart"})
  }
};
