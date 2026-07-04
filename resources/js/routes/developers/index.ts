import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import keys from './keys'
import webhook from './webhook'
/**
* @see \App\Http\Controllers\DeveloperController::testEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
export const testEvent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testEvent.url(options),
    method: 'post',
})

testEvent.definition = {
    methods: ["post"],
    url: '/developers/test-event',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DeveloperController::testEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
testEvent.url = (options?: RouteQueryOptions) => {
    return testEvent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DeveloperController::testEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
testEvent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testEvent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::testEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
const testEventForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: testEvent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DeveloperController::testEvent
* @see app/Http/Controllers/DeveloperController.php:122
* @route '/developers/test-event'
*/
testEventForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: testEvent.url(options),
    method: 'post',
})

testEvent.form = testEventForm

const developers = {
    keys: Object.assign(keys, keys),
    testEvent: Object.assign(testEvent, testEvent),
    webhook: Object.assign(webhook, webhook),
}

export default developers