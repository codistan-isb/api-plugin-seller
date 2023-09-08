export default async function createBrands(_, { input }, context) {
  //  const {name } = input;

  const brands = context.mutations.createBrands(context, input);
  // console.log(brands);
  return brands;
}
