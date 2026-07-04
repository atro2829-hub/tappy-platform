import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/register',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\RegisteredUserController::register
* @see vendor/laravel/fortify/src/Http/Controllers/RegisteredUserController.php:41
* @route '/register'
*/
registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: register.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

register.form = registerForm

/**
* @see routes/web.php:37
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:37
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see routes/web.php:37
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:37
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see routes/web.php:37
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:37
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see routes/web.php:37
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
export const documentation = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documentation.url(args, options),
    method: 'get',
})

documentation.definition = {
    methods: ["get","head"],
    url: '/documentation/{slug?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
documentation.url = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    if (Array.isArray(args)) {
        args = {
            slug: args[0],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "slug",
    ])

    const parsedArgs = {
        slug: args?.slug,
    }

    return documentation.definition.url
            .replace('{slug?}', parsedArgs.slug?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
documentation.get = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documentation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
documentation.head = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: documentation.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
const documentationForm = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documentation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
documentationForm.get = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documentation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocumentationController::documentation
* @see app/Http/Controllers/DocumentationController.php:15
* @route '/documentation/{slug?}'
*/
documentationForm.head = (args?: { slug?: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: documentation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

documentation.form = documentationForm

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DashboardController::dashboard
* @see app/Http/Controllers/DashboardController.php:25
* @route '/dashboard'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
export const topup = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: topup.url(options),
    method: 'get',
})

topup.definition = {
    methods: ["get","head"],
    url: '/topup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
topup.url = (options?: RouteQueryOptions) => {
    return topup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
topup.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: topup.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
topup.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: topup.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
const topupForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: topup.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
topupForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: topup.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TopUpController::topup
* @see app/Http/Controllers/TopUpController.php:24
* @route '/topup'
*/
topupForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: topup.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

topup.form = topupForm

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
export const giftcards = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: giftcards.url(options),
    method: 'get',
})

giftcards.definition = {
    methods: ["get","head"],
    url: '/giftcards',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
giftcards.url = (options?: RouteQueryOptions) => {
    return giftcards.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
giftcards.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: giftcards.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
giftcards.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: giftcards.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
const giftcardsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: giftcards.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
giftcardsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: giftcards.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GiftCardController::giftcards
* @see app/Http/Controllers/GiftCardController.php:23
* @route '/giftcards'
*/
giftcardsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: giftcards.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

giftcards.form = giftcardsForm

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
export const bulk = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bulk.url(options),
    method: 'get',
})

bulk.definition = {
    methods: ["get","head"],
    url: '/bulk',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
bulk.url = (options?: RouteQueryOptions) => {
    return bulk.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
bulk.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bulk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
bulk.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: bulk.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
const bulkForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bulk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
bulkForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bulk.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BulkController::bulk
* @see app/Http/Controllers/BulkController.php:22
* @route '/bulk'
*/
bulkForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bulk.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

bulk.form = bulkForm

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
export const recipients = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recipients.url(options),
    method: 'get',
})

recipients.definition = {
    methods: ["get","head"],
    url: '/recipients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
recipients.url = (options?: RouteQueryOptions) => {
    return recipients.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
recipients.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
recipients.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recipients.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
const recipientsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
recipientsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\RecipientController::recipients
* @see app/Http/Controllers/RecipientController.php:16
* @route '/recipients'
*/
recipientsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recipients.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

recipients.form = recipientsForm

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
export const automations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: automations.url(options),
    method: 'get',
})

automations.definition = {
    methods: ["get","head"],
    url: '/automations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
automations.url = (options?: RouteQueryOptions) => {
    return automations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
automations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: automations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
automations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: automations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
const automationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: automations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
automationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: automations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AutomationController::automations
* @see app/Http/Controllers/AutomationController.php:24
* @route '/automations'
*/
automationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: automations.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

automations.form = automationsForm

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
export const wallet = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wallet.url(options),
    method: 'get',
})

wallet.definition = {
    methods: ["get","head"],
    url: '/wallet',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
wallet.url = (options?: RouteQueryOptions) => {
    return wallet.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
wallet.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: wallet.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
wallet.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: wallet.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
const walletForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: wallet.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
walletForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: wallet.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WalletController::wallet
* @see app/Http/Controllers/WalletController.php:27
* @route '/wallet'
*/
walletForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: wallet.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

wallet.form = walletForm

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
export const transactions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transactions.url(options),
    method: 'get',
})

transactions.definition = {
    methods: ["get","head"],
    url: '/transactions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
transactions.url = (options?: RouteQueryOptions) => {
    return transactions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
transactions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transactions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
transactions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transactions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
const transactionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: transactions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
transactionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: transactions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TransactionController::transactions
* @see app/Http/Controllers/TransactionController.php:15
* @route '/transactions'
*/
transactionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: transactions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

transactions.form = transactionsForm

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
export const reports = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

reports.definition = {
    methods: ["get","head"],
    url: '/reports',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
reports.url = (options?: RouteQueryOptions) => {
    return reports.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
reports.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
reports.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reports.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
const reportsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
reportsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reports.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ReportsController::reports
* @see app/Http/Controllers/ReportsController.php:14
* @route '/reports'
*/
reportsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reports.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reports.form = reportsForm

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
export const aiActivity = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiActivity.url(options),
    method: 'get',
})

aiActivity.definition = {
    methods: ["get","head"],
    url: '/ai-activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
aiActivity.url = (options?: RouteQueryOptions) => {
    return aiActivity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
aiActivity.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: aiActivity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
aiActivity.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: aiActivity.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
const aiActivityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiActivity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
aiActivityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiActivity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::aiActivity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
aiActivityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: aiActivity.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

aiActivity.form = aiActivityForm

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
export const developers = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: developers.url(options),
    method: 'get',
})

developers.definition = {
    methods: ["get","head"],
    url: '/developers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
developers.url = (options?: RouteQueryOptions) => {
    return developers.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
developers.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: developers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
developers.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: developers.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
const developersForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: developers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
developersForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: developers.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::developers
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
developersForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: developers.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

developers.form = developersForm

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
export const support = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})

support.definition = {
    methods: ["get","head"],
    url: '/support',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
support.url = (options?: RouteQueryOptions) => {
    return support.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
support.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: support.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
support.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: support.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
const supportForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: support.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
supportForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: support.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SupportController::support
* @see app/Http/Controllers/SupportController.php:17
* @route '/support'
*/
supportForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: support.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

support.form = supportForm
