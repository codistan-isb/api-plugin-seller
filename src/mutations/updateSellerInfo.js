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
    bankDetail,
    documentDetails,
  } = input;
  
// if(bankDetail){
//   input["bankDetail"] = bankDetail;
// }
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
  if (bankDetail) {
    updates["bankDetail"] = bankDetail;
    updatedFields.push("bankDetail");
  }
  console.log("bankDetail", updates.bankDetail);

  if (documentDetails) {
   
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
