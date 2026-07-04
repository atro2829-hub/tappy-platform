import AdminUserController from './AdminUserController'
import AdminKycController from './AdminKycController'
import AdminCatalogController from './AdminCatalogController'
import AdminCommissionController from './AdminCommissionController'
import AdminRiskController from './AdminRiskController'
import AdminAuditController from './AdminAuditController'
import AdminSettingsController from './AdminSettingsController'

const Admin = {
    AdminUserController: Object.assign(AdminUserController, AdminUserController),
    AdminKycController: Object.assign(AdminKycController, AdminKycController),
    AdminCatalogController: Object.assign(AdminCatalogController, AdminCatalogController),
    AdminCommissionController: Object.assign(AdminCommissionController, AdminCommissionController),
    AdminRiskController: Object.assign(AdminRiskController, AdminRiskController),
    AdminAuditController: Object.assign(AdminAuditController, AdminAuditController),
    AdminSettingsController: Object.assign(AdminSettingsController, AdminSettingsController),
}

export default Admin