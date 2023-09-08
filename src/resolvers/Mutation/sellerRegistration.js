import ReactionError from "@reactioncommerce/reaction-error";
import password_1 from "@accounts/password";
import server_1 from "@accounts/server";

async function validateDiscountCode(context, code) {
  const { SellerDiscounts } = context.collections;

  const discountCode = await SellerDiscounts.findOne({
    code,
  });

  if (!discountCode) throw new Error("Invalid Discount Code");
}

export default async function sellerRegistration(_, { input }, context) {
  const { Accounts, Groups } = context.collections;
  const { email, discountCode } = input;
  const { injector, infos, collections } = context;
  console.log("input in sellerRegistration", input);

  if (discountCode) {
    await validateDiscountCode(context, discountCode);
  }

  const accountsServer = injector.get(server_1.AccountsServer);
  const accountsPassword = injector.get(password_1.AccountsPassword);
  let userId;

  const existingCustomer = await Accounts.findOne({
    "emails.0.address": email,
    roles: { $ne: "vendor" },
  });
  let groupId;
  const getGroup = await Groups.findOne({ name: "seller" });
  if (getGroup) {
    groupId = getGroup._id;
  } else {
    groupId = null;
  }

  if (existingCustomer) {
    console.log("getGroup ", getGroup);

    // Update the existing customer account to become a seller

    await Accounts.updateOne(
      { _id: existingCustomer._id },
      {
        $set: {
          roles: "vendor",
          groups: [groupId],
          isSeller: true,
          discountCode,
          image: input.image,
          pickUpAddress: input.address1,
          isDeleted: false,
         
      updatedAt: new Date(),
        },
      }
    );
    return {
      message: "Account updated to seller",
      success: true,
    };
  }

  // Check if the email already exists in the system
  const EmailExist = await Accounts.findOne({
    "emails.0.address": email,
    roles: "vendor",
  });
  if (EmailExist) {
    throw new Error("You are Already A Seller");
  }

  try {
    input.createdAt = new Date();
    input.updatedAt = new Date();
    userId = await accountsPassword.createUser(input);
  } catch (error) {
    if (
      accountsServer.options.ambiguousErrorMessages &&
      error instanceof server_1.AccountsJsError &&
      (error.code === password_1.CreateUserErrors.EmailAlreadyExists ||
        error.code === password_1.CreateUserErrors.UsernameAlreadyExists)
    ) {
      return {};
    }
    throw error;
  }


  if (userId) {
    const account = {
      _id: userId,
      userId,
      acceptsMarketing: false,
      isDeleted: false,
      emails: [
        {
          address: input.email,
          verified: false,
          provides: "default",
        },
      ],
      name: input.fullName ,
      
      profile: {
        firstName: input.fullName,
        phone: input.phone,
      },
      isSeller: true,
      state: input.state,
      storeName: input.storeName,
      storeAddress: {
        address1: input.address2,
        city: input.city,
        country: input.country,
        address2: input.phone,
        postalcode: input.postalcode,
      },
      groups: [groupId],
      roles: "vendor",
      contactNumber: input.phone,
      discountCode,
      image: input.image,
      pickUpAddress: input.address1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const accountAdded = await Accounts.insertOne(account);
    console.log("accountAdded", accountAdded);
    return {
      message: "Seller created successfully",
      success: true,
    };
  }
}
