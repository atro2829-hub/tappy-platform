import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
export const branding = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branding.url(options),
    method: 'get',
})

branding.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
branding.url = (options?: RouteQueryOptions) => {
    return branding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
branding.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: branding.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
branding.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: branding.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
const brandingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: branding.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
brandingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: branding.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:27
* @route '/admin/settings'
*/
brandingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: branding.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

branding.form = brandingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
export const integrations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})

integrations.definition = {
    methods: ["get","head"],
    url: '/admin/settings/integrations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
integrations.url = (options?: RouteQueryOptions) => {
    return integrations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
integrations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: integrations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
integrations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: integrations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
const integrationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: integrations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
integrationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: integrations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integrations
* @see app/Http/Controllers/Admin/AdminSettingsController.php:37
* @route '/admin/settings/integrations'
*/
integrationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: integrations.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

integrations.form = integrationsForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
export const landing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})

landing.definition = {
    methods: ["get","head"],
    url: '/admin/settings/landing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
landing.url = (options?: RouteQueryOptions) => {
    return landing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
landing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: landing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
landing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: landing.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
const landingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: landing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
landingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: landing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::landing
* @see app/Http/Controllers/Admin/AdminSettingsController.php:78
* @route '/admin/settings/landing'
*/
landingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: landing.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

landing.form = landingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
export const updateLanding = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateLanding.url(options),
    method: 'post',
})

updateLanding.definition = {
    methods: ["post"],
    url: '/admin/settings/landing',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
updateLanding.url = (options?: RouteQueryOptions) => {
    return updateLanding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
updateLanding.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateLanding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
const updateLandingForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLanding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:90
* @route '/admin/settings/landing'
*/
updateLandingForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLanding.url(options),
    method: 'post',
})

updateLanding.form = updateLandingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::resetLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
export const resetLanding = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetLanding.url(options),
    method: 'post',
})

resetLanding.definition = {
    methods: ["post"],
    url: '/admin/settings/landing/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::resetLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
resetLanding.url = (options?: RouteQueryOptions) => {
    return resetLanding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::resetLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
resetLanding.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetLanding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::resetLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
const resetLandingForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetLanding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::resetLanding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:131
* @route '/admin/settings/landing/reset'
*/
resetLandingForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: resetLanding.url(options),
    method: 'post',
})

resetLanding.form = resetLandingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateBranding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
export const updateBranding = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateBranding.url(options),
    method: 'post',
})

updateBranding.definition = {
    methods: ["post"],
    url: '/admin/settings/branding',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateBranding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
updateBranding.url = (options?: RouteQueryOptions) => {
    return updateBranding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateBranding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
updateBranding.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateBranding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateBranding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
const updateBrandingForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBranding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateBranding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
updateBrandingForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBranding.url(options),
    method: 'post',
})

updateBranding.form = updateBrandingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateProviders
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
export const updateProviders = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProviders.url(options),
    method: 'post',
})

updateProviders.definition = {
    methods: ["post"],
    url: '/admin/settings/providers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateProviders
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
updateProviders.url = (options?: RouteQueryOptions) => {
    return updateProviders.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateProviders
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
updateProviders.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateProviders.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateProviders
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
const updateProvidersForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProviders.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateProviders
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
updateProvidersForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProviders.url(options),
    method: 'post',
})

updateProviders.form = updateProvidersForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
export const updateIntegration = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateIntegration.url(args, options),
    method: 'post',
})

updateIntegration.definition = {
    methods: ["post"],
    url: '/admin/settings/integrations/{group}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
updateIntegration.url = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: args.group,
    }

    return updateIntegration.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
updateIntegration.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateIntegration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
const updateIntegrationForm = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateIntegration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::updateIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
updateIntegrationForm.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateIntegration.url(args, options),
    method: 'post',
})

updateIntegration.form = updateIntegrationForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::testIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
export const testIntegration = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testIntegration.url(args, options),
    method: 'post',
})

testIntegration.definition = {
    methods: ["post"],
    url: '/admin/settings/integrations/{group}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::testIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
testIntegration.url = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: args.group,
    }

    return testIntegration.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::testIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
testIntegration.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testIntegration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::testIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
const testIntegrationForm = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: testIntegration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::testIntegration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:211
* @route '/admin/settings/integrations/{group}/test'
*/
testIntegrationForm.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: testIntegration.url(args, options),
    method: 'post',
})

testIntegration.form = testIntegrationForm

const AdminSettingsController = { branding, integrations, landing, updateLanding, resetLanding, updateBranding, updateProviders, updateIntegration, testIntegration }

export default AdminSettingsController