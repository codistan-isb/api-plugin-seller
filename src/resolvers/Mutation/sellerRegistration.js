import ReactionError from "@reactioncommerce/reaction-error";
import password_1 from "@accounts/password";
import server_1 from "@accounts/server";
export default async function sellerRegistration(_, { input }, context) {
  const { Accounts, Groups } = context.collections;
  const { email } = input;
  const { injector, infos, collections } = context;

  const accountsServer = injector.get(server_1.AccountsServer);
  const accountsPassword = injector.get(password_1.AccountsPassword);
  let userId;

  const existingCustomer = await Accounts.findOne({
    "emails.0.address": email,
    roles: "customer",
  });
  if (existingCustomer) {
    let groupId;
    const getGroup = await Groups.findOne({ name: "seller" });
    console.log("getGroup ", getGroup);
    if (getGroup) {
      groupId = getGroup._id;
    } else {
      groupId = null;
    }

    console.log("input is ", input);
    // Update the existing customer account to become a seller
    await Accounts.updateOne(
      { _id: existingCustomer._id },
      { $set: { roles: "seller", groups: [groupId] } }
    );
    return {
      message: "Account updated to seller",
      success: true,
    };
  }

  // Check if the email already exists in the system
  const EmailExist = await Accounts.findOne({
    "emails.0.address": email,
    roles: "seller",
  });
  if (EmailExist) {
    throw new Error("You Are Already Exists As A Seller");
  }

  try {
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
      acceptsMarketing: false,
      emails: [
        {
          address: input.email,
          verified: false,
          provides: "default",
        },
      ],
      name: null,
      profile: {
        firstName: input.fullName,
        phone: input.phone,
      },
      state: input.state,
      storeName: input.storeName,
      storeAddress: {
        address1: input.address2,
        city: input.city,
        country: input.country,
        address2: input.phone,
        postalcode: input.postalcode,
      },
      roles: ["seller"],
      phoneNumber: input.phone,
    };
    const accountAdded = await Accounts.insertOne(account);
    return {
      message: "Seller created successfully",
      success: true,
    };
  }
}
