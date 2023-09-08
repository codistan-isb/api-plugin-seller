import ReactionError from "@reactioncommerce/reaction-error";
export default async function getAllReferalCodeSeller( context, args){
    const { searchQuery, ...connectionArgs } = args;
    const {collections} = context;
    const {Accounts, Products} = collections;
console.log("In queries")
    try {
        const seller = await Accounts.find({
            "roles": "vendor",
            "discountCode": "Declutter15" 
        });
        console.log("seller",  await Accounts.find({
            "roles": "vendor",
            "discountCode": "Declutter15" 
        }).toArray())
        return seller;

    }
    catch (error) {
        console.log(error)
        throw new ReactionError(error);
    }


    
}