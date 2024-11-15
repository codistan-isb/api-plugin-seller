// import ReactionError from "@reactioncommerce/reaction-error";

// export default async function updateSellerInfo(context, input) {
//   if (!context.user) {
//     throw new ReactionError("access-denied", "Access Denied");
//   }
//   const { Accounts, Products } = context.collections;
//   const {
//     _id,
//     image,
//     storeName,
//     pickUpAddress,
//     city,
//     contactNumber,
//     bankDetail,
//     documentDetails,
//   } = input;

//   // if(bankDetail){
//   //   input["bankDetail"] = bankDetail;
//   // }
//   const updates = {};
//   const updatedFields = [];
//   if (image) {
//     updates["storeLogo"] = image;
//   }

//   if (storeName) {
//     updates["storeName"] = storeName;
//   }
//   if (pickUpAddress) {
//     updates["pickUpAddress"] = pickUpAddress;
//   }
//   if (city) {
//     updates["storeAddress.city"] = city;
//   }
//   if (contactNumber) {
//     updates["contactNumber"] = contactNumber;
//   }
//   if (bankDetail) {
//     updates["bankDetail"] = bankDetail;
//     updatedFields.push("bankDetail");
//   }
//   console.log("bankDetail", updates.bankDetail);

//   if (documentDetails) {

//     updates["documentDetails"] = documentDetails;
//     updatedFields.push("documentDetails");
//   }
//   // console.log("updates", updates);
//   const updatedAccountResp = await Accounts.findOneAndUpdate(
//     { _id },
//     { $set: updates },
//     { returnOriginal: false }
//   );
//   console.log("updatedAccountResp", updatedAccountResp);
//   return updatedAccountResp.value;
// }

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
    name,
    bankDetail,
    documentDetails,
    profilePicture
  } = input;

  const updates = {};
  const updatedFields = [];

  // Handle individual fields update
  if (image) updates["storeLogo"] = image;
  if (storeName) updates["storeName"] = storeName;
  if (pickUpAddress) updates["pickUpAddress"] = pickUpAddress;
  if (city) updates["storeAddress.city"] = city;
  if (contactNumber) updates["contactNumber"] = contactNumber;
  if (name) updates["name"] = name;
  if (profilePicture) {
    updates["profile.picture"] = profilePicture;
    updatedFields.push("profile.picture");
  }

  if (bankDetail) {
    const activeBankDetailsCount = bankDetail.filter((detail) => detail.isActive).length;

    if (activeBankDetailsCount > 1) {
      throw new ReactionError(
        "multiple-active-bank-details",
        "Only one bank detail can be active at a time. Please ensure only one bank detail is set to active."
      );
    }

    updates["bankDetail"] = bankDetail;
    updatedFields.push("bankDetail");
  }

  if (documentDetails) {
    updates["documentDetails"] = documentDetails;
    updatedFields.push("documentDetails");
  }

  const updatedAccountResp = await Accounts.findOneAndUpdate(
    { _id },
    { $set: updates },
    { returnOriginal: false }
  );

  const updatedAccount = updatedAccountResp.value;

  if (!updatedAccount) {
    throw new ReactionError("not-found", "Account not found");
  }

  // Construct the response object explicitly
  return {
    _id: updatedAccount._id || null,
    image: updatedAccount.storeLogo || null,
    storeName: updatedAccount.storeName || null,
    pickUpAddress: updatedAccount.pickUpAddress || null,
    city: updatedAccount.storeAddress?.city || null,
    contactNumber: updatedAccount.contactNumber || null,
    name: updatedAccount.name || null,
    profilePicture: updatedAccount.profile?.picture || null,
    bankDetail: updatedAccount.bankDetail || null,
  };

}
