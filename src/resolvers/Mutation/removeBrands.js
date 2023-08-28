
export default async function removeBrands(_, args, context) {
    const removeBrands = context.mutations.removeBrands(context, args);
    console.log("brands", removeBrands);
    return removeBrands;
}
