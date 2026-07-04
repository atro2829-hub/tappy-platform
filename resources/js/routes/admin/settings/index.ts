import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import landingA4c3bd from './landing'
import integrationE275dd from './integration'
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
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
export const branding = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: branding.url(options),
    method: 'post',
})

branding.definition = {
    methods: ["post"],
    url: '/admin/settings/branding',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
branding.url = (options?: RouteQueryOptions) => {
    return branding.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
branding.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: branding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
const brandingForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: branding.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::branding
* @see app/Http/Controllers/Admin/AdminSettingsController.php:148
* @route '/admin/settings/branding'
*/
brandingForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: branding.url(options),
    method: 'post',
})

branding.form = brandingForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::providers
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
export const providers = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: providers.url(options),
    method: 'post',
})

providers.definition = {
    methods: ["post"],
    url: '/admin/settings/providers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::providers
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
providers.url = (options?: RouteQueryOptions) => {
    return providers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::providers
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
providers.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: providers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::providers
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
const providersForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: providers.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::providers
* @see app/Http/Controllers/Admin/AdminSettingsController.php:51
* @route '/admin/settings/providers'
*/
providersForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: providers.url(options),
    method: 'post',
})

providers.form = providersForm

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
export const integration = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: integration.url(args, options),
    method: 'post',
})

integration.definition = {
    methods: ["post"],
    url: '/admin/settings/integrations/{group}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
integration.url = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return integration.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
integration.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: integration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
const integrationForm = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: integration.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AdminSettingsController::integration
* @see app/Http/Controllers/Admin/AdminSettingsController.php:194
* @route '/admin/settings/integrations/{group}'
*/
integrationForm.post = (args: { group: string | number } | [group: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: integration.url(args, options),
    method: 'post',
})

integration.form = integrationForm

const settings = {
    integrations: Object.assign(integrations, integrations),
    landing: Object.assign(landing, landingA4c3bd),
    branding: Object.assign(branding, branding),
    providers: Object.assign(providers, providers),
    integration: Object.assign(integration, integrationE275dd),
}

export default settings