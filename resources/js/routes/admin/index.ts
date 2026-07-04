import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import users48860f from './users'
import kyc70fa00 from './kyc'
import catalogC6a558 from './catalog'
import commissionsDf646b from './commissions'
import risk5b2fc4 from './risk'
import settings69f00b from './settings'
/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
export const users = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

users.definition = {
    methods: ["get","head"],
    url: '/admin/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
users.url = (options?: RouteQueryOptions) => {
    return users.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
users.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
users.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: users.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
const usersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
usersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminUserController::users
* @see app/Http/Controllers/Admin/AdminUserController.php:29
* @route '/admin/users'
*/
usersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: users.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

users.form = usersForm

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
export const kyc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kyc.url(options),
    method: 'get',
})

kyc.definition = {
    methods: ["get","head"],
    url: '/admin/kyc',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
kyc.url = (options?: RouteQueryOptions) => {
    return kyc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
kyc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kyc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
kyc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: kyc.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
const kycForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kyc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
kycForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kyc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminKycController::kyc
* @see app/Http/Controllers/Admin/AdminKycController.php:18
* @route '/admin/kyc'
*/
kycForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kyc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

kyc.form = kycForm

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
export const catalog = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: catalog.url(options),
    method: 'get',
})

catalog.definition = {
    methods: ["get","head"],
    url: '/admin/catalog',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
catalog.url = (options?: RouteQueryOptions) => {
    return catalog.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
catalog.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: catalog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
catalog.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: catalog.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
const catalogForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: catalog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
catalogForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: catalog.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCatalogController::catalog
* @see app/Http/Controllers/Admin/AdminCatalogController.php:18
* @route '/admin/catalog'
*/
catalogForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: catalog.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

catalog.form = catalogForm

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
export const commissions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commissions.url(options),
    method: 'get',
})

commissions.definition = {
    methods: ["get","head"],
    url: '/admin/commissions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
commissions.url = (options?: RouteQueryOptions) => {
    return commissions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
commissions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: commissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
commissions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: commissions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
const commissionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
commissionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commissions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminCommissionController::commissions
* @see app/Http/Controllers/Admin/AdminCommissionController.php:20
* @route '/admin/commissions'
*/
commissionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: commissions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

commissions.form = commissionsForm

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
export const risk = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: risk.url(options),
    method: 'get',
})

risk.definition = {
    methods: ["get","head"],
    url: '/admin/risk',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
risk.url = (options?: RouteQueryOptions) => {
    return risk.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
risk.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: risk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
risk.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: risk.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
const riskForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: risk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
riskForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: risk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminRiskController::risk
* @see app/Http/Controllers/Admin/AdminRiskController.php:26
* @route '/admin/risk'
*/
riskForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: risk.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

risk.form = riskForm

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
export const audit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audit.url(options),
    method: 'get',
})

audit.definition = {
    methods: ["get","head"],
    url: '/admin/audit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
audit.url = (options?: RouteQueryOptions) => {
    return audit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
audit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
audit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: audit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
const auditForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
auditForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminAuditController::audit
* @see app/Http/Controllers/Admin/AdminAuditController.php:12
* @route '/admin/audit'
*/
auditForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: audit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

audit.form = auditForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
const settingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
settingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::settings
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
settingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: settings.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

settings.form = settingsForm

const admin = {
    users: Object.assign(users, users48860f),
    kyc: Object.assign(kyc, kyc70fa00),
    catalog: Object.assign(catalog, catalogC6a558),
    commissions: Object.assign(commissions, commissionsDf646b),
    risk: Object.assign(risk, risk5b2fc4),
    audit: Object.assign(audit, audit),
    settings: Object.assign(settings, settings69f00b),
}

export default admin