import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
export const activity = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/ai-activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
activity.url = (options?: RouteQueryOptions) => {
    return activity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
activity.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
activity.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
const activityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
activityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CopilotController::activity
* @see app/Http/Controllers/CopilotController.php:110
* @route '/ai-activity'
*/
activityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

activity.form = activityForm

/**
* @see \App\Http\Controllers\CopilotController::ask
* @see app/Http/Controllers/CopilotController.php:19
* @route '/copilot/ask'
*/
export const ask = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ask.url(options),
    method: 'post',
})

ask.definition = {
    methods: ["post"],
    url: '/copilot/ask',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CopilotController::ask
* @see app/Http/Controllers/CopilotController.php:19
* @route '/copilot/ask'
*/
ask.url = (options?: RouteQueryOptions) => {
    return ask.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CopilotController::ask
* @see app/Http/Controllers/CopilotController.php:19
* @route '/copilot/ask'
*/
ask.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ask.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::ask
* @see app/Http/Controllers/CopilotController.php:19
* @route '/copilot/ask'
*/
const askForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ask.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::ask
* @see app/Http/Controllers/CopilotController.php:19
* @route '/copilot/ask'
*/
askForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: ask.url(options),
    method: 'post',
})

ask.form = askForm

/**
* @see \App\Http\Controllers\CopilotController::stream
* @see app/Http/Controllers/CopilotController.php:32
* @route '/copilot/stream'
*/
export const stream = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/copilot/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CopilotController::stream
* @see app/Http/Controllers/CopilotController.php:32
* @route '/copilot/stream'
*/
stream.url = (options?: RouteQueryOptions) => {
    return stream.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CopilotController::stream
* @see app/Http/Controllers/CopilotController.php:32
* @route '/copilot/stream'
*/
stream.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::stream
* @see app/Http/Controllers/CopilotController.php:32
* @route '/copilot/stream'
*/
const streamForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::stream
* @see app/Http/Controllers/CopilotController.php:32
* @route '/copilot/stream'
*/
streamForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(options),
    method: 'post',
})

stream.form = streamForm

/**
* @see \App\Http\Controllers\CopilotController::execute
* @see app/Http/Controllers/CopilotController.php:76
* @route '/copilot/execute'
*/
export const execute = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/copilot/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CopilotController::execute
* @see app/Http/Controllers/CopilotController.php:76
* @route '/copilot/execute'
*/
execute.url = (options?: RouteQueryOptions) => {
    return execute.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CopilotController::execute
* @see app/Http/Controllers/CopilotController.php:76
* @route '/copilot/execute'
*/
execute.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::execute
* @see app/Http/Controllers/CopilotController.php:76
* @route '/copilot/execute'
*/
const executeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: execute.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CopilotController::execute
* @see app/Http/Controllers/CopilotController.php:76
* @route '/copilot/execute'
*/
executeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: execute.url(options),
    method: 'post',
})

execute.form = executeForm

const CopilotController = { activity, ask, stream, execute }

export default CopilotController