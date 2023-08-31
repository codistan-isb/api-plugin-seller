export default async function discount(parent, args, context, info) {
    const { collections } = context;
    const { Accounts } = collections;

    const count = await Accounts.aggregate([
        {
            $match: {
                discountCode: { $nin: [null, ""] } // Filter out documents with null discountCode
            }
        },
        {
            $group: {
                _id: "$discountCode",
                count: { $sum: 1 }
            }
        }
    ]).toArray();

    console.log("count",count);

    const discount = count.map((result) => ({
        name: result._id,
        totalCount: result.count,
    }));
    console.log("discount",discount);
    return discount;
}
