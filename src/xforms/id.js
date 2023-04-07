import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Unit: "reaction/unit",
  Shop: "reaction/shop",
  Tag: "reaction/tag",
  CatalogItem:"reaction/catalogItem"
};

export const encodeUnitOpaqueId = encodeOpaqueId(namespaces.Unit);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
export const encodeTagOpaqueId = encodeOpaqueId(namespaces.Tag);

export const encodeCatalogItemOpaqueId = encodeOpaqueId("reaction/catalogItem");
export const encodeCatalogProductOpaqueId = encodeOpaqueId("reaction/catalogProduct");
export const encodeCatalogProductVariantOpaqueId = encodeOpaqueId("reaction/catalogProductVariant");

export const decodeCatalogItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.CatalogItem);
export const decodeUnitOpaqueId = decodeOpaqueIdForNamespace(namespaces.Unit);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
export const decodeTagOpaqueId = decodeOpaqueIdForNamespace(namespaces.Tag);
