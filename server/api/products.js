export const getProducts = () => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({
        products: [
          {
            id: 1,
            name: "Product 1",
            price: 100,
          },
        ],
      });
    }, 2000);
  });
};

export const getProductDetails = (id) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({
        product: [
          {
            id: id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * id * 100),
          },
        ],
      });
    }, 2000);
  });
};
