// import { decodeAccountOpaqueId } from "../../xforms/id.js";
export default async function updateSellerInfo(_, {input}, context) {
  // const { _id, ...otherInput } = input;
  // const decodedAccountId = decodeAccountOpaqueId(_id);
  // console.log("updatedAccount Mutation", input);

  const updatedAccount = await context.mutations.updateSellerInfo(
    context,
    input
  );
  // console.log("updatedAccount Mutation", updatedAccount);

  // return "hello"
  // return {
  //   account: updatedAccount,
  //   // clientMutationId,
  // };
}
