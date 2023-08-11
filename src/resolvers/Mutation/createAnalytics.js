export default async function createAnalytics(_, { input }, context, info) {
  const { collections } = context;
  const { Analytics } = collections;

  const { eventName, metafields } = input;

  // Increment the count using $inc operator and upsert
  const result = await Analytics.updateOne(
    { eventName },
    {
      $set: { eventName, metafields },
      $inc: { count: 1 },
    },
    { upsert: true }
  );

  console.log("input is ", input);

  console.log("resilt is ", result);

  // Check if the operation was successful
  if (result.upsertedId) {
    console.log("New document upserted:", result.upsertedId);
    return true;
  } else if (result.modifiedCount > 0 || result.matchedCount > 0) {
    console.log("Existing document updated.");
    return true;
  } else {
    console.log("Operation failed.");
    return false;
  }
}
