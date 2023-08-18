import ObjectID from "mongodb";
export default async function removeBrands(context ,args ) {

    const {collections} = context;
    const {SellerBrands} = collections;
    const {_id} = args;
    console.log("args", args);
    const filter = {_id: ObjectID.ObjectId(_id)};
    const options = {new: false};
    const removedBrand = await SellerBrands.findOneAndDelete(filter, options);
    console.log("removedBrand", removedBrand);
    
    if (removedBrand.ok === 1) {
    return true    
    }
    else{
        return false
    }
    

}


