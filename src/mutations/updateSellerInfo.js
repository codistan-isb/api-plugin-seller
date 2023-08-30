import ReactionError from "@reactioncommerce/reaction-error";

export default async function updateSellerInfo(context, input) {
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const { Accounts, Products } = context.collections;
  const {
    _id,
    image,
    storeName,
    pickUpAddress,
    city,
    contactNumber,
    bankDetails: { bankName, bankAccountNumber, type, bankAccountTitle },
    documentDetails: { cnicNumber, cnicImageFront, cnicImageBack },
  } = input;

  const updates = {};
  const updatedFields = [];
  if (image) {
    updates["storeLogo"] = image;
  }

  if (storeName) {
    updates["storeName"] = storeName;
  }
  if (pickUpAddress) {
    updates["pickUpAddress"] = pickUpAddress;
  }
  if (city) {
    updates["city"] = city;
  }
  if (contactNumber) {
    updates["contactNumber"] = contactNumber;
  }
  if (type) {
    const bankDetails = {
      type: type,
      bankName: bankName,
      bankAccountNumber: bankAccountNumber,
      bankAccountTitle: bankAccountTitle,
    };
    updates["bankDetails"] = bankDetails;
    updatedFields.push("bankDetails");
  }
  console.log("bankDetail", updates.bankDetails);

  if (cnicNumber) {
    const documentDetails = {
      cnicNumber: cnicNumber,
      cnicImageFront: cnicImageFront,
      cnicImageBack: cnicImageBack,
    };
    updates["documentDetails"] = documentDetails;
    updatedFields.push("documentDetails");
  }
  // console.log("updates", updates);
  const updatedAccountResp = await Accounts.findOneAndUpdate(
    { _id },
    { $set: updates },
    { returnOriginal: false }
  );
  // console.log("updatedAccountResp", updatedAccountResp.value);
  return updatedAccountResp.value;
}
