export default {
  async picture(parent, args, context, info) {
    console.log("parent in Picture", parent);
    return parent?.profile?.picture;
  },
  async phone(parent, args, context, info) {
    console.log("parent in Phone ", parent);
    return parent?.billing?.phone;
  },
  async address(parent, args, context, info) {
    console.log("parent in Phone ", parent);
    return parent?.billing?.address;
  },
};
