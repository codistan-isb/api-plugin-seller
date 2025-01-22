

// export default async function getSellerStore(context, args) {
//     try {

//         let { itemPerPage, PageNumber, searchQuery } = args;
//         const { Accounts } = context.collections;

//         let filters = {};

//         if (searchQuery) {
//             filters.$or = [
//                 { storeName: { $regex: new RegExp(searchQuery, "i") } },
//             ];
//         }

//         let itemsPerPage = itemPerPage ? itemPerPage : 10;
//         PageNumber = PageNumber ? PageNumber : 1;
//         let skipAmount = (PageNumber - 1) * itemsPerPage;

//         // Count total documents that match the filters
//         let totalCount = await Accounts.countDocuments(filters);
//         console.log(`Total matching Seller Discount: ${totalCount}`);

//         let getSellerRecord = await Accounts
//             .find(filters)
//             .skip(skipAmount)
//             .limit(itemsPerPage)
//             .toArray();


//         if (getSellerRecord.length > 0) {
//             return {
//                 totalCount,
//                 data: getSellerRecord,
//             };
//         } else {
//             return {
//                 totalCount: 0,
//                 data: [],
//             };
//         }
//     } catch (error) {
//         console.error("Error fetching sellerDiscount:", error);
//         throw new Error("Failed to fetch Seller Discount", error);
//     }
// }



export default async function getSellerStore(context, args) {
    try {

        let { searchQuery } = args;
        const { Accounts } = context.collections;
        let total = 0
        let filters = {};

        if (searchQuery) {
            filters.$or = [
                { storeName: { $regex: new RegExp(searchQuery, "i") } },
            ];
        }

        // Fetch all records that match the filters
        // let getSellerRecord = await Accounts
        //     .find(filters)
        //     .toArray();

        let getSellerRecord = await Accounts
            .find({
                ...filters,
                storeName: { $exists: true }
            })
            .toArray();


        let totalCount = getSellerRecord.length;

        if (getSellerRecord.length > 0) {
            return {
                totalCount,
                data: getSellerRecord,
            };
        } else {
            return {
                totalCount: 0,
                data: [],
            };
        }
    } catch (error) {
        console.error("Error fetching sellerDiscount:", error);
        throw new Error("Failed to fetch Seller Discount", error);
    }
}