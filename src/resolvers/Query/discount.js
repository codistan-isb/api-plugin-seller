
export default async function discount(parent, args, context, info) {
    console.log("discount query");
    const discount = await context.queries.discount(parent, args, context, info);
    return discount;
    }

