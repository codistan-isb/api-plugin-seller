export default async function getSellerOrders(_, args, context) {
  const { sellerId } = args;

  console.log("called", sellerId);
}
