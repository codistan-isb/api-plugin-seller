// import { decodeAccountOpaqueId } from "../../xforms/id.js";
export default async function updateSellerInfo(context, input) {
  const { Accounts } = context.collections;
  const {
    _id,
    profileImage,
    storeName,
    pickUpAddress,
    city,
    contactNumber,
    bankDetails: { bankName, bankAccountNumber },
    documentDetails: { cnicNumber, cnicImageFront, cnicImageBack },
  } = input;

  const updates = {};
  const updatedFields = [];
  if (profileImage) {
    updates["profileImage"] = profileImage;
  }

  if (storeName) {
    updates[" storeName"] = storeName;
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
  if (bankName) {
    const bankDetail = {
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
  const updatedAccountResp = await Accounts.findOneAndUpdate(
    { _id },
    { $set: updates }, // Use $set operator to update fields
    { returnOriginal: false }
  );
  console.log(updatedAccountResp, "sssss");
}
