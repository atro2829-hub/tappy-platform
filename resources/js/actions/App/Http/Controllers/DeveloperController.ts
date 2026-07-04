import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/developers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DeveloperController::index
* @see app/Http/Controllers/DeveloperController.php:21
* @route '/developers'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/developers/keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::store
* @see app/Http/Controllers/DeveloperController.php:89
* @route '/developers/keys'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DeveloperController::sendTestEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
export const sendTestEvent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendTestEvent.url(options),
    method: 'post',
})

sendTestEvent.definition = {
    methods: ["post"],
    url: '/developers/test-event',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::sendTestEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
sendTestEvent.url = (options?: RouteQueryOptions) => {
    return sendTestEvent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::sendTestEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
sendTestEvent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendTestEvent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::sendTestEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
const sendTestEventForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendTestEvent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::sendTestEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
sendTestEventForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendTestEvent.url(options),
    method: 'post',
})

sendTestEvent.form = sendTestEventForm

/**
* @see \App\Http\Controllers\DeveloperController::updateWebhook
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
export const updateWebhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateWebhook.url(options),
    method: 'post',
})

updateWebhook.definition = {
    methods: ["post"],
    url: '/developers/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::updateWebhook
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
updateWebhook.url = (options?: RouteQueryOptions) => {
    return updateWebhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::updateWebhook
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
updateWebhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateWebhook.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::updateWebhook
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
const updateWebhookForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateWebhook.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::updateWebhook
* @see app/Http/Controllers/DeveloperController.php:61
* @route '/developers/webhook'
*/
updateWebhookForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateWebhook.url(options),
    method: 'post',
})

updateWebhook.form = updateWebhookForm

/**
* @see \App\Http\Controllers\DeveloperController::rotateWebhookSecret
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
export const rotateWebhookSecret = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotateWebhookSecret.url(options),
    method: 'post',
})

rotateWebhookSecret.definition = {
    methods: ["post"],
    url: '/developers/webhook/rotate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::rotateWebhookSecret
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotateWebhookSecret.url = (options?: RouteQueryOptions) => {
    return rotateWebhookSecret.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::rotateWebhookSecret
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotateWebhookSecret.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rotateWebhookSecret.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::rotateWebhookSecret
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
const rotateWebhookSecretForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotateWebhookSecret.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::rotateWebhookSecret
* @see app/Http/Controllers/DeveloperController.php:80
* @route '/developers/webhook/rotate'
*/
rotateWebhookSecretForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rotateWebhookSecret.url(options),
    method: 'post',
})

rotateWebhookSecret.form = rotateWebhookSecretForm

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
export const destroy = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/developers/keys/{apiKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroy.url = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { apiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { apiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            apiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        apiKey: typeof args.apiKey === 'object'
        ? args.apiKey.id
        : args.apiKey,
    }

    return destroy.definition.url
            .replace('{apiKey}', parsedArgs.apiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroy.delete = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
const destroyForm = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::destroy
* @see app/Http/Controllers/DeveloperController.php:108
* @route '/developers/keys/{apiKey}'
*/
destroyForm.delete = (args: { apiKey: number | { id: number } } | [apiKey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const DeveloperController = { index, store, sendTestEvent, updateWebhook, rotateWebhookSecret, destroy }

export default DeveloperController