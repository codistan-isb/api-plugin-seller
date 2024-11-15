export default async function sellerDetails(parent, args, context, info) {
  const { collections } = context;
  const { Accounts } = collections;
  const { sellerId } = args;
  console.log("sellerDetails query", sellerId);
  if (!sellerId) {
    throw new Error("sellerId is required");
  }
  const account = await Accounts.findOne({ _id: sellerId });
  if (!account) {
    throw new Error("sellerId not found");
  }
  console.log("sellerDetails account", account);
  const {
    _id,
    name,
    emails,
    contactNumber,
    storeName,
    bankDetail: { type, bankName, bankAccountNumber, bankAccountTitle } = {},
    documentDetails: { cnicNumber, cnicImageFront, cnicImageBack } = {},
    isSeller,
    referralCode,
    joiningCode,
    roles,
    storeAddress: { city, country, address1, address2, postalCode } = {},
    pickUpAddress,
    referredSellersCount,
  } = account;
  const sellerDetails = {
    _id,
    name,
    email: emails[0]?.address,
    contactNumber,
    storeName,
    bankDetail: {
      type,
      bankName,
      bankAccountNumber,
      bankAccountTitle,
    },
    documentDetails: {
      cnicNumber,
      cnicImageFront,
      cnicImageBack,
    },
    isSeller,
    referralCode,
    joiningCode,
    referredSellersCount,
    pickUpAddress,
    roles,
    storeAddress: {
      city,
      country,
      address1,
      address2,
      postalCode,
    },
  };
  console.log("sellerDetails query", sellerDetails);
  return sellerDetails;
}
