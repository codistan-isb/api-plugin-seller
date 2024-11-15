import password_1 from "@accounts/password";

export default async function updateSellerInfoForAdmin(_, args, context) {
    const { injector, collections } = context; // Include collections if needed for additional checks
    const { input } = args; // Destructure input from args
    const { userId, newPassword } = input || {}; // Safely handle undefined input

    try {
        // Validate input
        if (!userId) {
            throw new Error("User ID is required.");
        }
        if (!newPassword) {
            throw new Error("New password is required.");
        }

        // Check if the user exists
        const userExists = await collections.users.findOne({ _id: userId });
        if (!userExists) {
            throw new Error("User not found.");
        }

        // Use the AccountsPassword service to change the password
        await injector
            .get(password_1.AccountsPassword)
            .setPassword(userId, newPassword); // Directly set the password

        console.log("Password successfully updated for user:", userId);

        return { success: true, message: "Password updated successfully." };
    } catch (err) {
        console.error("Error updating password:", err);
        throw new Error("Failed to update password.");
    }
}




// import password_1 from "@accounts/password";

// export default async function updateSellerInfoForAdmin(_, { input }, context) {
//     const { injector, user } = context;
//     const { newPassword } = input;

//     try {
//         // Check if the user is authenticated
//         if (!(user && user.id)) {
//             throw new Error("Unauthorized. User must be logged in.");
//         }

//         const userId = user.id;

//         // Use the AccountsPassword service to change the password
//         await injector
//             .get(password_1.AccountsPassword)
//             .changePassword(userId, null, newPassword);

//         console.log("Password successfully changed for user:", userId);

//         return { success: true, message: "Password updated successfully." };
//     } catch (err) {
//         console.error("Error updating password:", err);
//         throw new Error("Failed to update password.");
//     }
// }


// import password_1 from "@accounts/password";

// export default async function updateSellerInfoForAdmin(_, context, input) {
//     const { injector, collections } = context;
//     const { users } = collections;
//     const { userId, newPassword } = input;

//     try {
//         // Check if the user exists
//         const userExists = await users.findOne({ _id: userId });

//         if (!userExists) {
//             throw new Error("User not found.");
//         }

//         // Use setPassword to bypass requiring the current password
//         const setPasswordResponse = await injector
//             .get(password_1.AccountsPassword)
//             .changePassword(userId, newPassword);

//         console.log("setPasswordResponse", setPasswordResponse)

//         // Optionally, update the firstLogin field if needed
//         if (userExists.firstLogin) {
//             await users.updateOne({ _id: userId }, { $set: { "firstLogin": false } });
//         }

//         return setPasswordResponse;
//     } catch (err) {
//         console.error("Error updating seller info:", err);
//         return null; // Or you might want to handle errors differently
//     }
// }


// changePassword: async (
//     _,
//     { oldPassword, newPassword },
//     { user, injector }
//   ) => {
//     if (!(user && user.id)) {
//       throw new Error("Unauthorized");
//     }
//     const userId = user.id;
//     let responsePassword = await injector
//       .get(password_1.AccountsPassword)
//       .changePassword(userId, oldPassword, newPassword);
//     return null;
//   },





// import password_1 from "@accounts/password";
// import server_1 from "@accounts/server";


// export default async function updateSellerInfoForAdmin(_, context, input, { token, newPassword }, { injector, infos, collections }) {
//     let resetPasswordResponse = null;
//     const { users } = collections;

//     const { userId } = input;

//     try {

//         const TokenUser = await users.findOne({
//             "services.password.reset": {
//                 $elemMatch: {
//                     token: token
//                 },

//             },

//         });
//         resetPasswordResponse = await injector
//             .get(password_1.AccountsPassword)
//             .resetPassword(token, newPassword, infos);

//         if (TokenUser && TokenUser?.firstLogin) {
//             await users.updateOne({ _id: userId }, { $set: { "firstLogin": false } });
//         }
//         return resetPasswordResponse;
//     }
//     catch (err) {
//         console.log(err)
//         return resetPasswordResponse;
//     }
// }


// import ReactionError from "@reactioncommerce/reaction-error";
// import bcrypt from "bcrypt";

// export default async function updateSellerInfoForAdmin(context, input) {
//     const { users } = context.collections;
//     const { userId, newPassword } = input;

//     console.log("INPUT", input);
//     try {
//         const user = await users.findOne({ _id: userId });
//         console.log("USER", user);

//         if (!user) {
//             throw new ReactionError("not-found", "User not found in Users collection");
//         }

//         if (newPassword) {
//             console.log("PASSWORD", newPassword);
//             try {
//                 // Ensure you use await here
//                 const hashedPassword = await bcrypt.hash(newPassword, 10);
//                 console.log("HASHED PASSWORD", hashedPassword);

//                 const userUpdateResult = await users.findOneAndUpdate(
//                     { _id: userId },
//                     { $set: { "services.password.bcrypt": hashedPassword } },
//                     { returnOriginal: false }
//                 );

//                 console.log("UPDATED ACCOUNT", userUpdateResult.value);

//                 if (!userUpdateResult.value) {
//                     throw new ReactionError("update-failed", "Failed to update the user password");
//                 }
//             } catch (error) {
//                 console.error("BCRYPT ERROR", error);
//                 throw new ReactionError("bcrypt-error", "Error hashing password", error);
//             }
//         }
//     } catch (error) {
//         console.error("Error in updateSellerInfoForAdmin:", error);
//         throw new ReactionError("server-error", "An error occurred while processing the request", error);
//     }
// }
