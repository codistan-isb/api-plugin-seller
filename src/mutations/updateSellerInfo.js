import ReactionError from "@reactioncommerce/reaction-error";

export default async function updateSellerInfo(context, input) {
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const { Accounts } = context.collections;
  const {
    _id,
    image,
    storeName,
    pickUpAddress,
    city,
    contactNumber,
    bankDetails: { bankName, bankAccountNumber, type },
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
    const bankDetail = {
      type: type,
      bankName: bankName,
      bankAccountNumber: bankAccountNumber,
    };
    updates["bankDetail"] = bankDetail;
    updatedFields.push("bankDetail");
  }

  if (cnicNumber) {
    const documentDetails = {
      cnicNumber: cnicNumber,
      cnicImageFront: cnicImageFront,
      cnicImageBack: cnicImageBack,
    };
    updates["documentDetails"] = documentDetails;
    updatedFields.push("documentDetails");
  }
  console.log("updates", updates);
  const updatedAccountResp = await Accounts.findOneAndUpdate(
    { _id },
    { $set: updates },
    { returnOriginal: false }
  );
  return updatedAccountResp.value;
}
