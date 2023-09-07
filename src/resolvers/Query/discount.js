
export default async function discount(parent, args, context, info) {
    const discount = await context.queries.discount(parent, args, context, info);
    return discount;
    }

