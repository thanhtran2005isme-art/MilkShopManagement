export { adminApi } from './adminApi';
export { orderApi } from './orderApi';
export { categoryApi, type CategoryDTO } from './categoryApi';
export { attributeApi, type AttributeDTO } from './attributeApi';
export { inventoryApi, type InventoryAdjustPayload, type InventoryAdjustmentType, type InventoryHistoryDTO } from './inventoryApi';
export { couponApi, type CouponDTO, type CouponValidateRequest, type CouponValidateResult } from './couponApi';
export { promotionApi, type PromotionDTO } from './promotionApi';
export { reportApi, type RevenueDataPoint, type TopProductItem, type OrderStatItem, type DashboardData } from './reportApi';
export { settingsApi, type SettingDTO, type UpsertSettingDTO, type VietQrBankDTO, type VietQrAccountLookupDTO } from './settingsApi';
export { adminProductsApi } from './adminProductsApi';
export { customerApi } from './customerApi';
export { supplierApi, type SupplierDTO, type CreateSupplierPayload } from './supplierApi';
export { stockReceiptApi, type StockReceiptDTO, type StockReceiptItemDTO, type StockReceiptListItem, type CreateStockReceiptPayload, type CreateStockReceiptItemPayload } from './stockReceiptApi';
export { variantStockApi, type VariantStockDTO, type ProductVariantSummary } from './variantStockApi';
export {
  staffManagementApi,
  type StaffListItem,
  type StaffDetail,
  type CreateStaffPayload,
  type UpdateStaffPayload,
  type StaffListParams,
  type Role as StaffRole,
  type CreateRolePayload,
  type Permission as StaffPermission,
  type PermissionGroupKey,
} from './staffManagementApi';
