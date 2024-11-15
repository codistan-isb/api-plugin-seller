// export default async function updateSellerInfoForAdmin(_, { input }, context) {
//     try {
//         // Call the mutation function with the correct arguments
//         const updatedPassword = await context.mutations.updateSellerInfoForAdmin(_, context, input);
//         return updatedPassword;
//     } catch (error) {
//         console.error('Failed to update seller info:', error);
//         throw new Error('Error updating seller information.');
//     }
// }


export default async function updateSellerInfoForAdmin(_, args, context) {
    try {
        const result = await context.mutations.updateSellerInfoForAdmin(_, args, context);
        return result;
    } catch (error) {
        console.error("Failed to update seller info:", error);
        throw new Error("Error updating seller information.");
    }
}