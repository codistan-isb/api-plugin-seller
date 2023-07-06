import ReactionError from "@reactioncommerce/reaction-error";
import password_1 from "@accounts/password";
import server_1 from "@accounts/server";
export default async function sellerRegistration(_, { input }, context) {
  //   if (!context.user) {
  //     throw new ReactionError("access-denied", "Access Denied");
  //   }

  const { Accounts } = context.collections;
  const { email } = input;
  const EmailExist = await Accounts.findOne({ "emails.0.address": email });
 const { injector, infos, collections } = context;

 // console.log("user", user);
 const accountsServer = injector.get(server_1.AccountsServer);
 const accountsPassword = injector.get(password_1.AccountsPassword);
 let userId;
 // let groupId;
 // const getGroup = await Groups.findOne({ name: "seller" });
 // console.log("getGroup ", getGroup);
 // if (getGroup) {
 //   groupId = getGroup._id;
 // } else {
 //   groupId = null;
 // }
 // console.log(user);
 // user.push({
 //   groups: [groupId],
 // });
 // else{
 //     const nowDate = new Date();
 //     const newGroup = Object.assign({}, group, {
 //       _id: Random.id(),
 //       createdAt: nowDate,
 //     //   createdBy: accountId,
 //       shopId,
 //       slug: group.slug || getSlug(group.name),
 //       updatedAt: nowDate
 //     });
 // }
 try {
   userId = await accountsPassword.createUser(input);
 } catch (error) {
   // If ambiguousErrorMessages is true we obfuscate the email or username already exist error
   // to prevent user enumeration during user creation
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

  if (EmailExist) {
    throw new "email already exists"();
  }
 if(userId){
     const account = {
       acceptsMarketing: false,
       emails: [
         {
           address: input.email,
           verified: false,
           provides: "default",
         },
       ],
       // groups: [groupId],
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
       roles: "seller",
       phoneNumber: input.phone,
     };
      const accountAdded = await Accounts.insertOne(account);
      console.log("new account", await accountAdded);
      console.log("Command Result", await accountAdded.CommandResult);
      // console.log("new account", accountAdded.data);

      return {
        message: "seller created Successfully",
        success: true,
      };
 }
 
}
